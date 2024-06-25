export interface CoinPriceFiatInterface {
    id: number,
    coin_id: number,
    cmc_id: number,
    coin_symbol: string,
    fiat_type: string,
    value: number | 0,
    price_change_24h: number | 0,
    price_change_percentage_24h: number | 0,
    token_address: string,
    created_at: Date,
    updated_at: Date
}