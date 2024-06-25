import { DataTypes, Model, Optional } from "sequelize";
import { PriceConversionInterface } from "../interface/interface.price_conversion";
import db from "../../helpers/common/db";
interface PriceConversionCreationModel extends Optional<PriceConversionInterface, "id"> { }
interface PriceConversionInstance
    extends Model<PriceConversionInterface, PriceConversionCreationModel>,
    PriceConversionInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    asset_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_price: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_price_symbol: {
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
const PriceConversionModel = db.db_write.define<PriceConversionInstance>(
    "price_conversions",
    dataObj
);
export default PriceConversionModel;