import { DataTypes, Model, Optional } from "sequelize";
import { AnswerInterface } from "../interface/interface.answernaries";
import db from "../../helpers/common/db";

interface AnswerCreationModel extends Optional<AnswerInterface, "id"> { }
interface AnswerInstance extends Model<AnswerInterface, AnswerCreationModel>, AnswerInterface { }
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
    title: {
        type: DataTypes.STRING,
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    skip_to: {
        type: DataTypes.INTEGER,
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
const AnswerModel = db.db_write.define<AnswerInstance>(
    "answernaries",
    dataObj
);

export default AnswerModel;
