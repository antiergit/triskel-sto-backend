import { Op, col, fn, Sequelize } from 'sequelize';
import rabbitMq from '../../../helpers/common/rabbitMq';
import AWS from 'aws-sdk';
import { CoinFamily, Fiat_Currency, GlblBooleanEnum, GlblCode } from '../../../constants/global_enum'
import { config } from "../../../config";
import commonHelper from '../../../helpers/common/common.helpers';
import { language } from '../../../constants';
import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import { global_helper } from "../../../helpers/common/global_helper";

import * as Models from '../../../models/model/index';
import { Messages, TUT_COIN_ID, tokenMintStatus, coinSymbol, orderBuyingType, transactionStatus, orderStatus, orderLogActions, ProposalCategoryStatus, mintStatus, orderTokensBlocked, PaymentCheckoutEventStatus, relistedStatus, order } from './enum';
import { coin_queries, wallet_queries, card_liminal_queries } from '../../../helpers/dbHelper/index';

import { maticWeb3 } from "../../../helpers/blockChainHelper/web3_matic_helpers";
import { ethWeb3 } from "../../../helpers/blockChainHelper/web3_eth_helpers";
import { bscWeb3 } from "../../../helpers/blockChainHelper/web3.bsc_helper";
import { trxWeb3 } from "../../../helpers/blockChainHelper/web3_trx_helper";

import { AbiItem } from "web3-utils";

import { exponentialToDecimal } from "../../../helpers/blockChainHelper/globalFunctions";




class proposaltHelper {

