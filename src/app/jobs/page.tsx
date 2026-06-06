"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { jobsApi } from "@/modules/jobs/api";
import type { Job, JobListResponse } from "@/modules/jobs/types";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";

// ─── Filter options ───────────────────────────────────────────────────────────
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const REMOTE_TYPES = ["Remote", "Hybrid", "On-site"];
const CATEGORIES = [
  { value: "", label: "All Jobs" },
  { value: "white_collar", label: "White Collar" },
  { value: "blue_collar", label: "Blue Collar" },
];

// ─── Logo colors ──────────────────────────────────────────────────────────────
const LOGO_COLORS = [
  "bg-[rgba(44,110,106,0.12)] text-[#1A4D4A]",
  "bg-[rgba(200,230,60,0.3)] text-[#8CAF00]",
  "bg-[rgba(232,128,58,0.15)] text-[#B85A1A]",
  "bg-[#EDE8DF] text-[#3D3830]",
  "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]",
  "bg-[rgba(236,72,153,0.1)] text-[#9D174D]",
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function JobsNavbar() {
  useAuthHydration();
  const { user } = useAuthStore();
  return (
    <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
      <Link href="/" className="flex items-center gap-2.5">
        <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
        <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">ChitranshTech</span>
      </Link>
      <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
        <li><Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink)] font-medium border-b-2 border-[var(--color-ink)] pb-0.5">Find Jobs</Link></li>
        <li><Link href="/resume/build" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Build ATS CV</Link></li>
        {user && user.role_id === 2 && (
          <li><Link href="/dashboard" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Post a Job</Link></li>
        )}
        <li><Link href="/feed" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Feed</Link></li>
        <li><Link href="/profile" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Profile</Link></li>
      </ul>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link href="/dashboard" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full hover:bg-[var(--color-ink2)] transition-all">
              Dashboard
            </Link>
            <button
              onClick={() => { useAuthStore.getState().logout(); window.location.href = "/"; }}
              className="text-[0.85rem] text-[var(--color-ink3)] px-3 py-1.5 rounded-[10px] hover:bg-[var(--color-cream2)] hover:text-[var(--color-ink)] transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full hover:bg-[var(--color-ink2)] transition-all">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, index }: { job: Job; index: number }) {
  const colorClass = LOGO_COLORS[index % LOGO_COLORS.length];
  const initial = (job.company_name || job.title)?.[0]?.toUpperCase() || "J";
  const location = job.location || "Remote";
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const min = job.salary_min ? `₹${Number(job.salary_min).toLocaleString()}` : "";
    const max = job.salary_max ? `₹${Number(job.salary_max).toLocaleString()}` : "";
    if (min && max) return `${min} – ${max}`;
    return min || max;
  };
  const salary = formatSalary();

  return (
    <Link href={`/jobs/${job.id}`} className="block bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-5 hover:border-[rgba(26,23,20,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] hover:-translate-y-[2px] transition-all">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center font-[var(--font-serif)] text-[1rem] font-semibold shrink-0 ${colorClass}`}>
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-[var(--font-serif)] text-[0.95rem] font-medium text-[var(--color-ink)] leading-tight truncate">
            {job.title}
          </h3>
          <p className="text-[0.75rem] text-[var(--color-ink3)] uppercase tracking-[0.03em] mt-0.5 truncate">
            {job.company_name || "Company"}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-[0.72rem] text-[var(--color-ink4)] mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-teal)]" />
        {location}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 text-[0.75rem] text-[var(--color-ink3)] mb-3">
        {job.experience_required && <span>{job.experience_required}</span>}
        {job.employment_type && <span>{job.employment_type}</span>}
        {salary && <span className="font-medium text-[var(--color-ink)]">{salary}</span>}
      </div>

      {/* Description snippet */}
      <p className="text-[0.78rem] text-[var(--color-ink3)] leading-[1.6] line-clamp-2 mb-3">
        {job.description}
      </p>

      {/* Tags */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s.id} className="text-[0.68rem] px-2 py-0.5 border border-[rgba(26,23,20,0.08)] rounded-[5px] text-[var(--color-ink3)] bg-[var(--color-cream)]">
              {s.skill_name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgba(26,23,20,0.06)]">
        <span className="text-[0.72rem] text-[var(--color-ink4)]">{timeLabel}</span>
        <div className="flex items-center gap-2">
          {job.remote_type && (
            <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-[rgba(44,110,106,0.08)] text-[var(--color-teal)]">
              {job.remote_type}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Sidebar Filters ──────────────────────────────────────────────────────────
function Sidebar({
  filters,
  setFilters,
  onApply,
  onReset,
}: {
  filters: any;
  setFilters: (f: any) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-5 sticky top-[76px]">
        {/* Category */}
        <div className="mb-6">
          <h4 className="text-[0.8rem] font-medium text-[var(--color-ink)] mb-3 flex items-center justify-between">
            Job Category
            <span className="text-[var(--color-ink4)] text-[0.7rem]">▲</span>
          </h4>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.value}
                  onChange={() => setFilters({ ...filters, category: cat.value })}
                  className="w-4 h-4 accent-[var(--color-teal)]"
                />
                <span className="text-[0.8rem] text-[var(--color-ink2)] group-hover:text-[var(--color-ink)]">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment type */}
        <div className="mb-6">
          <h4 className="text-[0.8rem] font-medium text-[var(--color-ink)] mb-3 flex items-center justify-between">
            Type of Employment
            <span className="text-[var(--color-ink4)] text-[0.7rem]">▲</span>
          </h4>
          <div className="space-y-2">
            {EMPLOYMENT_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.employment_type === type}
                  onChange={() => setFilters({ ...filters, employment_type: filters.employment_type === type ? "" : type })}
                  className="w-4 h-4 rounded accent-[var(--color-teal)]"
                />
                <span className="text-[0.8rem] text-[var(--color-ink2)] group-hover:text-[var(--color-ink)]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Remote type */}
        <div className="mb-6">
          <h4 className="text-[0.8rem] font-medium text-[var(--color-ink)] mb-3 flex items-center justify-between">
            Work Mode
            <span className="text-[var(--color-ink4)] text-[0.7rem]">▲</span>
          </h4>
          <div className="space-y-2">
            {REMOTE_TYPES.map((type) => (
              <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.remote_type === type}
                  onChange={() => setFilters({ ...filters, remote_type: filters.remote_type === type ? "" : type })}
                  className="w-4 h-4 rounded accent-[var(--color-teal)]"
                />
                <span className="text-[0.8rem] text-[var(--color-ink2)] group-hover:text-[var(--color-ink)]">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <h4 className="text-[0.8rem] font-medium text-[var(--color-ink)] mb-3">Location</h4>
          <input
            type="text"
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            placeholder="e.g. Bangalore, Delhi"
            className="w-full px-3 py-2 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[8px] text-[0.8rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-ink2)] transition-colors"
          >
            Apply
          </button>
          <button
            onClick={onReset}
            className="flex-1 py-2.5 bg-transparent text-[var(--color-ink3)] border border-[rgba(26,23,20,0.1)] rounded-full text-[0.8rem] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Jobs Page ───────────────────────────────────────────────────────────
export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center"><p className="text-[var(--color-ink3)]">Loading...</p></div>}>
      <JobsPageContent />
    </Suspense>
  );
}

function JobsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const [filters, setFilters] = useState({
    category: "",
    employment_type: "",
    remote_type: "",
    location: "",
  });

  const fetchJobs = useCallback(async (p = 1, search = searchQuery) => {
    setIsLoading(true);
    try {
      const params: any = { page: p, page_size: 12 };
      if (search) params.search = search;
      if (filters.category) params.category = filters.category;
      if (filters.employment_type) params.employment_type = filters.employment_type;
      if (filters.remote_type) params.remote_type = filters.remote_type;
      if (filters.location) params.location = filters.location;

      const res: JobListResponse = await jobsApi.listJobs(params);
      setJobs(res.items);
      setTotal(res.total);
      setPage(p);
    } catch {
      setJobs([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, searchQuery]);

  useEffect(() => {
    fetchJobs(1, initialSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    fetchJobs(1, searchQuery);
  };

  const handleApplyFilters = () => {
    fetchJobs(1);
  };

  const handleResetFilters = () => {
    setFilters({ category: "", employment_type: "", remote_type: "", location: "" });
    setSearchQuery("");
    setTimeout(() => fetchJobs(1, ""), 0);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <JobsNavbar />

      {/* Search bar */}
      <div className="border-b border-[rgba(26,23,20,0.06)] bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white border border-[rgba(26,23,20,0.1)] rounded-full px-5 py-2.5 focus-within:border-[var(--color-teal)] focus-within:shadow-[0_2px_12px_rgba(44,110,106,0.1)] transition-all">
              <span className="text-[var(--color-ink4)]">⌕</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Job title, skill, or company..."
                className="flex-1 bg-transparent border-none outline-none text-[0.88rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)]"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-7 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium hover:bg-[var(--color-ink2)] transition-all shrink-0"
            >
              Start Searching
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[var(--font-serif)] text-[1.4rem] font-medium text-[var(--color-ink)]">
            <span className="text-[var(--color-ink2)]">{total.toLocaleString()}</span> Jobs Found
          </h1>
          <span className="text-[0.8rem] text-[var(--color-ink4)]">Sort by: Newest Post</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <Sidebar
            filters={filters}
            setFilters={setFilters}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Job grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-5 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-[8px] bg-[var(--color-cream2)]" />
                      <div className="flex-1">
                        <div className="h-4 w-32 bg-[var(--color-cream2)] rounded mb-1" />
                        <div className="h-3 w-20 bg-[var(--color-cream2)] rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-24 bg-[var(--color-cream2)] rounded mb-3" />
                    <div className="h-3 w-full bg-[var(--color-cream2)] rounded mb-2" />
                    <div className="h-3 w-3/4 bg-[var(--color-cream2)] rounded mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 w-12 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded" />
                      <div className="h-5 w-14 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job, i) => (
                    <JobCard key={job.id} job={job} index={i} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => fetchJobs(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 text-[0.8rem] border border-[rgba(26,23,20,0.1)] rounded-full hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchJobs(pageNum)}
                          className={`w-9 h-9 rounded-full text-[0.8rem] font-medium transition-all ${
                            page === pageNum
                              ? "bg-[var(--color-ink)] text-[var(--color-cream)]"
                              : "hover:bg-white text-[var(--color-ink3)]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchJobs(page + 1)}
                      disabled={page >= totalPages}
                      className="px-4 py-2 text-[0.8rem] border border-[rgba(26,23,20,0.1)] rounded-full hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-[1.5rem] mb-2">🔍</p>
                <h3 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)] mb-2">No jobs found</h3>
                <p className="text-[0.85rem] text-[var(--color-ink3)]">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
