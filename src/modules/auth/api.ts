import api from "@/lib/axios";
import type {
  SignUpPayload,
  LoginPayload,
  TokenResponse,
  User,
  ForgotPasswordPayload,
  VerifyEmailPayload,
  AskResetOtpPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
  VerifyResetOtpPayload,
  ResetPasswordPayload,
  MessageResponse,
} from "./types";

export const authApi = {
  signUp: (payload: SignUpPayload) =>
    api.post<User>("/auth/sign-up", payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    api.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  me: () => api.get<User>("/auth/me").then((r) => r.data),

  verifyEmail: (payload: VerifyEmailPayload) =>
    api.post<MessageResponse>("/auth/verify-email", payload).then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    api.post<MessageResponse>("/auth/forgot-password", payload).then((r) => r.data),

  askResetOtp: (payload: AskResetOtpPayload) =>
    api.post<MessageResponse>("/auth/ask-reset-otp", payload).then((r) => r.data),

  verifyOtp: (payload: VerifyOtpPayload) =>
    api.post<VerifyOtpResponse>("/auth/verify-otp", payload).then((r) => r.data),

  verifyResetOtp: (payload: VerifyResetOtpPayload) =>
    api.post<MessageResponse>("/auth/verify-reset-otp", payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    api.post<MessageResponse>("/auth/reset-password", payload).then((r) => r.data),
};
