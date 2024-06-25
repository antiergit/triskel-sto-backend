import { DataTypes, Model, Optional } from "sequelize";
import { CategoryInterface } from "../interface/interface.category";
import db from "../../helpers/common/db";
interface CategoryCreationModel extends Optional<CategoryInterface, "id"> { }
interface CategoryInstance
    extends Model<CategoryInterface, CategoryCreationModel>,
    CategoryInterface {}
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
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
const ProposalImageModel = db.db_write.define<CategoryInstance>(
    "categories",
    dataObj
);

export default ProposalImageModel;