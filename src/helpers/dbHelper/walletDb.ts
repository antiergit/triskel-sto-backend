import * as Models from '../../models/model/index';
import { GlblBooleanEnum } from "../../constants/global_enum";
import { Op, Sequelize } from "sequelize";
import commonHelper from '../common/common.helpers';


class walletQueries {

    public async wallet_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.WalletModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in wallet find one >>", err)
            // await commonHelper.save_error_logs("wallet_find_one", err.message);
            throw err;
        }
    }


    public async wallet_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.WalletModel.findAll({
                attributes: attr,
                where: where_clause,
            })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_find_all >>", err)
            // await commonHelper.save_error_logs("wallet_find_all", err.message);
            throw err;
        }
    }
    public async wallet_update(set: any, where_clause: any) {
        try {
            console.log("wallet of sto update wallet where  >>>", where_clause)

            let data: any = await Models.WalletModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in wallet_update>>", err)
            // await commonHelper.save_error_logs("wallet_update", err.message);
            throw err;
        }
    }
    public async wallet_create(obj: any) {
        try {
            let data: any = await Models.WalletModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            // await commonHelper.save_error_logs("wallet_create", err.message);
            throw err;
        }
    }
    public async wallet_coin_fiat_join_data(attr1: any, where1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let wallets: any = await Models.WalletModel.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: Models.CoinsModel,
                    attributes: attr2,
                    required: true,
                    where: where2,
                    include: [{
                        model: Models.CoinsInFiatModel,
                        attributes: attr3,
                        as: "coin_price_data",
                        where: where3,
                        required: false,
                    },
                    ],
                }],
                // order: [
                //     [Sequelize.literal(`CASE WHEN coin.coin_symbol = "TUTs" THEN 0 ELSE 1 END`), 'ASC'],
                //     ["sort_order", "ASC"]
                // ]
            })
            console.log("wallets >>>>>", wallets)
            return wallets;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            throw err;
        }
    }

    public async wallet_coin_parposal_join_data(attr1: any, where1: any, attr2: any, where2: any, attr3: any, where3: any) {
        try {
            let wallets: any = await Models.WalletModel.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: Models.CoinsModel,
                    attributes: attr2,
                    required: true,
                    where: where2,
                }, {
                    model: Models.ProposalModel,
                    attributes: attr3,
                    required: false,
                    where: where3,
                    as: "ProposalData",
                }],
                order: [
                    [Sequelize.literal(`CASE WHEN coin.coin_symbol = "TUTs" THEN 0 ELSE 1 END`), 'ASC'],
                    ["sort_order", "ASC"]
                ]
            })
            console.log("wallets >>>>>", wallets)
            return wallets;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            throw err;
        }
    }
    public async wallet_coin_join_data(attr1: any, where1: any, attr2: any, where2: any) {
        try {
            let wallets: any = await Models.WalletModel.findAll({
                attributes: attr1,
                where: where1,
                include: [{
                    model: Models.ProposalModel,
                    attributes: attr2,
                    required: true,
                    as: "ProposalData",
                    where: where2,
                }],
            })
            console.log("wallets >>>>>", wallets)
            return wallets;
        } catch (err: any) {
            console.error("Error in wallet_create>>", err)
            throw err;
        }
    }

}

const wallet_queries = new walletQueries();
export default wallet_queries;
