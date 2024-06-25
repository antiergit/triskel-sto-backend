import { DataTypes, Model, Optional } from "sequelize";
import { IconInterface } from "../interface/interface.icon";
import db from "../../helpers/common/db";
interface IconCreationModel extends Optional<IconInterface, "id"> { }
interface ProposalImageInstance
    extends Model<IconInterface, IconCreationModel>,
    IconInterface { }
let dataObj: any = {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    proposal_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    sub_head_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    sub_head_value: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    icon: {
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
const IconModel = db.db_write.define<ProposalImageInstance>(
    "icons",
    dataObj
);

export default IconModel;