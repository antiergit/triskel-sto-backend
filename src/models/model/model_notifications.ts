import { DataTypes, Model, Optional } from "sequelize";
import { StoNotificationInterface } from "../interface/interface_notifications"
import db from "../../helpers/common/db";
interface StoNotificationCreationModel extends Optional<StoNotificationInterface, "id"> { }
interface StoNotificationInstance
    extends Model<StoNotificationInterface, StoNotificationCreationModel>,
    StoNotificationInterface { }

let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    fiat_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    from_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    to_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    trnx_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    notification_type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coin_symbol: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    coin_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "updated_at",
    },
};


export const StoNotificationModel = db.db_write.define<StoNotificationInstance>(
    "notifications",
    dataObj
);
export default StoNotificationModel;


