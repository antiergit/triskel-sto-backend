export interface QuestionnariesInterface {
    id: number,
    user_id: number,
    question?: string,
    answer_json?: string,
    status?: number | 0,
    created_at?: string,
    updated_at?: string,

}