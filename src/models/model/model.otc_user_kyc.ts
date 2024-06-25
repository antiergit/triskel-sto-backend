import { DataTypes, Model, Optional } from "sequelize";
import { UserKycInterface } from "../interface/interface.otc_user_kyc";
import otc_db from "../../helpers/common/otc_db";
interface UserKycCreationModel extends Optional<UserKycInterface, "id"> { }
interface UserKycInstance
    extends Model<UserKycInterface, UserKycCreationModel>,
    UserKycInterface { }
let dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        alllowNull: false
    },
    kyc_address: {
        type: DataTypes.INTEGER,
        alllowNull: false
    },
    kyc_status: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: '0',
        values: ['0', '1', '2', '3']
    },
    email: {
        type: DataTypes.STRING,
        alllowNull: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: true
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

const UserKycModel = otc_db.db_write.define<UserKycInstance>(
    "user_kycs",
    dataObj
);

export default UserKycModel;