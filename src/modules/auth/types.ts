export interface SignUpPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  reset_token: string;
}

export interface ResetPasswordPayload {
  reset_token: string;
  password: string;
}

export interface MessageResponse {
  message: string;
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: number;
  status: string;
  email_verified: boolean;
  created_at: string;
}
