export interface AdminInterface {
  id: number;
  username: string;
  jwt_token: string;
  email: string;
  password: string;
  mobile_no: string | null;
  role: string;
  google2fa_secret: string | null;
  google2fa_status: number | null;
  login_status: number;
  active: number | 1;
  created_at?: Date;
  updated_at?: Date;
}
