"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.role_id === 4) { router.push("/admin"); return; }
      }
      router.push("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Invalid email or password.";
      toast.error(detail);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex">
      {/* Left — Decorative */}
      <div className="hidden lg:flex flex-1 bg-[var(--color-ink)] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[rgba(200,230,60,0.08)] rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-[400px] h-[400px] bg-[rgba(44,110,106,0.1)] rounded-full blur-[80px]" />
        <div className="relative text-center px-12">
          <h2 className="font-[var(--font-serif)] text-[2.5rem] font-medium text-[var(--color-cream)] leading-[1.15] tracking-[-0.03em] mb-4">
            Welcome<br /><em className="italic font-light text-[var(--color-lime)]">back.</em>
          </h2>
          <p className="text-[rgba(245,242,236,0.5)] text-[0.95rem] max-w-[320px] mx-auto leading-[1.7]">
            Sign in to access your personalized job feed, applications, and professional network.
          </p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
            <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em]">ChitranshTech</span>
          </Link>

          <h1 className="font-[var(--font-serif)] text-[2rem] font-medium tracking-[-0.02em] text-[var(--color-ink)] mb-2">
            Sign in to your account
          </h1>
          <p className="text-[0.9rem] text-[var(--color-ink3)] mb-8">
            Enter your credentials to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[0.8rem] text-[var(--color-ink3)]">Password</label>
                <Link href="/forgot-password" className="text-[0.78rem] text-[var(--color-teal)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[0.85rem] text-[var(--color-ink3)] mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--color-teal)] font-medium hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
