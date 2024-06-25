export interface ProposalBlockedTokensLogsInterface {
    id?: bigint;
    proposal_id: number;
    order_id: number;
    issued_token: number;
    old_token_to_sold: number;
    new_token_to_sold: number;
    diff_token_to_sold: number;
    old_blocked_tokens: number;
    new_blocked_tokens: number;
    diff_blocked_tokens: number;
    old_collected_fund: string;
    new_collected_fund: string;
    diff_collected_fund: string;
    action: string;
    created_at?: Date;
    updated_at?: Date;
  }
  