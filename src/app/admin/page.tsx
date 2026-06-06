"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { adminApi } from "@/modules/admin/api";
import type { DashboardStats, AdminUser, AdminJob, AdminFeedPost, AdminCompany } from "@/modules/admin/api";
import { toast } from "sonner";

type Tab = "dashboard" | "users" | "jobs" | "feed" | "companies" | "groups" | "partners";

export default function AdminPage() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    // Don't redirect until user is hydrated
    if (user && user.role_id !== 4) { router.push("/dashboard"); return; }
    if (user) loadStats();
    else {
      // user not hydrated yet, try loading stats anyway (token exists)
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const s = await adminApi.getDashboard();
      setStats(s);
    } catch { /* not admin */ }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#0f0f12] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[1.5rem] mb-3">🔒</p>
          <p className="text-gray-400 mb-4">Admin access required.</p>
          <Link href="/dashboard" className="px-6 py-2.5 bg-white text-black rounded-lg text-[0.85rem] font-medium">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: string; comingSoon?: boolean }[] = [
    { id: "dashboard", label: "Overview", icon: "📊" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "jobs", label: "Jobs", icon: "💼" },
    { id: "feed", label: "Feed", icon: "📰" },
    { id: "companies", label: "Companies", icon: "🏢" },
    { id: "groups", label: "Group Mgmt", icon: "🏘️", comingSoon: true },
    { id: "partners", label: "Promotional Partners", icon: "🤝", comingSoon: true },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f12] text-white">
      {/* Top bar */}
      <header className="h-[56px] bg-[#18181b] border-b border-[#2a2a2e] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center text-[0.7rem] font-bold">CT</div>
          <span className="text-[0.95rem] font-semibold text-white hidden sm:inline">ChitranshTech Admin</span>
          <span className="text-[0.95rem] font-semibold text-white sm:hidden">Admin</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-[0.75rem] text-gray-400 hidden sm:inline">Welcome, {user?.full_name || "Admin"}</span>
          <Link href="/" className="text-[0.75rem] text-gray-400 hover:text-white transition-colors hidden sm:inline">View Site</Link>
          <button onClick={() => { logout(); router.push("/login"); }} className="text-[0.75rem] text-red-400 hover:text-red-300 transition-colors">Logout</button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Mobile tab selector */}
        <div className="lg:hidden overflow-x-auto bg-[#18181b] border-b border-[#2a2a2e] px-4 py-2">
          <div className="flex gap-1 min-w-max">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => !t.comingSoon && setActiveTab(t.id)}
                disabled={t.comingSoon}
                className={`px-3 py-2 rounded-lg text-[0.75rem] font-medium whitespace-nowrap transition-all ${
                  t.comingSoon
                    ? "text-gray-600 cursor-not-allowed opacity-60"
                    : activeTab === t.id
                    ? "bg-white/10 text-white"
                    : "text-gray-400"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="w-[220px] min-h-[calc(100vh-56px)] bg-[#18181b] border-r border-[#2a2a2e] p-4 sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto hidden lg:block">
          <p className="text-[0.65rem] text-gray-500 uppercase tracking-[0.1em] mb-3 px-3">Navigation</p>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => !t.comingSoon && setActiveTab(t.id)}
              disabled={t.comingSoon}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[0.82rem] mb-1 transition-all ${
                t.comingSoon
                  ? "text-gray-600 cursor-not-allowed opacity-60"
                  : activeTab === t.id
                  ? "bg-white/10 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-[0.9rem]">{t.icon}</span>
              <span className="flex-1">{t.label}</span>
              {t.comingSoon && <span className="text-[0.55rem] px-1.5 py-0.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded">SOON</span>}
            </button>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === "dashboard" && <DashboardTab stats={stats} />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "jobs" && <JobsTab />}
          {activeTab === "feed" && <FeedTab />}
          {activeTab === "companies" && <CompaniesTab />}
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────
function DashboardTab({ stats }: { stats: DashboardStats }) {
  const cards = [
    { label: "Total Users", value: stats.total_users, change: `+${stats.new_users_last_7_days} this week`, color: "from-blue-500 to-blue-700" },
    { label: "Job Seekers", value: stats.total_job_seekers, change: "", color: "from-teal-500 to-teal-700" },
    { label: "Employers", value: stats.total_employers, change: "", color: "from-purple-500 to-purple-700" },
    { label: "Total Jobs", value: stats.total_jobs, change: `+${stats.new_jobs_last_7_days} this week`, color: "from-green-500 to-green-700" },
    { label: "Open Jobs", value: stats.open_jobs, change: "", color: "from-emerald-500 to-emerald-700" },
    { label: "Applications", value: stats.total_applications, change: `+${stats.new_applications_last_7_days} this week`, color: "from-orange-500 to-orange-700" },
    { label: "Companies", value: stats.total_companies, change: "", color: "from-pink-500 to-pink-700" },
    { label: "Feed Posts", value: stats.total_feed_posts, change: "", color: "from-indigo-500 to-indigo-700" },
  ];

  return (
    <div>
      <h2 className="text-[1.4rem] font-semibold text-white mb-6">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#18181b] border border-[#2a2a2e] rounded-xl p-5 hover:border-[#3a3a3e] transition-colors">
            <p className="text-[0.7rem] text-gray-500 uppercase tracking-[0.06em] mb-2">{c.label}</p>
            <p className="text-[1.8rem] font-bold text-white">{c.value.toLocaleString()}</p>
            {c.change && <p className="text-[0.7rem] text-green-400 mt-1">{c.change}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = async (p = 1) => {
    try {
      const res = await adminApi.listUsers({ page: p, page_size: 15, search: search || undefined });
      setUsers(res.items); setTotal(res.total); setPage(p);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (userId: string, status: string) => {
    try { await adminApi.updateUserStatus(userId, status); toast.success(`User ${status.toLowerCase()}`); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const handleRoleChange = async (userId: string, role_id: number) => {
    try { await adminApi.updateUserRole(userId, role_id); toast.success("Role updated"); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try { await adminApi.deleteUser(userId); toast.success("User deleted"); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const statusBadge = (s: string) => {
    if (s === "ACTIVE") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "SUSPENDED") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-[1.4rem] font-semibold text-white">Users <span className="text-gray-500 text-[0.9rem]">({total})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(1)} placeholder="Search name or email..." className="px-3 py-2 bg-[#1e1e22] border border-[#2a2a2e] rounded-lg text-[0.82rem] text-white placeholder:text-gray-500 w-full sm:w-[220px] focus:outline-none focus:border-violet-500" />
          <button onClick={() => load(1)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-[0.8rem] font-medium hover:bg-violet-500 transition-colors shrink-0">Search</button>
        </div>
      </div>

      <div className="bg-[#18181b] border border-[#2a2a2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-[#2a2a2e]">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#2a2a2e] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.role_id} onChange={(e) => handleRoleChange(u.id, Number(e.target.value))} className="bg-[#1e1e22] border border-[#2a2a2e] text-gray-300 text-[0.75rem] rounded px-2 py-1 focus:outline-none focus:border-violet-500">
                      <option value={1}>Seeker</option>
                      <option value={2}>Employer</option>
                      <option value={4}>Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.7rem] px-2 py-0.5 rounded border ${statusBadge(u.status)}`}>{u.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {u.status === "ACTIVE" && <button onClick={() => handleStatusChange(u.id, "SUSPENDED")} className="text-[0.7rem] px-2 py-1 text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors">Suspend</button>}
                      {u.status === "SUSPENDED" && <button onClick={() => handleStatusChange(u.id, "ACTIVE")} className="text-[0.7rem] px-2 py-1 text-green-400 hover:bg-green-500/10 rounded transition-colors">Activate</button>}
                      <button onClick={() => handleDelete(u.id)} className="text-[0.7rem] px-2 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {Math.ceil(total / 15) > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => load(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-500 transition-colors">← Prev</button>
          <span className="text-[0.8rem] text-gray-500 py-1.5 px-2">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / 15)} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30 hover:border-gray-500 transition-colors">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── Jobs Tab ─────────────────────────────────────────────────────────────────
