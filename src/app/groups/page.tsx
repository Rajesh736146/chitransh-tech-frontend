"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { groupsApi } from "@/modules/groups/api";
import type { Group } from "@/modules/groups/api";
import { toast } from "sonner";

export default function GroupsPage() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState<"discover" | "my">("discover");
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const res = tab === "my"
        ? await groupsApi.getMyGroups()
        : await groupsApi.listGroups(1, 20, search || undefined);
      setGroups(res.items);
      setTotal(res.total);
    } catch { setGroups([]); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadGroups(); }, [tab]);

  const handleJoinLeave = async (group: Group) => {
    if (!user) { toast.error("Please sign in"); return; }
    try {
      if (group.is_member) {
        await groupsApi.leaveGroup(group.id);
        toast.success("Left group");
      } else {
        await groupsApi.joinGroup(group.id);
        toast.success("Joined group!");
      }
      loadGroups();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

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
          <li><Link href="/network" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Network</Link></li>
          <li><Link href="/groups" className="text-[0.85rem] text-[var(--color-ink)] font-medium border-b-2 border-[var(--color-ink)] pb-0.5">Groups</Link></li>
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <button onClick={() => { logout(); window.location.href = "/"; }} className="text-[0.85rem] text-[var(--color-warm)] px-3 py-1.5 rounded-[10px] hover:bg-[rgba(232,128,58,0.08)] transition-colors">Sign Out</button>
          ) : (
            <Link href="/login" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-[var(--font-serif)] text-[1.2rem] sm:text-[1.4rem] font-medium text-[var(--color-ink)]">Groups</h1>
          {user && (
            <button onClick={() => setShowCreate(true)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.82rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
              + Create Group
            </button>
          )}
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex gap-2">
            <button onClick={() => setTab("discover")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${tab === "discover" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-white border border-[rgba(26,23,20,0.08)] text-[var(--color-ink3)]"}`}>
              Discover
            </button>
            <button onClick={() => setTab("my")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${tab === "my" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-white border border-[rgba(26,23,20,0.08)] text-[var(--color-ink3)]"}`}>
              My Groups
            </button>
          </div>
          {tab === "discover" && (
            <div className="flex-1 flex gap-2 max-w-[400px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadGroups()}
                placeholder="Search groups..."
                className="flex-1 px-4 py-2 bg-white border border-[rgba(26,23,20,0.08)] rounded-full text-[0.82rem] focus:outline-none focus:border-[var(--color-teal)]"
              />
              <button onClick={loadGroups} className="px-4 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem]">Search</button>
            </div>
          )}
          <span className="text-[0.78rem] text-[var(--color-ink4)] ml-auto">{total} groups</span>
        </div>

        {/* Groups grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] overflow-hidden animate-pulse">
                <div className="h-24 bg-[var(--color-cream2)]" />
                <div className="p-5"><div className="h-4 w-28 bg-[var(--color-cream2)] rounded mb-2" /><div className="h-3 w-full bg-[var(--color-cream2)] rounded" /></div>
              </div>
            ))}
          </div>
        ) : groups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.id} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] overflow-hidden hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[1px] transition-all">
                {/* Cover */}
                <div className="h-24 bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal2)] relative">
                  {g.cover_image && <img src={g.cover_image} alt="" className="w-full h-full object-cover" />}
                  {g.category && (
                    <span className="absolute top-2 right-2 text-[0.6rem] px-2 py-0.5 bg-white/90 rounded-full text-[var(--color-ink3)] capitalize">{g.category.replace("_", " ")}</span>
                  )}
                </div>

                <div className="p-5">
                  <Link href={`/groups/${g.id}`} className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors">
                    {g.name}
                  </Link>
                  {g.description && (
                    <p className="text-[0.78rem] text-[var(--color-ink3)] mt-1 line-clamp-2">{g.description}</p>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[0.72rem] text-[var(--color-ink4)]">{g.member_count} members</span>
                    {user && (
                      <button
                        onClick={() => handleJoinLeave(g)}
                        className={`px-4 py-1.5 rounded-full text-[0.75rem] font-medium transition-all ${
                          g.is_member
                            ? "bg-[var(--color-cream2)] text-[var(--color-ink3)] border border-[rgba(26,23,20,0.08)] hover:border-[var(--color-warm)] hover:text-[var(--color-warm)]"
                            : "bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink2)]"
                        }`}
                      >
                        {g.is_member ? "Leave" : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px]">
            <p className="text-[2rem] mb-3">👥</p>
            <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">
              {tab === "my" ? "You haven't joined any groups" : "No groups found"}
            </h3>
            <p className="text-[0.85rem] text-[var(--color-ink4)]">
              {tab === "my" ? "Discover and join groups to connect with like-minded professionals." : "Try a different search."}
            </p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setTab("my"); loadGroups(); }} />}
    </div>
  );
}

// ─── Create Group Modal ───────────────────────────────────────────────────────
function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (description) formData.append("description", description);
      if (file) formData.append("cover_image", file);
      await groupsApi.createGroup(formData);
      toast.success("Group created!");
      onCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create group");
    } finally { setIsCreating(false); }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-[480px] shadow-xl">
        <h3 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-5">Create a Group</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Group Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Frontend Developers India" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this group about?" rows={3} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none" />
          </div>
          <div>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Cover Image</label>
            <button onClick={() => fileRef.current?.click()} className="w-full py-3 border-2 border-dashed border-[rgba(26,23,20,0.1)] rounded-[10px] text-[0.82rem] text-[var(--color-ink3)] hover:border-[var(--color-teal)] transition-colors">
              {file ? `📷 ${file.name}` : "Click to upload cover image"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[0.85rem] text-[var(--color-ink3)]">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating} className="flex-1 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium disabled:opacity-50 transition-all">
            {isCreating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}
