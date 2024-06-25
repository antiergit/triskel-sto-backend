import { Op, Sequelize, col } from 'sequelize';
import rabbitMq from '../../../helpers/common/rabbitMq';
import AWS from 'aws-sdk';
import { CoinFamily, Fiat_Currency, GlblBooleanEnum, GlblCode } from '../../../constants/global_enum'
import { config } from "../../../config";
import commonHelper from '../../../helpers/common/common.helpers';
import { language } from '../../../constants';
import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import * as Models from '../../../models/model/index';
import { transactionStatus } from './enum';


class agentHelper {
    public async agent_proposal_data(limit: any, offset: any) {
        try {
            const data: any = await Models.ProposalModel.findAndCountAll({
                attributes: [
                    'id',
                    ['title', 'proposal_name'],
                    'token_name', 'relisted', 'token_address', 'agent_address', 'project_id',
                    ['token_quantity', 'total_token_quantity'],
                    [
                        Sequelize.literal(`CAST(collected_fund AS DECIMAL) / CAST(token_value AS DECIMAL) `),
                        'consumed_token_quantity'
                    ],
                    "status"
                ],
                where: {
                    token_address: {
                        [Op.ne]: null
                    }
                },
                include: [
                    {
                        model: Models.AssetModel,
                        attributes: [
                            ['asset_type', 'type_of_proposal'],
                            'id'],
                        as: "asset_type",
                        required: true,
                    },
                ],
                order: [["updated_at", "DESC"]],
                limit,
                offset,
            });
            return data || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }
    public async view_particular_proposal_data(proposal_id: any, limit: any, offset: any) {
        try {
            const total_consumed_token_quantity: any = await Models.ProposalModel.findOne({
                attributes: [
                    [
                        Sequelize.literal(`CAST(collected_fund AS DECIMAL) / CAST(token_value AS DECIMAL) `),
                        'consumed_token_quantity'
                    ],
                ],
                where: {
                    id: proposal_id,
                },
                raw: true
            });

            const investmentdata: any = await Models.TransactionsModel.findAndCountAll({
                attributes: [
                    "id",
                    "user_id",
                    "amount",
                    "status",
                    "user_adrs",
                    [Sequelize.literal('proposal_data.soft_cap_status'), 'soft_cap_status'],
                    [Sequelize.literal('proposal_data.hard_cap_status'), 'hard_cap_status'],

                ],
                where: {
                    proposal_id: proposal_id,
                    tx_type: "primary",
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    refund_status: null
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: 'proposal_data',
                        required: false,
                    },
                    {
                        model: Models.WalletModel,
                        attributes: ["username", "email", "approval_status"],
                        as: 'wallet_data',
                        required: false,
                    }
                ],
                order: [["updated_at", "DESC"]],
                group: ["proposal_data.id", "user_id"],
                limit,
                offset,

            });
            const groupCount = investmentdata?.count?.length || 0;
            console.log("groupCount", groupCount);
            let no_of_users_invested = investmentdata?.count?.length ? investmentdata?.count?.length : 0;
            let consumed_token_quantity = total_consumed_token_quantity?.consumed_token_quantity ? total_consumed_token_quantity?.consumed_token_quantity : 0
            const no_of_address_whitelisted: any = await Models.WalletModel.count({
                where: {
                    proposal_id: proposal_id,
                    is_sto_wallet: 1,
                    approval_status: "approved"
                }
            });
            return {
                no_of_users_invested, no_of_address_whitelisted, consumed_token_quantity, investmentdata, count: groupCount
            } || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }
    public async view_particular_proposal_data_for_minting(proposal_id: any, limit: any, offset: any) {
        try {
            const total_consumed_token_quantity: any = await Models.ProposalModel.findOne({
                attributes: [
                    [
                        Sequelize.literal(`CAST(collected_fund AS DECIMAL) / CAST(token_value AS DECIMAL) `),
                        'consumed_token_quantity'
                    ],
                ],
                where: {
                    id: proposal_id,
                },
                raw: true
            });
            console.log("total_consumed_token_quantity@@", total_consumed_token_quantity)

            const investmentdata: any = await Models.TransactionsModel.findAndCountAll({
                attributes: [
                    "id",
                    "user_id",
                    "user_token_quantity",
                    "status",
                    "blockchain_status",
                    "refund_status",
                    "user_adrs",
                    "qa_status",
                    "token_mint_status",
                    [Sequelize.literal('proposal_data.soft_cap_status'), 'soft_cap_status'],
                    [Sequelize.literal('proposal_data.hard_cap_status'), 'hard_cap_status'],
                    [Sequelize.literal('proposal_data.id'), 'proposal_id']

                ],
                where: {
                    proposal_id: proposal_id,
                    tx_type: "primary",
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    refund_status: null
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: ["start_date", "end_date"],
                        as: 'proposal_data',
                        required: false,
                    },
                    {
                        model: Models.WalletModel,
                        attributes: ["username", "email", "wallet_address", "approval_status"],
                        as: 'wallet_data',
                        required: false,
                    }
                ],
                order: [["updated_at", "DESC"]],
                limit,
                offset,
            });

            let no_of_users_invested = investmentdata?.count ? investmentdata?.count : 0;
            let consumed_token_quantity = total_consumed_token_quantity?.consumed_token_quantity ? total_consumed_token_quantity?.consumed_token_quantity : 0
            const no_of_address_whitelisted: any = await Models.WalletModel.count({
                where: {
                    proposal_id: proposal_id,
                    is_sto_wallet: 1,
                    approval_status: "approved"
                }
            });
            return { no_of_users_invested, no_of_address_whitelisted, consumed_token_quantity, investmentdata } || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }
    public async adding_sto_trnx_to_queue(data: any) {
        try {
            console.log("adding_trade_to_queue>>>", data)
            await rabbitMq.assertQueue(config.STO_TRNX_MINT)
            await rabbitMq.sendToQueue(config.STO_TRNX_MINT, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in adding_trade_to_queue>>>", err)
            return false;
        }
    }

    public async view_particular_proposal_data_for_minting_for_dwnld_csv(proposal_id: any) {
        try {
            const investmentdata: any = await Models.TransactionsModel.findAll({
                attributes: [
                    "id",
                    "user_id",
                    "user_token_quantity",
                    "amount",
                    "status",
                    "blockchain_status",
                    "refund_status",
                    "user_adrs",
                    "qa_status",
                    "token_mint_status",
                    [Sequelize.literal('proposal_data.soft_cap_status'), 'soft_cap_status'],
                    [Sequelize.literal('proposal_data.hard_cap_status'), 'hard_cap_status'],
                    [Sequelize.literal('proposal_data.id'), 'proposal_id']

                ],
                where: {
                    proposal_id: proposal_id,
                    tx_type: "primary",
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    refund_status: null
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: 'proposal_data',
                        required: false,
                    },
                    {
                        model: Models.WalletModel,
                        attributes: ["username", "email", "wallet_address", "approval_status"],
                        as: 'wallet_data',
                        required: false,
                    }
                ],
                order: [["updated_at", "DESC"]]

            });
            return investmentdata || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }

    public async view_particular_proposal_data_dwld_csv(proposal_id: any) {
        try {

            const investmentdata: any = await Models.TransactionsModel.findAll({
                attributes: [
                    "id",
                    "user_id",
                    "amount",
                    "status",
                    "user_adrs",
                    [Sequelize.literal('proposal_data.soft_cap_status'), 'soft_cap_status'],
                    [Sequelize.literal('proposal_data.hard_cap_status'), 'hard_cap_status'],

                ],
                where: {
                    proposal_id: proposal_id,
                    tx_type: "primary",
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    refund_status: null
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: 'proposal_data',
                        required: false,
                    },
                    {
                        model: Models.WalletModel,
                        attributes: ["username", "email", "wallet_address", "approval_status"],
                        as: 'wallet_data',
                        required: false,
                    }
                ],
                order: [["updated_at", "DESC"]],
                group: ["proposal_data.id", "user_id"]

            });

            return investmentdata || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }

    public async secondaryProposalData(limit: any, offset: any) {
        try {
          const data = await Models.SecondaryProposalModel.findAndCountAll({
            attributes: [
              "id",
              "coin_family",
              "coin_id",
              "user_id",
              "seller_wallet_address",
              "proposal_id",
              [
                Sequelize.literal(`IFNULL(
                  (SELECT COUNT(DISTINCT user_id) FROM transactions WHERE proposal_id = secondary_proposal_data.id AND tx_type = 'primary' AND blockchain_status = 'CONFIRMED' AND status = 'complete' AND refund_status IS NULL),
                  0
                )`),
                "no_of_primary_investors",
              ],
              [
                Sequelize.literal(`IFNULL(
                  (SELECT COUNT(DISTINCT user_id) FROM transactions WHERE proposal_id = secondary_proposal_data.id AND tx_type = 'secondary' AND blockchain_status = 'CONFIRMED' AND status = 'complete' AND refund_status IS NULL),
                  0
                )`),
                "no_of_secondary_investors",
              ],
              [
                Sequelize.literal(`IFNULL(
                  (SELECT COUNT(DISTINCT user_id) FROM secondary_market_proposals WHERE proposal_id = secondary_proposal_data.id),
                  0
                )`),
                "no_of_sellers",
              ]
            ],
            include: [
              {
                model: Models.ProposalModel,
                attributes: ["token_name" ,"id","relisted"],
                as: "secondary_proposal_data",
                required: true,
                include: [
                  {
                    model: Models.AssetModel,
                    attributes: [
                      ['asset_type', 'type_of_proposal'],
                      'id'
                    ],
                    as: "asset_type",
                    required: true,
                  },
                ],
              },
            ],
            order: [["updated_at", "DESC"]],
            group: ["secondary_proposal_data.id"],
            limit,
            offset,
          });
          return data || [];
        } catch (error) {
          console.error("Error in secondaryProposalData:", error);
          return false;
        }
      }

      public async getSeconadryList(
        proposal_id: any,
        limit: any,
        offset: any,
      ) {
        try {
          let data: any = await Models.SecondaryProposalModel.findAndCountAll({
            attributes: [
              "token_quantity",
              ["token_value","per_unit_price"],
              [
                Sequelize.literal(`IFNULL((SELECT SUM(user_token_quantity) FROM transactions WHERE secondary_market_proposal_id = secondary_market_proposals.id AND tx_type = 'secondary' AND blockchain_status = '${transactionStatus.CONFIRMED}' AND refund_status IS NULL AND token_mint_status = 'complete' AND status = 'complete'), 0)`),
                "total_consumed",
              ],
              "coin_family",
              "coin_id",
              "user_id",
              "seller_wallet_address",
              "proposal_id",
              "status",
              "token_address"
            ],
            where: {
              proposal_id: proposal_id,
            },
            include: [
              {
                model: Models.ProposalModel,
                attributes:["token_name"],
                as: "secondary_proposal_data",
                required: true,
              }
            ],
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

      public async getSeconadryMarketData(
        limit: any,
        offset: any,
      ) {
        try {
            const investmentData: any =
            await Models.TransactionsModel.findAndCountAll({
              attributes: [
                [
                  Sequelize.literal(`IFNULL(
                    (
                      SELECT JSON_OBJECT('email', email, 'username', username)
                      FROM wallets
                      WHERE is_sto_wallet = 1 AND user_id = transactions.seller_id
                      LIMIT 1
                    ),
                    JSON_OBJECT('email', '0', 'username', '0')
                  )`),
                  "seller_wallet_data"
                ],
                ["user_token_quantity","quantity_of_token"],
                ["amount","invested_amount"],
                "coin_family",
                ["token_value","initial_rate"],
                ["created_at","date_of_investment"],
                "refund_status",
                "status",
                "blockchain_status",
                "token_mint_status"
              ],
              where: {
                tx_type: "secondary"
              },
              include: [
                {
                  model: Models.ProposalModel,
                  attributes: ["token_name"],
                  as: "proposal_data",
                  required: true,
                },
                {
                  model: Models.WalletModel,
                  attributes: [
                    ["username","buyer_username"],
                    ["email","buyer_email"],
                    "approval_status"
                   ],
                  as: "wallet_data",
                  required: true,
                }
              ],
              order: [["updated_at", "DESC"]],
              limit,
              offset,
            });
            return investmentData
        } catch (err: any) {
          console.error("Error in proposal_create>>", err);
          return false;
        }
      }
}

const agenthelper = new agentHelper();
export default agenthelper;
