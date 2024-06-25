export interface WalletInterface {
  wallet_id: number;
  user_id: number;
  is_sto_wallet: number;
  proposal_id: number;
  email?: string | null,
  wallet_name: string;
  username: string;
  wallet_address: string;
  approval_status: string
  liminal_address: string | null;
  coin_id: number;
  coin_family?: number;
  balance: number | string;
  is_verified?: number | 1;
  status?: string;
  // approval_status?: number | 0;
  is_deleted?: number | 0;
  sort_order?: number | null;
  created_at: string;
  updated_at: string;
}
