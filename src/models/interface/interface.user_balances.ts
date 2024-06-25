export interface UserBalanceInterface {
  id: number;
  user_id: number;
  secondary_market_proposal_id: number;
  proposal_id: number;
  coin_id:number;
  is_primary:number;
  total_available_balance:number;
  available_balance:number;
  on_sell_balance:number;
  invested_balance:number;
  received_balance:number;
  sent_balance:number;
  created_at: string;
  updated_at: string;
}
