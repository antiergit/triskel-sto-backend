import axios from "axios";
import { config } from "../../config";
import { CoinFamily, GlblBooleanEnum, GlblCoins, GlblMessages } from "../../constants/global_enum";
import { TokenType } from "../../constants/global_enum";
import { AbiItem } from "web3-utils";
import { exponentialToDecimal } from "./globalFunctions";
import { FCMObject } from "../../interfaces/global.interface";
import commonHelper from "./common.helpers";

var FCM = require('fcm-node');


class Global_helper {
    public async generateLiminalAddress(blockchain: string, path: number) {
        try {
            console.log("blockchain ---=====", blockchain, path)
            let wallet_id: number = (blockchain == "eth") ? Number(config.LIMINAL.LIMINAL_ETH_WALLET_ID) : (blockchain == "matic") ? Number(config.LIMINAL.LIMINAL_MATIC_WALLET_ID) : (blockchain == "trx") ? Number(config.LIMINAL.LIMINAL_TRX_WALLET_ID) : Number(0)
            let auth: any = `Basic ${Buffer.from(`${config.LIMINAL.LIMINAL_CLIENT_ID}:${config.LIMINAL.LIMINAL_SECRET_KEY}`).toString('base64')}`;
            let data: any = {
                "wallet": {
                    "coin": blockchain,
                    "walletId": wallet_id,
                    "allToken": true
                },
                "path": path
            };
            return await axios.post(`${config.LIMINAL.LIMINAL_BASE_URL}/wallet/generate-address`, JSON.stringify(data),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': auth
                    }

                }).then((response: any) => {
                    if (response?.data?.data && response?.data?.data?.address != undefined) {

                        console.log("response ---===== response -----=========", response.data.data.address, path)

                        return {
                            address: response.data.data.address,
                            path: path,
                            status: true
                        };
                    } else {
                        return { status: false, data: response?.data };
                    }
                }).catch((error: any) => {
                    console.error("catch error:", error?.data?.data?.errors);
                    return { status: false, data: error?.data };;
                });
        } catch (err: any) {
            console.error("Error in generateLiminalAddress>>", err)
            throw err;
        }
    }
}
export const global_helper = new Global_helper();
