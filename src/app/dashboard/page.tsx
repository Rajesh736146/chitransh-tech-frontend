"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";

const STATS = [
  { label: "Jobs Posted", value: "12,400+" },
  { label: "Companies", value: "3,200+" },
  { label: "Hired", value: "85,000+" },
  { label: "Resumes Built", value: "50,000+" },
];

const CATEGORIES = [
  { label: "Technology", icon: "💻", count: "4,200 jobs" },
  { label: "Marketing", icon: "📣", count: "1,800 jobs" },
  { label: "Design", icon: "🎨", count: "1,200 jobs" },
  { label: "Finance", icon: "📊", count: "2,100 jobs" },
  { label: "Sales", icon: "🤝", count: "3,400 jobs" },
  { label: "Operations", icon: "⚙️", count: "1,600 jobs" },
];

const FEATURED_JOBS = [
  { title: "Senior Backend Engineer", company: "Razorpay", location: "Bangalore", type: "Full-time", salary: "₹30–45 LPA" },
  { title: "Product Designer", company: "Swiggy", location: "Remote", type: "Full-time", salary: "₹20–30 LPA" },
  { title: "Growth Marketing Manager", company: "CRED", location: "Bangalore", type: "Full-time", salary: "₹18–28 LPA" },
  { title: "Data Analyst", company: "Zepto", location: "Mumbai", type: "Full-time", salary: "₹12–20 LPA" },
  { title: "Frontend Developer", company: "Meesho", location: "Bangalore", type: "Full-time", salary: "₹15–25 LPA" },
  { title: "DevOps Engineer", company: "PhonePe", location: "Pune", type: "Full-time", salary: "₹22–35 LPA" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-950 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium bg-white/10 inline-block px-3 py-1 rounded-full mb-5">
            🚀 India&apos;s fastest growing job platform
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Find your next <span className="text-yellow-400">dream job</span>
          </h1>
          <p className="text-gray-400 mb-8">
            Thousands of jobs from top companies. Build an ATS-friendly resume and get hired faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Job title, skills, or company"
              className="flex-1 px-4 py-2.5 rounded-lg text-gray-900 text-sm focus:outline-none"
            />
            <input
              type="text"
              placeholder="Location"
              className="sm:w-36 px-4 py-2.5 rounded-lg text-gray-900 text-sm focus:outline-none"
            />
            <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Browse by category</h2>
          <Link href="/jobs" className="text-sm text-gray-500 hover:text-black">View all →</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.label}
              className="border border-gray-200 rounded-xl p-4 text-center hover:border-black hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className="text-sm font-medium">{cat.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="bg-gray-50 py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Featured jobs</h2>
            <Link href="/jobs" className="text-sm text-gray-500 hover:text-black">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURED_JOBS.map((job) => (
              <div
                key={job.title}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-600">
                    {job.company[0]}
                  </div>
                  <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                    {job.type}
                  </span>
                </div>
                <p className="font-semibold text-sm mb-1">{job.title}</p>
                <p className="text-xs text-gray-500 mb-3">{job.company} · {job.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{job.salary}</span>
                  <button className="text-xs text-black font-medium hover:underline">Apply →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume CTA */}
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="bg-gray-900 rounded-2xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h2 className="text-xl font-bold mb-1">Build an ATS-friendly resume</h2>
            <p className="text-gray-400 text-sm">AI-powered resume builder that helps you stand out.</p>
          </div>
          <Link
            href="/resume/build"
            className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Build my resume →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center text-sm text-gray-400">
        © 2025 JobPortal. All rights reserved.
      </footer>
    </div>
  );
}
