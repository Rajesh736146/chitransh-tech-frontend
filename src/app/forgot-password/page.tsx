"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/api";
import { toast } from "sonner";

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.askResetOtp(email);
      toast.success("OTP sent to your email!");
      setStep("otp");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to send OTP. Check your email.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      setResetToken(res.reset_token);
      toast.success("OTP verified! Set your new password.");
      setStep("reset");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.resetPassword({ email, otp, reset_token: resetToken, password });
      toast.success("Password reset successfully! Please login.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em]">ChitranshTech</span>
        </Link>

        <h1 className="font-[var(--font-serif)] text-[1.6rem] sm:text-[2rem] font-medium tracking-[-0.02em] text-[var(--color-ink)] mb-2">
          {step === "email" && "Reset your password"}
          {step === "otp" && "Enter OTP"}
          {step === "reset" && "Set new password"}
        </h1>
        <p className="text-[0.9rem] text-[var(--color-ink3)] mb-8">
          {step === "email" && "We'll send a one-time code to your registered email."}
          {step === "otp" && `Enter the 6-digit code sent to ${email}`}
          {step === "reset" && "Choose a strong password for your account."}
        </p>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["email", "otp", "reset"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.75rem] font-medium transition-all ${
                step === s
                  ? "bg-[var(--color-ink)] text-[var(--color-cream)]"
                  : i < ["email", "otp", "reset"].indexOf(step)
                  ? "bg-[var(--color-teal)] text-white"
                  : "bg-[var(--color-cream2)] text-[var(--color-ink4)]"
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-[2px] ${i < ["email", "otp", "reset"].indexOf(step) ? "bg-[var(--color-teal)]" : "bg-[var(--color-cream3)]"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Email */}
        {step === "email" && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: OTP */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">One-Time Password</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors tracking-[0.2em] text-center text-lg font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => { setStep("email"); setOtp(""); }}
              className="w-full py-2 text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors"
            >
              ← Change email
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center text-[0.85rem] text-[var(--color-ink3)] mt-8">
          Remember your password?{" "}
          <Link href="/login" className="text-[var(--color-teal)] font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
