import { DataTypes, Model, Optional } from "sequelize";
import { CardLiminalAddressInterface } from "../interface/interface.card_liminal_address";
import wallet_db from "../../helpers/common/wallet_db";
import CoinsModel from "./model.coins";
interface CardLiminalAddressCreationModel extends Optional<CardLiminalAddressInterface, "id"> { }
interface CardLiminalAddressInstance
  extends Model<CardLiminalAddressInterface, CardLiminalAddressCreationModel>,
  CardLiminalAddressInterface { }
let dataObj = {
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
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  card_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  otc_coin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sto_coin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  coin_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coin_family: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  liminal_path: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  liminal_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  card_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  card_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
};

const CardLiminalAddressModel = wallet_db.db_write.define<CardLiminalAddressInstance>(
  "card_liminal_addresses",
  dataObj
);

CardLiminalAddressModel.belongsTo(CoinsModel, {
  foreignKey: "otc_coin_id",
  targetKey: "coin_id",
  as: "liminal_coins_data"
});
export default CardLiminalAddressModel;