"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { jobsApi } from "@/modules/jobs/api";
import { useAuthStore } from "@/modules/auth/store";
import type { Job, Company } from "@/modules/jobs/types";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number | null) {
  if (!n) return null;
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString()}`;
}
function salaryRange(min: number | null, max: number | null) {
  const a = fmt(min), b = fmt(max);
  if (a && b) return `${a} – ${b}`;
  if (a) return `${a}+`;
  return null;
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const REMOTE_TYPES = ["Remote", "Hybrid", "On-site"];

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const salary = salaryRange(job.salary_min, job.salary_max);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-400 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
          {(job.company_name ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
          <p className="text-xs text-gray-500 truncate">{job.company_name ?? "—"}</p>
        </div>
        {job.employment_type && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">
            {job.employment_type}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        {job.location && <span>📍 {job.location}</span>}
        {job.remote_type && <span>🏠 {job.remote_type}</span>}
        {job.experience_required && <span>🎯 {job.experience_required}</span>}
      </div>

      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {s.skill_name}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {salary ? (
          <span className="text-xs font-semibold text-gray-800">{salary}</span>
        ) : (
          <span className="text-xs text-gray-400">Salary not disclosed</span>
        )}
        <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
      </div>
    </button>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
function JobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const salary = salaryRange(job.salary_min, job.salary_max);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
              {(job.company_name ?? "?")[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
              <p className="text-sm text-gray-600">{job.company_name ?? "—"}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.employment_type && (
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">{job.employment_type}</span>
          )}
          {job.remote_type && (
            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{job.remote_type}</span>
          )}
          {job.location && (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">📍 {job.location}</span>
          )}
          {job.experience_required && (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">🎯 {job.experience_required}</span>
          )}
          {salary && (
            <span className="text-xs bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-semibold">💰 {salary}</span>
          )}
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s.id}
                  className={`text-xs px-2 py-1 rounded ${
                    s.mandatory ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {s.skill_name}
                  {!s.mandatory && <span className="ml-1 opacity-60">(optional)</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-2">Job Description</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>

        <button className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
          Apply Now
        </button>
      </div>
    </div>
  );
}

// ─── Post Job Modal (employer only) ──────────────────────────────────────────
function PostJobModal({ companies, onClose, onSuccess }: {
  companies: Company[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    company_id: companies[0]?.id ?? "",
    title: "",
    description: "",
    employment_type: "",
    experience_required: "",
    salary_min: "",
    salary_max: "",
    location: "",
    remote_type: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company_id || !form.title || !form.description) {
      toast.error("Company, title and description are required");
      return;
    }
    setLoading(true);
    try {
      await jobsApi.createJob({
        company_id: form.company_id,
        title: form.title,
        description: form.description,
        employment_type: form.employment_type || undefined,
        experience_required: form.experience_required || undefined,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        location: form.location || undefined,
        remote_type: form.remote_type || undefined,
        skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
      });
      toast.success("Job posted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";
  const sel = `${inp} bg-white`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Post a Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company *</label>
            <select className={sel} value={form.company_id} onChange={(e) => set("company_id", e.target.value)}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Backend Engineer" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea className={inp} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the role, responsibilities, requirements..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Employment Type</label>
              <select className={sel} value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
                <option value="">Select</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remote Type</label>
              <select className={sel} value={form.remote_type} onChange={(e) => set("remote_type", e.target.value)}>
                <option value="">Select</option>
                {REMOTE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min Salary (₹)</label>
              <input className={inp} type="number" value={form.salary_min} onChange={(e) => set("salary_min", e.target.value)} placeholder="500000" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Salary (₹)</label>
              <input className={inp} type="number" value={form.salary_max} onChange={(e) => set("salary_max", e.target.value)} placeholder="1200000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input className={inp} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Bangalore" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Experience</label>
              <input className={inp} value={form.experience_required} onChange={(e) => set("experience_required", e.target.value)} placeholder="2-4 years" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skills <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input className={inp} value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? "Posting…" : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { user } = useAuthStore();
  const isEmployer = user?.role_id === 2;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [remoteType, setRemoteType] = useState("");

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);

  const PAGE_SIZE = 12;

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await jobsApi.listJobs({
        page: p,
        page_size: PAGE_SIZE,
        search: search || undefined,
        location: location || undefined,
        employment_type: employmentType || undefined,
        remote_type: remoteType || undefined,
      });
      setJobs(res.items);
      setTotal(res.total);
      setPage(p);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [search, location, employmentType, remoteType]);

  // initial load
  useEffect(() => { fetchJobs(1); }, []);

  // load companies for employer
  useEffect(() => {
    if (isEmployer) {
      jobsApi.listCompanies().then(setCompanies).catch(() => {});
    }
  }, [isEmployer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const clearFilters = () => {
    setSearch(""); setLocation(""); setEmploymentType(""); setRemoteType("");
    setTimeout(() => fetchJobs(1), 0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const inp = "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {total > 0 ? `${total} open positions` : "Search for your next opportunity"}
              </p>
            </div>
            {isEmployer && (
              <button
                onClick={() => setShowPostJob(true)}
                className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                + Post a Job
              </button>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              className={`flex-1 ${inp}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Job title, skills, or keyword"
            />
            <input
              className={`sm:w-44 ${inp}`}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
            <select className={`sm:w-40 ${inp} bg-white`} value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
              <option value="">All types</option>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select className={`sm:w-36 ${inp} bg-white`} value={remoteType} onChange={(e) => setRemoteType(e.target.value)}>
              <option value="">All modes</option>
              {REMOTE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button type="submit" className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              Search
            </button>
            {(search || location || employmentType || remoteType) && (
              <button type="button" onClick={clearFilters} className="text-sm text-gray-500 hover:text-black px-2">
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Job Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium text-gray-700">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="mt-4 text-sm text-black underline">Clear filters</button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => fetchJobs(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => fetchJobs(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showPostJob && (
        <PostJobModal
          companies={companies}
          onClose={() => setShowPostJob(false)}
          onSuccess={() => fetchJobs(1)}
        />
      )}
    </div>
  );
}
