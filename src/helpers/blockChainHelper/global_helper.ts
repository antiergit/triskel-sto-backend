import axios from "axios";
import { config } from "../../config";
import { ethWeb3 } from "./web3_eth_helpers";
import { maticWeb3 } from "./web3_matic_helpers";
import { CoinFamily, GlblBooleanEnum, GlblCoins, GlblMessages } from "../../constants/global_enum";
import { utxobtc } from "./web3_btc_helpers";
import { trxWeb3 } from "./web3_trx_helper";
import { CoinInterface } from "../../models";
import { TokenType } from "../../constants/global_enum";
import { AbiItem } from "web3-utils";
import { exponentialToDecimal } from "./globalFunctions";
import * as Models from '../../models/model/index';
import { FCMObject } from "../../interfaces/global.interface";
// import commonHelper from "./common.helpers";
import { bscWeb3 } from "./web3.bsc_helper";
import commonHelper from "../common/common.helpers";

var FCM = require('fcm-node');


class block_chain_global_helper {

    public async validate_address(data: any) {
        try {
            console.log("data ---============ ,data ---============", data)
            if (data.symbol) {
                data.symbol = data.symbol.toUpperCase()
                switch (data.symbol) {
                    case GlblCoins.BNB:
                        return await bscWeb3.validate_bnb_address(data.address);
                    case GlblCoins.ETH:
                        return await ethWeb3.validate_eth_address(data.address);
                    case GlblCoins.BTC:
                        console.log('BTC >>', GlblCoins.BTC);
                        if (config.SERVER !== 'stage') {
                            return await utxobtc.validate_btc_address(data.address);
                        }
                        // 
                        return true;
                    case GlblCoins.MATIC:
                        return await maticWeb3.validate_matic_address(data.address);
                    case GlblCoins.TRX:
                        return await trxWeb3.validate_trx_address(data.address);
                }
            } else if (data.coin_family) {
                switch (data.coin_family) {
                    case config.STATIC_COIN_FAMILY.BNB:
                        return await bscWeb3.validate_bnb_address(data.wallet_address);
                    case config.STATIC_COIN_FAMILY.ETH:
                        return await ethWeb3.validate_eth_address(data.wallet_address);
                    case config.STATIC_COIN_FAMILY.BTC:
                        if (config.SERVER !== 'stage') {
                            return await utxobtc.validate_btc_address(data.address);
                        }
                        return true;
                    case config.STATIC_COIN_FAMILY.MATIC:
                        return await maticWeb3.validate_matic_address(data.wallet_address);
                    case config.STATIC_COIN_FAMILY.TRX:
                        return await trxWeb3.validate_trx_address(data.wallet_address)
                }
            }
        } catch (err: any) {
            console.error("Error in validate_address", err)
            // await commonHelper.save_error_logs("validate_address", err.message);
            return false;
        }
    }
    public async get_wallet_balance(coinData: CoinInterface, wallet_address: string) {
        try {
            let balance: string = '0';
            switch (coinData.coin_family) {
                case CoinFamily.BNB:
                    balance = (await bscWeb3.get_balance(coinData, wallet_address)).toString()
                    break;
                case CoinFamily.ETH:
                    balance = (await ethWeb3.get_balance(coinData, wallet_address)).toString()
                    break;
                case CoinFamily.BTC:
                    console.log("bitcoin")
                    if (config.SERVER !== 'stage') {
                        balance = (await utxobtc.get_balance(wallet_address)).toString()
                    }
                    balance = "0"
                    break;
                case CoinFamily.MATIC:
                    console.log("MATIC >>> MATIC >>> MATIC")
                    balance = (await maticWeb3.get_balance(coinData, wallet_address)).toString()
                    break;
                case CoinFamily.TRX:
                    balance = (await trxWeb3.Fetch_Balance(wallet_address, coinData)).toString()
                    break;
            }
            return balance;
        } catch (err: any) {
            console.error("Error in get_wallet_balance.", err)
            // await commonHelper.save_error_logs("get_wallet_balance", err.message);
            return '0';
        }
    }
    public async get_new_token_balance(data: any) {
        try {
            let coin_family: number = data.coin_family;
            let tokenType: string = data.token_type;
            let token_address: string = data.token_address;
            let wallet_address: string = data.wallet_address;
            let tokenBalance: any;
            let userBalance: string = '';
            console.log("coin_family>>>>>>>>>>>>>>>", coin_family)

            switch (coin_family) {
                case config.STATIC_COIN_FAMILY.BNB:
                    tokenType = TokenType.BEP20;
                    tokenBalance = (await bscWeb3.get_bep20_token_balance(token_address, config.CONTRACT_ABI as AbiItem[], wallet_address)).toString();
                    userBalance = exponentialToDecimal(Number(tokenBalance))
                    break;
                case config.STATIC_COIN_FAMILY.ETH:
                    tokenType = TokenType.ERC20;
                    tokenBalance = (await ethWeb3.get_erc20_token_balance(token_address, config.CONTRACT_ABI as AbiItem[], wallet_address)).toString();
                    userBalance = exponentialToDecimal(Number(tokenBalance))
                    break;
                case config.STATIC_COIN_FAMILY.MATIC:
                    tokenType = TokenType.ERC20;
                    tokenBalance = (await maticWeb3.get_matic_erc20_token_balance(token_address, config.CONTRACT_ABI as AbiItem[], wallet_address)).toString()
                    userBalance = exponentialToDecimal(Number(tokenBalance))
                    break;
                case config.STATIC_COIN_FAMILY.TRX:
                    tokenType = TokenType.TRC20;
                    userBalance = (await trxWeb3.TRC20_Token_Balance(wallet_address, token_address)).toString()
                    break;
                default:
                    throw GlblMessages.INVALID_COIN_FAMILY
            }
            return { userBalance, tokenType };
        } catch (err: any) {
            console.error("Error in get_new_token_balance.", err)
            // await commonHelper.save_error_logs("get_new_token_balance", err.message);
            return '0';
        }
    }

    public async fetch_data(method: string, url: string, header: Object) {
        try {
            let config_data: any = {
                method: method,
                url: url,
                headers: header
            }
            let return_data: any;
            await axios(config_data)
                .then(function (response) {
                    return_data = response?.data;
                    return response?.data;
                })
                .catch(function (err: any) {
                    console.error('axios catch error', err.message);
                    return_data = null;
                    return null;
                });
            return return_data;
        } catch (err: any) {
            console.error('🔥 ~ ~ fetch_data error', err);
            return null;
        }
    }







}
export const block_global_helper = new block_chain_global_helper();
