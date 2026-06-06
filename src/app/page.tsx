"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { jobsApi } from "@/modules/jobs/api";
import type { FeaturedJob } from "@/modules/jobs/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPANIES = ["Cloud", "Proline", "Leafe", "Penta", "Recharge", "Snowflake", "Hues", "Cactus", "Vision", "Greenish"];
const CATEGORIES = ["Frontend", "Backend", "Full Stack", "DevOps", "Data Science", "Design", "Marketing", "Sales"];
const STATS = [
  { value: "12K", sup: "+", label: "Jobs Posted" },
  { value: "8K", sup: "+", label: "Companies" },
  { value: "5M", sup: "+", label: "Matches Made" },
  { value: "3M", sup: "+", label: "Startup-ready Candidates" },
];

// ─── Logo colors for company initials ─────────────────────────────────────────
const LOGO_COLORS = [
  "bg-[rgba(44,110,106,0.12)] text-[#1A4D4A]",
  "bg-[rgba(200,230,60,0.3)] text-[#8CAF00]",
  "bg-[rgba(232,128,58,0.15)] text-[#B85A1A]",
  "bg-[#EDE8DF] text-[#3D3830]",
  "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]",
  "bg-[rgba(236,72,153,0.1)] text-[#9D174D]",
];

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  useAuthHydration();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-4 md:px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
            ChitranshTech
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <li><Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Find Jobs</Link></li>
          <li><Link href="/resume/build" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Build ATS CV</Link></li>
          {user && user.role_id === 2 && (
            <li><Link href="/dashboard" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Post a Job</Link></li>
          )}
          <li><Link href="/feed" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Feed</Link></li>
        </ul>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px]">
                Dashboard
              </Link>
              <button onClick={() => { useAuthStore.getState().logout(); window.location.href = "/"; }} className="text-[0.85rem] text-[var(--color-ink3)] px-3 py-1.5 rounded-[10px] hover:bg-[var(--color-cream2)] hover:text-[var(--color-ink)] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-[0.85rem] text-[var(--color-ink2)] px-3 py-1.5 rounded-[10px] hover:bg-[var(--color-cream2)] transition-colors">Sign In</Link>
              <Link href="/signup" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full hover:bg-[var(--color-ink2)] transition-all hover:-translate-y-[1px]">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-[8px] hover:bg-[var(--color-cream2)] transition-colors">
          <span className="w-[18px] h-[2px] bg-[var(--color-ink)] rounded-full" />
          <span className="w-[18px] h-[2px] bg-[var(--color-ink)] rounded-full" />
          <span className="w-[18px] h-[2px] bg-[var(--color-ink)] rounded-full" />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-[280px] h-full bg-[var(--color-cream)] border-l border-[rgba(26,23,20,0.1)] p-6 shadow-xl">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-[1.2rem] text-[var(--color-ink3)]">✕</button>
            <div className="mt-10 space-y-2">
              <Link href="/jobs" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Find Jobs</Link>
              <Link href="/feed" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Feed</Link>
              <Link href="/network" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Network</Link>
              <Link href="/resume/build" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Build ATS CV</Link>
              <Link href="/groups" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Groups</Link>
              {user && user.role_id === 2 && (
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Post a Job</Link>
              )}
              <div className="border-t border-[rgba(26,23,20,0.08)] my-3" />
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] font-medium text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Dashboard</Link>
                  <Link href="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">My Profile</Link>
                  <button onClick={() => { useAuthStore.getState().logout(); window.location.href = "/"; }} className="block w-full text-left px-4 py-3 text-[0.9rem] text-[var(--color-warm)] rounded-[10px] hover:bg-[rgba(232,128,58,0.08)]">Sign Out</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] text-[var(--color-ink)] rounded-[10px] hover:bg-[var(--color-cream2)]">Sign In</Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-[0.9rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] rounded-[10px] text-center">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, index }: { job: FeaturedJob; index: number }) {
  const colorClass = LOGO_COLORS[index % LOGO_COLORS.length];
  const initial = (job.company_name || job.title)?.[0]?.toUpperCase() || "J";
  const location = job.location || "Remote";
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const min = job.salary_min ? `₹${(job.salary_min / 100000).toFixed(0)}L` : "";
    const max = job.salary_max ? `₹${(job.salary_max / 100000).toFixed(0)}L` : "";
    if (min && max) return `${min}–${max}`;
    return min || max;
  };

  const salary = formatSalary();

  return (
    <Link href={`/jobs/${job.id}`} className="block bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-6 cursor-pointer transition-all hover:border-[rgba(26,23,20,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:-translate-y-[3px]">
      {/* Top */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center font-[var(--font-serif)] text-[1.1rem] font-semibold ${colorClass}`}>
          {initial}
        </div>
        {job.remote_type && (
          <span className="text-[0.65rem] px-2.5 py-1 rounded-full font-medium tracking-[0.04em] uppercase bg-[var(--color-cream2)] text-[var(--color-ink3)]">
            {job.remote_type}
          </span>
        )}
      </div>

      {/* Location & time */}
      <div className="text-[0.72rem] text-[var(--color-ink4)] mb-1 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-lime)]" />
        {location} · {timeLabel}
      </div>

      {/* Title & Company */}
      <h3 className="font-[var(--font-serif)] text-[1.05rem] font-medium text-[var(--color-ink)] mb-1 tracking-[-0.01em] leading-[1.3]">
        {job.title}
      </h3>
      <p className="text-[0.8rem] text-[var(--color-ink3)] mb-4">
        {job.company_name || "Company"}
      </p>

      {/* Skills tags */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 3).map((s) => (
            <span key={s.id} className="text-[0.7rem] px-2.5 py-1 border border-[rgba(26,23,20,0.1)] rounded-[6px] text-[var(--color-ink3)] bg-[var(--color-cream)]">
              {s.skill_name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-[rgba(26,23,20,0.06)] pt-3">
        {salary && (
          <span className="font-[var(--font-serif)] text-[0.95rem] font-semibold text-[var(--color-ink)]">
            {salary}
          </span>
        )}
        {job.employment_type && (
          <span className="text-[0.72rem] px-2.5 py-1 rounded-full bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)]">
            {job.employment_type}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [featuredJobs, setFeaturedJobs] = useState<FeaturedJob[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    jobsApi.getFeaturedJobs(6).then((res) => setFeaturedJobs(res.items)).catch(() => {});
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/jobs");
    }
  }, [searchQuery, router]);

  return (
    <div className="relative z-[1]">
      <Navbar />

      {/* ─── Hero ──────────────────────────────────────────────────────── */}
      <section className="pt-[100px] px-6 lg:px-12 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen">
        <div className="pb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--color-lime)] text-[var(--color-ink)] px-4 py-1.5 rounded-full text-[0.72rem] font-medium tracking-[0.06em] uppercase mb-7 animate-fade-up">
            <span className="text-[0.9rem]">🏆</span>
            #1 Platform for Jobs
          </div>

          <h1 className="font-[var(--font-serif)] text-[clamp(3rem,5vw,4.8rem)] font-medium leading-[1.08] tracking-[-0.03em] text-[var(--color-ink)] mb-6 animate-fade-up [animation-delay:0.1s]">
            New offers are<br />
            waiting <em className="italic font-light text-[var(--color-teal)]">for you</em>
            <span className="animate-wave ml-2">👋</span>
          </h1>

          <p className="text-[1rem] text-[var(--color-ink3)] max-w-[420px] mb-9 leading-[1.75] font-light animate-fade-up [animation-delay:0.2s]">
            Search and <strong className="text-[var(--color-teal)] font-medium">find your dream job</strong> is now easier than ever.
            Just browse a job and apply if you need to.
          </p>

          {/* Search */}
          <div className="flex items-center bg-white border border-[rgba(26,23,20,0.1)] rounded-full pl-5 pr-1.5 py-1.5 gap-3 max-w-[480px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] animate-fade-up [animation-delay:0.3s] focus-within:border-[var(--color-teal)] focus-within:shadow-[0_4px_24px_rgba(44,110,106,0.12)] transition-all">
            <span className="text-[var(--color-ink4)] text-[1rem] shrink-0">⌕</span>
            <input
              type="text"
              placeholder="Job title, Salary, or Companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1 border-none outline-none font-[var(--font-sans)] text-[0.9rem] text-[var(--color-ink)] bg-transparent placeholder:text-[var(--color-ink4)]"
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2.5 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full font-[var(--font-sans)] text-[0.85rem] font-medium cursor-pointer whitespace-nowrap hover:bg-[var(--color-lime2)] hover:scale-[1.02] transition-all"
            >
              Explore Now
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 mt-5 animate-fade-up [animation-delay:0.4s]">
            <span className="text-[0.78rem] text-[var(--color-ink4)] mr-1">Popular:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSearchQuery(cat); router.push(`/jobs?search=${encodeURIComponent(cat)}`); }}
                className="text-[0.78rem] px-3 py-1 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-ink2)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] hover:bg-[rgba(44,110,106,0.05)] transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right — Orbital visual */}
        <div className="hidden lg:flex items-center justify-center h-[520px] relative animate-fade-up [animation-delay:0.25s]">
          <div className="absolute w-[420px] h-[420px] rounded-full border border-[rgba(26,23,20,0.1)] bg-[rgba(200,230,60,0.06)]" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-[rgba(26,23,20,0.1)] bg-[rgba(200,230,60,0.1)]" />
          <div className="absolute w-[180px] h-[180px] rounded-full border border-[rgba(200,230,60,0.3)] bg-[rgba(200,230,60,0.16)]" />

          <div className="absolute w-2 h-2 rounded-full bg-[var(--color-lime)] top-[105px] right-[185px]" />
          <div className="absolute w-2 h-2 rounded-full bg-[var(--color-lime)] bottom-[100px] left-[170px]" />
          <div className="absolute w-[5px] h-[5px] rounded-full bg-[var(--color-warm)] top-[200px] right-[50px]" />

          <div className="absolute w-[88px] h-[88px] bg-[var(--color-ink)] rounded-full flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.2)] z-[5]">
            <span className="font-[var(--font-serif)] text-[2rem] font-semibold text-[var(--color-cream)] leading-none">C</span>
            <span className="text-[0.5rem] text-[var(--color-ink4)] tracking-[0.08em] uppercase mt-0.5">ChitranshTech</span>
          </div>

          {/* Floating cards */}
          <div className="absolute top-[60px] right-[40px] bg-white border border-[rgba(26,23,20,0.1)] rounded-[14px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-10 min-w-[160px] animate-float-a">
            <p className="text-[0.65rem] text-[var(--color-ink4)] tracking-[0.04em] mb-1">The Top Company · Full-time</p>
            <p className="font-[var(--font-serif)] text-[0.88rem] font-semibold text-[var(--color-ink)] mb-0.5">Hiring Developer</p>
            <p className="text-[0.72rem] text-[var(--color-ink3)]">5 days ago · Remote</p>
          </div>

          <div className="absolute top-[160px] left-[20px] bg-[var(--color-lime)] border-transparent rounded-[14px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-10 min-w-[160px] animate-float-b">
            <p className="text-[0.65rem] text-[var(--color-ink2)] tracking-[0.04em] mb-1">Design · Bangalore</p>
            <p className="font-[var(--font-serif)] text-[0.88rem] font-semibold text-[var(--color-ink)] mb-0.5">UI/UX Designer</p>
            <p className="text-[0.72rem] text-[var(--color-ink3)]">40 vacancies open</p>
          </div>

          <div className="absolute bottom-[80px] right-[60px] bg-white border border-[rgba(26,23,20,0.1)] rounded-[14px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-10 min-w-[160px] animate-float-a [animation-delay:1s]">
            <p className="text-[0.65rem] text-[var(--color-ink4)] tracking-[0.04em] mb-1">Engineering</p>
            <p className="font-[var(--font-serif)] text-[0.88rem] font-semibold text-[var(--color-ink)] mb-0.5">Backend Engineer</p>
            <p className="text-[0.72rem] text-[var(--color-ink3)]">₹32–48 LPA · Hybrid</p>
          </div>

          <div className="absolute bottom-[140px] left-[40px] bg-white border border-[rgba(26,23,20,0.1)] rounded-[14px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-10 min-w-[130px] animate-float-b [animation-delay:0.5s]">
            <p className="text-[0.65rem] text-[var(--color-ink4)] tracking-[0.04em] mb-1">AI / ML</p>
            <p className="font-[var(--font-serif)] text-[0.88rem] font-semibold text-[var(--color-ink)] mb-0.5">Data Scientist</p>
            <p className="text-[0.72rem] text-[var(--color-ink3)]">12 new today</p>
          </div>
        </div>
      </section>

      {/* ─── Companies Strip ───────────────────────────────────────────── */}
      <section className="relative z-[1] bg-[var(--color-ink)] py-5 px-6 flex items-center justify-center gap-8 flex-wrap">
        <span className="text-[0.72rem] text-[var(--color-ink3)] tracking-[0.1em] uppercase mr-4">Trusted by the best companies</span>
        {COMPANIES.map((c, i) => (
          <span key={c} className="flex items-center gap-4">
            <span className="font-[var(--font-serif)] text-[0.95rem] font-medium text-[rgba(245,242,236,0.35)] hover:text-[rgba(245,242,236,0.75)] cursor-pointer transition-colors tracking-[0.01em]">
              {c}
            </span>
            {i < COMPANIES.length - 1 && <span className="text-[rgba(245,242,236,0.15)] text-[0.5rem]">●</span>}
          </span>
        ))}
      </section>

      {/* ─── Stats ─────────────────────────────────────────────────────── */}
      <section className="relative z-[1] max-w-[900px] mx-auto py-20 px-6 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className={`text-center py-8 px-4 ${i < STATS.length - 1 ? "border-r border-[rgba(26,23,20,0.06)]" : ""}`}>
            <div className="font-[var(--font-serif)] text-[2.6rem] font-semibold tracking-[-0.04em] text-[var(--color-ink)] leading-none mb-1.5">
              {s.value}<sup className="text-[1.2rem] font-normal">{s.sup}</sup>
            </div>
            <div className="text-[0.78rem] text-[var(--color-ink4)] tracking-[0.04em] uppercase">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ─── Featured Jobs ─────────────────────────────────────────────── */}
      <section className="relative z-[1] max-w-[1200px] mx-auto px-6 lg:px-12 pb-24">
        <div className="text-center mb-12">
          <p className="text-[0.72rem] text-[var(--color-teal)] tracking-[0.1em] uppercase mb-3">✦ Curated Listings</p>
          <h2 className="font-[var(--font-serif)] text-[clamp(2rem,3.5vw,2.8rem)] font-medium tracking-[-0.03em] text-[var(--color-ink)] leading-[1.1] mb-3">
            Latest <em className="italic font-light text-[var(--color-teal)]">featured</em> jobs
          </h2>
          <p className="text-[0.92rem] text-[var(--color-ink3)] max-w-[420px] mx-auto font-light leading-[1.7]">
            Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.
          </p>
        </div>

        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="w-[42px] h-[42px] rounded-[10px] bg-[var(--color-cream2)]" />
                  <div className="w-16 h-5 rounded-full bg-[var(--color-cream2)]" />
                </div>
                <div className="w-24 h-3 bg-[var(--color-cream2)] rounded mb-2" />
                <div className="w-40 h-4 bg-[var(--color-cream2)] rounded mb-1" />
                <div className="w-28 h-3 bg-[var(--color-cream2)] rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="w-14 h-5 bg-[var(--color-cream)] rounded border border-[rgba(26,23,20,0.06)]" />
                  <div className="w-14 h-5 bg-[var(--color-cream)] rounded border border-[rgba(26,23,20,0.06)]" />
                </div>
                <div className="border-t border-[rgba(26,23,20,0.06)] pt-3 flex justify-between">
                  <div className="w-20 h-4 bg-[var(--color-cream2)] rounded" />
                  <div className="w-16 h-5 bg-[var(--color-cream2)] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[rgba(26,23,20,0.1)] bg-transparent text-[var(--color-ink)] rounded-full font-[var(--font-sans)] text-[0.875rem] hover:bg-[var(--color-ink)] hover:text-[var(--color-cream)] hover:border-[var(--color-ink)] transition-all"
          >
            View all jobs →
          </Link>
        </div>
      </section>

      {/* ─── For Employers (Split section) ─────────────────────────────── */}
      <section className="relative z-[1] bg-[var(--color-ink)] py-28 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div>
            <p className="text-[0.72rem] text-[rgba(245,242,236,0.35)] tracking-[0.1em] uppercase mb-4">✦ For Employers</p>
            <h2 className="font-[var(--font-serif)] text-[clamp(2rem,3vw,2.8rem)] font-medium tracking-[-0.03em] text-[var(--color-cream)] leading-[1.1] mb-6">
              Hire the <em className="italic font-light text-[var(--color-lime)]">brilliant minds</em> your company deserves
            </h2>
            <p className="text-[0.93rem] text-[rgba(245,242,236,0.5)] font-light leading-[1.75] mb-10">
              Post once, reach thousands of pre-vetted, actively interviewing candidates. Our AI does the heavy lifting so your team can focus on people, not paperwork.
            </p>

            <div className="flex flex-col gap-5">
              {[
                { icon: "🧠", title: "AI Candidate Screening", desc: "Automatically rank applicants by fit, saving your HR team dozens of hours per role." },
                { icon: "⚡", title: "ATS Integration", desc: "Works with your existing tools — Greenhouse, Lever, Workday — without disrupting your workflow." },
                { icon: "📊", title: "Hiring Analytics Dashboard", desc: "Track pipeline health, time-to-offer, and drop-off rates with real-time insights." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4 p-5 border border-[rgba(245,242,236,0.08)] rounded-[14px] bg-[rgba(245,242,236,0.03)] hover:bg-[rgba(245,242,236,0.06)] transition-colors">
                  <div className="w-[38px] h-[38px] shrink-0 rounded-[10px] bg-[rgba(200,230,60,0.15)] flex items-center justify-center text-[1rem]">
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-[var(--font-serif)] text-[0.95rem] font-medium text-[var(--color-cream)] mb-1 tracking-[-0.01em]">{f.title}</h4>
                    <p className="text-[0.82rem] text-[rgba(245,242,236,0.45)] leading-[1.65]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employer card */}
          <div className="bg-[var(--color-cream)] rounded-[28px] p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-[rgba(200,230,60,0.35)] rounded-full blur-[60px]" />
            <p className="text-[0.7rem] text-[var(--color-ink4)] tracking-[0.08em] uppercase mb-6 relative">Active Employers This Month</p>
            <div className="font-[var(--font-serif)] text-[3.5rem] font-semibold tracking-[-0.05em] text-[var(--color-ink)] leading-none relative">
              140<span className="text-[var(--color-teal)]">K+</span>
            </div>
            <p className="text-[0.87rem] text-[var(--color-ink3)] mt-3 mb-8 max-w-[260px] leading-[1.7] relative">
              Companies across India and globally are finding their next great hire on ChitranshTech every week.
            </p>
            <Link href="/jobs" className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full font-[var(--font-sans)] text-[0.875rem] font-medium relative hover:bg-[var(--color-teal2)] transition-colors">
              Post a Job →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ──────────────────────────────────────────────── */}
      <section className="relative z-[1] max-w-[1200px] mx-auto px-6 lg:px-12 py-24">
        <div className="text-center mb-12">
          <p className="text-[0.72rem] text-[var(--color-teal)] tracking-[0.1em] uppercase mb-3">✦ Stories</p>
          <h2 className="font-[var(--font-serif)] text-[clamp(2rem,3.5vw,2.8rem)] font-medium tracking-[-0.03em] text-[var(--color-ink)] leading-[1.1]">
            People who found <em className="italic font-light text-[var(--color-teal)]">their future</em> here
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { quote: "Applied to 8 companies through ChitranshTech. Had 3 final-round interviews in under two weeks. The ATS CV builder alone made my applications stand out.", name: "Arjun Kapoor", role: "Senior Engineer · Now at Zepto", color: "bg-[rgba(44,110,106,0.12)] text-[#1A4D4A]", initials: "AK" },
            { quote: "We filled 4 senior roles in 6 weeks — roles that had been open for months on other platforms. The quality of applicants was genuinely different.", name: "Priya Raghavan", role: "Head of Talent · Razorpay", color: "bg-[rgba(200,230,60,0.3)] text-[#8CAF00]", initials: "PR" },
            { quote: "Switched careers from finance to product. The job feed actually surfaced roles I'd never have found myself, and the salary data helped me negotiate properly.", name: "Sneha Khanna", role: "Product Manager · Early-stage startup", color: "bg-[rgba(232,128,58,0.15)] text-[#B85A1A]", initials: "SK" },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7 hover:shadow-[0_6px_24px_rgba(0,0,0,0.07)] transition-shadow">
              <p className="text-[var(--color-lime-dk)] text-[0.75rem] mb-4 tracking-[2px]">★ ★ ★ ★ ★</p>
              <p className="font-[var(--font-serif)] text-[0.95rem] italic font-normal text-[var(--color-ink2)] leading-[1.75] mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-[var(--font-serif)] text-[0.75rem] font-semibold ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">{t.name}</p>
                  <p className="text-[0.72rem] text-[var(--color-ink4)]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="relative z-[1] mx-6 lg:mx-12 mb-24 max-w-[1140px] lg:mx-auto">
        <div className="bg-[var(--color-ink)] rounded-[28px] px-8 lg:px-16 py-20 text-center relative overflow-hidden">
          <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[rgba(200,230,60,0.12)] rounded-full blur-[80px]" />
          <h2 className="font-[var(--font-serif)] text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-[-0.03em] text-[var(--color-cream)] leading-[1.1] mb-4 relative">
            Your next opportunity<br />is one search <em className="italic font-light text-[var(--color-lime)]">away.</em>
          </h2>
          <p className="text-[rgba(245,242,236,0.5)] mb-10 relative text-[0.95rem]">
            Join 3 million professionals already building their careers on ChitranshTech.
          </p>
          <div className="flex justify-center gap-4 flex-wrap relative">
            <Link href="/jobs" className="px-8 py-3 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full font-[var(--font-sans)] text-[0.9rem] font-medium hover:bg-[var(--color-lime2)] hover:-translate-y-0.5 transition-all">
              Find Jobs Now →
            </Link>
            <Link href="/signup" className="px-8 py-3 bg-transparent text-[rgba(245,242,236,0.65)] border border-[rgba(245,242,236,0.15)] rounded-full font-[var(--font-sans)] text-[0.9rem] hover:text-[var(--color-cream)] hover:border-[rgba(245,242,236,0.35)] transition-all">
              Post a Job
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-[1] bg-[var(--color-ink)] py-12 px-6 lg:px-12 border-t border-[rgba(245,242,236,0.06)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-[rgba(245,242,236,0.06)] mb-7">
            <div>
              <p className="font-[var(--font-serif)] text-[1.1rem] font-semibold text-[var(--color-cream)] mb-3 tracking-[-0.01em]">ChitranshTech</p>
              <p className="text-[0.85rem] text-[rgba(245,242,236,0.35)] leading-[1.7] max-w-[250px]">
                The modern job platform for a world where talent is borderless. Find the work that fits who you are.
              </p>
            </div>
            <div>
              <h5 className="text-[0.7rem] tracking-[0.1em] uppercase text-[rgba(245,242,236,0.3)] mb-5">Job Seekers</h5>
              <ul className="space-y-2.5">
                <li><Link href="/jobs" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Browse Jobs</Link></li>
                <li><Link href="/resume/build" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Build ATS CV</Link></li>
                <li><Link href="/jobs" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Salary Explorer</Link></li>
                <li><Link href="/feed" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Career Paths</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[0.7rem] tracking-[0.1em] uppercase text-[rgba(245,242,236,0.3)] mb-5">Employers</h5>
              <ul className="space-y-2.5">
                <li><Link href="/jobs" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Post a Job</Link></li>
                <li><Link href="/profile/search" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Talent Search</Link></li>
                <li><Link href="#" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Pricing</Link></li>
                <li><Link href="#" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">ATS Integration</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-[0.7rem] tracking-[0.1em] uppercase text-[rgba(245,242,236,0.3)] mb-5">Company</h5>
              <ul className="space-y-2.5">
                <li><Link href="#" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">About</Link></li>
                <li><Link href="/feed" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Feed</Link></li>
                <li><Link href="#" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-[0.85rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)] transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex justify-between items-center text-[0.78rem] text-[rgba(245,242,236,0.25)]">
            <span>© 2026 ChitranshTech. All rights reserved.</span>
            <span>Built with care for the next generation of work.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
