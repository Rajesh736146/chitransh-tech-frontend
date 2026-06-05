"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/modules/auth/store";
import { jobsApi } from "@/modules/jobs/api";
import type { Job } from "@/modules/jobs/types";
import { Search, MapPin, ArrowRight, Briefcase, Users, FileText, Building2, CheckCircle } from "lucide-react";

// ─── Trusted Companies ────────────────────────────────────────────────────────
const COMPANIES = [
  "Cloud", "Proline", "Leafe", "Penta", "Recharge",
  "Snowflake", "Hues", "Cactus", "Vision", "Greenish",
];

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  "UX Designer", "Front-end Dev", "Back-end Dev", "Full Stack", "Data Science", "DevOps",
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "12K+", label: "Jobs Posted" },
  { value: "8K+", label: "Companies" },
  { value: "5M+", label: "Matches Made" },
  { value: "3M+", label: "Startup-ready candidates" },
];

// ─── Landing Navbar ───────────────────────────────────────────────────────────
function LandingNav() {
  const { user } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Chitransh Tech"
            width={34}
            height={34}
            className="h-[34px] w-auto object-contain"
          />
          <span className="font-bold text-lg text-gray-900">ChitranshTech</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Latest Jobs</Link>
          <Link href="/resume/build" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Build ATS Friendly CV</Link>
          <Link href="/jobs" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Post a Job</Link>
          <Link href="/feed" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Feed</Link>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-700 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Featured Job Card ────────────────────────────────────────────────────────
function FeaturedJobCard({ job }: { job: Job }) {
  const location = job.location || "Worldwide";
  const daysAgo = Math.floor((Date.now() - new Date(job.created_at).getTime()) / 86400000);
  const timeLabel = daysAgo === 0 ? "Today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;

  return (
    <Link href="/jobs" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all group">
      {/* Top meta */}
      <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          {location}
        </span>
        <span>{timeLabel}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-sm text-gray-900 mb-3 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
        {job.title}
      </h3>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {job.employment_type && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{job.employment_type}</span>
        )}
        {job.remote_type && (
          <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{job.remote_type}</span>
        )}
      </div>
    </Link>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);

  useEffect(() => {
    jobsApi.listJobs({ page: 1, page_size: 6 })
      .then((res) => setFeaturedJobs(res.items))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#f9f9f6]">
      <LandingNav />

      {/* ─── Hero Section ──────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#c4e441]/20 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
              🔥 #1 PLATFORM FOR JOBS
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-gray-900 leading-[1.1] mb-6">
              New offers<br />are waiting<br />for you 👋
            </h1>

            <p className="text-gray-500 text-base mb-8 max-w-md leading-relaxed">
              Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.
            </p>

            {/* Search bar */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 max-w-md shadow-sm mb-6">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Job title, Salary, or Companies..."
                className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
              />
              <Link
                href="/jobs"
                className="bg-[#c4e441] text-gray-900 px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#b8d83a] transition-colors"
              >
                Explore Now
              </Link>
            </div>

            {/* Popular categories */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">Popular Categories:</span>
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/jobs?search=${encodeURIComponent(cat)}`}
                  className="text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full hover:border-gray-400 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Right — Hero visual */}
          <div className="hidden lg:flex justify-center relative">
            <div className="relative w-[420px] h-[420px]">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full bg-[#c4e441]/20" />

              {/* Central avatar placeholder */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-yellow-200 via-yellow-100 to-white border-4 border-white shadow-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-900 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-2">
                    C
                  </div>
                  <p className="text-sm font-semibold text-gray-900">ChitranshTech</p>
                  <p className="text-xs text-gray-500">Find Your Dream Job</p>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute top-8 left-4 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100">
                <p className="text-[10px] text-gray-400">The Top Company</p>
                <p className="text-xs font-semibold text-gray-900">Hiring Developer</p>
                <p className="text-[10px] text-gray-500">5 days ago • Full-time</p>
              </div>

              <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-lg px-3 py-2 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">U</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">UI/UX Designer</p>
                    <p className="text-[10px] text-gray-500">40 vacancies</p>
                  </div>
                </div>
              </div>

              {/* Small floating icons */}
              <div className="absolute top-16 right-8 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
                <span className="text-lg">🎯</span>
              </div>
              <div className="absolute bottom-20 left-0 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
                <span className="text-lg">💼</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trusted Companies ─────────────────────────────────────────── */}
      <section className="bg-gray-900 py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <p className="text-center text-sm text-gray-400 mb-6">Trusted by the best companies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {COMPANIES.map((company) => (
              <span key={company} className="text-white/70 text-sm font-medium flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[8px]">✦</span>
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured Jobs ─────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Latest featured jobs</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Search and find your dream job is now easier than ever. Just browse a job and apply if you need to.
          </p>
        </div>

        {featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <FeaturedJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder cards when no jobs loaded */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                    Worldwide
                  </span>
                  <span>Recent</span>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">
                  Senior Developer with strong skills
                </h3>
                <div className="flex gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">Full-time</span>
                  <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">Remote</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            View All Jobs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 text-sm">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#c4e441]/20 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-gray-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create your profile</h3>
              <p className="text-sm text-gray-500">Build your professional profile and upload your resume to get noticed.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#c4e441]/20 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Search & apply</h3>
              <p className="text-sm text-gray-500">Browse thousands of jobs and apply with a single click.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#c4e441]/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-gray-900" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get hired</h3>
              <p className="text-sm text-gray-500">Connect with employers and land your dream job faster.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="bg-gray-900 rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to find your dream job?
          </h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
            Join thousands of professionals who have already found their perfect career match.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-[#c4e441] text-gray-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#b8d83a] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/jobs"
              className="border border-white/30 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#c4e441] flex items-center justify-center">
                  <Briefcase size={12} className="text-gray-900" />
                </div>
                <span className="font-bold text-sm">ChitranshTech</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                India&apos;s leading professional network and job portal for tech professionals.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Product</h4>
              <div className="space-y-2">
                <Link href="/jobs" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Find Jobs</Link>
                <Link href="/resume/build" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Resume Builder</Link>
                <Link href="/feed" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Feed</Link>
                <Link href="/network" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Network</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Company</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">About Us</Link>
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Careers</Link>
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-3">Legal</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Privacy Policy</Link>
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Terms of Service</Link>
                <Link href="#" className="block text-xs text-gray-500 hover:text-gray-900 transition-colors">Cookie Policy</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
            <p className="text-xs text-gray-400">© 2025 ChitranshTech. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <span key={s} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
