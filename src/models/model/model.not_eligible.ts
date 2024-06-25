import { DataTypes, Model, Optional } from "sequelize";
import { NotEligibleInterface } from "../interface/interface.not_eligible";
import db from "../../helpers/common/db";

interface NotEligibleCreationModel extends Optional<NotEligibleInterface, "id"> { }
interface NotEligibleInstance extends Model<NotEligibleInterface, NotEligibleCreationModel>, NotEligibleInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    proposal_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    answer: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true,
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
const NotEligibleModel = db.db_write.define<NotEligibleInstance>(
    "not_eligible_users",
    dataObj
);

export default NotEligibleModel;
