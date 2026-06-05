"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "@/modules/auth/store";
import { useEffect, useState, useCallback } from "react";
import { jobsApi } from "@/modules/jobs/api";
import type { Job, JobApplication } from "@/modules/jobs/types";
import {
  CheckCircle2, Eye, Phone, TrendingUp, ArrowRight, Clock, ExternalLink,
  Briefcase, FileText, Users, Search,
} from "lucide-react";

// ─── Stats Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, value, label, color }: {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-4 flex items-center gap-3 card-hover">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xl font-bold text-[var(--color-text)]">{value}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
    </div>
  );
}

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ user }: { user: { full_name: string; email: string } | null }) {
  const skills = ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS", "Git"];

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 sticky top-[68px]">
      {/* Avatar */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-2xl font-bold mx-auto mb-3">
          {user?.full_name?.[0]?.toUpperCase() ?? "U"}
        </div>
        <h3 className="font-bold text-[var(--color-text)]">{user?.full_name ?? "User"}</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Software Developer</p>
        <p className="text-xs text-[var(--color-text-muted)]">India</p>
      </div>

      {/* Social links */}
      <div className="flex items-center justify-center gap-3 mb-5">
        {["f", "in", "g", "tw"].map((s) => (
          <div key={s} className="w-7 h-7 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            {s}
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">My Skills</h4>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span key={skill} className="text-xs bg-[var(--color-surface)] text-[var(--color-text-secondary)] px-2.5 py-1 rounded-full border border-[var(--color-border)]">
              {skill}
            </span>
          ))}
        </div>
        <button className="text-xs text-[var(--color-primary)] mt-3 font-medium">+ More Skills</button>
      </div>

      {/* View Profile */}
      <Link
        href="/profile"
        className="block mt-5 text-center text-sm font-medium text-[var(--color-primary)] hover:underline transition-colors"
      >
        View Public Profile →
      </Link>
    </div>
  );
}

