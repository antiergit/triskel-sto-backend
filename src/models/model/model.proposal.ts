import { DataTypes, Model, Optional } from "sequelize";
import { ProposalInterface } from "../interface/interface.proposal";
import db from "../../helpers/common/db";
import ProposalImageModel from '../model/model.proposal_file';
import AssetModel from '../model/model.asset';
import IconModel from '../model/model.icon'

import SecondaryProposalModel from '../model/model.secondary_proposal'







interface ProposalCreationModel extends Optional<ProposalInterface, "id"> { }
interface ProposalInstance
    extends Model<ProposalInterface, ProposalCreationModel>,
    ProposalInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        alllowNull: true
    },
    token_address: {
        type: DataTypes.STRING,
        alllowNull: true
    },
    unique_id: {
        type: DataTypes.STRING,
        alllowNull: false
    },
    agent_address: {
        type: DataTypes.STRING,
        alllowNull: true
    },
    project_id: {
        type: DataTypes.INTEGER,
        alllowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    company_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    token_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    symbol: {
        type: DataTypes.STRING,
        allowNull: false
    },

    raise_fund: {
        type: DataTypes.STRING,
        allowNull: true
    },
    collected_fund: {
        type: DataTypes.STRING,
        default: "0",
        allowNull: true
    },
    token_value: {
        type: DataTypes.STRING,
        allowNull: true

    },
    fee: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,

    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    min_investment: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    token_to_sold: {
        type: DataTypes.STRING,
    },
    minted_token_quantity: {
        type: DataTypes.STRING,
        defaultValue: "0"
    },
    blocked_tokens: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    token_quantity: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    project_yield: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    asset_info: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    mint_status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.TINYINT,
        defaultValue: 1,
    },
    soft_cap_status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    hard_cap_status: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
    },
    relisted: {
        type: DataTypes.TINYINT,
        defaultValue: 2           
    },
    asset_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token_id: {
        type: DataTypes.STRING,
        defaultValue: "",
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
const ProposalModel = db.db_write.define<ProposalInstance>(
    "proposals",
    dataObj
);
ProposalModel.hasMany(ProposalImageModel, { foreignKey: "proposal_id", sourceKey: "id", as: "proposal_file" });

ProposalModel.hasOne(AssetModel, { foreignKey: "id", sourceKey: "asset_type_id", as: "asset_type" })

ProposalModel.hasMany(IconModel, { foreignKey: "proposal_id", sourceKey: "id", as: "proposal_icon" });

// ProposalModel.hasMany(SecondaryProposalModel, { foreignKey: "proposal_id", sourceKey: "id", as: "secondary_perposal_data" });


export default ProposalModel;