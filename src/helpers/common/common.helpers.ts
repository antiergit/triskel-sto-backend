import NodeRSA from "node-rsa";
import fs from "fs";
import { config } from "../../config";
import * as Models from '../../models/model/index';
class CommonHelper {
  constructor() { }

  public async makeRandomStringForTx() {
    try {
      let unique_id: any = await commonHelper.makeRandomString()
      let existingTransaction: any = await Models.TransactionsModel.findOne({
        where: {
          unique_id: unique_id
        }
      })
      console.log("fn makeRandomStringForTx existingTransaction ::", existingTransaction)
      if (existingTransaction) {
        unique_id = await this.makeRandomStringForTx()
      }
      return unique_id
    } catch (err: any) {
      console.log("makeRandomStringForTx:", err);
    }
  }

  public async makeRandomString(length: number = 5) {
    let result = '';
    let timeStamp: string = Date.now().toString();
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    result = result + "_" + timeStamp
    return result;
  }
}

const commonHelper = new CommonHelper();
export default commonHelper;
