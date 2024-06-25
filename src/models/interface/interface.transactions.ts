
export interface TransactionsInterface {
  id: number;
  sequence_id : string | null;
  liminal_refund_status: string | null;
  liminal_tx_hash : string | null;
  seller_id:number,
  req_type: string;
  unique_id: string;
  mint_tx_hash: string;
  token_value: number;
  coin_family:number;
  is_primary:number;
  secondary_market_proposal_id:number;
  user_id: number;
  proposal_id: number;
  wallet_id: number
  is_order: number;
  qa_status: number | null;
  order_id: number;
  coin_id: number;
  tx_id: string;
  tx_raw: string;
  from_adrs: string;
  to_adrs:string;
  user_adrs: string;
  webhook_amount: string;
  to_liminal_adrs: string;
  coin: string;
  amount: number;
  user_token_quantity: number;
  status: string;
  approval_status: string
  token_mint_status: string;
  blockchain_status: string;
  refund_status: string | null;
  tx_type: string,
  created_at: string;
  updated_at: string
}
