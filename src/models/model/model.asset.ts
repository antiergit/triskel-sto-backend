import { DataTypes, Model, Optional } from "sequelize";
import { AssetInterface } from "../interface/interface.asset";
import db from "../../helpers/common/db";
interface AssetCreationModel extends Optional<AssetInterface, "id"> { }
interface AssetInstance
    extends Model<AssetInterface, AssetCreationModel>,
    AssetInterface {}
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    asset_type: {
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
const AssetModel = db.db_write.define<AssetInstance>(
    "assets",
    dataObj
);

export default AssetModel;