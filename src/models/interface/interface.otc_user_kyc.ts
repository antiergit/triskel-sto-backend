export interface UserKycInterface {
    id: number,
    user_id: number,
    kyc_address: string,
    kyc_status?: string,
    email: string,
    first_name: string,
    last_name: string,
    created_at?: string,
    updated_at?: string,
}