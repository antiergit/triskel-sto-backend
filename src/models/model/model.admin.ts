import { DataTypes, Model, Optional } from "sequelize";
import { AdminInterface } from "../interface/interface.admin"
import db from "../../helpers/common/db";

interface AdminModel extends Optional<AdminInterface, "id"> { }
interface AdminInstance
    extends Model<AdminInterface, AdminModel>,
    AdminInterface { }

let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    mobile_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    google2fa_secret: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    google2fa_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    jwt_token: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    login_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
    },
    active: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
};

const AdminModel = db.db_write.define<AdminInstance>("admins", dataObj);

export default AdminModel;