// ─── Recently Viewed Job Row ──────────────────────────────────────────────────
function RecentJobRow({ job }: { job: Job }) {
  const salary = (() => {
    const min = job.salary_min;
    const max = job.salary_max;
    if (min && max) return `₹${(min / 100000).toFixed(0)}L – ₹${(max / 100000).toFixed(0)}L`;
    if (min) return `₹${(min / 100000).toFixed(0)}L+`;
    return "Not disclosed";
  })();

  return (
    <Link href={`/jobs/${job.id}`} className="flex items-center gap-4 py-4 border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)] px-3 -mx-3 rounded-lg transition-colors">
      {/* Company icon */}
      <div className="w-10 h-10 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-sm font-bold text-[var(--color-text-secondary)] shrink-0">
        {(job.company_name ?? "?")[0].toUpperCase()}
      </div>

      {/* Title & company */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-text)] truncate">{job.title}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{job.company_name ?? "—"}</p>
      </div>

      {/* Tags */}
      <div className="hidden sm:flex items-center gap-2">
        {job.employment_type && (
          <span className="text-[10px] bg-[var(--color-accent-light)] text-[var(--color-accent)] px-2 py-0.5 rounded-full font-medium">
            {job.employment_type}
          </span>
        )}
        {job.remote_type && (
          <span className="text-[10px] bg-[var(--color-primary-light)] text-[var(--color-primary)] px-2 py-0.5 rounded-full font-medium">
            {job.remote_type}
          </span>
        )}
      </div>

      {/* Salary */}
      <div className="text-right hidden md:block">
        <p className="text-sm font-semibold text-[var(--color-text)]">{salary}</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">per annum</p>
      </div>

      {/* Date */}
      <div className="text-right shrink-0">
        <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
          <Clock size={10} />
          {new Date(job.created_at).toLocaleDateString()}
        </p>
        <span className="text-[10px] text-[var(--color-primary)] font-medium flex items-center gap-0.5 mt-1">
          View Job <ExternalLink size={9} />
        </span>
      </div>
    </Link>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.allSettled([
        jobsApi.listJobs({ page: 1, page_size: 5 }),
        jobsApi.getMyApplications(1, 5),
      ]);
      if (jobsRes.status === "fulfilled") setRecentJobs(jobsRes.value.items);
      if (appsRes.status === "fulfilled") setApplications(appsRes.value.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (token) fetchData(); }, [fetchData, token]);

  if (!token) return null;

  const appliedCount = applications.length;
  const profileCompletion = 60;

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Welcome Banner */}
            <div className="gradient-hero rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-blue-200 text-sm mb-1">Welcome Back</p>
                <h1 className="text-2xl font-bold mb-3">
                  {user?.full_name ?? "User"} 👋
                </h1>
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-2 bg-white text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition-colors"
                >
                  Start Finding a Job <ArrowRight size={14} />
                </Link>
              </div>
              <div className="absolute right-6 top-4 opacity-10 hidden md:block">
                <div className="w-32 h-32 rounded-full bg-white" />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={CheckCircle2} value={appliedCount} label="Jobs Applied" color="bg-blue-50 text-[var(--color-primary)]" />
              <StatCard icon={Eye} value="1,200" label="Profile Views" color="bg-purple-50 text-purple-600" />
              <StatCard icon={Phone} value="48" label="Job Invitations" color="bg-green-50 text-[var(--color-accent)]" />
              <StatCard icon={TrendingUp} value="93%" label="Popularity" color="bg-orange-50 text-orange-600" />
            </div>

            {/* Application Stats + Profile Completion */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Chart */}
              <div className="md:col-span-2 bg-white rounded-xl border border-[var(--color-border)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-[var(--color-text)]">Job Application Statistics</h3>
                  <span className="text-xs text-[var(--color-text-muted)]">Last 30 days</span>
                </div>
                <div className="h-[160px] flex items-end gap-1.5">
                  {[40, 25, 60, 35, 80, 55, 70, 45, 90, 65, 50, 75].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-[var(--color-primary)] to-[var(--color-primary-light)] rounded-t-sm transition-all hover:opacity-80"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-[9px] text-[var(--color-text-muted)]">{10 + i}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Circular Progress */}
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5 flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-3">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#057642"
                      strokeWidth="3"
                      strokeDasharray={`${profileCompletion}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-[var(--color-accent)]">
                    {profileCompletion}%
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--color-text)]">Profile Complete</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Complete your profile</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Link href="/jobs" className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center card-hover group">
                <Search size={20} className="mx-auto mb-2 text-[var(--color-primary)]" />
                <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">Search Jobs</p>
              </Link>
              <Link href="/resume/build" className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center card-hover group">
                <FileText size={20} className="mx-auto mb-2 text-[var(--color-accent)]" />
                <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">Build Resume</p>
              </Link>
              <Link href="/network" className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center card-hover group">
                <Users size={20} className="mx-auto mb-2 text-purple-600" />
                <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-purple-600 transition-colors">Network</p>
              </Link>
              <Link href="/feed" className="bg-white rounded-xl border border-[var(--color-border)] p-4 text-center card-hover group">
                <Briefcase size={20} className="mx-auto mb-2 text-orange-600" />
                <p className="text-xs font-medium text-[var(--color-text)] group-hover:text-orange-600 transition-colors">Feed</p>
              </Link>
            </div>

            {/* Recently Viewed */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-[var(--color-text)]">Recently Viewed</h3>
                <Link href="/jobs" className="text-xs text-[var(--color-primary)] font-medium hover:underline">
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentJobs.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No jobs found. Start browsing!</p>
              ) : (
                <div>
                  {recentJobs.map((job) => (
                    <RecentJobRow key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Profile Sidebar */}
          <aside className="w-[280px] hidden xl:block">
            <ProfileCard user={user} />
          </aside>
        </div>
      </div>
    </div>
  );
}
