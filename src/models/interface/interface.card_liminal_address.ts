export interface CardLiminalAddressInterface {
  id: number;
  user_id: number,
  proposal_id: number | null,
  card_user_id: number | null;
  card_id: number | null;
  coin_id: number;
  sto_coin_id: number | null;
  coin_family: number;
  otc_coin_id: number | null,
  liminal_path: number;
  liminal_address: string | null;
  card_type: string;
}
