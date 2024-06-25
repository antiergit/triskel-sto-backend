import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';


class CoinQueries {


    public async coin_find_one(attr: any, where_clause: any) {
        try {
            let data: any;
            if (attr.length > 0) {
                data = await Models.CoinsModel.findOne({
                    attributes: attr,
                    where: where_clause,
                    raw: true
                })
            } else {
                console.log("no attr")
                data = await Models.CoinsModel.findOne({
                    where: where_clause,
                    raw: true
                })
            }
            return data;
        } catch (err: any) {
            console.error("Error in coin_find_one>>", err)
            // await commonHelper.save_error_logs("coin_find_one", err.message);
            throw err;
        }
    }

    public async coin_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CoinsModel.findAll({
                attributes: attr,
                where: where_clause,
            })
            return data;
        } catch (err: any) {
            console.error("Error in coin_find_all >>", err)
            // await commonHelper.save_error_logs("coin_find_all", err.message);
            throw err;
        }
    }

    // public async coin_join_with_fiat(attr: any, where_clause: any, attr1: any, where_clause1: any) {
    //     try {
    //         let data: any = await Models.CoinsModel.findOne({
    //             attributes: attr,
    //             where: where_clause,
    //             include: [{
    //                 model: Models.CoinPriceFiatsModel,
    //                 attributes: attr1,
    //                 where: where_clause1,
    //                 as: "coin_price_data",
    //                 required: true
    //             }]
    //         })
    //         return data;
    //     } catch (err: any) {
    //         console.error("Error in coin_join_with_fiat >>", err)
    //         // await commonHelper.save_error_logs("coin_join_with_fiat", err.message);
    //         throw err;
    //     }
    // }


}

const coin_queries = new CoinQueries();
export default coin_queries;
