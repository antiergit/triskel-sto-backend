import { Request, Response } from "express";
import { Model, Op, Sequelize, json } from "sequelize";
import jwtHelper from "../../../helpers/common/jwt";
import response from "../../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import {
  GlblBooleanEnum,
  GlblCode,
  LoginType,
  CoinFamily,
  Fiat_Currency,
  WalletName,
} from "../../../constants/global_enum";
import { language } from "../../../constants";
import {
  Messages,
  PROPOSAL_STATUS,
  orderBuyingType,
  transactionStatus,
  ProposalCategoryStatus,
  mintStatus,
  relistedStatus,
  order,
  COIN_FAMILY,
} from "./enum";
import proposaltHelper from "./helper";
const fs = require("fs");
import rabbitMq from "../../../helpers/common/rabbitMq";
import db from "../../../helpers/common/db";
import proposalhelper from "./helper";
import {
  user_queries,
  wallet_queries,
  coin_queries,
} from "../../../helpers/dbHelper/index";
import commonHelper from "../../../helpers/common/common.helpers";
import * as Models from "../../../models/model/index";
import sequelize from "sequelize";
import notification_queries from "../../../helpers/dbHelper/notifications";

import { maticWeb3 } from "../../../helpers/blockChainHelper/web3_matic_helpers";
import { ethWeb3 } from "../../../helpers/blockChainHelper/web3_eth_helpers";
import { bscWeb3 } from "../../../helpers/blockChainHelper/web3.bsc_helper";
import { trxWeb3 } from "../../../helpers/blockChainHelper/web3_trx_helper";

import { config } from "../../../config";
import { AbiItem } from "web3-utils";
import { exponentialToDecimal } from "../../../helpers/blockChainHelper/globalFunctions";

