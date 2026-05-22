import api from "@/lib/axios";
import type { SignUpPayload, LoginPayload, TokenResponse, User, ForgotPasswordPayload, VerifyOtpPayload, VerifyOtpResponse, ResetPasswordPayload, MessageResponse } from "./types";

export const authApi = {
  signUp: (payload: SignUpPayload) =>
    api.post<User>("/auth/sign-up", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<MessageResponse>("/auth/forgot-password", payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<VerifyOtpResponse>("/auth/verify-otp", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<MessageResponse>("/auth/reset-password", payload).then((r) => r.data),
};
