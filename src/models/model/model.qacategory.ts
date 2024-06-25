import { DataTypes, Model, Optional } from "sequelize";
import { QaCategoryInterface } from "../interface/interface.qacategory";
import db from "../../helpers/common/db";
interface QaCategoryCreationModel extends Optional<QaCategoryInterface, "id"> { }
interface QaCategoryInstance
    extends Model<QaCategoryInterface, QaCategoryCreationModel>,
    QaCategoryInterface {}
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
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
const QaCategoryModel = db.db_write.define<QaCategoryInstance>(
    "question_categories",
    dataObj
);

export default QaCategoryModel;