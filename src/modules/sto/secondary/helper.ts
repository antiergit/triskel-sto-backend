import { Op, fn, Sequelize, col } from "sequelize";
import rabbitMq from "../../../helpers/common/rabbitMq";
import AWS from "aws-sdk";
import {
  CoinFamily,
  Fiat_Currency,
  GlblBooleanEnum,
  GlblCode,
  STATUS,
} from "../../../constants/global_enum";
import { config } from "../../../config";
import commonHelper from "../../../helpers/common/common.helpers";
import { language } from "../../../constants";
import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import * as Models from "../../../models/model/index";
import {
  Messages,
  TUT_COIN_ID,
  tokenMintStatus,
  coinSymbol,
  orderBuyingType,
  transactionStatus,
  orderStatus,
  orderLogActions,
  ProposalCategoryStatus,
  mintStatus,
  orderTokensBlocked,
  PaymentCheckoutEventStatus,
  relistedStatus,
  order,
} from "./enum";

class secondaryhelper {
  public async get_liquidity_proposal(secondary_proposal_id: any) {
    try {
      const data: any = await Models.SecondaryProposalModel.findOne({
        where: {
          id: secondary_proposal_id,
          status: STATUS.OPEN,
          lock_blockchain_status: "confirmed",
          is_cancelled: {
            [Op.in]: [0, 3],
          },
        },
        raw: true,
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
  public async getSecondaryProposalList(limit: any, offset: any, type: any) {
    try {
      if (type == 0) {
        const proposalData: any = await Models.ProposalModel.findAndCountAll({
          attributes: [
            "title",
            "token_address",
            "id",
            "description",
            "company_name",
            "token_name",
            "token_quantity",
            "minted_token_quantity",
            "symbol",
            // "blocked_tokens",
            "asset_info",
            "relisted",
            [
              Sequelize.literal(
                `IFNULL(
                      (SELECT SUM(token_to_sold) 
                      FROM secondary_market_proposals 
                      WHERE proposal_id = proposals.id AND lock_blockchain_status = "confirmed" AND is_cancelled IN (0, 3)
                      ), 
                  0)`
              ),
              "total_token_to_sold",
            ],
            [
              Sequelize.literal(
                `IFNULL(
                      (SELECT SUM(blocked_tokens) 
                      FROM secondary_market_proposals 
                      WHERE proposal_id = proposals.id 
                      ), 
                  0)`
              ),
              "total_blocked_token",
            ],
          ],
          where: {
            relisted: 1,
            token_address: {
              [Op.ne]: null,
            },
          },
          include: [
            {
              model: Models.ProposalImageModel,
              attributes: ["url", "type"],
              as: "proposal_file",
              required: false,
            },
            {
              model: Models.AssetModel,
              attributes: ["asset_type"],
              as: "asset_type",
              required: false,
            },
            {
              model: Models.IconModel,
              attributes: ["sub_head_name", "sub_head_value", "icon"],
              as: "proposal_icon",
              required: false,
            },
          ],
          distinct: true,
          limit: limit,
          offset: offset,
        });
        return proposalData;
      } else {
        const proposalData: any = await Models.ProposalModel.findAndCountAll({
          attributes: [
            "title",
            "token_address",
            "id",
            "description",
            "company_name",
            "token_name",
            "token_quantity",
            "minted_token_quantity",
            "symbol",
            // "blocked_tokens",
            "asset_info",
            "relisted",
            [
              Sequelize.literal(
                `IFNULL(
                      (SELECT SUM(token_to_sold) 
                      FROM secondary_market_proposals 
                      WHERE proposal_id = proposals.id AND lock_blockchain_status = "confirmed" AND is_cancelled IN (0, 3)
                      ), 
                  0)`
              ),
              "total_token_to_sold",
            ],
            [
              Sequelize.literal(
                `IFNULL(
                      (SELECT SUM(blocked_tokens) 
                      FROM secondary_market_proposals 
                      WHERE proposal_id = proposals.id 
                      ), 
                  0)`
              ),
              "total_blocked_token",
            ],
          ],
          where: {
            relisted: 0,
            token_address: {
              [Op.ne]: null,
            },
          },
          include: [
            {
              model: Models.ProposalImageModel,
              attributes: ["url", "type"],
              as: "proposal_file",
              required: false,
            },
            {
              model: Models.AssetModel,
              attributes: ["asset_type"],
              as: "asset_type",
              required: false,
            },
            {
              model: Models.IconModel,
              attributes: ["sub_head_name", "sub_head_value", "icon"],
              as: "proposal_icon",
              required: false,
            },
          ],
          distinct: true,
          limit: limit,
          offset: offset,
        });
        return proposalData;
      }
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
  public async get_secondary_sell_data(
    proposal_id: any,
    limit: any,
    offset: any,
    fiat_type: any,
    user_id: any
  ) {
    try {
      let data: any = await Models.SecondaryProposalModel.findAndCountAll({
        attributes: [
          "id",
          "coin_family",
          "coin_id",
          "user_id",
          "seller_wallet_address",
          "proposal_id",
          "secondary_market_proposal_id",
          "raise_fund",
          "collected_fund",
          "token_value",
          "token_quantity",
          "token_to_sold",
          "blocked_tokens",
          "status",
          "token_address",
          [
            Sequelize.literal(
              `CASE WHEN user_id = ${user_id} THEN 1 ELSE 0 END`
            ),
            "is_sell_user",
          ],
        ],
        where: {
          proposal_id: proposal_id,
          token_to_sold: {
            [Op.gt]: 0,
          },
          status: STATUS.OPEN,
          lock_blockchain_status: "confirmed",
          is_cancelled: { 
            [Op.in]: [0, 3],
          },
        },
        include: [
          {
            model: Models.ProposalModel,
            as: "secondary_proposal_data",
            required: true,
          },
          {
            model: Models.CoinsModel,
            attributes: ["token_address"],
            as: "coin_data",
            required: true,
          },
        ],
        distinct: true,
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
  public async get_primary_proposal(proposal_id: any) {
    try {
      const proposalData: any = await Models.ProposalModel.findOne({
        where: {
          id: proposal_id,
          relisted: 1,
        },
      });
      return proposalData;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async get_secondary_proposal(proposal_id: any) {
    try {
      let data: any = await Models.SecondaryProposalModel.findOne({
        where: {
          id: proposal_id,
          token_to_sold: {
            [Op.gt]: 0,
          },
          status: STATUS.OPEN,
          lock_blockchain_status: "confirmed",
          is_cancelled: {
            [Op.in]: [0, 3]
          },
        },
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
  public async order_create(obj: any, transaction: any) {
    try {
      let data: any = await Models.OrderModel.create(obj, { transaction });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async proposal_update(
    blocked_tokens: any,
    token_to_sold: any,
    secondary_proposal_id: any,
    transaction: any
  ) {
    try {
      let updateData = await Models.SecondaryProposalModel.update(
        {
          blocked_tokens: blocked_tokens,
          token_to_sold: token_to_sold,
        },
        {
          where: {
            id: secondary_proposal_id,
          },
          transaction,
        }
      );
      return updateData;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public secondaryOrderCheckoutCancelEvent = async (data: {
    order_status: number;
    buyer_id: any;
    proposal_id: any;
    secondary_market_proposal_id: number;
  }) => {
    try {
      const order_status: number = data.order_status;
      const buyer_id: number = data.buyer_id;
      const proposal_id: number = data.proposal_id;
      const secondary_market_proposal_id: number =
        data.secondary_market_proposal_id;

      const secondaryMarketProposalData =
        await Models.SecondaryProposalModel.findOne({
          where: {
            id: secondary_market_proposal_id,
            status: STATUS.OPEN,
            lock_blockchain_status: "confirmed",
            is_cancelled: {
              [Op.in]: [0, 3]
            },
          },
        });
      if (!secondaryMarketProposalData) {
        console.log(
          "Secondary market proposal not found!",
          secondary_market_proposal_id
        );
        throw new Error("Secondary market proposal not found!");
      }
      const orderData: any = await Models.OrderModel.findOne({
        where: {
          buyer_id: buyer_id,
          secondary_market_proposal_id: secondary_market_proposal_id,
          proposal_id: proposal_id,
          status: { [Op.ne]: orderStatus.CANCELLED },
          buying_type: orderBuyingType.SECONDARY,
        },
        order: [["created_at", "DESC"]],
      });
      if (!orderData) {
        console.log("order not found>>>");
        return;
      }
      if (orderData.status != orderStatus.PENDING) {
        console.log("order not pending >>>", orderData);
        return;
      }
      if (order_status == PaymentCheckoutEventStatus.cancel) {
        let proposalData: any = await Models.ProposalModel.findOne({
          where: {
            id: proposal_id,
            relisted: 1,
          },
        });
        if (!proposalData) {
          console.log("proposalData not found>>>>>");
          throw new Error(`Primary proposal data not found :: ${proposal_id} `);
        }
        const buyerTokenQty: number = Number(orderData?.token_qty);
        const currentTokenToSold: number = Number(
          secondaryMarketProposalData?.token_to_sold
        );
        const currentBlockedTokens: number = Number(
          secondaryMarketProposalData?.blocked_tokens
        );
        const newTokenToSold: number = currentTokenToSold + buyerTokenQty;
        const newBlockedTokens: number = currentBlockedTokens - buyerTokenQty;

        if (newBlockedTokens < 0) {
          console.log("newBlockedTokens in minus>>", newBlockedTokens);
          throw new Error(`
                        Order id = ${orderData.id}, 
                        newBlockedTokens :: ${newBlockedTokens} 
                        currentBlockedTokens : ${currentBlockedTokens}
                        issuedTokens  ${secondaryMarketProposalData.token_quantity}
                    `);
        }
        if (newTokenToSold < 0) {
          console.log("newTokejnToSold in minus>>", newTokenToSold);
          throw new Error(`
                        newTokejnToSold in minus:: 
                        Order id = ${orderData.id}, 
                        newTokenToSold :: ${newTokenToSold} 
                        currentTokenToSold : ${currentTokenToSold}
                        issuedTokens  ${secondaryMarketProposalData.token_quantity}
                    `);
        }
        await Models.OrderModel.update(
          {
            status: orderStatus.CANCELLED,
            is_tokens_blocked: orderTokensBlocked.unblocked,
          },
          {
            where: {
              id: orderData.id,
            },
          }
        );
        await Models.SecondaryProposalModel.update(
          {
            token_to_sold: String(newTokenToSold),
            blocked_tokens: newBlockedTokens,
          },
          {
            where: {
              id: secondary_market_proposal_id,
            },
          }
        );
        await Models.OrderLogsModel.create({
          order_id: orderData.id,
          old_status: orderData.status,
          new_status: orderStatus.CANCELLED,
          old_is_tokens_blocked: orderData.is_tokens_blocked,
          new_is_tokens_blocked: orderTokensBlocked.unblocked,
          action: orderLogActions.CANCEL,
        });
        await Models.ProposalBlockedTokensLogs.create({
          proposal_id: proposal_id,
          order_id: orderData.id,
          issued_token: Number(secondaryMarketProposalData?.token_quantity),
          old_token_to_sold: Number(currentTokenToSold),
          new_token_to_sold: Number(newTokenToSold),
          diff_token_to_sold:
            Number(currentTokenToSold) - Number(newTokenToSold),
          old_blocked_tokens: Number(currentBlockedTokens),
          new_blocked_tokens: Number(newBlockedTokens),
          diff_blocked_tokens:
            Number(currentBlockedTokens) - Number(newBlockedTokens),
          old_collected_fund:
            secondaryMarketProposalData.collected_fund as string,
          new_collected_fund:
            secondaryMarketProposalData.collected_fund as string,
          diff_collected_fund: (
            Number(secondaryMarketProposalData.collected_fund) -
            Number(secondaryMarketProposalData.collected_fund)
          ).toString(),
          action: orderLogActions.CANCEL,
        });
      }
      return;
    } catch (err: any) {
      console.log("error secondaryOrderCancel=====>", err);
      throw new Error(err.message);
    }
  };
  public async get_proposal_data(proposal_id: any) {
    try {
      const data: any = await Models.ProposalModel.findOne({
        where: {
          id: proposal_id,
          relisted: relistedStatus.listed,
        },
        raw: true,
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async get_secondary_sell_proposal(secondary_proposal_id: any) {
    try {
      let data: any = await Models.SecondaryProposalModel.findOne({
        where: {
          id: secondary_proposal_id,
          status: STATUS.OPEN,
          lock_blockchain_status: "confirmed",
          is_cancelled: {
            [Op.in]: [0, 3],
          },
        },
        raw: true,
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }

  public createSecondaryProposalTransaction = async (data: {
    proposal_id: string;
    user_id: string;
    amount: number;
    token_quantity: number;
    secondary_proposal_id: number;
  }) => {
    try {
      let proposal_id: string = data.proposal_id;
      let user_id: string = data.user_id;
      let amount: number = data.amount;
      let token_quantity: number = data.token_quantity;
      let secondary_proposal_id: number = data.secondary_proposal_id;

      let orderData: any = await Models.OrderModel.findOne({
        where: {
          buyer_id: user_id,
          secondary_market_proposal_id: secondary_proposal_id,
          buying_type: orderBuyingType.SECONDARY,
          proposal_id: proposal_id,
          status: orderStatus.PENDING,
        },
        raw: true,
      });
      if (!orderData) {
        console.log(
          `${order.ORDER_NOT_EXISTS} , ${JSON.stringify({
            buyer_id: user_id,
            buying_type: orderBuyingType.SECONDARY,
            proposal_id: proposal_id,
            secondary_market_proposal_id: secondary_proposal_id,
            status: {
              [Op.in]: [orderStatus.PENDING, orderStatus.IN_PROGRESS],
            },
          })}`
        );
        throw new Error(
          `${order.ORDER_NOT_EXISTS} , ${JSON.stringify({
            buyer_id: user_id,
            buying_type: orderBuyingType.SECONDARY,
            proposal_id: proposal_id,
            secondary_market_proposal_id: secondary_proposal_id,
            status: {
              [Op.in]: [orderStatus.PENDING, orderStatus.IN_PROGRESS],
            },
          })}`
        );
      }
      let proposalData: any = await Models.ProposalModel.findOne({
        where: {
          id: proposal_id,
          relisted: 1,
        },
        raw: true,
      });
      if (!proposalData) {
        console.log("proposal not found!");
        throw new Error(
          `order_id = ${orderData.id} , ${Messages.PROPOSAL_NOT_FOUND}`
        );
      }
      let secondaryProposalData: any =
        await Models.SecondaryProposalModel.findOne({
          where: {
            id: secondary_proposal_id,
            status: STATUS.OPEN,
            lock_blockchain_status: "confirmed",
            is_cancelled: {
              [Op.in]: [0, 3],
            },
          },
          raw: true,
        });
      if (!secondaryProposalData) {
        console.log("secondary proposal not found!");
        throw new Error(
          `order_id = ${orderData.id} , ${Messages.PROPOSAL_NOT_FOUND}`
        );
      }
      let token_value: number = secondaryProposalData.token_value;
      let tokenQuantity: number = amount / token_value;
      // if invalid token qty
      if (Number(tokenQuantity) != token_quantity) {
        throw new Error(
          `order_id = ${orderData.id} ${Messages.INVALID_TOKEN_QUANTITY}, user tkn qty = ${token_quantity}, qty should be = ${tokenQuantity} `
        );
      }
      return true;
    } catch (err: any) {
      console.log("error in createPrimaryTransaction ==", err);
      throw new Error(err.message);
    }
  };
  public async get_coin_data(token_address: any, coin_family: any) {
    try {
      const data: any = await Models.CoinsModel.findOne({
        where: {
          token_address: { [Op.like]: token_address },
          coin_family: coin_family,
        },
        attributes: ["coin_id"],
        raw: true,
        logging: true,
      });
      console.log("datacoin@@", data);
      return data?.coin_id;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }

  public async transaction_create(obj: any) {
    try {
      let data: any = await Models.TransactionsModel.create(obj);
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async order_update(order_id: any) {
    try {
      await Models.OrderModel.update(
        {
          status: "in_progress",
        },
        {
          where: {
            id: order_id,
          },
        }
      );
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async secondary_proposal_update(secondary_proposal_id: any) {
    try {
      await Models.SecondaryProposalModel.update(
        {
          cancelled_status: 0,
        },
        {
          where: {
            id: secondary_proposal_id,
          },
        }
      );
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }
  public async getSecondaryListingData(
    user_id: any,
    limit: any,
    offset: any,
    fiat_type: any
  ) {
    try {
      let data: any = await Models.SecondaryProposalModel.findAndCountAll({
        attributes: [
          "id",
          "cancelled_status",
          "is_cancelled",
          "secondary_market_proposal_id",
          "coin_family",
          "coin_id",
          "created_at",
          "token_value",
          ["token_quantity", "No_of_token"],
          "minted_token_quantity",
          [
            Sequelize.literal(
              // `CAST(secondary_market_proposals.token_value AS DECIMAL) * CAST(coin_fiat_price_data.value AS DOUBLE)`
              `secondary_market_proposals.token_value * (SELECT value FROM coin_price_in_fiats WHERE coin_id = secondary_market_proposals.coin_id AND fiat_type = '${fiat_type}')`
            ),
            "per_unit_price",
          ],
          [
            Sequelize.literal(
              `IFNULL((SELECT SUM(amount) FROM transactions WHERE secondary_market_proposal_id = secondary_market_proposals.id AND tx_type = '${orderBuyingType.SECONDARY}' AND blockchain_status = '${transactionStatus.CONFIRMED}' AND token_mint_status = 'complete'), 0)`
            ),
            "total_consumed",
          ],
        ],
        where: { user_id: user_id ,lock_blockchain_status: "confirmed",
        [Op.and]: Sequelize.literal('secondary_market_proposals.minted_token_quantity < secondary_market_proposals.token_quantity')
      },
        include: [
          {
            model: Models.CoinsInFiatModel,
            attributes: ["id", "value"],
            where: { fiat_type: fiat_type },
            as: "coin_fiat_price_data",
            required: false,
          },
          {
            model: Models.ProposalModel,
            attributes: ["id", "title", "symbol"],
            // where: { relisted: 1 },
            as: "secondary_proposal_data",
            required: false,
            include: [
              {
                model: Models.ProposalImageModel,
                attributes: ["id", "url", "type"],
                as: "proposal_file",
                required: false,
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
        offset: offset,
        logging: true,
      });
      return data;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      throw err;
    }
  }

  public async holdingSecondaryProposal(
    user_id: any,
    limit: any,
    offset: any,
    fiat_type: any
  ) {
    try {
      console.log("holding_primary_proposal fiat_type ---=== ", fiat_type);
      const totalInvestedMintedBalanceUSD: any =
        await Models.UserBalanceModel.findAll({
          attributes: [
            [
              Sequelize.literal(
                `SUM(CAST(invested_balance AS DOUBLE) * (SELECT value FROM coin_price_in_fiats WHERE coin_id = user_secondary_proposal_data.coin_id AND fiat_type = '${fiat_type}') * user_secondary_proposal_data.token_value)`
              ),
              "user_invested_token_quantity_USD",
            ],
            [
              Sequelize.literal(
                `SUM(CAST(available_balance AS DOUBLE) * (SELECT value FROM coin_price_in_fiats WHERE coin_id = user_secondary_proposal_data.coin_id AND fiat_type = '${fiat_type}') * user_secondary_proposal_data.token_value)`
              ),
              "user_minted_token_quantity_USD",
            ],
          ],
          where: {
            user_id: user_id,
            is_primary: 0,
          },
          include: [
            {
              model: Models.SecondaryProposalModel,
              attributes: [],
              as: "user_secondary_proposal_data",
              required: true,
            },
          ],
          raw: true,
        });
      ///////////////////////////////////////
      let whereCondition: any = {
        user_id: user_id,
        is_primary: 0,
        tx_type: { [Op.or]: ["secondary", "deposit", "withdraw"] },
        updated_at: {
          [Op.in]: Sequelize.literal(
            `(SELECT MAX(updated_at) FROM transactions AS tr WHERE tr.user_id = ${user_id} AND tr.tx_type IN ('secondary', 'deposit' , 'withdraw') AND tr.proposal_id = transactions.proposal_id AND is_primary = 0 AND tr.secondary_market_proposal_id = transactions.secondary_market_proposal_id GROUP BY tr.secondary_market_proposal_id)`
          ),
        },
      };

      console.log("whereCondition >>", whereCondition);
      const data: any = await Models.TransactionsModel.findAndCountAll({
        attributes: [
          [
            Sequelize.literal(
              `CAST(user_balance_data.invested_balance AS DOUBLE) * transaction_secondary_proposal_data.token_value`
            ),
            "invested_amount_USDT",
          ],
          "user_id",
          ["updated_at", "updatDate"],
          "amount",
          "proposal_id",
          "secondary_market_proposal_id",
          "is_primary",
          ["created_at", "date_of_invested_amount"],
          "token_mint_status",
          "blockchain_status",
          "refund_status",
          "id",
        ],
        where: whereCondition,
        include: [
          {
            model: Models.ProposalModel,
            attributes: ["id", "title"],
            as: "proposal_data",
            required: true,

            include: [
              {
                model: Models.ProposalImageModel,
                attributes: ["id", "url", "type"],
                as: "proposal_file",
                required: true,
              },
            ],
          },
          {
            model: Models.SecondaryProposalModel,
            attributes: ["token_value"],
            as: "transaction_secondary_proposal_data",
            required: true,
          },
          {
            model: Models.UserBalanceModel,
            attributes: ["invested_balance", "secondary_market_proposal_id"],
            as: "user_balance_data",
            required: true,
            where: {
              [Op.and]: Sequelize.literal(
                `transactions.secondary_market_proposal_id = user_balance_data.secondary_market_proposal_id`
              ),
              is_primary: 0,
            },
          },
        ],
        order: [["updated_at", "DESC"]],
        group: ["secondary_market_proposal_id"],
        limit,
        offset,
      });

      /////////////////////////////////////////////////////
      const groupCount = data?.count?.length || 0;
      console.log(
        "totalInvestedMintedBalanceUSD@@@@@@",
        totalInvestedMintedBalanceUSD
      );

      let finalData = {
        total_invested_assets_fiat:
          totalInvestedMintedBalanceUSD[0].user_invested_token_quantity_USD ||
          0,
        total_minted_assets_fiat:
          totalInvestedMintedBalanceUSD[0].user_minted_token_quantity_USD || 0,
        data: data,
        count: groupCount,
      };
      console.log("finalData@@@", finalData);

      return finalData || [];
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }

  public async view_proposal_secondary_transaction_history(
    user_id: any,
    proposal_id: any,
    secondary_market_proposal_id: any,
    limit: any,
    offset: any
  ) {
    try {
      const transactionData = await Models.TransactionsModel.findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [{ user_id: user_id }, { seller_id: user_id }],
            },
            { is_primary: 0 },
            { proposal_id: proposal_id },
            { secondary_market_proposal_id: secondary_market_proposal_id },
            {
              [Op.or]: [
                { tx_type: orderBuyingType.WITHDRAW },
                { tx_type: orderBuyingType.DEPOSIT },
                { tx_type: orderBuyingType.SECONDARY },
              ],
            },
          ],
        },
        include: [
          {
            model: Models.OrderModel,
            attributes: [],
            as: "order_data",
            required: false,
            where: {
              [Op.or]: [{ buyer_id: user_id }, { seller_id: user_id }],
              buying_type: orderBuyingType.SECONDARY,
            },
          },
        ],
        attributes: [
          ["created_at", "investment_date"],
          "amount",
          ["blockchain_status", "status"],
          ["refund_status", "refund_status"],
          "from_adrs",
          "to_adrs",
          "coin_family",
          [
            Sequelize.literal(`
                CASE 
                    WHEN tx_type = '${orderBuyingType.DEPOSIT}' THEN 'deposit'
                    WHEN tx_type = '${orderBuyingType.WITHDRAW}' THEN 'withdraw'
                    WHEN tx_type = '${orderBuyingType.SECONDARY}' AND \`order_data\`.\`buyer_id\` = ${user_id} THEN 'buy'
                    WHEN tx_type = '${orderBuyingType.SECONDARY}' AND \`order_data\`.\`seller_id\` = ${user_id} THEN 'sell'
                    ELSE NULL 
                END
            `),
            "type",
          ],
        ],
        order: [["updated_at", "DESC"]],
        limit,
        offset,
      });
      return transactionData;
    } catch (error) {
      console.error("Error in proposal_create>>", error);
      return false;
    }
  }
  public async view_secondary_particular_proposal(
    user_id: any,
    proposal_id: any,
    secondary_market_proposal_id: any
  ) {
    try {
      const user_balance: any = await Models.UserBalanceModel.findOne({
        where: {
          user_id: user_id,
          proposal_id: proposal_id,
          secondary_market_proposal_id: secondary_market_proposal_id,
          is_primary: 0,
        },
        raw: true,
      });
      const transactionData: any = await Models.TransactionsModel.findAll({
        attributes: [
          [
            Sequelize.literal(
              `SUM(CASE WHEN tx_type = '${orderBuyingType.SECONDARY}' THEN user_token_quantity ELSE 0 END)`
            ),
            "total_purchased_token",
          ],
        ],
        where: {
          user_id: user_id,
          proposal_id: proposal_id,
          secondary_market_proposal_id: secondary_market_proposal_id,
          is_primary: 0,
          status: transactionStatus.STATUS_COMPLETE,
          blockchain_status: transactionStatus.CONFIRMED,
          token_mint_status: transactionStatus.STATUS_COMPLETE,
          [Op.or]: [
            { tx_type: orderBuyingType.SECONDARY },
            { tx_type: orderBuyingType.WITHDRAW },
            { tx_type: orderBuyingType.DEPOSIT },
          ],
        },
        raw: true,
      });
      const total_purchased_token =
        Number(transactionData[0].total_purchased_token) || 0;
      let obj = {
        total_token: Number(user_balance?.total_available_balance) || 0,
        available_in_wallet: Number(user_balance?.available_balance) || 0,
        open_to_sell: Number(user_balance?.on_sell_balance) || 0,
        total_purchased_token: total_purchased_token,
        total_sent_token: Number(user_balance?.sent_balance) || 0,
        total_received_token: Number(user_balance?.received_balance) || 0,
      };
      return obj;
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }

  public async secondaryPortfolioList(
    user_id: any,
    tx_type: any,
    limit: any,
    offset: any,
    fiat_type: any
  ) {
    try {
      console.log("portfolioList fiat type", fiat_type);

      const totalInvestedMintedBalanceUSD: any =
        await Models.UserBalanceModel.findAll({
          attributes: [
            [
              Sequelize.literal(
                `SUM(CAST(invested_balance AS DOUBLE) * (SELECT value FROM coin_price_in_fiats WHERE coin_id = user_secondary_proposal_data.coin_id AND fiat_type = '${fiat_type}') * user_secondary_proposal_data.token_value)`
              ),
              "user_invested_token_quantity_USD",
            ],
            [
              Sequelize.literal(
                `SUM(CAST(available_balance AS DOUBLE) * (SELECT value FROM coin_price_in_fiats WHERE coin_id = user_secondary_proposal_data.coin_id AND fiat_type = '${fiat_type}') * user_secondary_proposal_data.token_value)`
              ),
              "user_minted_token_quantity_USD",
            ],
          ],
          where: {
            user_id: user_id,
            is_primary: 0,
          },
          include: [
            {
              model: Models.SecondaryProposalModel,
              attributes: [],
              as: "user_secondary_proposal_data",
              required: true,
            },
          ],
          raw: true,
        });

      const data: any = await Models.TransactionsModel.findAndCountAll({
        attributes: [
          "user_id",
          "proposal_id",
          "secondary_market_proposal_id",
          [
            Sequelize.literal(
              `CAST(user_balance_data.invested_balance AS DOUBLE) * transaction_coin_fiat_price_data.value * transaction_secondary_proposal_data.token_value`
            ),
            "total_usdt_invested_usd",
          ],
          [
            Sequelize.literal(
              `(CAST(user_balance_data.invested_balance AS DOUBLE) * transaction_secondary_proposal_data.token_value / CAST(transaction_secondary_proposal_data.raise_fund AS DOUBLE)) * 100`
            ),
            "investment_percenatge",
          ],
        ],
        where: {
          user_id: user_id,
          is_primary: 0,
          tx_type: orderBuyingType.SECONDARY,
          status: transactionStatus.STATUS_COMPLETE,
          blockchain_status: transactionStatus.CONFIRMED,
          refund_status: null,
        },
        include: [
          {
            model: Models.ProposalModel,
            attributes: ["title", "raise_fund"],
            as: "proposal_data",
            required: true,
            include: [
              {
                model: Models.AssetModel,
                attributes: ["asset_type", "id"],
                as: "asset_type",
                required: true,
              },
            ],
          },
          {
            model: Models.SecondaryProposalModel,
            attributes: ["token_value", "raise_fund"],
            as: "transaction_secondary_proposal_data",
            required: true,
          },
          {
            model: Models.CoinsInFiatModel,
            attributes: ["value", "fiat_type"],
            where: { fiat_type: fiat_type },
            as: "transaction_coin_fiat_price_data",
            required: true,
          },
          {
            model: Models.UserBalanceModel,
            attributes: [
              "invested_balance",
              "proposal_id",
              "secondary_market_proposal_id",
            ],
            as: "user_balance_data",
            required: true,
            where: {
              [Op.and]: [
                Sequelize.literal(
                  `transactions.proposal_id = user_balance_data.proposal_id`
                ),
                Sequelize.literal(
                  `transactions.secondary_market_proposal_id = user_balance_data.secondary_market_proposal_id`
                ),
                { is_primary: 0 },
                { invested_balance: { [Op.gt]: 0 } } 
              ],
            },
          },
        ],
        order: [["updated_at", "DESC"]],
        group: ["proposal_data.asset_type.id", "secondary_market_proposal_id"],
        limit,
        offset,
        logging: true,
      });

      const groupCount = data?.count?.length || 0;
      console.log("groupCount@@", groupCount);

      let finalData = {
        total_invested_assets_usd:
          totalInvestedMintedBalanceUSD[0]?.user_invested_token_quantity_USD ||
          0,
        total_minted_assets_usd:
          totalInvestedMintedBalanceUSD[0]?.user_minted_token_quantity_USD || 0,
        data: data,
        count: groupCount,
      };
      return finalData || [];
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }

  public async updateUserBalance(updateBalanceObj: any, transaction: any) {
    try {
      let updateData: any;
      if (updateBalanceObj?.is_primary == 0) {
        updateData = await Models.UserBalanceModel.update(
          {
            available_balance: updateBalanceObj?.new_availbale_token_bal,
            // on_sell_balance: updateBalanceObj?.new_on_sell_tokens,
          },
          {
            where: {
              user_id: updateBalanceObj?.user_id,
              proposal_id: updateBalanceObj?.proposal_id,
              secondary_market_proposal_id:
                updateBalanceObj?.secondary_market_proposal_id,
              is_primary: 0,
            },
            transaction,
          }
        );
      } else if (updateBalanceObj?.is_primary == 1) {
        updateData = await Models.UserBalanceModel.update(
          {
            available_balance: updateBalanceObj?.new_availbale_token_bal,
            // on_sell_balance: updateBalanceObj?.new_on_sell_tokens,
          },
          {
            where: {
              user_id: updateBalanceObj?.user_id,
              proposal_id: updateBalanceObj?.proposal_id,
              is_primary: 1,
            },
            transaction,
          }
        );
      }
      return updateData;
    } catch (err: any) {
      throw err;
    }
  }
  public async getUserBalanceData(getBalanceObj: any) {
    try {
      let userBalanceData: any;
      if (getBalanceObj?.is_primary == 1) {
        userBalanceData = await Models.UserBalanceModel.findOne({
          where: {
            user_id: getBalanceObj?.user_id,
            proposal_id: getBalanceObj?.proposal_id, 
            is_primary: 1,
          },
          raw: true,
        });
      } else if (getBalanceObj?.is_primary == 0) {
        userBalanceData = await Models.UserBalanceModel.findOne({
          where: {
            user_id: getBalanceObj?.user_id,
            proposal_id: getBalanceObj?.proposal_id,
            secondary_market_proposal_id:
              getBalanceObj?.secondary_market_proposal_id,
            is_primary: 0,
          },
          raw: true,
        });
      }
      return userBalanceData;
    } catch (err: any) {
      console.error("Error in balance update>>", err); 
      return false;
    }
  }
  public async getSingleWalletAddressDetail(
    userId: any,
    proposalId: any,
    isPrimary: any,
    secondaryProposalId: any
  ) {
    try {
      let userBalanceData: any;
      console.log("isPrimary@@@@", isPrimary);
      if (isPrimary == 1) {
        userBalanceData = await Models.UserBalanceModel.findOne({
          attributes: [
            "available_balance",
            "proposal_id",
            "secondary_market_proposal_id",
          ],
          where: {
            user_id: userId,
            proposal_id: proposalId,
            is_primary: 1,
          },
          include: [
            {
              model: Models.WalletModel,
              where: {
                proposal_id: proposalId,
                is_sto_wallet: 1,
              },
              attributes: ["wallet_address", "wallet_id"],
              as: "userWalletData",
              required: true,
            },
            {
              model: Models.ProposalModel,
              attributes: ["token_address", "symbol"],
              as: "userProposalData",
              required: true,
              include: [
                {
                  model: Models.ProposalImageModel,
                  attributes: ["url"],
                  as: "proposal_file",
                  required: true,
                },
              ],
            },
          ],
        });
      } else if (isPrimary == 0) {
        userBalanceData = await Models.UserBalanceModel.findOne({
          attributes: [
            "available_balance",
            "proposal_id",
            "secondary_market_proposal_id",
          ],
          where: {
            user_id: userId,
            proposal_id: proposalId,
            secondary_market_proposal_id: secondaryProposalId,
            is_primary: 0,
          },
          include: [
            {
              model: Models.WalletModel,
              where: {
                proposal_id: proposalId,
                is_sto_wallet: 1,
              },
              attributes: ["wallet_address", "wallet_id"],
              as: "userWalletData",
              required: true,
            },
            {
              model: Models.ProposalModel,
              attributes: ["token_address", "symbol"],
              as: "userProposalData",
              required: true,

              include: [
                {
                  model: Models.ProposalImageModel,
                  attributes: ["url"],
                  as: "proposal_file",
                  required: true,
                },
              ],
            },
          ],
        });
      }
      // console.log("userBalance data.. >>", userBalance)
      let finalData = {
        data: userBalanceData,
      };
      return finalData || [];
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
  public async listsOfAllUsdtTokens() {
    try {
      let usdtData: any = await Models.CoinsModel.findAll({
        attributes: ["coin_id", "coin_family", "coin_symbol", "token_address"],
        where: {
          coin_id: {
            [Op.in]: [336, 360, 9, 417],
          },
        },
      });
      console.log("usdtData >>>", usdtData);
      let finalData = {
        data: usdtData,
      };
      return finalData || [];
    } catch (err: any) {
      console.error("Error in proposal_create>>", err);
      return false;
    }
  }
}

const Secondaryhelper = new secondaryhelper();
export default Secondaryhelper;