    public async proposal_create(obj: any) {
        try {
            let data: any = await Models.ProposalModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async order_create(obj: any, transaction: any) {
        try {
            let data: any = await Models.OrderModel.create(obj, { transaction })
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err
        }
    }
    public async proposal_update(blocked_tokens: any, token_to_sold: any, proposal_id: any, transaction: any) {
        try {
            let updateData = await Models.ProposalModel.update(
                {
                    blocked_tokens: blocked_tokens,
                    token_to_sold: String(token_to_sold)
                },
                {
                    where: {
                        id: proposal_id,
                    },
                    transaction
                }
            )
            return updateData
        }
        catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err
        }
    }
    public async proposal_file_create(obj: any) {
        try {
            let data: any = await Models.ProposalImageModel.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async sto_token_price() {
        try {
            let data: any = await Models.PriceConversionModel.findOne({
                attributes: ["asset_name", "token_price", "token_price_symbol"],
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async proposal_data(condition: any, limit: any, offset: any, fiat_type: any) {
        try {
            console.log("fiat_type proposal_data --===", fiat_type)
            let tut_price_in_usd: any = await Models.CoinsInFiatModel.findOne({
                attributes: ["value"],
                where: {
                    coin_id: TUT_COIN_ID?.coin_id,
                    fiat_type: fiat_type

                },
                raw: true
            })
            let one_tut_price_in_usd = tut_price_in_usd?.value;
            console.log("one_tut_price_in_usd",one_tut_price_in_usd)
            const data: any = await Models.ProposalModel.findAndCountAll({
                attributes: [
                    'id',
                    'asset_type_id',
                    'title',
                    'description',
                    'company_name',
                    'token_name',
                    'raise_fund',
                    'token_value',
                    'head',
                    [
                        Sequelize.literal(`CAST(token_quantity AS DOUBLE) - CAST(token_to_sold AS DOUBLE)`),
                        'collected_funded_with_blocked_TST'
                    ],
                    // [
                    //     Sequelize.literal(`(CAST(collected_fund AS DECIMAL) / CAST(raise_fund AS DECIMAL)) * 100`),
                    //     'tut_funded_percentage'
                    // ],
                    'collected_fund',
                    'fee',
                    'start_date',
                    'end_date',
                    'min_investment',
                    'token_quantity',
                    'project_yield',
                    'asset_info',
                    'token_address',
                    'updated_at'],
                where: {
                    [Op.and]: [
                        condition,
                        {
                           
                            token_address: { [Op.ne]: null }
                        }
                    ]
                }, include: [
                    {
                        model: Models.ProposalImageModel,
                        attributes: ['url', 'type'],
                        as: "proposal_file",
                        required: false,
                    },
                    {
                        model: Models.AssetModel,
                        attributes: ['asset_type'],
                        as: "asset_type",
                        required: false,
                    },
                    {
                        model: Models.IconModel,
                        attributes: ['sub_head_name', 'sub_head_value', 'icon'],
                        as: "proposal_icon",
                        required: false,
                    },
                ],
                order: [["updated_at", "DESC"]],
                limit,
                offset,
            });
            return { data, one_tut_price_in_usd} || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async get_proposal_data(proposal_id: any) {
        try {
            const data: any = await Models.ProposalModel.findOne({
                where: { id: proposal_id},
                raw: true
            });
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err
        }
    }
    public async get_coin_data(coin_id: any) {
        try {
            const data: any = await Models.CoinsModel.findOne({
                where: { coin_id: coin_id },
                attributes: ["coin_id"],
                raw: true
            });
            return data?.coin_id;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async get_proposal_coin(proposal_id: any) {
        try {
            const data: any = await Models.CoinsModel.findOne({
                where: { proposal_id: proposal_id },
                attributes: ["coin_id"],
                raw: true
            });
            return data?.coin_id;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async proposal_conversion_data(proposal_id: any) {
        try {
            const data: any = await Models.ProposalModel.findOne({
                where: { id: proposal_id},
                attributes: ["token_value", "token_name", "min_investment", "description", "asset_info"],
                raw: true
            });
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public cancelOrder = async (
        data: {
            order_status: number,
            buyer_id: any,
            proposal_id: any
        }
    ) => {
        try {
            let order_status: number = data.order_status;
            let buyer_id: number = data.buyer_id;
            let proposal_id: number = data.proposal_id;
            const orderData: any = await Models.OrderModel.findOne({
                where: {
                    buyer_id: buyer_id, proposal_id: proposal_id,
                    status: { [Op.ne]: orderStatus.CANCELLED },
                    buying_type: orderBuyingType.PRIMARY

                },
                order: [["created_at", "DESC"]],
            });
            if (!orderData) {
                return false;
            }
            if (orderData.status != orderStatus.PENDING) {
                return false;
            }
            if (order_status == PaymentCheckoutEventStatus.cancel) {
                let proposalData: any = await Models.ProposalModel.findOne({
                    where: {
                        id: proposal_id
                    }
                });
                if (!proposalData) {
                    throw new Error(`proposalData not found :: ${proposal_id} `);
                }
                const buyerTokenQty: number = Number(orderData?.token_qty);
                const currentTokenToSold: number = Number(proposalData?.token_to_sold);
                const currentBlockedTokens: number = Number(proposalData?.blocked_tokens);
                const newTokenToSold: number = currentTokenToSold + buyerTokenQty;
                const newBlockedTokens: number = currentBlockedTokens - buyerTokenQty;

                if (newBlockedTokens < 0) {
                    throw new Error(`
                        Order id = ${orderData.id}, 
                        newBlockedTokens :: ${newBlockedTokens} 
                        currentBlockedTokens : ${currentBlockedTokens}
                        issuedTokens  ${proposalData.issuedToken}
                    `);
                }
                if (newTokenToSold < 0) {
                    throw new Error(`
                        newTokejnToSold in minus:: 
                        Order id = ${orderData.id}, 
                        newTokenToSold :: ${newTokenToSold} 
                        currentTokenToSold : ${currentTokenToSold}
                        issuedTokens  ${proposalData.issuedToken}
                    `);
                }
                await Models.OrderModel.update({
                    status: orderStatus.CANCELLED,
                    is_tokens_blocked: orderTokensBlocked.unblocked,
                }, {
                    where: {
                        id: orderData.id
                    },
                });
                await Models.ProposalModel.update({
                    token_to_sold: newTokenToSold.toString(),
                    blocked_tokens: newBlockedTokens
                }, {
                    where: {
                        id: proposal_id
                    },
                });
                await Models.OrderLogsModel.create({
                    order_id: orderData.id,
                    old_status: orderData.status,
                    new_status: orderStatus.CANCELLED,
                    old_is_tokens_blocked: orderData.is_tokens_blocked,
                    new_is_tokens_blocked: orderTokensBlocked.unblocked,
                    action: orderLogActions.CANCEL
                },
                );
                await Models.ProposalBlockedTokensLogs.create({
                    proposal_id: proposal_id,
                    order_id: orderData.id,
                    issued_token: Number(proposalData?.token_quantity),
                    old_token_to_sold: Number(currentTokenToSold),
                    new_token_to_sold: Number(newTokenToSold),
                    diff_token_to_sold: (Number(currentTokenToSold) - Number(newTokenToSold)),
                    old_blocked_tokens: Number(currentBlockedTokens),
                    new_blocked_tokens: Number(newBlockedTokens),
                    diff_blocked_tokens: (Number(currentBlockedTokens) - Number(newBlockedTokens)),
                    old_collected_fund: proposalData.collected_fund as string,
                    new_collected_fund: proposalData.collected_fund as string,
                    diff_collected_fund: (Number(proposalData.collected_fund) - Number(proposalData.collected_fund)).toString(),
                    action: orderLogActions.CANCEL
                });
            }
            return;
        } catch (err: any) {
            console.log("payment_checkout_event ---- err", err);
            throw new Error(err.message);
        }
    }
    public createPrimaryProposalTransaction = async (
        data: {
            proposal_id: string,
            user_id: string,
            amount: number,
            token_quantity: number
        }
    ) => {
        try {
            let proposal_id: string = data.proposal_id;
            let user_id: string = data.user_id;
            let amount: number = data.amount;
            let token_quantity: number = data.token_quantity;
            let orderData: any = await Models.OrderModel.findOne({
                where: {
                    buyer_id: user_id,
                    buying_type: orderBuyingType.PRIMARY,
                    proposal_id: proposal_id,
                    status: orderStatus.PENDING
                },
                raw: true
            });
            if (!orderData) {
                console.log(`${order.ORDER_NOT_EXISTS} , ${JSON.stringify({
                    buyer_id: user_id,
                    buying_type: orderBuyingType.PRIMARY,
                    proposal_id: proposal_id,
                    status: {
                        [Op.in]: [orderStatus.PENDING, orderStatus.IN_PROGRESS]
                    }
                })}`);
                throw new Error(`${order.ORDER_NOT_EXISTS} , ${JSON.stringify({
                    buyer_id: user_id,
                    buying_type: orderBuyingType.PRIMARY,
                    proposal_id: proposal_id,
                    status: {
                        [Op.in]: [orderStatus.PENDING, orderStatus.IN_PROGRESS]
                    }
                })}`);
            }
            let proposalData: any = await Models.ProposalModel.findOne({
                where: {
                    id: proposal_id
                },
                raw: true,
            });
            if (!proposalData) {
                console.log("proposal not found!");
                throw new Error(`order_id = ${orderData.id} , ${Messages.PROPOSAL_NOT_FOUND}`);
            }
            let tokenQuantity: number = (amount / Number(proposalData.token_value));
            console.log("amount:", amount);
            console.log("proposalData.tokenValue:", proposalData.token_value);
            // if invalid token qty
            if (Number(tokenQuantity) != token_quantity) {
                throw new Error(`order_id = ${orderData.id} ${Messages.INVALID_TOKEN_QUANTITY}, user tkn qty = ${token_quantity}, qty should be = ${tokenQuantity} `)
            }
            return true
        } catch (err: any) {
            console.log("error in createPrimaryTransaction ==", err);
            throw new Error(err.message);
        }
    }
    public async get_liquidity_proposal(proposal_id: any) {
        try {
            const data: any = await Models.ProposalModel.findOne({
                where: { id: proposal_id},
                attributes: ["token_quantity", "token_to_sold", "blocked_tokens", "token_value"],
                raw: true
            });
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async transaction_create(obj: any) {
        try {
            let data: any = await Models.TransactionsModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async order_update(order_id: any) {
        try {
            await Models.OrderModel.update(
                {
                    status: "in_progress"
                },
                {
                    where: {
                        id: order_id,
                    }
                }
            )
        }
        catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false
        }
    }
    public async holding_primary_proposal(user_id: any, limit: any, offset: any, fiat_type: any) {
        try {
            console.log("holding_primary_proposal fiat_type ---=== ", fiat_type)

            let tut_price_in_usd: any = await Models.CoinsInFiatModel.findOne({
                attributes: ["value"],
                where: {
                    coin_id: TUT_COIN_ID?.coin_id,
                    fiat_type: fiat_type
                },
                raw: true
            });
            
            let one_tut_price_in_usd = tut_price_in_usd?.value;
            const totalInvestedMintedBalanceUSD: any = await Models.UserBalanceModel.findAll({
                attributes: [
                    [
                        Sequelize.literal(`SUM(CAST(invested_balance AS DOUBLE) * ${one_tut_price_in_usd} * CAST(userProposalData.token_value AS DOUBLE))`), 'user_invested_token_quantity_USD'
                    ],
                    [
                        Sequelize.literal(`SUM(CAST(available_balance AS DOUBLE) * ${one_tut_price_in_usd} * CAST(userProposalData.token_value AS DOUBLE))`), 'user_minted_token_quantity_USD'
                    ]
                ],
                where: {
                    user_id: user_id,
                    is_primary: 1
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: "userProposalData",
                        required: true,
                    },
                ],
                raw: true
            });
            ///////////////////////////////////////

            let whereCondition: any = {
                user_id: user_id,
                is_primary: 1,
                tx_type: { [Op.or]: ['primary', 'deposit', 'withdraw'] },
                updated_at: { [Op.in]: Sequelize.literal(`(SELECT MAX(updated_at) FROM transactions AS tr WHERE tr.user_id = ${user_id} AND tr.tx_type IN ('primary', 'deposit' , 'withdraw') AND tr.proposal_id = transactions.proposal_id AND is_primary = 1 GROUP BY tr.proposal_id)`) }
            }
            console.log('whereCondition >>', whereCondition)
            const data: any = await Models.TransactionsModel.findAndCountAll({
                attributes: [
                    [
                        Sequelize.literal(`CAST(user_balance_data.invested_balance AS DOUBLE) * CAST(proposal_data.token_value AS DOUBLE)`),
                        'total_tut_invested'
                    ],
                    "user_id",
                    ["updated_at", "updatDate"],
                    "amount",
                    "proposal_id",
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
                        attributes: [
                            'id',
                            'title',
                            'token_value'
                        ],
                        as: "proposal_data",
                        required: true,

                        include: [
                            {
                                model: Models.ProposalImageModel,
                                attributes: ['id', 'url', 'type'],
                                as: "proposal_file",
                                required: true,
                            },
                        ]
                    },
                    {
                        model: Models.UserBalanceModel,
                        attributes: ['invested_balance','proposal_id'],
                        as: 'user_balance_data',
                        required: true,
                        where: {
                            [Op.and]: Sequelize.literal(`transactions.proposal_id = user_balance_data.proposal_id`),
                            is_primary: 1,
                            user_id: user_id
                        }
                    },

                ],
                order: [['updated_at', 'DESC']],
                group: ["proposal_id"],
                limit,
                offset
            });

            /////////////////////////////////////////////////////
            const groupCount = data?.count?.length || 0;
            console.log("groupCount", groupCount)

            let finalData = {
                total_invested_assets_usd: totalInvestedMintedBalanceUSD[0].user_invested_token_quantity_USD || 0,
                total_minted_assets_usd: totalInvestedMintedBalanceUSD[0].user_minted_token_quantity_USD || 0,
                one_tut_price_in_fiat: one_tut_price_in_usd,
                data: data,
                count: groupCount
            }

            return finalData || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false;
        }
    }

    public async get_All_proposal(user_id: any, proposal_id: any, limit: any, offset: any) {
        try {
            const data: any = await Models.TransactionsModel.findAndCountAll({
                attributes: [
                    "id",
                    "user_id",
                    "proposal_id",
                    ["amount", "amount_in_tut"],
                    "created_at",
                    [fn("sum", col("user_token_quantity")), "total_tokens"],
                    "blockchain_status"
                ],
                where: {
                    user_id: user_id,
                    proposal_id: proposal_id,
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [
                            'title',
                            ['token_quantity', "issued_token"],
                        ],
                        as: "proposal_data",
                        required: true,
                    }
                ],
                order: [["updated_at", "DESC"]],
                limit,
                offset,
            });
            console.log("data@@@", data)
            return data || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false;
        }
    }

    public async check_liminal_adress(userId: number, proposal_id: number, coin_family: number) {
        try {
            let activity = 'sto'
            let coinData: any = await coin_queries.coin_find_one(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address"], { coin_family: coin_family, coin_status: 1, is_sto: 1, coin_id: TUT_COIN_ID?.coin_id })

            if (coinData) {
                let lmnl_data = await card_liminal_queries.lmnl_address_find_one(
                    ["user_id", "coin_id", "sto_coin_id", "liminal_path", "liminal_address", "card_type"],
                    { user_id: userId, proposal_id: proposal_id, coin_family: coin_family, card_type: "sto", sto_coin_id: coinData?.coin_id })
                if (lmnl_data) {
                    console.log("addres exist")
                    lmnl_data.liminal_coins_data = {
                        coin_id: coinData?.coin_id,
                        coi_symbol: coinData?.coin_symbol,
                        token_address:coinData?.token_address
                    }
                    return lmnl_data
                } else {
                    console.log("address not exist")
                    let coin_id = coinData?.coin_id
                    let coin_symbol = coinData?.coin_symbol
                    let token_address=coinData?.token_address


                    lmnl_data = await this.generate_lmnl_address(userId, activity, coin_id, coin_family, coin_symbol, proposal_id, coinData?.coin_id, token_address)
                    // console.log("lmnl_data >>>> lmnl_data >>>> lmnl_data >>>>", lmnl_data)

                    return lmnl_data

                }

            }

        } catch (err: any) {
            console.error("Error in create_wallet_with_bal>>>", err)
            return false;
        }
    }
    public async generate_lmnl_address(userId: number, activity: string, to_receive_coin_id: number, receive_coin_family: number, coin_symbol: any, proposal_id: number, stoCoin_id: any,token_address:any) {
        try {
            let lmnl_path: any = await card_liminal_queries.getAddressPath(receive_coin_family);
            // console.log("lmnl_path ---=====", lmnl_path)

            if (receive_coin_family == 4) {
                coin_symbol = coinSymbol.POLYGON
            }
            console.log("coin_symbolcoin_symbol --======", coin_symbol)
            if (coin_symbol) {
                let response: any = await global_helper.generateLiminalAddress(coin_symbol.toLowerCase(), lmnl_path.path);
                // console.log("response --=>>>>>> response ->>>>>>>response ->>>>>>>>", response)
                if (response?.status) {
                    let array: any = {
                        user_id: userId,
                        card_user_id: null,
                        coin_id: 0,
                        coin_family: receive_coin_family,
                        sto_coin_id: stoCoin_id,
                        liminal_path: response.path,
                        liminal_address: response.address,
                        card_type: activity,
                        proposal_id: proposal_id,
                        card_id: 0
                    }
                    await card_liminal_queries.lmnl_address_create(array);
                    await card_liminal_queries.lmnl_address_sto_create(array);
                } else {
                    console.log("no response")
                }
            }

            // await card_liminal_queries.lmnl_address_bulk_create(array);
            // await card_liminal_queries.lmnl_address_sto_bulk_create(array);

            let lmnl_data: any = await card_liminal_queries.lmnl_address_find_one(
                ["user_id", "card_user_id", "coin_id", "sto_coin_id", "liminal_path", "liminal_address", "card_type", "card_id"],
                { user_id: userId, proposal_id: proposal_id, coin_family: receive_coin_family, card_type: "sto" })

            // console.log("lmnl_data ----============,  lmnl_data----===========", lmnl_data, to_receive_coin_id, coin_symbol)


            lmnl_data.liminal_coins_data = {
                coin_id: to_receive_coin_id,
                coi_symbol: coin_symbol,
                token_address:token_address

            }
            // console.log("lmnl_data ----============,  lmnl_data----===========", to_receive_coin_id, coin_symbol)

            return lmnl_data;
        } catch (err: any) {
            console.error("Error in generate_lmnl_address>>>", err)
            return false;
        }

    }
    public async create_wallet_with_bal(addressList: any, userId: number, wallet_name: string, email: string) {
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            for await (const wallet of addressList) {
                console.log("walletDataaaaaaaaa",wallet);
                let address: string = wallet.address;
                let symbol: string = wallet.symbol;
                let coin_family: number = wallet.coin_family;

                let addressValidity: any = await block_global_helper.validate_address({ address: address, symbol: symbol });
                if (!addressValidity) throw new Error(`${Messages.ADDRESS_DOES_NOT_EXIST}`);
                let coinData: any = await coin_queries.coin_find_all(["coin_id", "coin_family", "coin_symbol", "is_token", "token_address"], { coin_family: coin_family, coin_status: 1, is_sto: 1 })
                if (coinData.length > 0) {
                    for (let i: number = 0; i < coinData.length; i++) {
                        console.log("coinDatacreateWallet",coinData[i])

                        let balance: any = await block_global_helper.get_wallet_balance(coinData[i], address);
                        // console.log("balance>>>>", balance, "coinData>>>", coinData[i].is_token, "wallet_address>", address)
                        let ifWalletExists: any = await wallet_queries.wallet_find_one(["wallet_id"], { wallet_address: address, coin_id: coinData[i].coin_id, user_id: userId })

                        if (ifWalletExists) {
                            console.log("ifWalletExistscreate",wallet)

                            await wallet_queries.wallet_update({ balance: balance, status: 1 }, { wallet_id: ifWalletExists.wallet_id })
                        } else {
                            console.log("ifWallet not Existsss")

                            let obj: any = {
                                user_id: userId,
                                wallet_name: wallet_name,
                                email: email ? email : null,
                                wallet_address: address,
                                default_wallet: GlblBooleanEnum.true,
                                status: GlblBooleanEnum.true,
                                coin_id: coinData[i].coin_id,
                                balance: balance,
                                is_sto_wallet: 0,
                                coin_family: coin_family,
                                created_at: currentUTCDate,
                                updated_at: currentUTCDate,
                            }
                            await wallet_queries.wallet_create(obj)
                        }
                    }
                } else {
                    console.log("no coin data for this coin family >>", coin_family)
                }
            }
        } catch (err: any) {
            console.error("Error in createwalletwithbal", err)
            return false;
        }
    }
    public async view_particular_proposal(user_id: any, proposal_id: any) {
        try {
            const user_balance: any = await Models.UserBalanceModel.findOne({
                where: {
                    user_id: user_id,
                    proposal_id: proposal_id,
                    is_primary: 1,
                },
                raw: true
            });
            const transactionData: any = await Models.TransactionsModel.findAll({
                attributes: [
                    [Sequelize.literal(`SUM(CASE WHEN tx_type = '${orderBuyingType.PRIMARY}' THEN user_token_quantity ELSE 0 END)`), 'total_purchased_token'],
                ],
                where: {
                    user_id: user_id,
                    proposal_id: proposal_id,
                    is_primary: 1,
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    token_mint_status: transactionStatus.STATUS_COMPLETE,
                    [Op.or]: [
                        { tx_type: orderBuyingType.PRIMARY },
                        { tx_type: orderBuyingType.WITHDRAW },
                        { tx_type: orderBuyingType.DEPOSIT }
                    ]
                },
                raw: true
            });
            const total_purchased_token = Number(transactionData[0].total_purchased_token) || 0;
            let obj = {
                total_token: Number(user_balance?.total_available_balance) || 0,
                available_in_wallet: Number(user_balance?.available_balance) || 0,
                open_to_sell: Number(user_balance?.on_sell_balance) || 0,
                total_purchased_token: total_purchased_token,
                total_sent_token: Number(user_balance?.sent_balance) || 0,
                total_received_token: Number(user_balance?.received_balance) || 0
            }
            return obj;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false;
        }
    }

    public async view_proposal_transaction_history(user_id: any, proposal_id: any, limit: any, offset: any) {
        try {
            const transactionData = await Models.TransactionsModel.findAndCountAll({
                where: {
                    user_id: user_id,
                    is_primary: 1,
                    proposal_id: proposal_id,
                    [Op.or]: [
                        { tx_type: orderBuyingType.WITHDRAW },
                        { tx_type: orderBuyingType.DEPOSIT },
                        { tx_type: orderBuyingType.PRIMARY }
                    ]
                },
                include: [
                    {
                        model: Models.OrderModel,
                        attributes: [],
                        as: "order_data",
                        required: false,
                        where: {
                            [Op.or]: [
                                { buyer_id: user_id },
                                { seller_id: user_id },
                            ],
                            buying_type: orderBuyingType.PRIMARY
                        }
                    }
                ],
                attributes: [
                    ['created_at', 'investment_date'],
                    'amount',
                    ['blockchain_status', 'status'],
                    ['refund_status', 'refund_status'],
                    'from_adrs',
                    'to_adrs',
                    'coin_family',
                    [
                        Sequelize.literal(`
                            CASE 
                                WHEN tx_type = '${orderBuyingType.DEPOSIT}' THEN 'deposit'
                                WHEN tx_type = '${orderBuyingType.WITHDRAW}' THEN 'withdraw'
                                WHEN tx_type = '${orderBuyingType.PRIMARY}' AND \`order_data\`.\`buyer_id\` = ${user_id} THEN 'buy'
                                WHEN tx_type = '${orderBuyingType.PRIMARY}' AND \`order_data\`.\`seller_id\` = ${user_id} THEN 'sell'
                                ELSE NULL 
                            END
                        `),
                        'type'
                    ]
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

    public async portfolioList(user_id: any, tx_type: any, limit: any, offset: any, fiat_type: any) {
        try {
            console.log("portfolioList fiat_type ---=== ", fiat_type)
            let tut_price_in_usd: any = await Models.CoinsInFiatModel.findOne({
                attributes: ["value"],
                where: {
                    coin_id: TUT_COIN_ID?.coin_id,
                    fiat_type: fiat_type

                },
                raw: true
            })
            let one_tut_price_in_usd = tut_price_in_usd?.value;
            console.log("one_tut_price_in_usd ---=== ", one_tut_price_in_usd)


            const totalInvestedMintedBalanceUSD: any = await Models.UserBalanceModel.findAll({
                attributes: [
                    [
                        Sequelize.literal(`SUM(CAST(invested_balance AS DOUBLE) * ${one_tut_price_in_usd} * CAST(userProposalData.token_value AS DOUBLE))`),
                        'user_invested_token_quantity_USD'
                    ],
                    [
                        Sequelize.literal(`SUM(CAST(available_balance AS DOUBLE) * ${one_tut_price_in_usd} * CAST(userProposalData.token_value AS DOUBLE))`),
                        'user_minted_token_quantity_USD'
                    ]
                ],
                where: {
                    user_id: user_id,
                    is_primary: 1
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: "userProposalData",
                        required: true,
                    },
                ],
                raw: true
            });
            const data: any = await Models.TransactionsModel.findAndCountAll({
                attributes: [
                    "user_id",
                    "proposal_id",
                    [
                        Sequelize.literal(`CAST(user_balance_data.invested_balance AS DOUBLE) * ${one_tut_price_in_usd} * CAST(proposal_data.token_value AS DOUBLE)`),
                        'total_tut_invested_usd'
                    ],
                    [
                        Sequelize.literal(`(CAST(user_balance_data.invested_balance AS DOUBLE) * CAST(proposal_data.token_value AS DOUBLE) / CAST(proposal_data.raise_fund AS DOUBLE)) * 100`),
                        'investment_percenatge'
                    ]
                ],
                where: {
                    user_id: user_id,
                    is_primary: 1,
                    tx_type: orderBuyingType.PRIMARY,
                    status: transactionStatus.STATUS_COMPLETE,
                    blockchain_status: transactionStatus.CONFIRMED,
                    refund_status: null
                },
                include: [
                    {
                        model: Models.UserBalanceModel,
                        attributes: [],
                        as: 'user_balance_data',
                        required: true,
                        where: {
                            [Op.and]: Sequelize.literal(`transactions.proposal_id = user_balance_data.proposal_id`),
                            is_primary: 1,
                            invested_balance: { [Op.gt]:0},
                            user_id: user_id
                        }
                    },
                    {
                        model: Models.ProposalModel,
                        attributes: [
                            'title',
                            'raise_fund'
                        ],
                        as: "proposal_data",
                        required: true,
                        include: [
                            {
                                model: Models.AssetModel,
                                attributes: ['asset_type', 'id'],
                                as: "asset_type",
                                required: true,
                            },
                        ],
                    },
                ],
                order: [["updated_at", "DESC"]],
                group: ['proposal_data.asset_type.id', "proposal_id"],
                limit,
                offset
            });

            const groupCount = data?.count?.length || 0;
            console.log("groupCount@@", groupCount)

            let finalData = {
                total_invested_assets_usd: totalInvestedMintedBalanceUSD[0]?.user_invested_token_quantity_USD || 0,
                total_minted_assets_usd: totalInvestedMintedBalanceUSD[0]?.user_minted_token_quantity_USD || 0,
                one_tut_price_in_fiat: one_tut_price_in_usd,
                data: data,
                count: groupCount
            }
            return finalData || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }
    public async create_proposal_wallet_with_bal(user_id: number, wallet_address: string, wallet_name: string, email: string, username: string, proposal_id: number, token_address: string, coin_family: number) {
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            let coinData: any = await Models.CoinsModel.findOne({
                attributes: ["coin_id", "coin_family", "coin_symbol", "is_token", "token_address"],
                where: {
                    token_address: token_address,
                    proposal_id: proposal_id
                },
                raw: true
            })
            console.log("coinData@@@@@",coinData)
            if (coinData) {
                console.log("inside coinData@@@@@",coinData)

                let balance: any = await block_global_helper.get_wallet_balance(coinData, wallet_address);
                let ifWalletExists: any = await wallet_queries.wallet_find_one(["wallet_id", "wallet_address"], { wallet_address: wallet_address, coin_id: coinData.coin_id, user_id: user_id, proposal_id: proposal_id, is_sto_wallet: 1 })
                if (ifWalletExists) {
                    console.log("ifWalletExists",ifWalletExists)
                    await wallet_queries.wallet_update({ balance: balance, status: 1 }, { wallet_id: ifWalletExists.wallet_id, is_sto_wallet: 1 })
                    return ifWalletExists
                } else {
                    console.log("ifWallet not Exists")

                    let obj: any = {
                        user_id: user_id,
                        wallet_name: wallet_name,
                        email: email ? email : null,
                        username: username,
                        proposal_id: proposal_id,
                        wallet_address: wallet_address,
                        default_wallet: GlblBooleanEnum.true,
                        status: GlblBooleanEnum.true,
                        coin_id: coinData?.coin_id,
                        balance: balance,
                        is_sto_wallet: 1,
                        coin_family: coin_family,
                        created_at: currentUTCDate,
                        updated_at: currentUTCDate,
                    }
                    console.log("obj created data :::", obj)
                    let create_wallet = await wallet_queries.wallet_create(obj);
                    let ifUserBalanceExists: any = await Models.UserBalanceModel.findOne({ where: { proposal_id: proposal_id, user_id: user_id, is_primary: 1 } });
                    if (!ifUserBalanceExists) {
                        let userBalanceObj: any = {
                            user_id: user_id,
                            proposal_id: proposal_id,
                            coin_id: coinData?.coin_id,
                            is_primary: 1,
                            total_available_balance: 0,
                            available_balance: 0,
                            on_sell_balance: 0,
                            invested_balance: 0,
                            received_balance: 0,
                            sent_balance: 0,
                            created_at: currentUTCDate,
                            updated_at: currentUTCDate,
                        }
                        console.log("obj created data :::", obj);
                        await Models.UserBalanceModel.create(userBalanceObj)
                    }
                    return { wallet_id: create_wallet?.wallet_id, wallet_address: create_wallet?.wallet_address }
                }
            }
        } catch (err: any) {
            console.error("Error in create_wallet_sto_with_bal>>>", err)
            return false;
        }
    }
    public async createSecondaryProposalWalletWithBal(user_id: number, wallet_address: string, wallet_name: string, email: string, username: string, proposal_id: number, token_address: string, coin_family: number, secondary_market_proposal_id: number) {
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            let coinData: any = await Models.CoinsModel.findOne({
                attributes: ["coin_id", "coin_family", "coin_symbol", "is_token", "token_address"],
                where: {
                    token_address: token_address,
                    proposal_id: proposal_id
                },
                raw: true
            })
            console.log("coinData@@@@@",coinData)
            if (coinData) {
                console.log("inside coinData@@@@@",coinData)
                let ifUserBalanceExists: any = await Models.UserBalanceModel.findOne({ where: { proposal_id: proposal_id,secondary_market_proposal_id:secondary_market_proposal_id, user_id: user_id, is_primary: 0 } });
                if (!ifUserBalanceExists) {
                    let userBalanceObj: any = {
                        user_id: user_id,
                        proposal_id: proposal_id,
                        secondary_market_proposal_id:secondary_market_proposal_id,
                        coin_id: coinData?.coin_id,
                        is_primary: 0,
                        total_available_balance: 0,
                        available_balance: 0,
                        on_sell_balance: 0,
                        invested_balance: 0,
                        received_balance: 0,
                        sent_balance: 0,
                        created_at: currentUTCDate,
                        updated_at: currentUTCDate,
                    }
                    await Models.UserBalanceModel.create(userBalanceObj)
                }
                let balance: any = await block_global_helper.get_wallet_balance(coinData, wallet_address);
                let ifWalletExists: any = await wallet_queries.wallet_find_one(["wallet_id", "wallet_address"], { wallet_address: wallet_address, coin_id: coinData.coin_id, user_id: user_id, proposal_id: proposal_id, is_sto_wallet: 1 })
                if (ifWalletExists) {
                    console.log("ifWalletExists",ifWalletExists)
                    await wallet_queries.wallet_update({ balance: balance, status: 1 }, { wallet_id: ifWalletExists.wallet_id, is_sto_wallet: 1 })
                    return ifWalletExists
                } else {
                    console.log("ifWallet not Exists")

                    let obj: any = {
                        user_id: user_id,
                        wallet_name: wallet_name,
                        email: email ? email : null,
                        username: username,
                        proposal_id: proposal_id,
                        wallet_address: wallet_address,
                        default_wallet: GlblBooleanEnum.true,
                        status: GlblBooleanEnum.true,
                        coin_id: coinData?.coin_id,
                        balance: balance,
                        is_sto_wallet: 1,
                        coin_family: coin_family,
                        created_at: currentUTCDate,
                        updated_at: currentUTCDate,
                    }
                    console.log("obj created data :::", obj)
                    let create_wallet = await wallet_queries.wallet_create(obj);
                    return { wallet_id: create_wallet?.wallet_id, wallet_address: create_wallet?.wallet_address }
                }
            }
        } catch (err: any) {
            console.error("Error in create_wallet_sto_with_bal>>>", err)
            return false;
        }
    }
    public async percentageListing(user_id: any, fiat_type: any) {
        try {
            console.log("Listing fiat_type ====", fiat_type)
            let tut_price_in_usd: any = await Models.CoinsInFiatModel.findOne({
                attributes: ["value"],
                where: {
                    coin_id: TUT_COIN_ID?.coin_id,
                    fiat_type: fiat_type
                },
                raw: true
            });
            let one_tut_price_in_usd = tut_price_in_usd?.value;
            const totalInvestedBalanceFiatPrimary: any = await Models.UserBalanceModel.findAll({
                attributes: [
                    [
                        Sequelize.literal(`SUM(invested_balance * ${one_tut_price_in_usd} * userProposalData.token_value)`), 'user_invested_token_quantity_USD'
                    ]
                ],
                where: {
                    user_id: user_id,
                    is_primary: 1
                },
                include: [
                    {
                        model: Models.ProposalModel,
                        attributes: [],
                        as: "userProposalData",
                        required: true,
                    },
                ],
                raw: true
            });
            const totalInvestedBalanceFiatSecondary: any = await Models.UserBalanceModel.findAll({
            attributes: [
             [
              Sequelize.literal(`SUM(invested_balance * (SELECT value FROM coin_price_in_fiats WHERE coin_id = user_secondary_proposal_data.coin_id AND fiat_type = '${fiat_type}') * user_secondary_proposal_data.token_value)`),
              'user_invested_token_quantity_USD'
             ]
        ],
        where: {
          user_id: user_id,
          is_primary: 0
        },
        include: [
          {
            model: Models.SecondaryProposalModel,
            attributes: [],
            as: "user_secondary_proposal_data",
            required: true
          }
        ],
        raw: true
      });
            let finalData = {
                total_primary_invested_assets_fiat: totalInvestedBalanceFiatPrimary[0]?.user_invested_token_quantity_USD || 0,
                total_secondary_invested_assets_fiat: totalInvestedBalanceFiatSecondary[0]?.user_invested_token_quantity_USD || 0,
                primary: 100,
                secondary: 0,
            }
            return finalData || [];
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            return false;
        }
    }
    public async user_balance_data(attr1: any, where1: any, attr2: any, where2: any) {
        try {
            let wallets: any = await Models.UserBalanceModel.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: Models.ProposalModel,
                    attributes: attr2,
                    required: true,
                    as: "userProposalData",
                    where: where2,
                }],
            })
            console.log("wallets >>>>>", wallets)
            return wallets;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            return false;
        }
    }

    public async primaryBalance(user_id: any, is_primary: any) {
        try {
            let assetData: any
            if (is_primary == 1) {
                assetData = await Models.UserBalanceModel.findAll({
                    where: {
                        user_id: user_id,
                        is_primary: 1,
                        available_balance: {
                            [Op.gt]: 0 
                        }
                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name", "symbol","token_address","id"],
                            as: "userProposalData",
                            required: true,
                        },
                    ],
                    group: ["userProposalData.id"], // Group by id
                });
            }
            else if (is_primary == 0) {
                assetData = await Models.UserBalanceModel.findAll({
                    where: {
                        user_id: user_id,
                        is_primary: 0,
                        available_balance: {
                            [Op.gt]: 0 
                        }
                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name","token_address","id"],
                            as: "userProposalData",
                            required: true,
                        },
                    ],
                    group: ["userProposalData.id"]
                });
            }
            return assetData;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            return false;
        }
    }

    public async primaryAssetBalance(user_id: any, is_primary: any) {
        try {
            let assetData: any
            if (is_primary == 1) {
                assetData = await Models.UserBalanceModel.findAll({
                    attributes: ["available_balance", "proposal_id", "secondary_market_proposal_id", "is_primary"],
                    where: {
                        user_id: user_id,
                        is_primary: 1,
                        available_balance: {
                            [Op.gt]: 0 
                        }
                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name", "symbol","token_address"],
                            as: "userProposalData",
                            required: true,
                        },
                    ]
                });
            }
            else if (is_primary == 0) {
                assetData = await Models.UserBalanceModel.findAll({
                    attributes: ["available_balance", "proposal_id", "secondary_market_proposal_id", "is_primary"],
                    where: {
                        user_id: user_id,
                        is_primary: 0,
                        available_balance: {
                            [Op.gt]: 0 
                        }
                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name","token_address"],
                            as: "userProposalData",
                            required: true,
                        },
                    ]
                });
            }
            return assetData;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            return false;
        }
    }
    public async singleAssetBalance(user_id: any, is_primary: any , proposal_id:any) {
        try {
            let assetData: any
            if (is_primary == 1) {
                assetData = await Models.UserBalanceModel.findAll({
                    attributes: [
                        [
                            Sequelize.literal(`SUM(available_balance)`), 'total_available_balance'
                        ],
                    //   "available_balance",
                      "proposal_id",
                      "secondary_market_proposal_id",
                      "is_primary",
                      "user_id"
                    ],
                    where: {
                        user_id: user_id,
                        is_primary: 1,
                        proposal_id:proposal_id
                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name", "symbol","token_address"],
                            as: "userProposalData",
                            required: true,
                        },
                    ],
                    group: ["user_id","proposal_id"],
                });
            }
            else if (is_primary == 0) {
                assetData = await Models.UserBalanceModel.findAll({
                    attributes: [
                        [
                            Sequelize.literal(`SUM(available_balance)`), 'total_available_balance'
                        ],
                       "proposal_id",
                       "secondary_market_proposal_id",
                       "is_primary",
                       "user_id"
                    ],
                    where: {
                        user_id: user_id,
                        is_primary: 0,
                        proposal_id:proposal_id

                    },
                    include: [
                        {
                            model: Models.ProposalModel,
                            attributes: ["title", "token_name","token_address"],
                            as: "userProposalData",
                            required: true,
                        },
                    ],
                    group: ["user_id","proposal_id","secondary_market_proposal_id"],
                });
            }
            return assetData;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            return false;
        }
    }
    public async sendPrimaryToken(data: any, user_id: any, amount_in_tut: any) {
        try {
            let unique_id: string = await commonHelper.makeRandomStringForTx();
            let coin_id = await this.get_proposal_coin(data?.proposal_id);
            let transactionData: any = {
                req_type: "APP",
                coin_family: data?.coin_family,
                is_primary: 1,
                unique_id: unique_id,
                user_token_quantity: data?.token_quantity,
                amount: amount_in_tut,
                user_id: user_id,
                proposal_id: data?.proposal_id,
                tx_id: data?.tx_id,
                mint_tx_hash:data?.tx_id,
                tx_raw: data?.tx_raw,
                from_adrs: data?.from_adrs,
                to_adrs: data?.to_adrs,
                user_adrs: data?.from_adrs,
                wallet_id: data?.wallet_id,
                coin_id: coin_id,
                status: transactionStatus.STATUS_COMPLETE,
                tx_type: orderBuyingType.WITHDRAW,
                blockchain_status: transactionStatus.PENDING
            }
            await this.transaction_create(transactionData)
        } catch (err: any) {
            console.error("Error in balance update>>", err);
            return false;
        }
    }
    public async sendSecondaryToken(data: any, user_id: any, amount_in_usdt: any) {
        try {
            let unique_id: string = await commonHelper.makeRandomStringForTx();
            let coin_id = await this.get_proposal_coin(data?.proposal_id);
            let transactionData: any = {
                req_type: "APP",
                coin_family: data?.coin_family,
                is_primary: 0,
                unique_id: unique_id,
                user_token_quantity: data?.token_quantity,
                amount: amount_in_usdt,
                user_id: user_id,
                proposal_id: data?.proposal_id,
                secondary_market_proposal_id: data?.secondary_proposal_id,
                tx_id: data?.tx_id,
                mint_tx_hash:data?.tx_id,
                tx_raw: data?.tx_raw,
                from_adrs: data?.from_adrs,
                to_adrs: data?.to_adrs,
                user_adrs: data?.from_adrs,
                wallet_id: data?.wallet_id,
                coin_id: coin_id,
                status: transactionStatus.STATUS_COMPLETE,
                tx_type: orderBuyingType.WITHDRAW,
                blockchain_status: transactionStatus.PENDING
            }
            await this.transaction_create(transactionData)
        } catch (err: any) {
            console.error("Error in balance update>>", err);
            return false;
        }
    }
    public async getUserBalance(data: any, user_id: any) {
        try {
            console.log("data@@@@@@@2", data)
            let userBalanceData: any
            if (data?.is_primary == 1) {
                userBalanceData = await Models.UserBalanceModel.findOne({
                    where: {
                        user_id: user_id,
                        proposal_id: data?.proposal_id,
                        is_primary: 1,
                    },
                    raw: true
                });
            } else if (data?.is_primary == 0) {
                userBalanceData = await Models.UserBalanceModel.findOne({
                    where: {
                        user_id: user_id,
                        proposal_id: data?.proposal_id,
                        secondary_market_proposal_id: data?.secondary_proposal_id,
                        is_primary: 0,
                    },
                    raw: true
                });
            }
            return userBalanceData;
        } catch (err: any) {
            console.error("Error in balance update>>", err);
            return false;
        }
    }
    public async getBlockchainBalance(data: any, user_id: any) {
        try {
            let userBalance: any = 0;
            if (!data || !data.coin_family || !data.wallet_address || !data.token_address) {
                throw new Error("Missing required data fields");
            }
            switch (data.coin_family) {
                case CoinFamily.ETH:
                    let ethBalance: any = await ethWeb3.get_eth_token_balance(data.token_address, config.CONTRACT_ABI as AbiItem[], data.wallet_address);
                    userBalance = exponentialToDecimal(Number(ethBalance));
                    break;
                case CoinFamily.BNB:
                    let bnbBalance: any = await bscWeb3.get_bsc_token_balance(data.token_address, config.CONTRACT_ABI as AbiItem[], data.wallet_address);
                    userBalance = exponentialToDecimal(Number(bnbBalance));
                    break;
                case CoinFamily.TRX:
                    userBalance = await trxWeb3.trx_token_balance(data.wallet_address, data.token_address);
                    break;
                case CoinFamily.MATIC:
                    let maticBalance: any = await maticWeb3.get_tut_token_balance(data.token_address, config.CONTRACT_ABI as AbiItem[], data.wallet_address);
                    userBalance = exponentialToDecimal(Number(maticBalance));
                    break;
                default:
                    return;
            }
            console.log("userBalance", userBalance);
            let coinDetail = await Models.CoinsModel.findOne({
                attributes: ["coin_id"],
                where: { token_address: data.token_address },
                raw: true
            });
            await Models.BackendWalletModel.update(
                { balance: userBalance },
                {
                    where: {
                        user_id: user_id,
                        wallet_address: data?.wallet_address,
                        coin_id: coinDetail?.coin_id
                    }
                }
            );
        } catch (err: any) {
            console.error("Error in balance update>>", err);
        }
    }
    
}



const proposalhelper = new proposaltHelper();
export default proposalhelper;
