import { DataTypes, Model, Optional } from "sequelize";
import { AdminRevokedTokensInterface } from "../interface/index.interface";
import db from "../../helpers/common/db";

interface AdminRevokedTokensCreationModel extends Optional<AdminRevokedTokensInterface, "id"> { }
interface AdminRevokedTokensInstance
    extends Model<AdminRevokedTokensInterface, AdminRevokedTokensCreationModel>,
    AdminRevokedTokensInterface { }

const dataObj = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    jwt_token: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
};

const AdminRevokedTokensModel = db.db_write.define<AdminRevokedTokensInstance>("admin_revoked_tokens", dataObj);
export default AdminRevokedTokensModel;


