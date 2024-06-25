import { DataTypes, Model, Optional } from "sequelize";
import { OrderInterface } from "../interface/interface.order";
import db from "../../helpers/common/db";

interface OrderCreationModel extends Optional<OrderInterface, "id"> { }
interface OrderInstance
    extends Model<OrderInterface, OrderCreationModel>,
    OrderInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    secondary_market_proposal_id: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    proposal_id: {
        type: DataTypes.NUMBER,
    },
    buyer_id: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    wallet_id:{
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    seller_id: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    token_value: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    token_address: {
        type: DataTypes.STRING,
    },
    user_adrs: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    liminal_address: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    token_qty: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    amount: {
        type: DataTypes.NUMBER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.STRING,
        enum: ['pending', 'cancelled', 'completed', 'in_progress'],
        defaultValue: "pending"
    },
    is_tokens_blocked: {
        type: DataTypes.NUMBER,
        allowNull: false,
        defaultValue: 1
    },
    buying_type: {
        type: DataTypes.STRING,
        allowNull: false,
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
const OrderModel = db.db_write.define<OrderInstance>(
    "orders",
    dataObj
);

export default OrderModel;