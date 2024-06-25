export interface OrderLogsInterface{
  id?: string;
  order_id?: number;
  old_status: string;
  new_status: string;
  old_is_tokens_blocked: number;
  new_is_tokens_blocked: number;
  action: string;
  created_at?: string;
  updated_at?: string;
}
