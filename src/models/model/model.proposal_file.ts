import { DataTypes, Model, Optional } from "sequelize";
import { ProposalImageInterface } from "../interface/interface.proposal_image";
import db from "../../helpers/common/db";
interface ProposalImageCreationModel extends Optional<ProposalImageInterface, "id"> { }
interface ProposalImageInstance
    extends Model<ProposalImageInterface, ProposalImageCreationModel>,
    ProposalImageInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    proposal_id: {
        type: DataTypes.INTEGER,
        alllowNull: false
    },
    url: {
        type: DataTypes.STRING,
        alllowNull: true
    },
    type: {
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
const ProposalImageModel = db.db_write.define<ProposalImageInstance>(
    "proposal_files",
    dataObj
);


export default ProposalImageModel;