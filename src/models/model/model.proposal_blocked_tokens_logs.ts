import { DataTypes, Model, Optional } from "sequelize";
import { ProposalBlockedTokensLogsInterface } from "../interface/interface.proposalBlockedTokensLogs";
import db from "../../helpers/common/db";

interface ProposalBlockedTokensLogsCreationModel extends Optional<ProposalBlockedTokensLogsInterface, "id"> { }
interface ProposalBlockedTokensLogsInstance
    extends Model<ProposalBlockedTokensLogsInterface, ProposalBlockedTokensLogsCreationModel>,
    ProposalBlockedTokensLogsInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },

    proposal_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    issued_token: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    old_token_to_sold: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    new_token_to_sold: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    diff_token_to_sold: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    old_blocked_tokens: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    new_blocked_tokens: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    diff_blocked_tokens: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    old_collected_fund: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    new_collected_fund: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    diff_collected_fund: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    action: {
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
const ProposalBlockedTokensLogs = db.db_write.define<ProposalBlockedTokensLogsInstance>(
    "proposal_blocked_tokens_logs",
    dataObj
);

export default ProposalBlockedTokensLogs;