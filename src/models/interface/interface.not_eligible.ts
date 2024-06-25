export interface NotEligibleInterface {
  id?: number;
  user_id: number;
  question_id: number;
  proposal_id:number;
  category?: string;
  answer?:string;
  created_at:string;
  updated_at:string;
}
