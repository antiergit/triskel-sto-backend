import { DataTypes, Model, Optional } from "sequelize";
import { BackendCoinInterface } from "../interface/interface.backend_coins";
import db from "../../helpers/common/wallet_db";
// import CoinPriceInFiatModel from '../model/model.coinPriceInFiat';
// import WatchlistsModel from "./model.watchlist";
// import CoinPriceInFiatGraphModel from "./model.coinPriceInFiatGraph";
// import CardCoinsModel from "./model.card_supported_coins";
// import CardCoinPriceInFiatModel from "./model.card_coin_fiat";


interface BackendCoinCreationModel extends Optional<BackendCoinInterface, "coin_id"> { }
interface BackendCoinInstance extends Model<BackendCoinInterface, BackendCoinCreationModel>, BackendCoinInterface { }

let dataObj = {
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  mainnet_token_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // coin_market_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  // },
  coin_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cmc_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_on_cmc: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coin_symbol: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin_gicko_alias: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_family: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  coin_status: {
    type: DataTypes.TINYINT,
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
  decimals: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  usd_price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  withdraw_limit: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  token_abi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uuid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  for_swap: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  added_by: {
    type: DataTypes.ENUM('admin', 'user', 'swap'),
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
    {
      unique: false,
      fields: ["coin_gicko_alias"],
    },
    {
      unique: false,
      fields: ["coin_family"],
    },
    {
      unique: false,
      fields: ["coin_status"],
    },
    {
      unique: false,
      fields: ["is_token"],
    },
    {
      unique: false,
      fields: ["token_type"],
    },
    {
      unique: false,
      fields: ["token_address"],
    },
  ],
};

const BackendCoinsModel = db.db_write.define<BackendCoinInstance>(
  "coins",
  dataObj,
  dataObjIndex
);


// CoinsModel.belongsTo(CoinPriceInFiatModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "fiat_price_data" })
// CoinsModel.belongsTo(CoinPriceInFiatGraphModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "fiat_price_graph_data" })
// // CoinsModel.belongsTo(WalletModel, { foreignKey: "coin_id", targetKey: "coin_id", as: "wallet_data" })
// CoinsModel.belongsTo(WatchlistsModel, { foreignKey: "coin_id", targetKey: "coin_id", as: "watchlist_data" })
// CoinsModel.belongsTo(CardCoinPriceInFiatModel, { foreignKey: "cmc_id", targetKey: "cmc_id", as: "card_fiat_price_data" })

// CardCoinsModel.belongsTo(CoinsModel, {
//   foreignKey: "coin_id",
//   targetKey: "coin_id",
// });



export default BackendCoinsModel;
