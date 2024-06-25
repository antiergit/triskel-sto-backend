import { DataTypes, Model, Optional } from "sequelize";
import { BackendWalletInterface } from "../interface/interface.backend_wallets";
import db from "../../helpers/common/wallet_db";
import CoinsModel from '../model/model.coins';
interface BackendWalletCreationModel extends Optional<BackendWalletInterface, "wallet_id"> { }
interface BackendWalletInstance
  extends Model<BackendWalletInterface, BackendWalletCreationModel>,
  BackendWalletInterface { }

let dataObj = {
  wallet_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  login_type: {
    type: DataTypes.STRING,
    allowNull: true
  },
  social_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  wallet_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coin_family: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  balance_blocked: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  user_withdraw_limit: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  default_wallet: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  is_deleted: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  sort_order: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_private_wallet: {
    type: DataTypes.TINYINT,
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

let dataObjIndex = {
  indexes: [
    {
      unique: false,
      fields: ["user_id"],
    },
    {
      unique: false,
      fields: ["coin_family"],
    },
    {
      unique: false,
      fields: ["wallet_address"],
    },
    {
      unique: false,
      fields: ["coin_id"],
    },
    {
      unique: false,
      fields: ["default_wallet"],
    },
    {
      unique: false,
      fields: ["is_verified"],
    },
    {
      unique: false,
      fields: ["status"],
    },
  ],
};

const BackendWalletModel = db.db_write.define<BackendWalletInstance>(
  "wallets",
  dataObj,
  dataObjIndex
);

// CoinsModel.hasMany(WalletModel, {
//   foreignKey: "coin_id",
//   sourceKey: "coin_id",
// });

// CoinsModel.hasMany(WalletModel, {
//   foreignKey: "coin_family",
//   sourceKey: "coin_family",
//   as: "native_wallet_data"
// });

// WalletModel.belongsTo(CoinsModel, {
//   foreignKey: "coin_id",
//   targetKey: "coin_id",
// });
// CoinsModel.hasOne(WalletModel, {
//   foreignKey: "coin_id",
//   sourceKey: "coin_id",
//   as: "wallet_data"
// });


export default BackendWalletModel;