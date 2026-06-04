"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { useAuthStore } from "@/modules/auth/store";
import { Briefcase, Users, FileText, TrendingUp, MapPin, Building2, ArrowRight, Star, Zap } from "lucide-react";

const STATS = [
  { label: "Active Jobs", value: "12,400+", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
  { label: "Companies", value: "3,200+", icon: Building2, color: "text-purple-600 bg-purple-50" },
  { label: "Professionals", value: "85,000+", icon: Users, color: "text-green-600 bg-green-50" },
  { label: "Resumes Built", value: "50,000+", icon: FileText, color: "text-orange-600 bg-orange-50" },
];

const CATEGORIES = [
  { label: "Technology", icon: "💻", count: "4,200", color: "from-blue-500 to-blue-600" },
  { label: "Marketing", icon: "📣", count: "1,800", color: "from-pink-500 to-pink-600" },
  { label: "Design", icon: "🎨", count: "1,200", color: "from-purple-500 to-purple-600" },
  { label: "Finance", icon: "📊", count: "2,100", color: "from-emerald-500 to-emerald-600" },
  { label: "Sales", icon: "🤝", count: "3,400", color: "from-amber-500 to-amber-600" },
  { label: "Engineering", icon: "⚙️", count: "2,800", color: "from-slate-500 to-slate-600" },
];

const FEATURED_JOBS = [
  { title: "Senior Backend Engineer", company: "Razorpay", location: "Bangalore", type: "Full-time", salary: "₹30–45 LPA", logo: "R" },
  { title: "Product Designer", company: "Swiggy", location: "Remote", type: "Full-time", salary: "₹20–30 LPA", logo: "S" },
  { title: "Growth Marketing Manager", company: "CRED", location: "Bangalore", type: "Full-time", salary: "₹18–28 LPA", logo: "C" },
  { title: "Data Analyst", company: "Zepto", location: "Mumbai", type: "Full-time", salary: "₹12–20 LPA", logo: "Z" },
  { title: "Frontend Developer", company: "Meesho", location: "Bangalore", type: "Full-time", salary: "₹15–25 LPA", logo: "M" },
  { title: "DevOps Engineer", company: "PhonePe", location: "Pune", type: "Full-time", salary: "₹22–35 LPA", logo: "P" },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Navbar />

      {/* Hero Section */}
      <section className="gradient-hero text-white">
        <div className="max-w-[1128px] mx-auto px-4 py-16 md:py-20">
          <div className="max-w-2xl">
            {user ? (
              <>
                <p className="text-blue-200 text-sm font-medium mb-2">Welcome back, {user.full_name.split(" ")[0]} 👋</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
                  Your next career move starts here
                </h1>
                <p className="text-gray-300 text-base mb-6">
                  Explore personalized job recommendations, build your network, and grow professionally.
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-sm mb-4">
                  <Zap size={14} className="text-yellow-400" />
                  <span>India&apos;s fastest growing professional network</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  Find your dream job &<br />grow your career
                </h1>
                <p className="text-gray-300 text-lg mb-8">
                  Connect with top companies, build ATS-ready resumes, and join a thriving professional community.
                </p>
              </>
            )}

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex-1 relative">
                <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, skills, or company"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div className="sm:w-[180px] relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <Link
                href="/jobs"
                className="bg-[#f5c518] hover:bg-[#e6b800] text-gray-900 font-semibold px-6 py-3 rounded-lg text-sm transition-colors text-center"
              >
                Search Jobs
              </Link>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2 mt-5">
              {["Remote Jobs", "Fresher", "Internship", "₹10L+ Salary"].map((tag) => (
                <Link
                  key={tag}
                  href={`/jobs?search=${encodeURIComponent(tag)}`}
                  className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-[1128px] mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl p-4 border border-[var(--color-border)] card-hover">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color} mb-3`}>
                  <Icon size={20} />
                </div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1128px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Explore by Category</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Find jobs across different industries</p>
          </div>
          <Link href="/jobs" className="text-sm text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/jobs?search=${cat.label}`}
              className="bg-white border border-[var(--color-border)] rounded-xl p-4 text-center card-hover group"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-sm font-semibold group-hover:text-[var(--color-primary)] transition-colors">{cat.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{cat.count} jobs</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-white border-y border-[var(--color-border)] py-12">
        <div className="max-w-[1128px] mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Star size={20} className="text-[var(--color-primary)]" />
              <h2 className="text-xl font-bold">Featured Jobs</h2>
            </div>
            <Link href="/jobs" className="text-sm text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1">
              See all jobs <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_JOBS.map((job) => (
              <Link
                key={job.title}
                href="/jobs"
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 card-hover group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {job.logo}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm group-hover:text-[var(--color-primary)] transition-colors truncate">{job.title}</p>
                    <p className="text-xs text-[var(--color-text-secondary)] truncate">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{job.type}</span>
                  <span className="text-xs bg-gray-100 text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin size={10} /> {job.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--color-text)]">{job.salary}</span>
                  <span className="text-xs text-[var(--color-primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Apply →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Sections */}
      <section className="max-w-[1128px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Resume Builder CTA */}
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-2xl p-8 text-white">
            <FileText size={32} className="mb-3 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Build your ATS-ready resume</h3>
            <p className="text-blue-100 text-sm mb-5">AI-powered builder that helps you stand out to recruiters and pass automated filters.</p>
            <Link
              href="/resume/build"
              className="inline-block bg-white text-[var(--color-primary)] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-blue-50 transition-colors"
            >
              Build my resume →
            </Link>
          </div>

          {/* Network CTA */}
          <div className="bg-gradient-to-br from-[#057642] to-[#034d2e] rounded-2xl p-8 text-white">
            <Users size={32} className="mb-3 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Grow your professional network</h3>
            <p className="text-green-100 text-sm mb-5">Connect with industry professionals, get endorsed for your skills, and discover opportunities.</p>
            <Link
              href="/network"
              className="inline-block bg-white text-[#057642] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-green-50 transition-colors"
            >
              Explore network →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[var(--color-border)] py-8">
        <div className="max-w-[1128px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">Chitransh Tech</span>
              <span className="text-xs text-[var(--color-text-muted)]">© 2025. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-[var(--color-text-secondary)]">
              <Link href="/jobs" className="hover:text-[var(--color-text)] transition-colors">Jobs</Link>
              <Link href="/feed" className="hover:text-[var(--color-text)] transition-colors">Feed</Link>
              <Link href="/network" className="hover:text-[var(--color-text)] transition-colors">Network</Link>
              <Link href="/resume/build" className="hover:text-[var(--color-text)] transition-colors">Resume</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