function JobsTab() {
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const load = async (p = 1) => {
    try { const res = await adminApi.listJobs({ page: p, page_size: 15, search: search || undefined }); setJobs(res.items); setTotal(res.total); setPage(p); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (jobId: string, status: string) => {
    try { await adminApi.updateJobStatus(jobId, status); toast.success(`Status → ${status}`); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Delete this job permanently?")) return;
    try { await adminApi.deleteJob(jobId); toast.success("Job deleted"); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const statusBadge = (s: string) => {
    if (s === "OPEN") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (s === "PAUSED") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    return "bg-red-500/10 text-red-400 border-red-500/20";
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-[1.4rem] font-semibold text-white">Jobs <span className="text-gray-500 text-[0.9rem]">({total})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load(1)} placeholder="Search title or company..." className="px-3 py-2 bg-[#1e1e22] border border-[#2a2a2e] rounded-lg text-[0.82rem] text-white placeholder:text-gray-500 w-full sm:w-[220px] focus:outline-none focus:border-violet-500" />
          <button onClick={() => load(1)} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-[0.8rem] font-medium hover:bg-violet-500 shrink-0">Search</button>
        </div>
      </div>

      <div className="bg-[#18181b] border border-[#2a2a2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-[#2a2a2e]">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Applications</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Posted</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-b border-[#2a2a2e] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{j.title}</td>
                  <td className="px-4 py-3 text-gray-400">{j.company_name || "—"}</td>
                  <td className="px-4 py-3">
                    <select value={j.status} onChange={(e) => handleStatusChange(j.id, e.target.value)} className="bg-[#1e1e22] border border-[#2a2a2e] text-gray-300 text-[0.75rem] rounded px-2 py-1 focus:outline-none focus:border-violet-500">
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="PAUSED">PAUSED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-white">{j.application_count}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(j.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(j.id)} className="text-[0.7rem] px-2 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {Math.ceil(total / 15) > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => load(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30">← Prev</button>
          <span className="text-[0.8rem] text-gray-500 py-1.5 px-2">Page {page}</span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / 15)} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── Feed Tab ─────────────────────────────────────────────────────────────────
function FeedTab() {
  const [posts, setPosts] = useState<AdminFeedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = async (p = 1) => {
    try { const res = await adminApi.listPosts({ page: p, page_size: 15 }); setPosts(res.items); setTotal(res.total); setPage(p); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this post?")) return;
    try { await adminApi.deletePost(postId); toast.success("Post removed"); load(page); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  return (
    <div>
      <h2 className="text-[1.4rem] font-semibold text-white mb-5">Feed Moderation <span className="text-gray-500 text-[0.9rem]">({total})</span></h2>

      <div className="bg-[#18181b] border border-[#2a2a2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-[#2a2a2e]">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Author</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Type</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Content</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Engagement</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Date</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-[#2a2a2e] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white">{p.author_name || "Unknown"}</td>
                  <td className="px-4 py-3"><span className="text-[0.7rem] px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">{p.post_type}</span></td>
                  <td className="px-4 py-3 text-gray-400 max-w-[250px] truncate">{p.title || p.content?.slice(0, 60) || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{p.like_count}❤️ {p.comment_count}💬</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-[0.7rem] px-2 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {Math.ceil(total / 15) > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          <button onClick={() => load(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30">← Prev</button>
          <span className="text-[0.8rem] text-gray-500 py-1.5 px-2">Page {page}</span>
          <button onClick={() => load(page + 1)} disabled={page >= Math.ceil(total / 15)} className="px-3 py-1.5 text-[0.78rem] border border-[#2a2a2e] rounded-lg text-gray-400 disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}

// ─── Companies Tab ────────────────────────────────────────────────────────────
function CompaniesTab() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const load = async () => {
    try { const res = await adminApi.listCompanies({ page: 1, page_size: 50, search: search || undefined }); setCompanies(res.items); setTotal(res.total); } catch {}
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (companyId: string) => {
    if (!confirm("Delete this company and all its associated jobs?")) return;
    try { await adminApi.deleteCompany(companyId); toast.success("Company deleted"); load(); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-[1.4rem] font-semibold text-white">Companies <span className="text-gray-500 text-[0.9rem]">({total})</span></h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search company..." className="px-3 py-2 bg-[#1e1e22] border border-[#2a2a2e] rounded-lg text-[0.82rem] text-white placeholder:text-gray-500 w-full sm:w-[200px] focus:outline-none focus:border-violet-500" />
          <button onClick={load} className="px-4 py-2 bg-violet-600 text-white rounded-lg text-[0.8rem] font-medium hover:bg-violet-500 shrink-0">Search</button>
        </div>
      </div>

      <div className="bg-[#18181b] border border-[#2a2a2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[0.8rem]">
            <thead>
              <tr className="border-b border-[#2a2a2e]">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Company</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Industry</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Size</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">HQ</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Active Jobs</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Created</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-[#2a2a2e] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.company_name}</td>
                  <td className="px-4 py-3 text-gray-400">{c.industry || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{c.company_size || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{c.headquarters || "—"}</td>
                  <td className="px-4 py-3 text-white">{c.job_count}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-[0.7rem] px-2 py-1 text-red-400 hover:bg-red-500/10 rounded transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
