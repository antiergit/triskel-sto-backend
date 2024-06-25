import { DataTypes, Model, Optional } from "sequelize";
import { QuestionnariesInterface } from "../interface/interface.question";
import db from "../../helpers/common/db";
import QuestionOptionModel from "./model.question_options";

interface QuestionnariesCreationModel extends Optional<QuestionnariesInterface, "id"> { }
interface QuestionnariesInstance extends Model<QuestionnariesInterface, QuestionnariesCreationModel>, QuestionnariesInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.NUMBER,
        allowNull: true,
    },
    question: {
        type: DataTypes.TEXT
    },
    answer_json: {
        type: DataTypes.TEXT,
        get(this: QuestionnariesInstance) {
            const rawValue: any = this.getDataValue("answer_json");
            return rawValue ? JSON.parse(rawValue) : null;
        },
    },

    status: {
        type: DataTypes.NUMBER,
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
const QuestionnariesModel = db.db_write.define<QuestionnariesInstance>(
    "questionnaries",
    dataObj
);
QuestionnariesModel.hasMany(QuestionOptionModel, { foreignKey: "question_id", sourceKey: "id", as: "answers" });

export default QuestionnariesModel;
