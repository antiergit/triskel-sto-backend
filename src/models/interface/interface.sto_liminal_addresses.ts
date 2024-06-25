export interface StoLiminalAddressInterface {
  id: number,
  user_id: number,
  proposal_id: number | null,
  coin_family: number | null,
  sto_coin_id: number | null,
  liminal_path: number,
  liminal_address: string | null,
  card_type: string
}
