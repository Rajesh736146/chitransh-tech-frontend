"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/api";
import { useAuthStore } from "@/modules/auth/store";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("All fields are required"); return; }
    setLoading(true);
    setError("");
    try {
      const { access_token } = await authApi.login({ email, password });
      localStorage.setItem("access_token", access_token);
      const user = await authApi.me();
      setAuth(user, access_token);
      toast.success(`Welcome back, ${user.full_name}!`);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.detail || "Login failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
        <div className="w-full max-w-[360px]">
          {/* Logo */}
          <Link href="/dashboard" className="inline-block mb-8">
            <Image src="/logo.png" alt="Chitransh Tech" width={120} height={40} className="h-10 w-auto" />
          </Link>

          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-muted)] mb-6">Sign in to access your professional network</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--color-primary)] font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[var(--color-border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-primary)] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">
              New to Chitransh Tech?{" "}
              <Link href="/signup" className="text-[var(--color-primary)] font-semibold hover:underline">
                Join now
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Your career starts here</h2>
          <p className="text-blue-100 text-lg leading-relaxed">
            Connect with 85,000+ professionals, discover opportunities at top companies, and grow your career with Chitransh Tech.
          </p>
          <div className="flex justify-center gap-8 mt-8">
            <div>
              <p className="text-2xl font-bold">12K+</p>
              <p className="text-xs text-blue-200">Active Jobs</p>
            </div>
            <div>
              <p className="text-2xl font-bold">3.2K+</p>
              <p className="text-xs text-blue-200">Companies</p>
            </div>
            <div>
              <p className="text-2xl font-bold">85K+</p>
              <p className="text-xs text-blue-200">Professionals</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
