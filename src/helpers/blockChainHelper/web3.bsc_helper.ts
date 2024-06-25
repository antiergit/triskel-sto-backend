import Web3 from "web3";
import { config } from "../../config";
import { AbiItem } from "web3-utils";
import { CoinInterface } from "../../models";
import { TokenData } from "../../interfaces/global.interface";

import { bigNumberSafeMath } from "../blockChainHelper/globalFunctions";
import { exponentialToDecimal } from "../blockChainHelper/globalFunctions";
import { language } from "../../constants";
// import commonHelper from "./common.helpers";

class BSCWeb3 {
    public web3: Web3;
    public abi: AbiItem[] | string;

    constructor(abi: AbiItem[] | string = "") {
        var provider = new Web3.providers.HttpProvider(config.NODE.BNB_RPC_URL || "");
        this.web3 = new Web3(provider);
        this.abi = abi != "" ? abi : "";
        this.initialize();
    }
    public initialize() { }

    public async get_bep20_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
            if (token_address) {
                let contract: any = new this.web3.eth.Contract(tokenAbi, token_address);
                let decimals: number = await contract.methods.decimals().call();
                let balance: string = await contract.methods.balanceOf(wallet_address).call();
                let tokenBalance: number = await bigNumberSafeMath(balance, '/', Math.pow(10, decimals))
                return tokenBalance;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in get_bep20_token_balance of bsc.", err)
            // await commonHelper.save_error_logs("get_bep20_token_balance_bsc", err.message);
            return 0;
        }
    }

    public async validate_bnb_address(address: string) {
        try {
            let { isAddress }: any = this.web3.utils;
            let validate_address: Boolean = isAddress(address);
            return validate_address;
        } catch (err: any) {
            console.error("Error in validate_bnb_address", err);
            // await commonHelper.save_error_logs("validate_bnb_address", err.message);
            return false;
        }
    }

    public async get_balance(coinData: CoinInterface, address: string) {
        try {
            let balance: string = '0';
            if (coinData.is_token) {
                balance = (await this.get_bep20_token_balance(coinData.token_address, config.CONTRACT_ABI as AbiItem[], address)).toString()
            } else {
                balance = (await this.get_coin_balance(address, true)).toString();
            }
            balance = exponentialToDecimal(Number(balance))
            console.log("bnb token balance",balance)
            return balance;
        } catch (err: any) {
            console.error("Error in get_balance of bnb", err)
            // await commonHelper.save_error_logs("get_balance_bnb", err.message);
            return 0;
        }
    }

    public async get_coin_balance(address: string, inBsc: boolean) {
        try {
            let balanceInWei = await this.web3.eth.getBalance(address);
            if (inBsc == true) {
                let balanceInBsc = this.web3.utils.fromWei(balanceInWei, "ether");
                return balanceInBsc;
            }
            return balanceInWei;
        } catch (err: any) {
            console.log("get_coin_balance _bsc", err);
            // await commonHelper.save_error_logs("get_coin_balance_bnb", err.message);
            throw err;
        }
    }

    public async get_bsc_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
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
            console.error("Error in get_eth_token_balance of matic", err);
            return 0;
        }
    }


















};

export const bscWeb3 = new BSCWeb3();

