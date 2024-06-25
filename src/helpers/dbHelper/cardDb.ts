import { CoinFamily } from '../../constants/global_enum';
import * as Models from '../../models/model/index';
import commonHelper from '../common/common.helpers';



class cardLiminalQueries {

    public async getAddressPath(coin_family: any) {
        try {
            let path: number = 0;
            let data: any = await Models.CardLiminalAddressModel.findOne({
                attributes: ["liminal_path", "coin_family"],
                order: [["liminal_path", "DESC"]],
                where: {
                    coin_family: coin_family
                }
            });
            if (data) {
                path = data.liminal_path + 1;
            }
            return {
                path
            }
        } catch (err: any) {
            console.error("Error in getAddressPath>>>", err)
            throw err;;
        }
    }

    public async lmnl_address_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CardLiminalAddressModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_find_one >>", err)
            // await commonHelper.save_error_logs("lmnl_address_find_one", err.message);
            throw err;
        }
    }

    public async lmnl_address_find_all(attr: any, where_clause: any) {
        try {
            let data: any = await Models.CardLiminalAddressModel.findAll({
                attributes: attr,
                where: where_clause,
            })
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_find_all >>", err)
            // await commonHelper.save_error_logs("lmnl_address_find_all", err.message);
            throw err;
        }
    }

    public async lmnl_address_bulk_create(obj: any) {
        try {
            let data: any = await Models.CardLiminalAddressModel.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_create>>", err)
            throw err;
        }
    }
    public async lmnl_address_sto_bulk_create(obj: any) {
        try {
            let data: any = await Models.LiminalAdresses.bulkCreate(obj)
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_create>>", err)
            throw err;
        }
    }

    public async lmnl_address_create(obj: any) {
        try {
            let data: any = await Models.CardLiminalAddressModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_create>>", err)
            throw err;
        }
    }

    public async lmnl_address_sto_create(obj: any) {
        try {
            let data: any = await Models.LiminalAdresses.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in lmnl_address_create>>", err)
            throw err;
        }
    }

}

const card_liminal_queries = new cardLiminalQueries();
export default card_liminal_queries;
