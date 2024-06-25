import { DataTypes, Model, Optional } from "sequelize";
import { CoinInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import CoinPriceFiatsModel from "./model.coin_price_in_fiats";
import ProposalModel from "./model.proposal";

// import CoinPriceInFiatGraphModel from "./model_coin_price_in_fiat_graph";
interface CoinCreationModel extends Optional<CoinInterface, "coin_id"> { }
interface CoinInstance extends Model<CoinInterface, CoinCreationModel>, CoinInterface { }

let dataObj: any = {
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  coin_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_family: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  decimals: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  is_tradable: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cmc_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_token: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  token_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_sto: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_proposal: {
    type: DataTypes.INTEGER,
     default:0
    },
    proposal_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  lmnl_adrs: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  min: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  max: {
    type: DataTypes.DOUBLE,
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
      unique: true,
      fields: ["coin_id"],
    },
    {
      unique: false,
      fields: ["coin_symbol"],
    },
  ],
};

const CoinsModel = db.db_write.define<CoinInstance>(
  "coins",
  dataObj,
  dataObjIndex
);
CoinsModel.belongsTo(CoinPriceFiatsModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "coin_price_data" })// CoinsModel.belongsTo(CoinPriceInFiatGraphModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "fiat_price_graph_data" })
CoinsModel.belongsTo(CoinPriceFiatsModel, {
  foreignKey: "coin_id",
  targetKey: "coin_id",
  as: "fiat_coin_data"
});

// CoinsModel.belongsTo(ProposalModel, { foreignKey: "symbol", targetKey: "coin_symbol", as: "coins_proposal_data" })// CoinsModel.belongsTo(CoinPriceInFiatGraphModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "fiat_price_graph_data" })


export default CoinsModel;