class ProposalController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() {}

  public async proposalList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let type: any = req.query.type;
      let currentUTCDate = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      const fiat_type = req.query.fiat_type;
      let condition: any;
      switch (type) {
        case PROPOSAL_STATUS.Open:
          condition = {
            [Op.and]: [
              { end_date: { [Op.gte]: currentUTCDate } },
              { start_date: { [Op.lte]: currentUTCDate } },
              { mint_status: mintStatus.unMinted },
            ],
          };
          break;
        case PROPOSAL_STATUS.Upcoming:
          condition = {
            start_date: { [Op.gt]: currentUTCDate },
            mint_status: mintStatus.unMinted,
          };
          break;
        case PROPOSAL_STATUS.Closed:
          condition = {
            end_date: { [Op.lt]: currentUTCDate },
          };
          break;
      }
      let final_data: any = await proposaltHelper.proposal_data(
        condition,
        limit,
        offset,
        fiat_type
      );
      if (final_data) {
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: {
              data: final_data,
              meta: {
                page: Number(page),
                pages: Math.ceil(final_data.count / limit),
                perPage: limit,
                total: final_data.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async priceConversion(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let proposal_id = req.body.proposal_id;
      let proposalData = await proposaltHelper.proposal_conversion_data(
        proposal_id
      );
      if (proposalData) {
        return response.success(res, {
          data: {
            status: true,
            data: {
              convesrion_data: proposalData,
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err: any) {
      console.error("Error in otc > info.", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async orderPrimaryProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    let transaction: any = await db.db_write.transaction();
    try {
      let user_id: any = req.userId;
      let {
        proposal_id,
        buyer_token_qty,
        total_payment_amount,
        liminal_address,
        user_adrs,
        wallet_id,
      } = req.body;
      let proposal_data: any = await proposaltHelper.get_proposal_data(
        proposal_id
      );
      if (!proposal_data) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      const current_token_to_sold: number = Number(proposal_data.token_to_sold);
      if (current_token_to_sold < 0 || isNaN(current_token_to_sold)) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }

      if (buyer_token_qty > current_token_to_sold) {
        return response.error(res, {
          data: { message: Messages.INVAILID_TOKEN_QTY },
        });
      }
      const price_to_pay: number =
        Number(proposal_data.token_value) * buyer_token_qty;
      if (price_to_pay !== total_payment_amount) {
        console.log("Invalid buyer paying amount: >>>>>");
        console.log("price_to_pay: >>>>>>>>>>", price_to_pay);
        console.log(
          "total including fees buyer_paying_amt: >>>>>>>>",
          total_payment_amount
        );
        return response.error(res, {
          data: { message: Messages.INVAILID_AMOUNT },
        });
      }
      const buyerData = {
        proposal_id: proposal_id,
        liminal_address: liminal_address,
        user_adrs: user_adrs,
        wallet_id: wallet_id,
        buyer_id: user_id,
        token_value: proposal_data?.token_value,
        token_qty: buyer_token_qty,
        amount: price_to_pay,
        buying_type: "primary",
      };
      let createOrder: any = await proposaltHelper.order_create(
        buyerData,
        transaction
      );
      if (!createOrder) {
        await transaction.rollback();
        return response.error(res, {
          data: { status: false, message: language[lang].CATCH_MSG },
        });
      }
      const blocked_token =
        Number(buyer_token_qty) + Number(proposal_data.blocked_tokens);
      const updated_token_to_sold =
        current_token_to_sold - Number(buyer_token_qty);
      if (
        isNaN(blocked_token) ||
        isNaN(updated_token_to_sold) ||
        blocked_token === undefined ||
        updated_token_to_sold === undefined ||
        blocked_token < 0 ||
        updated_token_to_sold < 0
      ) {
        await transaction.rollback();
        return response.error(res, {
          data: { status: false, message: language[lang].CATCH_MSG },
        });
      }
      const proposalUpdate: any = await proposaltHelper.proposal_update(
        blocked_token,
        updated_token_to_sold,
        proposal_data.id,
        transaction
      );
      if (!proposalUpdate) {
        await transaction.rollback();
        return response.error(res, {
          data: { status: false, message: language[lang].CATCH_MSG },
        });
      }
      await transaction.commit();
      return response.success(res, {
        data: { message: Messages.ORDER_CREATE, data: createOrder },
      });
    } catch (err: any) {
      console.error("Error in order primary proposal: ", err);
      await transaction.rollback();
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async order_checkout_cancel_event(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const order_status: number = req.body.status;
      const buyer_id: any = req.userId;
      const proposal_id: string = req.body.proposal_id;
      await proposalhelper.cancelOrder({ order_status, buyer_id, proposal_id });
      return response.success(res, {
        data: {
          message: Messages.ORDER_CANCELED,
        },
      });
    } catch (err: any) {
      console.log("order_checkout_event ---- err", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async kyc_status(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id: number = req.userId;
      let { kyc_address, email }: { kyc_address: string; email: string } =
        req.body;
      let check_kyc_status: any = await user_queries.user_kyc_find_one(
        ["kyc_status"],
        { user_id: user_id }
      );
      if (check_kyc_status) {
        console.log("check_kyc_status", Number(check_kyc_status.kyc_status));
      } else {
        let obj = {
          user_id: user_id,
          kyc_address: kyc_address,
          email: email,
        };
        let create_kyc_status: any = await user_queries.user_kyc_create(obj);
      }
      return response.success(res, {
        data: {
          message: Messages.CREATE_KYC,
        },
      });
    } catch (err: any) {
      console.log("kyc_status ---- err", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async checkLiquidity(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id: any = req.userId;
      let { proposal_id, buyer_token_qty, total_payment_amount } = req.body;
      let proposal_data: any = await proposaltHelper.get_liquidity_proposal(
        proposal_id
      );

      if (!proposal_data) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      const token_to_sold: number = Number(proposal_data.token_to_sold);
      if (buyer_token_qty > token_to_sold) {
        return response.success(res, {
          data: { message: Messages.TOKEN_NOT_ENOUGH, data: 0 },
        });
      }
      const price_to_pay: number =
        Number(proposal_data.token_value) * buyer_token_qty;
      if (price_to_pay !== total_payment_amount) {
        console.log("Invalid buyer paying amount: >>>>>");
        console.log("price_to_pay: >>>>>>>>>>", price_to_pay);
        console.log(
          "total including fees buyer_paying_amt: >>>>>>>>",
          total_payment_amount
        );
        return response.success(res, {
          data: { message: Messages.INVAILID_AMOUNT },
        });
      }
      return response.success(res, {
        data: { message: Messages.SUCCESS, data: proposal_data },
      });
    } catch (err: any) {
      console.error("Error in order_primary_proposal: ", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async createTransaction(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        token_quantity,
        amount,
        proposal_id,
        order_id,
        tx_id,
        tx_raw,
        from_adrs,
        to_liminal_adrs,
        buying_type,
        user_adrs,
        wallet_id,
      }: {
        req_type: string;
        token_quantity: number;
        amount: number;
        email: string;
        proposal_id: number;
        order_id: number;
        tx_id: string;
        tx_raw: string;
        from_adrs: string;
        to_liminal_adrs: string;
        buying_type: string;
        user_adrs: string;
        wallet_id: number;
      } = req.body;
      let user_id = req.userId;
      let coin_family = COIN_FAMILY?.polygon;
      let createObj: any = {
        user_id,
        token_quantity,
        amount,
        proposal_id,
      };

      if (buying_type == orderBuyingType.PRIMARY) {
        let proposal_data: any = await proposaltHelper.get_proposal_data(
          proposal_id
        );
        if (!proposal_data) {
          return response.error(res, {
            data: { message: Messages.UNABALE_TO_PROCEED },
          });
        }
        const available_token_with_block: number =
          Number(proposal_data.token_to_sold) +
          Number(proposal_data.blocked_token);
        if (available_token_with_block < token_quantity) {
          return response.error(res, {
            data: { message: Messages.INVAILID_TOKEN_QTY },
          });
        }
        const price_to_pay: number =
          Number(proposal_data.token_value) * token_quantity;
        if (price_to_pay !== amount) {
          console.log("Invalid buyer paying amount: >>>>>");
          console.log("price_to_pay: >>>>>>>>>>", price_to_pay);
          console.log(
            "total including fees buyer_paying_amt: >>>>>>>>",
            amount
          );
          return response.error(res, {
            data: { message: Messages.INVAILID_AMOUNT },
          });
        }
        let finalData = await proposalhelper.createPrimaryProposalTransaction(
          createObj
        );
        console.log("req.params.coin: >>>>>", req.params.coin);

        let TUTbalanceUpdate: any = await maticWeb3.get_tut_token_balance(
          req.params.coin,
          config.CONTRACT_ABI as AbiItem[],
          from_adrs
        );
        const userBalance = exponentialToDecimal(Number(TUTbalanceUpdate));
        let coinDetail = await Models.CoinsModel.findOne({
          attributes: ["coin_id"],
          where: { token_address: req.params.coin },
          raw: true,
        });
        console.log(" TUTbalanceUpdate.tokenBalance -----=======", userBalance);
        console.log(
          " ------------------.------------ -----=======",
          user_id,
          from_adrs,
          coinDetail?.coin_id
        );

        let updateWalletdata: any = await Models.BackendWalletModel.update(
          {
            balance: userBalance,
          },
          {
            where: {
              user_id: user_id,
              wallet_address: from_adrs,
              coin_id: coinDetail?.coin_id,
            },
          }
        );

        console.log(" CHECKING updateWalletdata updateWalletdata DATA====");

        if (finalData == true) {
          let unique_id: string = await commonHelper.makeRandomStringForTx();
          let coin_id = await proposaltHelper.get_coin_data(
            req.coininfo?.coin_id
          );
          let transactionData: any = {
            req_type: "APP",
            coin_family: coin_family,
            is_primary: 1,
            unique_id: unique_id,
            user_token_quantity: token_quantity,
            amount: amount,
            user_id: user_id,
            proposal_id: proposal_id,
            token_value: proposal_data?.token_value,
            order_id: order_id,
            tx_id: tx_id,
            tx_raw: tx_raw,
            from_adrs: from_adrs,
            to_liminal_adrs: to_liminal_adrs,
            user_adrs: user_adrs,
            wallet_id: wallet_id,
            coin_id: coin_id,
            status: transactionStatus.STATUS_COMPLETE,
            blockchain_status: transactionStatus.PENDING,
            tx_type: orderBuyingType.PRIMARY,
          };
          let transactionCreate = await proposaltHelper.transaction_create(
            transactionData
          );
          if (transactionCreate) {
            await proposaltHelper.order_update(order_id);
          }
        }
      } else {
        return response.error(res, {
          data: {
            status: false,
            message: language[lang].CATCH_MSG,
          },
        });
      }
      return response.success(res, {
        data: { message: Messages.TRANSACTION_SUCCESS },
      });
    } catch (err: any) {
      console.log("createTransaction order_checkout_event ---- err", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async create_liminal_address(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id = req.userId;
      console.log("user_id ", user_id);
      let {
        proposal_id,
        coin_family,
      }: { proposal_id: number; coin_family: number } = req.body;
      let checkLiminalAddress = await proposaltHelper.check_liminal_adress(
        user_id,
        proposal_id,
        coin_family
      );
      if (!checkLiminalAddress) {
        return response.error(res, {
          data: { status: false, message: "not create liminal address" },
        });
      } else {
        return response.success(res, {
          data: { message: Messages.SUCCESS, data: checkLiminalAddress },
        });
      }
    } catch (err: any) {
      console.error("Error in create_liminal_address: ", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async create_wallet(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let userId: number = req.userId;
      let {
        addressList,
        wallet_name,
        email,
      }: { addressList: any; wallet_name: string; email: string } = req.body;
      let createWallet = await proposalhelper.create_wallet_with_bal(
        addressList,
        userId,
        wallet_name,
        email
      );

      return response.success(res, {
        data: { message: Messages.SUCCESS, data: createWallet },
      });
    } catch (err: any) {
      console.error("catch error create wallet", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async get_coin_choose_by_option(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let fiat_type: string = req.body.fiat_type;
      let chooseCoinData: any = await wallet_queries.wallet_coin_fiat_join_data(
        [
          "wallet_id",
          "wallet_name",
          "user_id",
          "wallet_address",
          "balance",
          "status",
        ],

        { status: GlblBooleanEnum.true, user_id: req.userId },

        [
          "coin_id",
          "is_tradable",
          "coin_image",
          "coin_name",
          "coin_symbol",
          "coin_family",
          "decimals",
          "is_token",
          "token_address",
          "min",
          "max",
        ],

        {
          coin_status: GlblBooleanEnum.true,
          is_sto: 1,
          coin_id: 8,
        },

        [
          "value",
          "price_change_24h",
          "fiat_type",
          "price_change_percentage_24h",
        ],

        { fiat_type: fiat_type }
      );
      console.log("chooseCoinData", chooseCoinData);
      return response.success(res, {
        data: {
          status: true,
          data: chooseCoinData,
        },
      });
    } catch (err: any) {
      console.error("Error in get_coin_choose_by_option>>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  public async holdingPrimaryProposalList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const fiat_type = req.query.fiat_type;
      const user_id = req.userId;
      let page = req.query.page || 1;
      let limit = +(req.query.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let result: any = await proposaltHelper.holding_primary_proposal(
        user_id,
        limit,
        offset,
        fiat_type
      );
      if (result) {
        // console.log("result ---====", result.data)
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: {
              data: result,
              meta: {
                page: Number(page),
                pages: Math.ceil(result.count / limit),
                perPage: limit,
                total: result.count,
              },
            },
          },
        });
      } else {
        console.log("No data found@@@@@");

        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      console.log("catch error@@@@@", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  //====get particluar proposal
  public async viewParticularProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;
      let { proposal_id } = req.body;
      let result: any = await proposaltHelper.view_particular_proposal(
        user_id,
        proposal_id
      );
      if (result) {
        return response.success(res, {
          data: { message: Messages.SUCCESS, data: result },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  //---------------------Trnsaction history------------

  public async transactionHistory(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;
      let { proposal_id } = req.body;
      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let result: any = await proposaltHelper.view_proposal_transaction_history(
        user_id,
        proposal_id,
        limit,
        offset
      );
      if (result) {
        return response.success(res, {
          data: {
            message: Messages.SUCCESS,
            data: {
              data: result,
              meta: {
                page: Number(page),
                pages: Math.ceil(result.count / limit),
                perPage: limit,
                total: result.count,
              },
            },
          },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  //====get portfolio list
  public async portfolioList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;
      let { tx_type } = req.body;
      let fiat_type = req.body.fiat_type;

      console.log("portfolio fiat_type ---=== ", fiat_type);
      let page = Number(req.query.page) || 1;
      let limit = Number(+(req.query.limit as string)) || 10;
      let offset = (+page - 1) * limit;
      let result: any = await proposaltHelper.portfolioList(
        user_id,
        tx_type,
        limit,
        offset,
        fiat_type
      );
      console.log("result@@@@pr", result);
      if (result) {
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: {
              data: result,
              meta: {
                page: Number(page),
                pages: Math.ceil(result.count / limit),
                perPage: limit,
                total: result.count,
              },
            },
          },
        });
      } else {
        console.log("No data found@@@@@");
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      console.log("catch errorportfoli@@@@@", err);

      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async create_proposal_wallet(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id: number = req.userId;
      let {
        wallet_address,
        wallet_name,
        email,
        username,
        proposal_id,
        token_address,
        coin_family,
      }: {
        wallet_address: any;
        wallet_name: string;
        email: string;
        username: string;
        proposal_id: number;
        token_address: string;
        coin_family: number;
      } = req.body;
      console.log("BODY DATA :-===", req.body);
      let createWallet = await proposalhelper.create_proposal_wallet_with_bal(
        user_id,
        wallet_address,
        wallet_name,
        email,
        username,
        proposal_id,
        token_address,
        coin_family
      );
      if (createWallet) {
        return response.success(res, {
          data: { message: Messages.SUCCESS, data: createWallet },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND },
        });
      }
    } catch (err: any) {
      console.error(err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async sendData(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        fiat_type,
        wallet_address,
        token_address,
      }: { fiat_type: string; wallet_address: string; token_address: string } =
        req.body;
      let getSendData: any =
        await wallet_queries.wallet_coin_parposal_join_data(
          [
            "wallet_id",
            "wallet_name",
            "user_id",
            "wallet_address",
            "balance",
            "status",
          ],

          {
            status: GlblBooleanEnum.true,
            wallet_address: wallet_address,
            is_sto_wallet: 1,
          },

          [
            "coin_id",
            "is_tradable",
            "coin_image",
            "coin_name",
            "coin_symbol",
            "coin_family",
            "decimals",
            "is_token",
            "token_address",
            "min",
            "max",
          ],

          {
            coin_status: GlblBooleanEnum.true,
            is_sto: 1,
          },

          ["title", "description", "token_name", "raise_fund"],

          { token_address: token_address }
        );
      console.log("getSendData", getSendData);
      return response.success(res, {
        data: {
          status: true,
          data: getSendData,
        },
      });
    } catch (err: any) {
      console.error("Error in get_coin_choose_by_option>>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async primary_secondary_percentage(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let userId: number = req.userId;
      let fiat_type = req.query.fiat_type;
      console.log("fiat_type ====", fiat_type);
      let result: any = await proposaltHelper.percentageListing(
        userId,
        fiat_type
      );
      if (result) {
        return response.success(res, {
          data: { message: Messages.SUCCESS, data: result },
        });
      } else {
        console.log("no data found");
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err: any) {
      console.log("primary_secondary_percentage", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async notifications(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id: number = req.userId;
      // let user_id: number = 14;

      let { page, limit }: { page: number | string; limit: number | string } =
        req.body;

      let pageNo: any = parseInt(page as string) || GlblBooleanEnum.true;
      let limitNo: any = parseInt(limit as string) || 10;
      let offset: number = GlblBooleanEnum.false;
      if (pageNo != GlblBooleanEnum.true) {
        offset = (pageNo - GlblBooleanEnum.true) * limitNo;
      }

      let data: any = await notification_queries.notification_find_all_count(
        [
          "id",
          "message",
          "view_status",
          "amount",
          "fiat_type",
          "from_user_id",
          "to_user_id",
          "trnx_id",
          "notification_type",
          "coin_symbol",
          "coin_id",
          "wallet_address",
          "status",
          "created_at",
          "updated_at",
        ],
        {
          status: 1,
          [Op.or]: [{ from_user_id: user_id }, { to_user_id: user_id }],
        },
        limitNo,
        offset,
        [["id", "DESC"]]
      );

      await notification_queries.notification_update(
        { view_status: 1 },
        {
          status: 1,
          [Op.or]: [{ from_user_id: user_id }, { to_user_id: user_id }],
          view_status: 0,
        }
      );

      return response.success(res, {
        data: {
          status: true,
          data: data.rows,
          meta: {
            page: page,
            pages: Math.ceil(data.count / limitNo),
            perPage: limitNo,
            total: data.count,
          },
        },
      });
    } catch (err: any) {
      console.error("Error in notifications>>", err);
      // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notifications", error_msg: err.message || {} })
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async get_perposal_wallet(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let { proposal_id }: { proposal_id: number } = req.body;
      let chooseCoinData: any = await proposalhelper.user_balance_data(
        ["id", "user_id", "proposal_id", "coin_id", "available_balance"],
        {
          status: GlblBooleanEnum.true,
          user_id: req.userId,
          proposal_id: proposal_id,
        },
        [
          "title",
          "token_name",
          "token_value",
          "min_investment",
          "token_quantity",
          "minted_token_quantity",
          "token_to_sold",
          "mint_status",
          "token_address",
        ],
        {
          id: proposal_id,
        }
      );
      console.log("chooseCoinData", chooseCoinData);
      return response.success(res, {
        data: {
          status: true,
          data: chooseCoinData,
        },
      });
    } catch (err: any) {
      console.error("Error in get_coin_raise_quote -->>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async perposal_assets(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let { is_primary }: { is_primary: number } = req.body;
      let user_id = req.userId;
      let assetData: any = await proposalhelper.primaryAssetBalance(
        user_id,
        is_primary
      );
      console.log("chooseCoinData", assetData);
      return response.success(res, {
        data: {
          status: true,
          data: assetData,
          master_token_address:config.MASTER_TOKEN_ADDRESS
        },
      });
    } catch (err: any) {
      console.error("Error in primary perposal -->>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  public async getCombinedAssetsData(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let { is_primary }: { is_primary: number } = req.body;
      let user_id = req.userId;
      let assetData: any = await proposalhelper.primaryBalance(
        user_id,
        is_primary
      );
      console.log("chooseCoinData", assetData);
      return response.success(res, {
        data: {
          status: true,
          data: assetData,
          master_token_address:config.MASTER_TOKEN_ADDRESS
        },
      });
    } catch (err: any) {
      console.error("Error in primary perposal -->>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }


  public async getSingleProposalBalance(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        is_primary,
        proposal_id,
      }: { is_primary: number; proposal_id: number } = req.body;
      let user_id = req.userId;
      let assetData: any = await proposalhelper.singleAssetBalance(
        user_id,
        is_primary,
        proposal_id
      );
      console.log("chooseCoinData", assetData);
      return response.success(res, {
        data: {
          status: true,
          data: assetData,
          master_token_address:config.MASTER_TOKEN_ADDRESS
        },
      });
    } catch (err: any) {
      console.error("Error in primary perposal -->>", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async sendToken(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        coin_family,
        token_quantity,
        proposal_id,
        tx_id,
        tx_raw,
        from_adrs,
        to_adrs,
        wallet_id,
        is_primary,
        secondary_proposal_id,
      }: {
        coin_family: number;
        token_quantity: number;
        email: string;
        proposal_id: number;
        tx_id: string;
        tx_raw: string;
        from_adrs: string;
        to_adrs: string;
        wallet_id: number;
        is_primary: number;
        secondary_proposal_id: any;
      } = req.body;
      let user_id = req.userId;
      let userBalanceData: any = await proposalhelper.getUserBalance(
        req.body,
        user_id
      );
      console.log("getUserBalanceData -->>>>", userBalanceData);
      if (
        token_quantity <= userBalanceData?.available_balance &&
        userBalanceData?.available_balance > 0
      ) {
        if (is_primary == 1) {
          let proposalData: any = await Models.ProposalModel.findOne({
            attributes: ["token_value", "id"],
            where: {
              id: proposal_id,
            },
            raw: true,
          });
          let amount_in_tut =
            Number(token_quantity) * Number(proposalData?.token_value);
          await proposalhelper.sendPrimaryToken(
            req.body,
            user_id,
            amount_in_tut
          );
        } else if (is_primary == 0) {
          let secondaryProposalData: any =
            await Models.SecondaryProposalModel.findOne({
              attributes: ["token_value", "id"],
              where: {
                id: secondary_proposal_id,
              },
              raw: true,
            });
          let amount_in_usdt =
            Number(token_quantity) * Number(secondaryProposalData?.token_value);
          await proposalhelper.sendSecondaryToken(
            req.body,
            user_id,
            amount_in_usdt
          );
        }
        let available_balance: any =
          Number(userBalanceData?.available_balance) - Number(token_quantity);
        // let invested_balance: any =
        //   Number(userBalanceData?.invested_balance) - Number(token_quantity);
        // console.log(
        //   "available_balance",
        //   available_balance,
        //   "invested_balance",
        //   invested_balance
        // );
        // if (invested_balance < 0) {
        //   invested_balance = 0;
        // }
        if (available_balance < 0) {
          return response.success(res, {
            data: { message: Messages.BALANCE_MINUS },
          });
        }
        await Models.UserBalanceModel.update(
          {
            available_balance: Number(available_balance),
            // invested_balance: Number(invested_balance),
          },
          {
            where: {
              id: userBalanceData?.id,
            },
          }
        );
        return response.success(res, {
          data: { message: Messages.TRANSACTION_SUCCESS },
        });
      } else {
        return response.error(res, {
          data: {
            status: false,
            message: Messages.INSUFFICIENT_BALANCE,
          },
        });
      }
    } catch (err: any) {
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async updateWalletBalance(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        coin_family,
        token_address,
        wallet_address,
      }: {
        coin_family: number;
        token_address: string;
        wallet_address: string;
      } = req.body;
      let user_id = req.userId;
      await proposalhelper.getBlockchainBalance(req.body, user_id);
      return response.success(res, {
        data: { message: Messages.BALANCE_UPDATED },
      });
    } catch (err: any) {
      console.log("update balance error", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  public async createSecondaryProposalWallet(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let user_id: number = req.userId;
      let {
        wallet_address,
        wallet_name,
        email,
        username,
        proposal_id,
        token_address,
        coin_family,
        secondary_market_proposal_id,
      }: {
        wallet_address: any;
        wallet_name: string;
        email: string;
        username: string;
        proposal_id: number;
        token_address: string;
        coin_family: number;
        secondary_market_proposal_id: number;
      } = req.body;
      console.log("BODY DATA :-===", req.body);
      let createWallet =
        await proposalhelper.createSecondaryProposalWalletWithBal(
          user_id,
          wallet_address,
          wallet_name,
          email,
          username,
          proposal_id,
          token_address,
          coin_family,
          secondary_market_proposal_id
        );
      if (createWallet) {
        return response.success(res, {
          data: { message: Messages.SUCCESS, data: createWallet },
        });
      } else {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND },
        });
      }
    } catch (err: any) {
      console.error(err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async getStoDynamicDataList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let obj={
        is_token:1,
        coin_family:config.STATIC_COIN_FAMILY.MATIC,
        coin_name:config.STO_COIN_NAME,
        coin_symbol:config.STO_COIN_SYMBOL
        }
      return response.success(res, {
        data: {
          status: true,
          data: obj
        },
      });
    } catch (err: any) {
      console.error("getStoDynamicData catch error", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
}
export const proposalController = new ProposalController();
