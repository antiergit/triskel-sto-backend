import { DataTypes, Model, Optional } from "sequelize";
import { OrderLogsInterface } from "../interface/interface.order_logs";
import db from "../../helpers/common/db";

interface OrderLogsCreationModel extends Optional<OrderLogsInterface, "id"> { }
interface OrderLogsInstance
    extends Model<OrderLogsInterface, OrderLogsCreationModel>,
    OrderLogsInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.NUMBER,
    },
    old_status: {
        type: DataTypes.STRING,
    },
    new_status: {
        type: DataTypes.STRING,
    },
    old_is_tokens_blocked: {
        type: DataTypes.NUMBER,
    },
    new_is_tokens_blocked: {
        type: DataTypes.NUMBER,
    },
    action: {
        type: DataTypes.STRING,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
};
const OrderLogsModel = db.db_write.define<OrderLogsInstance>(
    "order_logs",
    dataObj
);

export default OrderLogsModel;