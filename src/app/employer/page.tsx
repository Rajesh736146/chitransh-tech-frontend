"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

type Tab = "overview" | "jobs" | "applicants" | "post-job" | "companies";

interface MyJob {
  id: string;
  title: string;
  location: string | null;
  employment_type: string | null;
  status: string;
  job_category: string;
  created_at: string;
  company_name: string | null;
}

interface Applicant {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_url: string | null;
  application_status: string;
  applied_at: string;
  job_title: string | null;
  company_name: string | null;
}

interface Company {
  id: string;
  company_name: string;
  industry: string | null;
  headquarters: string | null;
  created_at: string;
}

export default function EmployerDashboard() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [myJobs, setMyJobs] = useState<MyJob[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (user && user.role_id !== 2) { router.push("/dashboard"); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [jobsRes, companiesRes] = await Promise.allSettled([
        api.get("/jobs/my", { params: { page: 1, page_size: 50 } }),
        api.get("/jobs/companies"),
      ]);
      if (jobsRes.status === "fulfilled") { setMyJobs(jobsRes.value.data.items); setTotalJobs(jobsRes.value.data.total); }
      if (companiesRes.status === "fulfilled") setCompanies(companiesRes.value.data);
    } catch {}
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "jobs", label: "My Jobs", icon: "💼" },
    { id: "applicants", label: "Applicants", icon: "📋" },
    { id: "post-job", label: "Post a Job", icon: "➕" },
    { id: "companies", label: "Companies", icon: "🏢" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[60px] bg-[var(--color-ink)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CT" width={30} height={30} className="w-[30px] h-[30px] object-contain invert" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold text-[var(--color-cream)]">Employer Dashboard</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[0.78rem] text-[rgba(245,242,236,0.5)]">{user?.full_name}</span>
          <Link href="/" className="text-[0.78rem] text-[rgba(245,242,236,0.5)] hover:text-[var(--color-cream)]">View Site</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="text-[0.78rem] text-[var(--color-warm)]">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-[240px] shrink-0 hidden lg:block">
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-4 sticky top-[76px]">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[rgba(26,23,20,0.06)]">
              <div className="w-10 h-10 rounded-full bg-[var(--color-lime)] flex items-center justify-center font-[var(--font-serif)] text-[0.9rem] font-semibold text-[var(--color-ink)]">
                {user?.full_name?.[0]?.toUpperCase() || "E"}
              </div>
              <div>
                <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">{user?.full_name}</p>
                <p className="text-[0.68rem] text-[var(--color-ink4)]">Employer</p>
              </div>
            </div>
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[10px] text-left text-[0.85rem] mb-1 transition-all ${activeTab === t.id ? "bg-[var(--color-ink)] text-[var(--color-cream)] font-medium" : "text-[var(--color-ink3)] hover:bg-[var(--color-cream2)] hover:text-[var(--color-ink)]"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "overview" && <OverviewTab myJobs={myJobs} totalJobs={totalJobs} />}
          {activeTab === "jobs" && <MyJobsTab jobs={myJobs} onRefresh={loadData} />}
          {activeTab === "applicants" && <ApplicantsTab jobs={myJobs} />}
          {activeTab === "post-job" && <PostJobTab companies={companies} onPosted={loadData} />}
          {activeTab === "companies" && <CompaniesTab companies={companies} onRefresh={loadData} />}
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ myJobs, totalJobs }: { myJobs: MyJob[]; totalJobs: number }) {
  const openJobs = myJobs.filter((j) => j.status === "OPEN").length;
  const closedJobs = myJobs.filter((j) => j.status === "CLOSED").length;

  return (
    <div>
      <h2 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-6">Employer Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6">
          <p className="text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-2">Total Jobs Posted</p>
          <p className="font-[var(--font-serif)] text-[2rem] font-semibold text-[var(--color-ink)]">{totalJobs}</p>
        </div>
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6">
          <p className="text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-2">Open Jobs</p>
          <p className="font-[var(--font-serif)] text-[2rem] font-semibold text-[var(--color-teal)]">{openJobs}</p>
        </div>
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6">
          <p className="text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-2">Closed Jobs</p>
          <p className="font-[var(--font-serif)] text-[2rem] font-semibold text-[var(--color-ink3)]">{closedJobs}</p>
        </div>
      </div>

      {/* Recent jobs */}
      <h3 className="text-[0.9rem] font-medium text-[var(--color-ink)] mb-3">Recent Job Postings</h3>
      <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] overflow-hidden">
        {myJobs.slice(0, 5).map((j) => (
          <div key={j.id} className="flex items-center justify-between px-5 py-4 border-b border-[rgba(26,23,20,0.04)] last:border-0 hover:bg-[var(--color-cream)] transition-colors">
            <div>
              <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">{j.title}</p>
              <p className="text-[0.72rem] text-[var(--color-ink4)]">{j.company_name} · {j.location || "Remote"}</p>
            </div>
            <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-medium ${j.status === "OPEN" ? "bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>{j.status}</span>
          </div>
        ))}
        {myJobs.length === 0 && <p className="text-center py-8 text-[0.85rem] text-[var(--color-ink4)]">No jobs posted yet.</p>}
      </div>
    </div>
  );
}

