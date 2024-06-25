import * as Models from '../../models/model/index';


class UserQueries {

    public async user_kyc_find_one(attr: any, where_clause: any) {
        try {
            let data: any = await Models.UserKycModel.findOne({
                attributes: attr,
                where: where_clause,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in user kyc find one >>", err)
            throw err;
        }
    }
    public async user_kyc_create(obj: any) {
        try {
            let data: any = await Models.UserKycModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in user kyc create >>", err)
            throw err;
        }
    }
    public async user_kyc_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.UserKycModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in user kyc update >>", err)
            throw err;
        }
    }


}

const user_queries = new UserQueries();
export default user_queries;
