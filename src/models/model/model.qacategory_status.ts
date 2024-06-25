import { DataTypes, Model, Optional } from "sequelize";
import { QaCategoryStatusInterface } from "../interface/interface.qacategory_status";
import db from "../../helpers/common/db";
interface QaCategoryCreationModel extends Optional<QaCategoryStatusInterface, "user_id"> { }
interface QaCategoryInstanceStatus
    extends Model<QaCategoryStatusInterface, QaCategoryCreationModel>,
    QaCategoryStatusInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    status: {
        type: DataTypes.NUMBER,
        allowNull: true,
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
const QaCategoryModelStatus = db.db_write.define<QaCategoryInstanceStatus>(
    "question_statuses",
    dataObj
);

export default QaCategoryModelStatus;