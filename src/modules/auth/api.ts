import { api } from "@/lib/api";

export interface SignUpData {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role_id: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: number;
  status: string;
  email_verified: boolean;
  created_at: string;
}

export const authApi = {
  signUp: async (data: SignUpData): Promise<UserResponse> => {
    const res = await api.post("/auth/sign-up", data);
    return res.data;
  },

  login: async (data: LoginData): Promise<TokenResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  getMe: async (): Promise<UserResponse> => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  askResetOtp: async (email: string): Promise<{ message: string }> => {
    const res = await api.post("/auth/ask-reset-otp", { email });
    return res.data;
  },

  verifyResetOtp: async (email: string, otp: string): Promise<{ message: string }> => {
    const res = await api.post("/auth/verify-reset-otp", { email, otp });
    return res.data;
  },

  verifyOtp: async (email: string, otp: string): Promise<{ reset_token: string }> => {
    const res = await api.post("/auth/verify-otp", { email, otp });
    return res.data;
  },

  resetPassword: async (data: { email: string; otp: string; reset_token: string; password: string }): Promise<{ message: string }> => {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  },
};
