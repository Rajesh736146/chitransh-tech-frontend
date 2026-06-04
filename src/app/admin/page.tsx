"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { adminApi } from "@/modules/admin/api";
import { useAuthStore } from "@/modules/auth/store";
import type { DashboardStats } from "@/modules/admin/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users, Briefcase, Building2, MessageSquare,
  TrendingUp, FileText, Shield, ArrowUpRight,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch {
      toast.error("Access denied or failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role_id !== 3) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Navbar />
        <div className="max-w-[600px] mx-auto px-4 py-20 text-center">
          <Shield size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-[var(--color-text-muted)]">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Total Users", value: stats.total_users, sub: `+${stats.new_users_last_7_days} this week`, icon: Users, color: "bg-blue-50 text-blue-600", href: "/admin/users" },
    { label: "Total Jobs", value: stats.total_jobs, sub: `${stats.open_jobs} open · +${stats.new_jobs_last_7_days} this week`, icon: Briefcase, color: "bg-green-50 text-green-600", href: "/admin/jobs" },
    { label: "Applications", value: stats.total_applications, sub: `+${stats.new_applications_last_7_days} this week`, icon: FileText, color: "bg-purple-50 text-purple-600", href: "/admin/jobs" },
    { label: "Companies", value: stats.total_companies, sub: "Registered companies", icon: Building2, color: "bg-orange-50 text-orange-600", href: "/admin/companies" },
    { label: "Feed Posts", value: stats.total_feed_posts, sub: "Total posts", icon: MessageSquare, color: "bg-pink-50 text-pink-600", href: "/admin/feed" },
    { label: "Job Seekers", value: stats.total_job_seekers, sub: `${stats.total_employers} employers · ${stats.total_admins} admins`, icon: TrendingUp, color: "bg-indigo-50 text-indigo-600", href: "/admin/users" },
  ] : [];

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Navbar />
      <div className="max-w-[1128px] mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield size={24} className="text-[var(--color-primary)]" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">Platform overview and management tools</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-[var(--color-border)] p-5 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
                <div className="h-6 bg-gray-200 rounded w-20 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="bg-white rounded-xl border border-[var(--color-border)] p-5 card-hover group"
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                        <Icon size={20} />
                      </div>
                      <ArrowUpRight size={16} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-2xl font-bold mt-3">{card.value.toLocaleString()}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{card.label}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{card.sub}</p>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Manage Users", href: "/admin/users", icon: Users },
                  { label: "Manage Jobs", href: "/admin/jobs", icon: Briefcase },
                  { label: "Moderate Feed", href: "/admin/feed", icon: MessageSquare },
                  { label: "Companies", href: "/admin/companies", icon: Building2 },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)] transition-colors text-center"
                    >
                      <Icon size={24} className="text-[var(--color-primary)]" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
