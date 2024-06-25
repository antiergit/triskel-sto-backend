import { Request, Response, raw } from "express";
import { Model, Op, Sequelize, json } from "sequelize";
import response from "../../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import wallethelper from "./helper";
import { orderBuyingType } from "./enum";
import db from "../../../helpers/common/db";
import Secondaryhelper from "./helper";
import { maticWeb3 } from "../../../helpers/blockChainHelper/web3_matic_helpers";
import { config } from "../../../config";
import { AbiItem } from "web3-utils";
import { STATUS } from "../../../constants/global_enum";

import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import { language } from "../../../constants";
import commonHelper from "../../../helpers/common/common.helpers";
import * as Models from "../../../models/model/index";
import { Messages } from "./enum";
import secondaryhelper from "./helper";
import { transactionStatus } from "./enum";
import { exponentialToDecimal } from "../../../helpers/common/globalFunctions";
import { wallet_queries } from "../../../helpers/dbHelper/index";
import { GlblBooleanEnum } from "../../../constants/global_enum";

class secondaryController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() {}

  public async raiseQuoteSecondaryProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    let transaction: any = await db.db_write.transaction();
    try {
      let user_id: number = req.userId;
      let lock_tx_hash: string = req.body.lock_tx_hash;
      let is_primary: number = req.body.is_primary;
      let seller_wallet_address: any = req.body.seller_wallet_address;
      let proposal_id: number = req.body.proposal_id;
      let coin_id: number = req.body.coin_id;
      let coin_family: number = req.body.coin_family;
      let secondary_market_proposal_id: number = req.body
        .secondary_market_proposal_id
        ? req.body.secondary_market_proposal_id
        : null;
      let tokenValue: number = req.body.token_price;
      let issuedToken: number = req.body.token_qty;
      let raiseFund: string = (
        Number(tokenValue) * Number(issuedToken)
      ).toString();
      let coinData: any = await Models.CoinsModel.findOne({
        where: {
          coin_id: coin_id,
        },
        raw: true,
      });
      if (!coinData) {
        return response.error(res, {
          data: { message: Messages.TOKEN_NOT_EXIST },
        });
      }
      let proposalData: any = await Models.ProposalModel.findOne({
        where: {
          id: proposal_id,
        },
        raw: true,
      });
      if (!proposalData) {
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND },
        });
      }
      let getUserBalanceObj = {
        is_primary: is_primary,
        user_id: user_id,
        proposal_id: proposal_id,
        secondary_market_proposal_id: secondary_market_proposal_id,
      };
      let userBalanceData: any = await secondaryhelper.getUserBalanceData(
        getUserBalanceObj
      );
      let current_token_bal: number = userBalanceData?.available_balance;
      // let current_sell_tokens: number = userBalanceData.on_sell_balance;
      if (issuedToken > current_token_bal || current_token_bal <= 0) {
        return response.error(res, {
          data: { message: Messages.INSUFFICIENT_BIDD_QUANTITY },
        });
      }
      // let new_on_sell_tokens: number =
      //   Number(current_sell_tokens) + Number(issuedToken);
      let new_availbale_token_bal: number =
        Number(current_token_bal) - Number(issuedToken);
        if (new_availbale_token_bal < 0) {
          return response.error(res, {
            data: { message: Messages.INSUFFICIENT_BIDD_QUANTITY },
          });
        }
      let obj: any = {
        user_id: user_id,
        coin_family: coin_family,
        coin_id: coin_id,
        proposal_id: proposal_id,
        seller_wallet_address: seller_wallet_address,
        secondary_market_proposal_id: secondary_market_proposal_id
          ? secondary_market_proposal_id
          : null,
        raise_fund: raiseFund,
        token_value: tokenValue,
        token_quantity: String(issuedToken),
        token_to_sold: String(issuedToken),
        status: STATUS.OPEN,
        blocked_tokens: 0,
        token_address: proposalData?.token_address,
        cancelled_status:1,
        is_cancelled:0,
        lock_tx_hash:lock_tx_hash,
        lock_blockchain_status:"pending"
      };
      let createData: any = await Models.SecondaryProposalModel.create(obj, {
        transaction,
      });
      if (!createData) {
        await transaction.rollback();
        return response.error(res, {
          data: { status: false, message: language[lang].CATCH_MSG },
        });
      }
      let updateBalanceObj: any = {
        is_primary: is_primary,
        new_availbale_token_bal: new_availbale_token_bal,
        // new_on_sell_tokens: new_on_sell_tokens,
        user_id: user_id,
        proposal_id: proposal_id,
        secondary_market_proposal_id: secondary_market_proposal_id,
      };
      let updateData = await secondaryhelper.updateUserBalance(
        updateBalanceObj,
        transaction
      );
      if (updateData) {
        // await Models.ProposalModel.update(
        //   {
        //     relisted: 1,
        //   },
        //   {
        //     where: {
        //       id: proposal_id,
        //     },
        //     transaction,
        //   }
        // );
        await transaction.commit();
        return response.success(res, {
          data: { message: Messages.SECONDARY_PROPOSAL_ADDEDD, data: {} },
        });
      } else {
        await transaction.rollback();
        return response.error(res, {
          data: {
            status: false,
            message: language[lang].CATCH_MSG,
          },
        });
      }
    } catch (err) {
      console.log("add_secondary_proposal err>>>", err);
      await transaction.rollback();
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async secondaryProposalData(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let type = Number(req.body.type);
      let offset = (+page - 1) * limit;
      let final_data: any = await secondaryhelper.getSecondaryProposalList(
        limit,
        offset,
        type
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
      }
    } catch (err: any) {
      console.log("relisted_proposals err>>>", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async sellOrdersList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let page = req.body.page || 1;
      let fiat_type = req.body.fiat_type;
      let user_id = req.userId;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let proposal_id: any = req.body.proposal_id;
      const userData: any = await Models.UsersModel.findOne({
        where: { user_id: user_id },
        raw: true,
      });

      let final_data: any = await secondaryhelper.get_secondary_sell_data(
        proposal_id,
        limit,
        offset,
        fiat_type,
        user_id
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
      }
    } catch (err: any) {
      console.log("relisted_proposals err>>>", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async createOrderSecondaryProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    let transaction: any = await db.db_write.transaction();
    try {
      let user_id: any = req.userId;
      let {
        proposal_id,
        secondary_proposal_id,
        buyer_token_qty,
        total_payment_amount,
        user_adrs,
        wallet_id,
      } = req.body;
      let proposal_data: any = await Secondaryhelper.get_primary_proposal(
        proposal_id
      );
      if (!proposal_data) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      let secondary_proposal_data: any =
        await Secondaryhelper.get_secondary_proposal(secondary_proposal_id);
      if (!secondary_proposal_data) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      const seller_id = secondary_proposal_data?.user_id;
      const token_to_sold: number = Number(
        secondary_proposal_data?.token_to_sold
      );
      if (token_to_sold < 0 || isNaN(token_to_sold)) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      if (buyer_token_qty > token_to_sold) {
        return response.error(res, {
          data: { message: Messages.INVAILID_TOKEN_QTY },
        });
      }
      const price_to_pay: number =
        Number(secondary_proposal_data.token_value) * buyer_token_qty;
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
        secondary_market_proposal_id: secondary_proposal_id,
        proposal_id: proposal_id,
        user_adrs: user_adrs,
        wallet_id: wallet_id,
        buyer_id: user_id,
        seller_id: seller_id,
        token_value: secondary_proposal_data?.token_value,
        token_qty: buyer_token_qty,
        amount: price_to_pay,
        buying_type: orderBuyingType.SECONDARY,
      };
      const createOrder = await Secondaryhelper.order_create(
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
        Number(buyer_token_qty) +
        Number(secondary_proposal_data?.blocked_tokens);
      const updated_token_to_sold = token_to_sold - Number(buyer_token_qty);

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
      let updatedSecondaryProposal:any=await Secondaryhelper.proposal_update(
        blocked_token,
        updated_token_to_sold,
        secondary_proposal_id,
        transaction
      );
      if (!updatedSecondaryProposal) {
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
      console.error("Error in order_primary_proposal: ", err);
      await transaction.rollback();
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async secondaryCancelOrder(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const order_status: number = req.body.status;
      const buyer_id: any = req.userId;
      const proposal_id: any = req.body.proposal_id;
      const secondary_market_proposal_id: any =
        req.body.secondary_market_proposal_id;
      await secondaryhelper.secondaryOrderCheckoutCancelEvent({
        order_status,
        buyer_id,
        proposal_id,
        secondary_market_proposal_id,
      });
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
  public async checkLiquidity(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let { secondary_proposal_id, buyer_token_qty, total_payment_amount } =
        req.body;
      let secondary_proposal_data: any =
        await secondaryhelper.get_liquidity_proposal(secondary_proposal_id);

      if (!secondary_proposal_data) {
        return response.error(res, {
          data: { message: Messages.UNABALE_TO_PROCEED },
        });
      }
      const token_to_sold: number = Number(
        secondary_proposal_data.token_to_sold
      );
      if (buyer_token_qty > token_to_sold) {
        return response.success(res, {
          data: { message: Messages.TOKEN_NOT_ENOUGH, data: 0 },
        });
      }
      const price_to_pay: number =
        Number(secondary_proposal_data.token_value) * buyer_token_qty;
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
        data: { message: Messages.SUCCESS, data: secondary_proposal_data },
      });
    } catch (err: any) {
      console.error("Error in order_primary_proposal: ", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async createSecondaryTransaction(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let {
        token_quantity,
        amount,
        proposal_id,
        secondary_proposal_id,
        order_id,
        tx_id,
        tx_raw,
        from_adrs,
        to_adrs,
        buying_type,
        user_adrs,
        wallet_id,
        coin_family,
        seller_id,
      }: {
        token_quantity: number;
        amount: number;
        email: string;
        proposal_id: number;
        secondary_proposal_id: number;
        order_id: number;
        tx_id: string;
        tx_raw: string;
        from_adrs: string;
        to_adrs: string;
        buying_type: string;
        user_adrs: string;
        wallet_id: number;
        coin_family: number;
        seller_id: number;
      } = req.body;
      let user_id = req.userId;
      let createObj: any = {
        user_id,
        token_quantity,
        amount,
        proposal_id,
        secondary_proposal_id,
      };

      if (buying_type == orderBuyingType.SECONDARY) {
        let proposal_data: any = await Secondaryhelper.get_proposal_data(
          proposal_id
        );
        console.log("proposal_data", proposal_data);
        if (!proposal_data) {
          return response.error(res, {
            data: { message: Messages.UNABALE_TO_PROCEED },
          });
        }
        let secondary_proposal_data: any =
          await Secondaryhelper.get_secondary_sell_proposal(
            secondary_proposal_id
          );
        console.log("secondary_proposal_data", secondary_proposal_data);

        if (!secondary_proposal_data) {
          return response.error(res, {
            data: { message: Messages.UNABALE_TO_PROCEED },
          });
        }

        const available_token_with_block: number =
          Number(secondary_proposal_data.token_to_sold) +
          Number(secondary_proposal_data.blocked_token);
        if (available_token_with_block < token_quantity) {
          return response.error(res, {
            data: { message: Messages.INVAILID_TOKEN_QTY },
          });
        }
        const price_to_pay: number =
          Number(secondary_proposal_data.token_value) * token_quantity;
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
        let finalData =
          await Secondaryhelper.createSecondaryProposalTransaction(createObj);
        if (finalData == true) {
          let unique_id: string = await commonHelper.makeRandomStringForTx();
          let coin_id = await Secondaryhelper.get_coin_data(
            req.params.coin,
            coin_family
          );
          let transactionData: any = {
            req_type: "APP",
            is_primary: 0,
            seller_id: seller_id,
            coin_family: coin_family,
            seller_wallet_address: to_adrs,
            unique_id: unique_id,
            user_token_quantity: token_quantity,
            amount: amount,
            user_id: user_id,
            proposal_id: proposal_id,
            secondary_market_proposal_id: secondary_proposal_id,
            token_value: secondary_proposal_data?.token_value,
            order_id: order_id,
            tx_id: tx_id,
            tx_raw: tx_raw,
            from_adrs: from_adrs,
            to_adrs: to_adrs,
            user_adrs: user_adrs, //----Proposal wallet address
            wallet_id: wallet_id, //----Proposal wallet id
            coin_id: coin_id,
            status: transactionStatus.STATUS_COMPLETE,
            blockchain_status: transactionStatus.PENDING,
            tx_type: orderBuyingType.SECONDARY,
          };
          let transactionCreate = await Secondaryhelper.transaction_create(
            transactionData
          );
          if (transactionCreate) {
            await Secondaryhelper.order_update(order_id);
            await Secondaryhelper.secondary_proposal_update(secondary_proposal_id);
          }
        }
      } else {
        throw new Error("Order not found::");
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
  public async secondaryMyListing(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let userId = req.userId;

      let fiat_type = req.body.fiat_type;
      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let final_data: any = await secondaryhelper.getSecondaryListingData(
        userId,
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
      }
    } catch (err: any) {
      console.log("secondary my listing---- err", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async holdingSecondaryProposalList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const fiat_type = req.query.fiat_type;
      const user_id = req.userId;

      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let result: any = await Secondaryhelper.holdingSecondaryProposal(
        user_id,
        limit,
        offset,
        fiat_type
      );
      if (result) {
        console.log("result ---====", result.data);
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

  public async transactionHistories(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;

      let { proposal_id, secondary_market_proposal_id } = req.body;
      let page = req.body.page || 1;
      let limit = +(req.body.limit as string) || 10;
      let offset = (+page - 1) * limit;
      let result: any =
        await Secondaryhelper.view_proposal_secondary_transaction_history(
          user_id,
          proposal_id,
          secondary_market_proposal_id,
          limit,
          offset
        );
      if (result) {
        // return response.success(res, {
        //   data: { message: Messages.SUCCESS, data: result },
        // });
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

  public async secondaryViewParticularProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;

      let { proposal_id, secondary_market_proposal_id } = req.body;
      let result: any =
        await Secondaryhelper.view_secondary_particular_proposal(
          user_id,
          proposal_id,
          secondary_market_proposal_id
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
  public async secondaryPortfolioList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const user_id = req.userId;
      let { tx_type } = req.body;
      let fiat_type = req.body.fiat_type;

      console.log("portfolio fiat_type ---=== ", fiat_type);
      let page = Number(req.query.page) || 1;
      let limit = Number(+(req.query.limit as string)) || 10;
      let offset = (+page - 1) * limit;
      let result: any = await Secondaryhelper.secondaryPortfolioList(
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
  public async getSingleWalletAddress(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const userId = req.userId;
      let proposalId = req.body.proposal_id;
      let isPrimary = req.body.is_primary;
      let secondaryProposalId = req.body.secondary_proposal_id;
      let result: any = await Secondaryhelper.getSingleWalletAddressDetail(
        userId,
        proposalId,
        isPrimary,
        secondaryProposalId
      );
      console.log("result@@@@", result);
      if (result) {
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: result,
          },
        });
      } else {
        console.log("No data found@@@@@");
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      console.log("catch error get Single Wallet Address @@@@@", err);

      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }
  public async listOfUsdtTokens(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result: any = await Secondaryhelper.listsOfAllUsdtTokens();
      console.log("resulttttttttttttttttttttt", result);
      if (result) {
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: result,
          },
        });
      } else {
        console.log("No data found@@@@@");
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      console.log("catch error get Single Wallet Address @@@@@", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async listDummy(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = {
        name: "wakar",
      };
      if (result) {
        return response.success(res, {
          data: {
            message: Messages.Data_FOUND,
            data: result,
          },
        });
      } else {
        console.log("No data found@@@@@");
        return response.error(res, {
          data: { message: Messages.Data_NOT_FOUND, data: [] },
        });
      }
    } catch (err) {
      console.log("catch error get Single Wallet Address @@@@@", err);
      return response.error(res, {
        data: { status: false, message: language[lang].CATCH_MSG },
      });
    }
  }

  public async getCoinChooseByOption(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let fiat_type: string = req.body.fiat_type;
      let coinId: number = req.body.coin_id;
      let CoinFamily: number = req.body.coin_family;

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
          coin_id: coinId,
          coin_family: CoinFamily,
        },

        [
          "value",
          "price_change_24h",
          "fiat_type",
          "price_change_percentage_24h",
        ],

        { fiat_type: fiat_type, coin_id: coinId }
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
  public async sendCancelRequestSecondaryProposal(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let secondary_market_proposal_id: number = req.body.secondary_market_proposal_id;
      let getCancelStatusData: any = await Models.SecondaryProposalModel.findOne({
        attributes:["cancelled_status"],
        where: {
          id: secondary_market_proposal_id,
        },
        raw: true,
      });
      if (getCancelStatusData.cancelled_status != 1) {
        return response.error(res, {
          data: {
            status: false,
            message: Messages.CANCELLED_NOT_ALLOWED,
          },
        });
      }
      await Models.SecondaryProposalModel.update(
        {
          is_cancelled: 1,
          cancelled_status:0
        },
        {
          where: {
            id: secondary_market_proposal_id,
          },
        }
      );
      return response.success(res, {
        data: {
          status: true,
          message: Messages.CANCELLED_QOUTE,
        },
      });
    } catch (err: any) {
      console.error("cancelSecondaryProposal error", err);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
}
export const SecondaryController = new secondaryController();
