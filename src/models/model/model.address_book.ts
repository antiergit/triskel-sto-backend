import { DataTypes, Model, Optional } from "sequelize";
import { AddressBookInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
import ProposalModel from "./model.proposal";

interface AddressBookCreationModel extends Optional<AddressBookInterface, "wallet_id"> { }
interface AddressBookInstance
  extends Model<AddressBookInterface, AddressBookCreationModel>,
  AddressBookInterface { }

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
  wallet_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  network: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  wallet_address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  proposal_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  market: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  coin_family: {
    type: DataTypes.TINYINT,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    default: 0
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
};
const AddressBookModel = db.db_write.define<AddressBookInstance>(
  "address_books",
  dataObj
);
AddressBookModel.hasOne(ProposalModel, { foreignKey: "id", sourceKey: "proposal_id", as: "perName" })


export default AddressBookModel;