// ─── My Jobs ──────────────────────────────────────────────────────────────────
function MyJobsTab({ jobs, onRefresh }: { jobs: MyJob[]; onRefresh: () => void }) {
  const handleDelete = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;
    try { await api.delete(`/jobs/${jobId}`); toast.success("Job deleted"); onRefresh(); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const handleStatusChange = async (jobId: string, status: string) => {
    try { await api.patch(`/jobs/${jobId}`, { status }); toast.success(`Job ${status.toLowerCase()}`); onRefresh(); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  return (
    <div>
      <h2 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-5">My Job Postings ({jobs.length})</h2>
      <div className="space-y-3">
        {jobs.map((j) => (
          <div key={j.id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 flex items-center justify-between group hover:shadow-sm transition-all">
            <div className="flex-1 min-w-0">
              <h3 className="text-[0.92rem] font-medium text-[var(--color-ink)]">{j.title}</h3>
              <p className="text-[0.75rem] text-[var(--color-ink3)] mt-0.5">{j.company_name} · {j.location || "Remote"} · {j.employment_type || "—"}</p>
              <p className="text-[0.68rem] text-[var(--color-ink4)] mt-1">Posted {new Date(j.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={j.status} onChange={(e) => handleStatusChange(j.id, e.target.value)} className="text-[0.75rem] px-2 py-1.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[8px] focus:outline-none focus:border-[var(--color-teal)]">
                <option value="OPEN">OPEN</option>
                <option value="CLOSED">CLOSED</option>
                <option value="PAUSED">PAUSED</option>
              </select>
              <Link href={`/jobs/${j.id}`} className="text-[0.72rem] px-3 py-1.5 border border-[rgba(26,23,20,0.08)] rounded-full text-[var(--color-ink3)] hover:text-[var(--color-ink)]">View</Link>
              <button onClick={() => handleDelete(j.id)} className="text-[0.72rem] px-3 py-1.5 text-[var(--color-warm)] hover:bg-[rgba(232,128,58,0.08)] rounded-full opacity-0 group-hover:opacity-100 transition-all">Delete</button>
            </div>
          </div>
        ))}
        {jobs.length === 0 && (
          <div className="text-center py-12 bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px]">
            <p className="text-[1.5rem] mb-2">💼</p>
            <p className="text-[0.85rem] text-[var(--color-ink4)]">No jobs posted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Applicants ───────────────────────────────────────────────────────────────
function ApplicantsTab({ jobs }: { jobs: MyJob[] }) {
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadApplicants = async (jobId: string) => {
    if (!jobId) { setApplicants([]); return; }
    setIsLoading(true);
    try {
      const res = await api.get(`/jobs/${jobId}/applicants`, { params: { page: 1, page_size: 50 } });
      setApplicants(res.data.items);
    } catch { setApplicants([]); }
    finally { setIsLoading(false); }
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId);
    loadApplicants(jobId);
  };

  return (
    <div>
      <h2 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-5">Job Applicants</h2>

      {/* Job selector */}
      <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 mb-5">
        <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-2">Select a Job</label>
        <select value={selectedJob} onChange={(e) => handleJobSelect(e.target.value)} className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)]">
          <option value="">Choose a job to view applicants...</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>{j.title} ({j.status})</option>
          ))}
        </select>
      </div>

      {/* Applicants list */}
      {selectedJob && (
        isLoading ? (
          <p className="text-[0.85rem] text-[var(--color-ink4)]">Loading applicants...</p>
        ) : applicants.length > 0 ? (
          <div className="space-y-3">
            {applicants.map((a) => (
              <div key={a.id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 flex items-center justify-between">
                <div>
                  <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">Applicant</p>
                  <p className="text-[0.75rem] text-[var(--color-ink3)] mt-0.5">Applied {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[0.7rem] px-2.5 py-1 rounded-full font-medium ${a.application_status === "APPLIED" ? "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]" : "bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)]"}`}>
                    {a.application_status}
                  </span>
                  {a.resume_url && (
                    <a href={a.resume_url} target="_blank" rel="noopener" className="text-[0.72rem] px-3 py-1.5 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full font-medium hover:bg-[var(--color-lime2)] transition-colors">
                      View Resume
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px]">
            <p className="text-[1.5rem] mb-2">📋</p>
            <p className="text-[0.85rem] text-[var(--color-ink4)]">No applicants for this job yet.</p>
          </div>
        )
      )}

      {!selectedJob && (
        <div className="text-center py-10 bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px]">
          <p className="text-[0.85rem] text-[var(--color-ink4)]">Select a job above to view its applicants.</p>
        </div>
      )}
    </div>
  );
}

// ─── Post Job ─────────────────────────────────────────────────────────────────
function PostJobTab({ companies, onPosted }: { companies: Company[]; onPosted: () => void }) {
  const [form, setForm] = useState({
    company_id: "",
    title: "",
    description: "",
    employment_type: "Full-time",
    experience_required: "",
    salary_min: "",
    salary_max: "",
    location: "",
    remote_type: "On-site",
    job_category: "white_collar",
    skills: "",
  });
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!form.company_id || !form.title || !form.description) {
      toast.error("Please fill company, title, and description");
      return;
    }
    setIsPosting(true);
    try {
      const payload: any = {
        company_id: form.company_id,
        title: form.title,
        description: form.description,
        employment_type: form.employment_type,
        remote_type: form.remote_type,
        job_category: form.job_category,
      };
      if (form.experience_required) payload.experience_required = form.experience_required;
      if (form.salary_min) payload.salary_min = Number(form.salary_min);
      if (form.salary_max) payload.salary_max = Number(form.salary_max);
      if (form.location) payload.location = form.location;
      if (form.skills) payload.skills = form.skills.split(",").map((s: string) => s.trim()).filter(Boolean);

      await api.post("/jobs/", payload);
      toast.success("Job posted successfully!");
      setForm({ company_id: "", title: "", description: "", employment_type: "Full-time", experience_required: "", salary_min: "", salary_max: "", location: "", remote_type: "On-site", job_category: "white_collar", skills: "" });
      onPosted();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed to post job"); }
    finally { setIsPosting(false); }
  };

  return (
    <div>
      <h2 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-5">Post a New Job</h2>
      <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-7">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Company *</label>
            <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
              <option value="">Select a company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Job Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description, responsibilities, requirements..." rows={5} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Employment Type</label>
            <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
              <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Remote Type</label>
            <select value={form.remote_type} onChange={(e) => setForm({ ...form, remote_type: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
              <option>On-site</option><option>Remote</option><option>Hybrid</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Category</label>
            <select value={form.job_category} onChange={(e) => setForm({ ...form, job_category: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
              <option value="white_collar">White Collar</option><option value="blue_collar">Blue Collar</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Experience Required</label>
            <input type="text" value={form.experience_required} onChange={(e) => setForm({ ...form, experience_required: e.target.value })} placeholder="e.g. 2-4 years" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Salary Min (₹)</label>
            <input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} placeholder="e.g. 800000" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Salary Max (₹)</label>
            <input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} placeholder="e.g. 1500000" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore, India" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Skills (comma-separated)</label>
            <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, TypeScript, Node.js" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
        </div>

        <button onClick={handlePost} disabled={isPosting} className="mt-6 px-8 py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.88rem] font-medium hover:bg-[var(--color-ink2)] disabled:opacity-50 transition-all">
          {isPosting ? "Posting..." : "Post Job"}
        </button>
      </div>
    </div>
  );
}

// ─── Companies ────────────────────────────────────────────────────────────────
function CompaniesTab({ companies, onRefresh }: { companies: Company[]; onRefresh: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company_name: "", company_description: "", industry: "", headquarters: "", company_size: "", website: "" });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!form.company_name.trim()) return;
    setIsCreating(true);
    try {
      const payload: any = { company_name: form.company_name };
      if (form.company_description) payload.company_description = form.company_description;
      if (form.industry) payload.industry = form.industry;
      if (form.headquarters) payload.headquarters = form.headquarters;
      if (form.company_size) payload.company_size = form.company_size;
      if (form.website) payload.website = form.website;
      await api.post("/jobs/companies", payload);
      toast.success("Company created!");
      setForm({ company_name: "", company_description: "", industry: "", headquarters: "", company_size: "", website: "" });
      setShowCreate(false);
      onRefresh();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setIsCreating(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)]">My Companies ({companies.length})</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.82rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
          + Add Company
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-5">
          <h3 className="text-[0.9rem] font-medium text-[var(--color-ink)] mb-4">Create Company</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name *" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} placeholder="Headquarters" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} placeholder="Size (e.g. 50-200)" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="Website URL" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <textarea value={form.company_description} onChange={(e) => setForm({ ...form, company_description: e.target.value })} placeholder="Description" className="px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none" rows={2} />
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={!form.company_name.trim() || isCreating} className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.82rem] font-medium disabled:opacity-50">{isCreating ? "Creating..." : "Create"}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 text-[0.82rem] text-[var(--color-ink3)]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {companies.map((c) => (
          <div key={c.id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 flex items-center justify-between">
            <div>
              <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{c.company_name}</p>
              <p className="text-[0.72rem] text-[var(--color-ink4)]">{[c.industry, c.headquarters].filter(Boolean).join(" · ") || "—"}</p>
            </div>
            <span className="text-[0.72rem] text-[var(--color-ink4)]">Created {new Date(c.created_at).toLocaleDateString()}</span>
          </div>
        ))}
        {companies.length === 0 && <p className="text-center py-8 text-[0.85rem] text-[var(--color-ink4)]">No companies yet. Create one to start posting jobs.</p>}
      </div>
    </div>
  );
}
