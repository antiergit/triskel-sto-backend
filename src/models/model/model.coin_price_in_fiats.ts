import { DataTypes, Model, Optional } from "sequelize";
import { CoinPriceFiatInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
interface CoinInFiatCreationModel extends Optional<CoinPriceFiatInterface, "coin_id"> { }
interface CoinPriceFiatModel extends Model<CoinPriceFiatInterface, CoinInFiatCreationModel>, CoinPriceFiatInterface { }
import CoinsModel from "./model.coins";




let dataObj: any = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cmc_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coin_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fiat_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  value: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  price_change_24h: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price_change_percentage_24h: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  token_address: {
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
let dataObjIndex = {
  indexes: [
    {
      unique: false,
      fields: ['coin_id']
    },
    {
      unique: false,
      fields: ['fiat_type']
    }
  ],
};

const CoinsInFiatModel = db.db_write.define<CoinPriceFiatModel>(
  "coin_price_in_fiats",
  dataObj,
  dataObjIndex
);


export default CoinsInFiatModel;
