"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { api } from "@/lib/api";
import { groupsApi } from "@/modules/groups/api";
import type { Group } from "@/modules/groups/api";
import { toast } from "sonner";

interface ProfileItem {
  user_id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  headline: string | null;
  bio: string | null;
  current_company: string | null;
  current_position: string | null;
  experience_years: number | null;
  location: string | null;
  skills: string[];
}

export default function NetworkPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center"><p className="text-[var(--color-ink3)]">Loading...</p></div>}>
      <NetworkContent />
    </Suspense>
  );
}

function NetworkContent() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("q") || "";

  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({ location: "", skill: "", job_profile: "" });
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeTab, setActiveTab] = useState<"people" | "groups">("people");

  // Load who the current user is following
  const loadFollowing = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/profile/${user.id}/following`);
      const ids = new Set<string>(res.data.items.map((p: any) => p.user_id));
      setFollowingSet(ids);
    } catch { /* ignore */ }
  };

  const loadProfiles = async (p = 1) => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { page: p, page_size: 12 };
      if (search) params.keyword = search;
      if (filters.location) params.location = filters.location;
      if (filters.skill) params.skill = filters.skill;
      if (filters.job_profile) params.job_profile = filters.job_profile;

      const res = await api.get("/profile/search", { params });
      setProfiles(res.data.items);
      setTotal(res.data.total);
      setPage(p);
    } catch { setProfiles([]); }
    finally { setIsLoading(false); }
  };

  const loadGroups = async () => {
    try {
      const res = await groupsApi.listGroups(1, 6, search || undefined);
      setGroups(res.items);
    } catch { setGroups([]); }
  };

  useEffect(() => {
    loadProfiles();
    loadFollowing();
    loadGroups();
  }, [user]);

  const handleFollow = async (userId: string) => {
    if (!user) { toast.error("Please sign in to follow"); return; }
    try {
      const res = await api.post(`/profile/${userId}/follow`);
      const newSet = new Set(followingSet);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      setFollowingSet(newSet);
      toast.success(res.data.message);
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleReset = () => {
    setSearch("");
    setFilters({ location: "", skill: "", job_profile: "" });
    setTimeout(() => loadProfiles(1), 0);
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">ChitranshTech</span>
        </Link>
        <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <li><Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Find Jobs</Link></li>
          <li><Link href="/feed" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Feed</Link></li>
          <li><Link href="/network" className="text-[0.85rem] text-[var(--color-ink)] font-medium border-b-2 border-[var(--color-ink)] pb-0.5">Network</Link></li>
          <li><Link href="/resume/build" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Build ATS CV</Link></li>
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
              <button onClick={() => { logout(); window.location.href = "/"; }} className="text-[0.85rem] text-[var(--color-warm)] px-3 py-1.5 rounded-[10px] hover:bg-[rgba(232,128,58,0.08)] transition-colors">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-8 flex gap-6">
        {/* Left Sidebar — Filters */}
        <aside className="w-[260px] shrink-0 hidden lg:block">
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-5 sticky top-[76px]">
            <h3 className="text-[0.85rem] font-medium text-[var(--color-ink)] mb-4">Search & Filter</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Keyword</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadProfiles(1)}
                  placeholder="Name, headline, bio..."
                  className="w-full px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-[10px] text-[0.82rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="e.g. Bangalore, Delhi"
                  className="w-full px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-[10px] text-[0.82rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Skill</label>
                <input
                  type="text"
                  value={filters.skill}
                  onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
                  placeholder="e.g. React, Python"
                  className="w-full px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-[10px] text-[0.82rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Job Title / Role</label>
                <input
                  type="text"
                  value={filters.job_profile}
                  onChange={(e) => setFilters({ ...filters, job_profile: e.target.value })}
                  placeholder="e.g. Frontend, Manager"
                  className="w-full px-3 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-[10px] text-[0.82rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)] transition-colors"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => loadProfiles(1)} className="flex-1 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-ink2)] transition-colors">
                  Search
                </button>
                <button onClick={handleReset} className="flex-1 py-2.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[0.8rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-colors">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header with tabs */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
            <div>
              <h1 className="font-[var(--font-serif)] text-[1.2rem] sm:text-[1.4rem] font-medium text-[var(--color-ink)]">Discover</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("people")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${activeTab === "people" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-white border border-[rgba(26,23,20,0.08)] text-[var(--color-ink3)]"}`}>
                People ({total})
              </button>
              <button onClick={() => setActiveTab("groups")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${activeTab === "groups" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-white border border-[rgba(26,23,20,0.08)] text-[var(--color-ink3)]"}`}>
                Groups ({groups.length})
              </button>
            </div>
          </div>

          {/* Groups section */}
          {activeTab === "groups" && (
            <>
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groups.map((g) => (
                    <div key={g.id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all">
                      <div className="h-20 bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal2)] relative">
                        {g.cover_image && <img src={g.cover_image} alt="" className="w-full h-full object-cover" />}
                        {g.category && <span className="absolute top-2 right-2 text-[0.6rem] px-2 py-0.5 bg-white/90 rounded-full text-[var(--color-ink3)] capitalize">{g.category.replace("_", " ")}</span>}
                      </div>
                      <div className="p-4">
                        <Link href={`/groups/${g.id}`} className="font-[var(--font-serif)] text-[0.95rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors">
                          {g.name}
                        </Link>
                        {g.description && <p className="text-[0.75rem] text-[var(--color-ink3)] mt-1 line-clamp-2">{g.description}</p>}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[0.7rem] text-[var(--color-ink4)]">👥 {g.member_count} members</span>
                          <Link href={`/groups/${g.id}`} className="text-[0.72rem] px-3 py-1 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full hover:bg-[var(--color-ink2)] transition-colors">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px]">
                  <p className="text-[2rem] mb-3">🏘️</p>
                  <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">No groups yet</h3>
                  <p className="text-[0.85rem] text-[var(--color-ink4)]">Be the first to create one!</p>
                  <Link href="/groups" className="inline-block mt-4 px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.82rem] font-medium">Create a Group</Link>
                </div>
              )}
            </>
          )}

          {/* People section */}
          {activeTab === "people" && (
            <>
          {/* Mobile search */}
          <div className="lg:hidden mb-4 flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadProfiles(1)}
              placeholder="Search people..."
              className="flex-1 px-4 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-full text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]"
            />
            <button onClick={() => loadProfiles(1)} className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.82rem] font-medium">Search</button>
          </div>

          {/* Results grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-5 animate-pulse">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--color-cream2)] mb-3" />
                    <div className="h-4 w-24 bg-[var(--color-cream2)] rounded mb-2" />
                    <div className="h-3 w-32 bg-[var(--color-cream2)] rounded mb-3" />
                    <div className="h-8 w-full bg-[var(--color-cream2)] rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : profiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {profiles.map((p) => {
                const isFollowed = followingSet.has(p.user_id);
                return (
                  <div key={p.user_id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] overflow-hidden hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] transition-all">
                    {/* Banner */}
                    <div className="h-16 bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal2)] relative">
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                        <div className="w-16 h-16 rounded-full bg-[var(--color-cream)] border-3 border-white flex items-center justify-center font-[var(--font-serif)] text-[1.3rem] font-semibold text-[var(--color-ink)] shadow-sm">
                          {p.full_name?.[0]?.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="pt-10 pb-5 px-5 text-center">
                      <Link href={`/profile/${p.user_id}`} className="text-[0.95rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors">
                        {p.full_name}
                      </Link>
                      <p className="text-[0.75rem] text-[var(--color-ink3)] mt-0.5 line-clamp-1">
                        {p.headline || p.current_position || p.email}
                      </p>

                      {(p.location || p.current_company) && (
                        <div className="flex items-center justify-center gap-3 mt-2 text-[0.7rem] text-[var(--color-ink4)]">
                          {p.location && <span>📍 {p.location}</span>}
                          {p.current_company && <span>🏢 {p.current_company}</span>}
                        </div>
                      )}

                      {p.skills.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                          {p.skills.slice(0, 3).map((s) => (
                            <span key={s} className="text-[0.65rem] px-2 py-0.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-full text-[var(--color-ink3)]">
                              {s}
                            </span>
                          ))}
                          {p.skills.length > 3 && <span className="text-[0.65rem] text-[var(--color-ink4)]">+{p.skills.length - 3}</span>}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Link href={`/profile/${p.user_id}`} className="flex-1 py-2 border border-[rgba(26,23,20,0.08)] rounded-full text-[0.78rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] text-center transition-all">
                          View Profile
                        </Link>
                        {user && user.id !== p.user_id && (
                          <button
                            onClick={() => handleFollow(p.user_id)}
                            className={`flex-1 py-2 rounded-full text-[0.78rem] font-medium transition-all ${
                              isFollowed
                                ? "bg-[var(--color-cream2)] text-[var(--color-ink3)] border border-[rgba(26,23,20,0.08)] hover:border-[var(--color-warm)] hover:text-[var(--color-warm)]"
                                : "bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink2)]"
                            }`}
                          >
                            {isFollowed ? "Unfollow" : "Follow"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px]">
              <p className="text-[2rem] mb-3">👥</p>
              <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">No people found</h3>
              <p className="text-[0.85rem] text-[var(--color-ink4)]">Try different search terms or clear your filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && activeTab === "people" && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => loadProfiles(page - 1)} disabled={page <= 1} className="px-4 py-2 text-[0.8rem] border border-[rgba(26,23,20,0.1)] rounded-full hover:bg-white disabled:opacity-40 transition-colors">← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <button key={i + 1} onClick={() => loadProfiles(i + 1)} className={`w-9 h-9 rounded-full text-[0.8rem] font-medium transition-all ${page === i + 1 ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "hover:bg-white text-[var(--color-ink3)]"}`}>{i + 1}</button>
              ))}
              <button onClick={() => loadProfiles(page + 1)} disabled={page >= totalPages} className="px-4 py-2 text-[0.8rem] border border-[rgba(26,23,20,0.1)] rounded-full hover:bg-white disabled:opacity-40 transition-colors">Next →</button>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
