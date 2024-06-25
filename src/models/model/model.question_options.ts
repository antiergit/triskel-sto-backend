import { DataTypes, Model, Optional } from "sequelize";
import { StoQuestionOptionsInterface } from "../interface/interface.question_options";
import sto_db from "../../helpers/common/db";
interface QuestionOptionsCreationModel extends Optional<StoQuestionOptionsInterface, "id"> { }
interface QuestionOptionInstance extends Model<StoQuestionOptionsInterface, QuestionOptionsCreationModel>, StoQuestionOptionsInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    ans_auto_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    options: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    skip_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    categories: {
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
const QuestionOptionModel = sto_db.db_write.define<QuestionOptionInstance>(
    "questionnarie_options",
    dataObj
);

export default QuestionOptionModel;
