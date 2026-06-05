"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { jobsApi } from "@/modules/jobs/api";
import { useAuthStore } from "@/modules/auth/store";
import type { Job, Company } from "@/modules/jobs/types";
import { toast } from "sonner";
import {
  Search, MapPin, X, Heart, Bookmark, MoreHorizontal, ChevronUp, ChevronDown,
  SlidersHorizontal, Clock,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number | null) {
  if (!n) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(0)}L PA`;
  return `₹${n.toLocaleString()} PA`;
}
function salaryRange(min: number | null, max: number | null) {
  const a = fmt(min), b = fmt(max);
  if (a && b) return `${a.replace(" PA", "")} – ${b}`;
  if (a) return a;
  return null;
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];
const SENIORITY_LEVELS = ["Student-Entry", "Entry Level", "Mid Level", "Senior Level", "Directors", "VP or Above"];
const REMOTE_TYPES = ["Remote", "Hybrid", "On-site"];

// ─── Filter Sidebar ───────────────────────────────────────────────────────────
function FilterSidebar({
  selectedTypes, setSelectedTypes,
  selectedSeniority, setSelectedSeniority,
  salaryMin, setSalaryMin,
  salaryMax, setSalaryMax,
  onApply, onReset,
}: {
  selectedTypes: string[];
  setSelectedTypes: (v: string[]) => void;
  selectedSeniority: string[];
  setSelectedSeniority: (v: string[]) => void;
  salaryMin: string;
  setSalaryMin: (v: string) => void;
  salaryMax: string;
  setSalaryMax: (v: string) => void;
  onApply: () => void;
  onReset: () => void;
}) {
  const [showTypes, setShowTypes] = useState(true);
  const [showSeniority, setShowSeniority] = useState(true);
  const [showSalary, setShowSalary] = useState(true);

  const toggleType = (t: string) => {
    setSelectedTypes(
      selectedTypes.includes(t) ? selectedTypes.filter((x) => x !== t) : [...selectedTypes, t]
    );
  };
  const toggleSeniority = (s: string) => {
    setSelectedSeniority(
      selectedSeniority.includes(s) ? selectedSeniority.filter((x) => x !== s) : [...selectedSeniority, s]
    );
  };

  return (
    <aside className="w-[260px] shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-gray-100 p-5 sticky top-20">
        {/* Employment Type */}
        <div className="mb-5">
          <button
            onClick={() => setShowTypes(!showTypes)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
          >
            Type of Employment
            {showTypes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showTypes && (
            <div className="space-y-2">
              {EMPLOYMENT_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{t}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Seniority Level */}
        <div className="mb-5">
          <button
            onClick={() => setShowSeniority(!showSeniority)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
          >
            Seniority Level
            {showSeniority ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSeniority && (
            <div className="space-y-2">
              {SENIORITY_LEVELS.map((s) => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedSeniority.includes(s)}
                    onChange={() => toggleSeniority(s)}
                    className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{s}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Salary Range */}
        <div className="mb-5">
          <button
            onClick={() => setShowSalary(!showSalary)}
            className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3"
          >
            Salary Range
            {showSalary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showSalary && (
            <div>
              {/* Slider visual */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={salaryMax || "5000000"}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-medium">Min</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <span className="text-gray-300 mt-4">—</span>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-medium">Max</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="5000000"
                    className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onApply}
            className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            APPLY
          </button>
          <button
            onClick={onReset}
            className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            RESET
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── Job Card (grid) ──────────────────────────────────────────────────────────
function JobGridCard({ job }: { job: Job }) {
  const salary = salaryRange(job.salary_min, job.salary_max);

  return (
    <Link href={`/jobs/${job.id}`} className="block bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-md transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
            {(job.company_name ?? "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 leading-tight line-clamp-2">{job.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">{job.company_name ?? "—"}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 shrink-0" onClick={(e) => e.preventDefault()}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Location */}
      {job.location && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <MapPin size={12} />
          <span>{job.location}</span>
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
        {job.experience_required && <span>{job.experience_required}</span>}
        {job.employment_type && <span>{job.employment_type}</span>}
        {salary && <span className="ml-auto font-semibold text-gray-900">{salary}</span>}
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{job.description}</p>
      )}

      {/* Skills tags */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.skills.slice(0, 3).map((s) => (
            <span key={s.id} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
              {s.skill_name}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-[11px] text-gray-400">+{job.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Clock size={11} /> {timeAgo(job.created_at)}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Save"
          >
            <Heart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Post Job Modal ───────────────────────────────────────────────────────────
function PostJobModal({ companies, onClose, onSuccess }: {
  companies: Company[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    company_id: companies[0]?.id ?? "",
    title: "", description: "", employment_type: "", experience_required: "",
    salary_min: "", salary_max: "", location: "", remote_type: "", skills: "",
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
        company_id: form.company_id, title: form.title, description: form.description,
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

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold">Post a Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Company *</label>
            <select className={`${inp} bg-white`} value={form.company_id} onChange={(e) => set("company_id", e.target.value)}>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input className={inp} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Senior Backend Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea className={inp} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the role..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Employment Type</label>
              <select className={`${inp} bg-white`} value={form.employment_type} onChange={(e) => set("employment_type", e.target.value)}>
                <option value="">Select</option>
                {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Remote Type</label>
              <select className={`${inp} bg-white`} value={form.remote_type} onChange={(e) => set("remote_type", e.target.value)}>
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
            <label className="block text-sm font-medium mb-1">Skills <span className="text-gray-400">(comma-separated)</span></label>
            <input className={inp} value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, PostgreSQL" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {loading ? "Posting…" : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function JobsPageInner() {
  const { user } = useAuthStore();
  const isEmployer = user?.role_id === 2;
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [employmentType, setEmploymentType] = useState(searchParams.get("employment_type") || "");
  const [remoteType, setRemoteType] = useState(searchParams.get("remote_type") || "");

  // Filter sidebar state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>([]);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  const [showPostJob, setShowPostJob] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sortBy, setSortBy] = useState("newest");

  const PAGE_SIZE = 12;

  const fetchJobs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const typeFilter = selectedTypes.length > 0 ? selectedTypes[0] : (employmentType || undefined);
      const res = await jobsApi.listJobs({
        page: p,
        page_size: PAGE_SIZE,
        search: search || (searchTags.length > 0 ? searchTags.join(" ") : undefined),
        location: location || undefined,
        employment_type: typeFilter,
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
  }, [search, searchTags, location, employmentType, remoteType, selectedTypes]);

  useEffect(() => { fetchJobs(1); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isEmployer) { jobsApi.listCompanies().then(setCompanies).catch(() => {}); }
  }, [isEmployer]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim() && !searchTags.includes(search.trim())) {
      setSearchTags([...searchTags, search.trim()]);
    }
    fetchJobs(1);
    setSearch("");
  };

  const removeTag = (tag: string) => {
    const next = searchTags.filter((t) => t !== tag);
    setSearchTags(next);
    setTimeout(() => fetchJobs(1), 0);
  };

  const handleApplyFilters = () => { fetchJobs(1); };
  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedSeniority([]);
    setSalaryMin("");
    setSalaryMax("");
    setSearchTags([]);
    setSearch("");
    setLocation("");
    setEmploymentType("");
    setRemoteType("");
    setTimeout(() => fetchJobs(1), 0);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-[52px] z-40">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            {/* Search input with tags */}
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
              <Search size={16} className="text-gray-400 shrink-0" />
              {searchTags.map((tag) => (
                <span key={tag} className="flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded text-xs text-gray-700 shrink-0">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job title, skills..."
                className="flex-1 bg-transparent text-sm focus:outline-none min-w-[120px]"
              />
            </div>

            {/* Location */}
            <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-[180px]">
              <MapPin size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="All Locations"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>

            {/* Job Type dropdown */}
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-[140px] focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Job Type</option>
              {EMPLOYMENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            {/* Salary Range dropdown */}
            <select
              value={remoteType}
              onChange={(e) => setRemoteType(e.target.value)}
              className="hidden sm:block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm w-[140px] focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="">Work Mode</option>
              {REMOTE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            {/* Search button */}
            <button
              type="submit"
              className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              START SEARCHING
            </button>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900">
              {total > 0 ? `${total.toLocaleString()} Jobs Found` : "Jobs"}
            </h2>
            {isEmployer && (
              <button
                onClick={() => setShowPostJob(true)}
                className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                + Post Job
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-medium text-gray-900 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest Post</option>
              <option value="salary">Highest Salary</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedSeniority={selectedSeniority}
            setSelectedSeniority={setSelectedSeniority}
            salaryMin={salaryMin}
            setSalaryMin={setSalaryMin}
            salaryMax={salaryMax}
            setSalaryMax={setSalaryMax}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />

          {/* Job Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
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
                <button onClick={handleResetFilters} className="mt-4 text-sm text-gray-900 underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobGridCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => fetchJobs(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchJobs(pageNum)}
                          className={`w-9 h-9 text-sm rounded-lg transition-colors ${
                            page === pageNum
                              ? "bg-gray-900 text-white"
                              : "border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => fetchJobs(page + 1)}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPostJob && (
        <PostJobModal companies={companies} onClose={() => setShowPostJob(false)} onSuccess={() => fetchJobs(1)} />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    }>
      <JobsPageInner />
    </Suspense>
  );
}
