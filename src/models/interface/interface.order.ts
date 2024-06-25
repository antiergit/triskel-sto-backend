export interface OrderInterface {
    id?: string;
    proposal_id:string;
    secondary_market_proposal_id:Number;
    buyer_id: number;
    seller_id:number;
    token_address: string;
    user_adrs:string;
    token_value: number;
    wallet_id:number
    token_qty: number;
    amount: number;
    status: string;
    liminal_address:string;
    is_tokens_blocked: number;
    buying_type: string;
    created_at?: string;
    updated_at?: string;
  }
