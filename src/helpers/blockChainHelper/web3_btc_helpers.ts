import { config } from "../../config";
import axios, { AxiosInstance } from "axios";
import { block_global_helper } from "../../helpers/blockChainHelper/global_helper";

// import commonHelper from "./common.helpers";

class utxo {
    // public btc_client_url = config.NODE.BTC_RPC_URL;
    // public btc_axios_client: AxiosInstance;
    public config: any;

    constructor() {
        this.config = {
            method: 'get',
            headers: {
                'apikey': `${config.NODE.BTC_API_KEY}`,
                'Content-Type': 'application/json',
            }
        };
        // this.btc_axios_client = axios.create({
        //     baseURL: this.btc_client_url,
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });
    }

    public async validate_btc_address(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            let validate_data: any = await axios(this.config);
            if (validate_data.data) {
                return true;
            } else {
                return false;
            }
            // let validation_url: any;
            // validation_url = `${this.btc_client_url}api/v2/address/${address}`;
            // let validate_data: any = await block_global_helper.fetch_data('get', validation_url, {});
            // if (validate_data) {
            //     return true;
            // } else {
            //     return false;
            // }
        } catch (err: any) {
            console.error("Error in validation BTC address", err)
            // await commonHelper.save_error_logs("validate_btc_address", err.message);
            return false;
        }
    }
    public async get_balance(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            let response: any = await axios(this.config);
            return response.data.balance / 100000000;
            // const response = await this.btc_axios_client.get(`api/v2/address/${address}`);
            // return response.data.balance / 100000000;
        } catch (err: any) {
            console.error("Erorr in get balacne of BTC.", err)
            // await commonHelper.save_error_logs("get_balance_btc", err.message);
            return 0;
        }
    }

}

export const utxobtc = new utxo();
