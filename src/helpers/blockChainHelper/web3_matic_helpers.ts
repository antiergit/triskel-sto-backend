import Web3 from "web3";
import { config } from "../../config";
import { AbiItem } from "web3-utils";
import { CoinInterface } from "../../models";
import { bigNumberSafeMath, exponentialToDecimal } from "./globalFunctions";
import { TokenData } from "../../interfaces/global.interface";
import { language } from "../../constants";
// import commonHelper from "./common.helpers";
class MaticWeb3 {
    public web3: Web3;
    public abi: AbiItem[] | string;

    constructor(abi: AbiItem[] | string = "") {
        var provider = new Web3.providers.HttpProvider(config.NODE.MATIC_RPC_URL || "");

        this.web3 = new Web3(provider);
        this.abi = abi != "" ? abi : "";
        this.initialize();
    }
    public initialize() { }

    public async searchToken(token_contract: string, lang: string) {
        try {
            let { Contract }: any = maticWeb3.web3.eth;
            let contract: any = new Contract(config.CONTRACT_ABI as AbiItem[], token_contract as string);
            let decimals: number = await contract.methods.decimals().call();
            let name: string = await contract.methods.name().call();
            let symbol: string = await contract.methods.symbol().call();
            let data: TokenData = { decimals: Number(decimals), name: name, symbol: symbol };
            if (!data) throw new Error(language[lang].MATIC_TOKEN_SEARCH);
            return data;
        } catch (err: any) {
            console.error("searchToken_matic", err)
            // await commonHelper.save_error_logs("searchToken_matic", err.message);
            throw new Error(language[lang].MATIC_TOKEN_SEARCH);
        }
    }

    public async get_matic_erc20_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
            console.log("get_matic_erc20_token_balance >>> get_matic_erc20_token_balance >>> get_matic_erc20_token_balance", token_address)
            if (token_address) {
                let contract: any = new this.web3.eth.Contract(tokenAbi, token_address);
                let decimals: number = await contract.methods.decimals().call();
                let balance: string = await contract.methods.balanceOf(wallet_address).call();
                let tokenBalance: number = await bigNumberSafeMath(balance, '/', Math.pow(10, decimals));
                return tokenBalance;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in get_matic_erc20_token_balance of matic", err);
            // await commonHelper.save_error_logs("get_matic_erc20_token_balance", err.message);
            return 0;
        }
    }
    public async validate_matic_address(address: string) {
        try {
            let { isAddress }: any = this.web3.utils;
            let validate_address: Boolean = isAddress(address);
            return validate_address;
        } catch (err: any) {
            console.error("Error in validate_matic_address", err)
            // await commonHelper.save_error_logs("validate_matic_address", err.message);
            return false;
        }
    }
    public async get_balance(coinData: CoinInterface, address: string) {
        try {
            console.log("get_balance >>> get_balance >>> get_balance", coinData, address)
            let balance: string = '0';
            if (coinData.is_token == 1) {
                balance = (await this.get_matic_erc20_token_balance(coinData.token_address, config.CONTRACT_ABI as AbiItem[], address)).toString()
            } else {
                balance = (await this.get_coin_balance(address, true)).toString()
            }
            balance = await exponentialToDecimal(Number(balance))
            return balance;
        } catch (err: any) {
            console.error("Error in get_balance of matic.", err)
            // await commonHelper.save_error_logs("get_balance_matic", err.message);
            return 0;
        }
    }

    public async get_coin_balance(wallet_address: string, inPoly: boolean) {
        try {
            console.log("get_coin_balance >>> get_coin_balance >>> get_coin_balance")

            let balance_in_wei: any = await this.web3.eth.getBalance(wallet_address)
            if (inPoly == true) {
                let balance_in_poly: any = await this.web3.utils.fromWei(balance_in_wei, 'ether')
                return balance_in_poly;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in get_coin_balance of matic.", err)
            // await commonHelper.save_error_logs("get_coin_balance_matic", err.message);
            return 0;
        }
    }

    public async get_tut_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
            console.log("get_matic_erc20_token_balance >>> get_matic_erc20_token_balance >>> get_matic_erc20_token_balance", token_address)
            if (token_address) {
                let contract: any = new this.web3.eth.Contract(tokenAbi, token_address);
                let decimals: number = await contract.methods.decimals().call();
                let balance: string = await contract.methods.balanceOf(wallet_address).call();
                let tokenBalance: number = await bigNumberSafeMath(balance, '/', Math.pow(10, decimals));
                console.log(" >>>  >>> ", tokenBalance, decimals, balance)
                return tokenBalance;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in get_tut_token_balance of matic", err);
            // await commonHelper.save_error_logs("get_matic_erc20_token_balance", err.message);
            return 0;
        }
    }

}

export const maticWeb3 = new MaticWeb3();
