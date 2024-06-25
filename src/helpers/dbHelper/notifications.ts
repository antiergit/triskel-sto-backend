import * as Models from '../../models/model/index';
// import catch_err_msg_queries from './catch_err_msgs';


class NotificationQueries {

    public async notification_find_one(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await Models.StoNotificationModel.findOne({
                attributes: attr,
                where: where_clause,
                order: order,
                raw: true
            })
            return data;
        } catch (err: any) {
            console.error("Error in notification_find_one >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_find_one", error_msg: err.message || {} })
            throw err;
        }
    }
    public async notification_create(obj: any) {
        try {
            let data: any = await Models.StoNotificationModel.create(obj)
            return data;
        } catch (err: any) {
            console.error("Error in notification_create >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_create", error_msg: err.message || {} })
            throw err;
        }
    }
    public async notification_update(set: any, where_clause: any) {
        try {
            let data: any = await Models.StoNotificationModel.update(set, { where: where_clause })
            return data;
        } catch (err: any) {
            console.error("Error in buy_sell_trade_update >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_update", error_msg: err.message || {} })
            throw err;
        }
    }
    public async notification_find_all(attr: any, where_clause: any, order: any) {
        try {
            let data: any = await Models.StoNotificationModel.findAll({
                attributes: attr,
                where: where_clause,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in notification_find_all >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_find_all", error_msg: err.message || {} })
            throw err;
        }
    }
    public async notification_find_all_count(attr: any, where_clause: any, limitNo: any, offset: any, order: any) {
        try {
            let data: any = await Models.StoNotificationModel.findAndCountAll({
                attributes: attr,
                where: where_clause,
                limit: limitNo,
                offset: offset,
                order: order
            })
            return data;
        } catch (err: any) {
            console.error("Error in notification_find_all_count >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_find_all_count", error_msg: err.message || {} })
            throw err;
        }
    }
    public async notification_count(attr: any, where_clause: any) {
        try {
            let data: any = await Models.StoNotificationModel.count({
                attributes: attr,
                where: where_clause
            })
            return data;
        } catch (err: any) {
            console.error("Error in notification_count >>", err)
            // await catch_err_msg_queries.catch_err_msg_create({ fx_name: "notification_count", error_msg: err.message || {} })
            throw err;
        }
    }



}

const notification_queries = new NotificationQueries();
export default notification_queries;
