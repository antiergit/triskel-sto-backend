import { DataTypes, Model, Optional } from "sequelize";
import { UserBalanceInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import ProposalModel from "./model.proposal";
import CoinsInFiatModel from "../model/model.coin_price_in_fiats";
import SecondaryProposalModel from "../model/model.secondary_proposal";
import WalletModel from "./model.wallets";






interface UserBalanceCreationModel extends Optional<UserBalanceInterface, "id"> { }
interface UserBalanceInstance
  extends Model<UserBalanceInterface, UserBalanceCreationModel>,
  UserBalanceInterface { }
let dataObj: any = {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  secondary_market_proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  is_primary:{
    type: DataTypes.INTEGER,
    allowNull: false,
    default:1
  },
  received_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
  },
  sent_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
  },
  
  total_available_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
  },
  available_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
  },
  on_sell_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
  },
  invested_balance:{
    type: DataTypes.DOUBLE,
    allowNull: false,
    default:0
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
const UserBalanceModel = db.db_write.define<UserBalanceInstance>(
  "user_balances",
  dataObj
);
UserBalanceModel.belongsTo(ProposalModel, {
  foreignKey: "proposal_id",
  targetKey: "id",
  as: "userProposalData"
});
// UserBalanceModel.belongsTo(CoinsInFiatModel, {
//   foreignKey: "coin_id",
//   targetKey: "coin_id",
//   as: "user_coin_fiat_price_data"
// });
UserBalanceModel.belongsTo(SecondaryProposalModel, {
  foreignKey: "secondary_market_proposal_id",
  targetKey: "id",
  as: "user_secondary_proposal_data"
});
UserBalanceModel.belongsTo(WalletModel, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "userWalletData"
});

export default UserBalanceModel;