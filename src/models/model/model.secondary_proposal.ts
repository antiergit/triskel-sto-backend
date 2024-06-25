import { DataTypes, Model, Optional } from "sequelize";
import { SecondaryProposalModelInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import ProposalModel from "../model/model.proposal";
import Transaction from "../model/model.transactions";
import CoinsInFiatModel from "../model/model.coin_price_in_fiats";
import CoinsModel from "../model/model.coins";




interface SecondaryProposalCreationModel
  extends Optional<SecondaryProposalModelInterface, "id"> { }
interface SecondaryProposalInstance
  extends Model<SecondaryProposalModelInterface, SecondaryProposalCreationModel>,
  SecondaryProposalModelInterface { }

let dataObj: any = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  lock_tx_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unlock_tx_hash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lock_blockchain_status: {
    type: DataTypes.ENUM(
      "pending","confirmed","failed"
    ),
    allowNull: true,
  },
  unlock_blockchain_status: {
    type: DataTypes.ENUM(
      "pending","confirmed","failed"
    ),
    allowNull: true,
  },
  coin_family:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  coin_id:{
    type: DataTypes.INTEGER,
    alllowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    alllowNull: false,
  },
  seller_wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  secondary_market_proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  raise_fund: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  collected_fund: {
    type: DataTypes.STRING,
    default: "0",
    allowNull: true,
  },
  token_value: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_quantity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_to_sold: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  blocked_tokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "open",
  },
  cancelled_status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  is_cancelled: {
    type: DataTypes.TINYINT,
    defaultValue: 0,
  },
  token_address: {
    type: DataTypes.STRING,
    alllowNull: true,
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

const SecondaryProposalModel = db.db_write.define<SecondaryProposalInstance>(
  "secondary_market_proposals",
  dataObj
);

SecondaryProposalModel.belongsTo(CoinsInFiatModel, {
  foreignKey: "coin_id",
  targetKey: "coin_id",
  as: "coin_fiat_price_data"
});

SecondaryProposalModel.belongsTo(ProposalModel, {
  foreignKey: "proposal_id",
  targetKey: "id",
  as: "secondary_proposal_data"
});
SecondaryProposalModel.belongsTo(CoinsModel, {
  foreignKey: "coin_id",
  targetKey: "coin_id",
  as: "coin_data"
});
// ProposalModel.hasMany(SecondaryProposalModel, { foreignKey: "proposal_id", sourceKey: "id", as: "secondary_prop_data" });

// SecondaryProposalModel.hasMany(ProposalModel, { foreignKey: "id", sourceKey: "proposal_id", as: "secondary_perposal_data" });
// SecondaryProposalModel.hasMany(Transaction, { foreignKey: "secondary_market_proposal_id", sourceKey: "id", as: "trx_sell_data" });

export default SecondaryProposalModel;
