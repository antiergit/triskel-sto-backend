export interface CoinInterface {
  coin_id: number,
  coin_name: string,
  coin_symbol: string,
  coin_image?: string | null,
  coin_family: number,
  proposal_id:number
  decimals: number | 0,
  is_tradable: number | 0,
  cmc_id?: number,
  is_token: number | 0,
  is_sto: number | 0,
  lmnl_adrs: number,
  token_type: string | null,
  min: number | null,
  max: number | null,
  token_address?: string | null,
  created_at?: string,
  updated_at?: string,
}
