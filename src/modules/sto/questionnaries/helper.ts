import { Op, Sequelize } from 'sequelize';
import rabbitMq from '../../../helpers/common/rabbitMq';
import AWS from 'aws-sdk';
import { CoinFamily, Fiat_Currency, GlblBooleanEnum, GlblCode } from '../../../constants/global_enum'
import { config } from "../../../config";
import commonHelper from '../../../helpers/common/common.helpers';
import { language } from '../../../constants';
import { block_global_helper } from "../../../helpers/blockChainHelper/global_helper";
import * as Models from '../../../models/model/index';

class questionHelper {
    public async question_create(obj: any) {
        try {
            let data: any = await Models.QuestionnModel.create(obj)
            console.log("data@@", data)
            return data;
        } catch (err: any) {
            console.error("Error in proposal_create>>", err)
            throw err;
        }
    }
}

const questionhelper = new questionHelper();
export default questionhelper;
