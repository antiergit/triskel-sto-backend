import { DataTypes, Model, Optional } from "sequelize";

import { TransactionsInterface } from "../interface/interface.transactions";
import db from "../../helpers/common/db";
import ProposalModel from "./model.proposal";
import OrderModel from "./model.order";
import WalletModel from "./model.wallets";
import UserBalanceModel from "./model.user_balance";
import SecondaryProposalModel from "../model/model.secondary_proposal";
import CoinsInFiatModel from "../model/model.coin_price_in_fiats";


interface TransactionsCreationModel extends Optional<TransactionsInterface, "id"> { }
interface TransactionsInstance
  extends Model<TransactionsInterface, TransactionsCreationModel>,
  TransactionsInterface { }

  let dataObj: any = {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
  is_primary:{
    type: DataTypes.INTEGER,
    allowNull: true
  },
  coin_family:{
    type: DataTypes.INTEGER,
    allowNull: true
  },
    secondary_market_proposal_id:{
      type: DataTypes.INTEGER,
      allowNull: true,
  },
  seller_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
},
    unique_id: {
      type: DataTypes.STRING,
      defaultValue: null
    },
    req_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_token_quantity: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    webhook_amount: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    proposal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token_value: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tx_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mint_tx_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tx_raw: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    from_adrs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_adrs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    to_liminal_adrs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    seller_wallet_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    to_adrs: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    coin_id: {
      type: DataTypes.NUMBER,
      allowNull: false,
    },
    is_order: {
      type: DataTypes.NUMBER,
      default: 1,
    },
    approval_status: {
      type: DataTypes.ENUM(
        "approved", "pending", 'declined'
      ),
      allowNull: true,
    },
    qa_status: {
      type: DataTypes.NUMBER,
      default: null,
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "complete"
      ),
      allowNull: false,
    },
    token_mint_status: {
      type: DataTypes.ENUM(
        "pending","processing","complete","failed"
      ),
      allowNull: true,
    },
    blockchain_status: {
      type: DataTypes.ENUM("FAILED", "CONFIRMED", "PENDING"),
      allowNull: false,
    },
    refund_status: {
      type: DataTypes.ENUM("pending", "complete"),
      allowNull: true,
    },
    tx_type: {
      type: DataTypes.ENUM("primary", "secondary", "deposit", "withdraw"),
      defaultValue: null
    },
    liminal_refund_status: {
      type: DataTypes.ENUM("initiate", "broadcast", "confirmed","failed"),
      allowNull: true,
    },
    liminal_tx_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
   sequence_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  };
const TransactionsModel = db.db_write.define<TransactionsInstance>(
  "transactions",
  dataObj
);
TransactionsModel.belongsTo(ProposalModel, {
  foreignKey: "proposal_id",
  targetKey: "id",
  as: "proposal_data"
});
TransactionsModel.belongsTo(OrderModel, {
  foreignKey: "order_id",
  targetKey: "id",
  as: "order_data"
});

TransactionsModel.belongsTo(WalletModel, {
  foreignKey: "wallet_id",
  targetKey: "wallet_id",
  as: "wallet_data"
});

TransactionsModel.belongsTo(UserBalanceModel, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "user_balance_data"
});

TransactionsModel.belongsTo(SecondaryProposalModel, {
  foreignKey: "secondary_market_proposal_id",
  targetKey: "id",
  as: "transaction_secondary_proposal_data"
});

TransactionsModel.belongsTo(CoinsInFiatModel, {
  foreignKey: "coin_id",
  targetKey: "coin_id",
  as: "transaction_coin_fiat_price_data"
});




export default TransactionsModel;
