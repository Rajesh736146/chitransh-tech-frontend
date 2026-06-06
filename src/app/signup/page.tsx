"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/modules/auth/api";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role_id: 1, // 1 = jobseeker, 2 = employer
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.signUp({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
        role_id: form.role_id,
      });
      toast.success("Account created! Please check your email to verify.");
      router.push("/login");
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Sign up failed. Please try again.";
      toast.error(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-cream)] flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
            <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em]">ChitranshTech</span>
          </Link>

          <h1 className="font-[var(--font-serif)] text-[1.6rem] sm:text-[2rem] font-medium tracking-[-0.02em] text-[var(--color-ink)] mb-2">
            Create your account
          </h1>
          <p className="text-[0.9rem] text-[var(--color-ink3)] mb-8">
            Join millions of professionals finding their dream job.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role_id: 1 })}
                className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-medium border transition-all ${
                  form.role_id === 1
                    ? "bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]"
                    : "bg-transparent text-[var(--color-ink2)] border-[rgba(26,23,20,0.1)] hover:border-[var(--color-ink3)]"
                }`}
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role_id: 2 })}
                className={`flex-1 py-2.5 rounded-full text-[0.85rem] font-medium border transition-all ${
                  form.role_id === 2
                    ? "bg-[var(--color-ink)] text-[var(--color-cream)] border-[var(--color-ink)]"
                    : "bg-transparent text-[var(--color-ink2)] border-[rgba(26,23,20,0.1)] hover:border-[var(--color-ink3)]"
                }`}
              >
                Employer
              </button>
            </div>

            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

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
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 9876543210"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.8rem] text-[var(--color-ink3)] mb-1.5">Confirm Password</label>
              <input
                type="password"
                required
                value={form.confirm_password}
                onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-white border border-[rgba(26,23,20,0.1)] rounded-[12px] text-[0.9rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[0.85rem] text-[var(--color-ink3)] mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-teal)] font-medium hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right — Decorative */}
      <div className="hidden lg:flex flex-1 bg-[var(--color-ink)] items-center justify-center relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[rgba(200,230,60,0.08)] rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-[rgba(44,110,106,0.1)] rounded-full blur-[80px]" />
        <div className="relative text-center px-12">
          <h2 className="font-[var(--font-serif)] text-[2.5rem] font-medium text-[var(--color-cream)] leading-[1.15] tracking-[-0.03em] mb-4">
            Your career<br />starts <em className="italic font-light text-[var(--color-lime)]">here.</em>
          </h2>
          <p className="text-[rgba(245,242,236,0.5)] text-[0.95rem] max-w-[320px] mx-auto leading-[1.7]">
            Join 3 million professionals building their careers on ChitranshTech.
          </p>
        </div>
      </div>
    </div>
  );
}
