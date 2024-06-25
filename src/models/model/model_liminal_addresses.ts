import { DataTypes, Model, Optional } from "sequelize";
import { StoLiminalAddressInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";
interface OtcLiminalAddressCreationModel extends Optional<StoLiminalAddressInterface, "id"> { }
interface OtcLiminalAddressInstance
  extends Model<StoLiminalAddressInterface, OtcLiminalAddressCreationModel>,
  StoLiminalAddressInterface { }
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
  coin_family: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  sto_coin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
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
  }
};

const OtcLiminalAddressModel = db.db_write.define<OtcLiminalAddressInstance>(
  "liminal_addresses",
  dataObj
);
export default OtcLiminalAddressModel;