"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, KeyRound, Lock } from "lucide-react";
import { authApi } from "@/modules/auth/api";
import { toast } from "sonner";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword({ email });
      setStep("otp");
      toast.success("OTP sent to your email!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to send OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) { setError("Please enter the OTP"); return; }
    if (otp.length < 4) { setError("Invalid OTP"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.verifyOtp({ email, otp });
      setResetToken(res.reset_token);
      setStep("password");
      toast.success("OTP verified!");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Invalid OTP";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Please enter a new password"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword({ reset_token: resetToken, password });
      toast.success("Password reset successfully! Please sign in.");
      router.push("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Failed to reset password";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (s: Step, label: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
          step === s
            ? "bg-black text-white"
            : ["otp", "password"].includes(s) && step !== "email" && !(s === "password" && step === "otp")
              ? "bg-gray-900 text-white"
              : step === "password" && s === "otp"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-400"
        }`}
      >
        {icon}
      </div>
      <span
        className={`text-sm transition-colors ${
          step === s ? "text-black font-medium" : "text-gray-400"
        }`}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {stepIndicator("email", "Email", <Mail className="w-4 h-4" />)}
          <div className="flex-1 h-px bg-gray-200 mx-2" />
          {stepIndicator("otp", "OTP", <KeyRound className="w-4 h-4" />)}
          <div className="flex-1 h-px bg-gray-200 mx-2" />
          {stepIndicator("password", "Password", <Lock className="w-4 h-4" />)}
        </div>

        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold mb-1">Forgot password?</h1>
            <p className="text-sm text-gray-500 mb-6">
              Enter your email and we'll send you an OTP.
            </p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold mb-1">Check your email</h1>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit OTP to <strong>{email}</strong>. Enter it below.
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-black"
                  maxLength={6}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setError("")}
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-black transition-colors"
                >
                  Didn't receive it?{" "}
                  <span
                    className="font-medium underline"
                    onClick={async () => {
                      try {
                        await authApi.forgotPassword({ email });
                        toast.success("OTP resent!");
                      } catch {
                        toast.error("Failed to resend OTP");
                      }
                    }}
                  >
                    Resend
                  </span>
                </button>
              </div>
            </form>
          </>
        )}

        {step === "password" && (
          <>
            <h1 className="text-2xl font-bold mb-1">Reset password</h1>
            <p className="text-sm text-gray-500 mb-6">
              Choose a new password for your account.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Resetting…" : "Reset password"}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-center text-gray-500 mt-6">
          Remember your password?{" "}
          <Link href="/login" className="text-black font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
