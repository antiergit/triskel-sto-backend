import { DataTypes, Model, Optional } from "sequelize";
import { WalletInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import CoinsModel from '../model/model.coins';
import ProposalModel from '../model/model.proposal';

interface WalletCreationModel extends Optional<WalletInterface, "wallet_id"> { }
interface WalletInstance
  extends Model<WalletInterface, WalletCreationModel>,
  WalletInterface { }

let dataObj: any = {
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
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_sto_wallet: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wallet_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  approval_status: {
    type: DataTypes.ENUM(
      "approved", "pending", 'declined'
    ),
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
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
  is_verified: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
  },
  sort_order: {
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
      fields: ["is_verified"],
    },
    {
      unique: false,
      fields: ["status"],
    },
  ],
};

const WalletModel = db.db_write.define<WalletInstance>(
  "wallets",
  dataObj,
  dataObjIndex
);

WalletModel.belongsTo(CoinsModel, {
  foreignKey: "coin_id",
  targetKey: "coin_id",
});
WalletModel.belongsTo(ProposalModel, {
  foreignKey: "proposal_id",
  targetKey: "id",
  as: "ProposalData"

});



export default WalletModel;