"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { profileApi } from "@/modules/profile/api";
import { api } from "@/lib/api";
import { groupsApi } from "@/modules/groups/api";
import type { Group } from "@/modules/groups/api";
import type { ProfileData, Skill, Education, Experience, JobApplication } from "@/modules/profile/api";
import { toast } from "sonner";

type Tab = "profile" | "skills" | "education" | "experience" | "applications" | "network" | "groups" | "my-jobs" | "applicants" | "post-job" | "companies";

export default function DashboardPage() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const isEmployer = user?.role_id === 2;
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const p = await profileApi.getMyProfile();
      setProfile(p);
      const [sk, ed, ex] = await Promise.all([
        profileApi.getMySkills(p.user_id),
        profileApi.getEducation(p.user_id),
        profileApi.getExperience(p.user_id),
      ]);
      setSkills(sk);
      setEducation(ed);
      setExperience(ex);
      const apps = await profileApi.getMyApplications();
      setApplications(apps.items);
    } catch {
      // not logged in
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[0.85rem] text-[var(--color-ink3)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[1.5rem] mb-3">🔒</p>
          <p className="text-[var(--color-ink3)] mb-4">Please sign in to access your dashboard.</p>
          <Link href="/login" className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium">Sign In</Link>
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: string }[] = isEmployer ? [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "my-jobs", label: "My Jobs", icon: "💼" },
    { id: "applicants", label: "Applicants", icon: "📋" },
    { id: "post-job", label: "Post a Job", icon: "➕" },
    { id: "companies", label: "Companies", icon: "🏢" },
    { id: "network", label: "Network", icon: "👥" },
    { id: "groups", label: "Groups", icon: "🏘️" },
  ] : [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "skills", label: "Skills", icon: "🎯" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "experience", label: "Experience", icon: "💼" },
    { id: "applications", label: "Applications", icon: "📋" },
    { id: "network", label: "Network", icon: "👥" },
    { id: "groups", label: "Groups", icon: "🏘️" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em]">ChitranshTech</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors hidden sm:inline">Find Jobs</Link>
          <Link href="/feed" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors hidden sm:inline">Feed</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="text-[0.85rem] text-[var(--color-warm)] px-3 py-1.5 rounded-[10px] hover:bg-[rgba(232,128,58,0.08)] transition-colors">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-8 flex gap-6">
        {/* Left sidebar */}
        <div className="w-[280px] shrink-0 hidden lg:block">
          {/* Profile card */}
          <div className="bg-[var(--color-ink)] rounded-[20px] p-6 mb-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[rgba(200,230,60,0.1)] rounded-full blur-[40px]" />
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[var(--color-cream)] flex items-center justify-center font-[var(--font-serif)] text-[1.3rem] font-semibold text-[var(--color-ink)] mb-3">
                {profile.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <h2 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-cream)] tracking-[-0.01em]">
                {profile.full_name}
              </h2>
              <p className="text-[0.78rem] text-[rgba(245,242,236,0.5)] mt-0.5">{profile.headline || profile.current_position || profile.email}</p>
              {profile.location && <p className="text-[0.72rem] text-[rgba(245,242,236,0.35)] mt-1">📍 {profile.location}</p>}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-[rgba(245,242,236,0.08)]">
              <div className="text-center">
                <p className="font-[var(--font-serif)] text-[1rem] font-semibold text-[var(--color-lime)]">{profile.follower_count}</p>
                <p className="text-[0.6rem] text-[rgba(245,242,236,0.4)] uppercase tracking-[0.05em]">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-[var(--font-serif)] text-[1rem] font-semibold text-[var(--color-lime)]">{profile.following_count}</p>
                <p className="text-[0.6rem] text-[rgba(245,242,236,0.4)] uppercase tracking-[0.05em]">Following</p>
              </div>
              <div className="text-center">
                <p className="font-[var(--font-serif)] text-[1rem] font-semibold text-[var(--color-lime)]">{profile.profile_view_count}</p>
                <p className="text-[0.6rem] text-[rgba(245,242,236,0.4)] uppercase tracking-[0.05em]">Views</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-left text-[0.85rem] transition-all mb-1 last:mb-0 ${
                  activeTab === tab.id
                    ? "bg-[var(--color-ink)] text-[var(--color-cream)] font-medium"
                    : "text-[var(--color-ink3)] hover:bg-[var(--color-cream2)] hover:text-[var(--color-ink)]"
                }`}
              >
                <span className="text-[0.9rem]">{tab.icon}</span>
                {tab.label}
                {tab.id === "applications" && applications.length > 0 && (
                  <span className={`ml-auto text-[0.68rem] px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[var(--color-lime)] text-[var(--color-ink)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
                    {applications.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile tabs */}
          <div className="lg:hidden flex gap-1 mb-6 bg-white border border-[rgba(26,23,20,0.06)] rounded-full p-1 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-[0.78rem] font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[var(--color-ink)] text-[var(--color-cream)]"
                    : "text-[var(--color-ink3)] hover:text-[var(--color-ink)]"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "profile" && <ProfileTab profile={profile} onUpdate={loadProfile} />}
          {activeTab === "skills" && <SkillsTab skills={skills} userId={profile.user_id} onUpdate={loadProfile} />}
          {activeTab === "education" && <EducationTab education={education} onUpdate={loadProfile} />}
          {activeTab === "experience" && <ExperienceTab experience={experience} onUpdate={loadProfile} />}
          {activeTab === "applications" && <ApplicationsTab applications={applications} />}
          {activeTab === "my-jobs" && <EmployerJobsTab />}
          {activeTab === "applicants" && <EmployerApplicantsTab />}
          {activeTab === "post-job" && <EmployerPostJobTab />}
          {activeTab === "companies" && <EmployerCompaniesTab />}
          {activeTab === "network" && <NetworkTab userId={profile.user_id} />}
          {activeTab === "groups" && <GroupsTab />}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ profile, onUpdate }: { profile: ProfileData; onUpdate: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      headline: profile.headline || "",
      bio: profile.bio || "",
      current_company: profile.current_company || "",
      current_position: profile.current_position || "",
      experience_years: profile.experience_years || "",
      location: profile.location || "",
      notice_period: profile.notice_period || "",
      portfolio_url: profile.portfolio_url || "",
      linkedin_url: profile.linkedin_url || "",
      github_url: profile.github_url || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const data: any = {};
      Object.entries(form).forEach(([k, v]) => { if (v !== "") data[k] = v; });
      if (form.experience_years) data.experience_years = Number(form.experience_years);
      await profileApi.updateProfile(data);
      toast.success("Profile updated!");
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">Personal Information</h2>
            <button onClick={startEdit} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
              ✏️ Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: "Full Name", value: profile.full_name },
              { label: "Email", value: profile.email },
              { label: "Phone", value: profile.phone },
              { label: "Location", value: profile.location },
              { label: "Headline", value: profile.headline },
              { label: "Current Company", value: profile.current_company },
              { label: "Current Position", value: profile.current_position },
              { label: "Experience", value: profile.experience_years ? `${profile.experience_years} years` : null },
              { label: "Notice Period", value: profile.notice_period },
              { label: "Portfolio", value: profile.portfolio_url },
              { label: "LinkedIn", value: profile.linkedin_url },
              { label: "GitHub", value: profile.github_url },
            ].map((item) => (
              <div key={item.label} className="border-b border-[rgba(26,23,20,0.04)] pb-3">
                <p className="text-[0.7rem] text-[var(--color-ink4)] uppercase tracking-[0.06em] mb-1">{item.label}</p>
                <p className="text-[0.88rem] text-[var(--color-ink)]">{item.value || <span className="text-[var(--color-ink4)] italic">Not set</span>}</p>
              </div>
            ))}
          </div>
        </div>

        {profile.bio && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-3">About</h3>
            <p className="text-[0.88rem] text-[var(--color-ink2)] leading-[1.8]">{profile.bio}</p>
          </div>
        )}
      </div>
    );
  }

  const fields = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "headline", label: "Headline", type: "text" },
    { key: "location", label: "Location", type: "text" },
    { key: "current_company", label: "Current Company", type: "text" },
    { key: "current_position", label: "Current Position", type: "text" },
    { key: "experience_years", label: "Experience (years)", type: "number" },
    { key: "notice_period", label: "Notice Period", type: "text" },
    { key: "portfolio_url", label: "Portfolio URL", type: "url" },
    { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
    { key: "github_url", label: "GitHub URL", type: "url" },
  ];

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)] mb-6">Edit Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.04em] mb-1.5">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key] || ""}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)] focus:bg-white transition-all"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.04em] mb-1.5">Bio</label>
        <textarea
          value={form.bio || ""}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-teal)] focus:bg-white transition-all resize-none"
        />
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={handleSave} disabled={isSaving} className="px-7 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium hover:bg-[var(--color-ink2)] disabled:opacity-50 transition-all">
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button onClick={() => setIsEditing(false)} className="px-7 py-2.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Skills Tab ───────────────────────────────────────────────────────────────
function SkillsTab({ skills, userId, onUpdate }: { skills: Skill[]; userId: string; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ skill_name: "", experience_years: "", skill_level: "" });

  const handleAdd = async () => {
    if (!form.skill_name.trim()) return;
    try {
      await profileApi.addSkill({
        skill_name: form.skill_name,
        experience_years: form.experience_years ? Number(form.experience_years) : undefined,
        skill_level: form.skill_level || undefined,
      });
      toast.success("Skill added!");
      setForm({ skill_name: "", experience_years: "", skill_level: "" });
      setShowForm(false);
      onUpdate();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed to add skill"); }
  };

  const handleDelete = async (id: string) => {
    try { await profileApi.deleteSkill(id); toast.success("Skill removed"); onUpdate(); } catch { toast.error("Failed"); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">Skills</h2>
          <p className="text-[0.78rem] text-[var(--color-ink4)] mt-0.5">{skills.length} skills added</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
          + Add Skill
        </button>
      </div>

      {showForm && (
        <div className="flex gap-3 mb-6 flex-wrap p-4 bg-[var(--color-cream)] rounded-[14px] border border-[rgba(26,23,20,0.04)]">
          <input type="text" placeholder="Skill name" value={form.skill_name} onChange={(e) => setForm({ ...form, skill_name: e.target.value })} className="flex-1 min-w-[150px] px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="number" placeholder="Years" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} className="w-20 px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <select value={form.skill_level} onChange={(e) => setForm({ ...form, skill_level: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
            <option value="">Level</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Expert">Expert</option>
          </select>
          <button onClick={handleAdd} className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-ink2)] transition-colors">Add</button>
        </div>
      )}

      {skills.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {skills.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 bg-[var(--color-cream)] rounded-[12px] group hover:bg-[var(--color-cream2)] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[rgba(44,110,106,0.1)] flex items-center justify-center text-[0.7rem] font-medium text-[var(--color-teal)]">
                  {s.skill_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">{s.skill_name}</p>
                  <p className="text-[0.7rem] text-[var(--color-ink4)]">
                    {[s.skill_level, s.experience_years && `${s.experience_years}y`].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(s.id)} className="opacity-0 group-hover:opacity-100 text-[var(--color-ink4)] hover:text-[var(--color-warm)] text-[0.8rem] transition-all">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.85rem] text-[var(--color-ink4)] text-center py-6">No skills added yet. Add your first skill above.</p>
      )}
    </div>
  );
}

// ─── Education Tab ────────────────────────────────────────────────────────────
function EducationTab({ education, onUpdate }: { education: Education[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ institution_name: "", degree: "", specialization: "", start_year: "", end_year: "" });

  const handleAdd = async () => {
    if (!form.institution_name.trim()) return;
    try {
      await profileApi.addEducation({
        institution_name: form.institution_name,
        degree: form.degree || undefined,
        specialization: form.specialization || undefined,
        start_year: form.start_year ? Number(form.start_year) : undefined,
        end_year: form.end_year ? Number(form.end_year) : undefined,
      });
      toast.success("Education added!");
      setForm({ institution_name: "", degree: "", specialization: "", start_year: "", end_year: "" });
      setShowForm(false);
      onUpdate();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    try { await profileApi.deleteEducation(id); toast.success("Removed"); onUpdate(); } catch { toast.error("Failed"); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">Education</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
          + Add
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 p-5 bg-[var(--color-cream)] rounded-[14px] border border-[rgba(26,23,20,0.04)]">
          <input type="text" placeholder="Institution" value={form.institution_name} onChange={(e) => setForm({ ...form, institution_name: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="text" placeholder="Degree" value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="text" placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <div className="flex gap-2">
            <input type="number" placeholder="Start" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: e.target.value })} className="flex-1 px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="number" placeholder="End" value={form.end_year} onChange={(e) => setForm({ ...form, end_year: e.target.value })} className="flex-1 px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <button onClick={handleAdd} className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-ink2)] w-fit">Add</button>
        </div>
      )}

      {education.length > 0 ? (
        <div className="space-y-3">
          {education.map((e) => (
            <div key={e.id} className="flex items-start justify-between p-4 bg-[var(--color-cream)] rounded-[14px] group hover:bg-[var(--color-cream2)] transition-colors">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(44,110,106,0.1)] flex items-center justify-center text-[0.9rem]">🎓</div>
                <div>
                  <h4 className="text-[0.9rem] font-medium text-[var(--color-ink)]">{e.institution_name}</h4>
                  <p className="text-[0.8rem] text-[var(--color-ink3)]">{[e.degree, e.specialization].filter(Boolean).join(" · ") || "—"}</p>
                  {(e.start_year || e.end_year) && <p className="text-[0.72rem] text-[var(--color-ink4)] mt-0.5">{e.start_year} – {e.end_year || "Present"}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(e.id)} className="opacity-0 group-hover:opacity-100 text-[var(--color-ink4)] hover:text-[var(--color-warm)] text-[0.8rem] transition-all">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.85rem] text-[var(--color-ink4)] text-center py-6">No education added yet.</p>
      )}
    </div>
  );
}

// ─── Experience Tab ───────────────────────────────────────────────────────────
function ExperienceTab({ experience, onUpdate }: { experience: Experience[]; onUpdate: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ company_name: "", designation: "", start_date: "", end_date: "", description: "" });

  const handleAdd = async () => {
    if (!form.company_name.trim()) return;
    try {
      await profileApi.addExperience({
        company_name: form.company_name,
        designation: form.designation || undefined,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
        description: form.description || undefined,
      });
      toast.success("Experience added!");
      setForm({ company_name: "", designation: "", start_date: "", end_date: "", description: "" });
      setShowForm(false);
      onUpdate();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    try { await profileApi.deleteExperience(id); toast.success("Removed"); onUpdate(); } catch { toast.error("Failed"); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">Work Experience</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
          + Add
        </button>
      </div>

      {showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 p-5 bg-[var(--color-cream)] rounded-[14px] border border-[rgba(26,23,20,0.04)]">
          <input type="text" placeholder="Company Name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="text" placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="md:col-span-2 px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none" />
          <button onClick={handleAdd} className="px-5 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-ink2)] w-fit">Add</button>
        </div>
      )}

      {experience.length > 0 ? (
        <div className="space-y-3">
          {experience.map((e) => (
            <div key={e.id} className="flex items-start justify-between p-4 bg-[var(--color-cream)] rounded-[14px] group hover:bg-[var(--color-cream2)] transition-colors">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[rgba(232,128,58,0.1)] flex items-center justify-center text-[0.9rem]">💼</div>
                <div>
                  <h4 className="text-[0.9rem] font-medium text-[var(--color-ink)]">{e.designation || "Role"}</h4>
                  <p className="text-[0.8rem] text-[var(--color-ink3)]">{e.company_name}</p>
                  {(e.start_date || e.end_date) && <p className="text-[0.72rem] text-[var(--color-ink4)] mt-0.5">{e.start_date} – {e.end_date || "Present"}</p>}
                  {e.description && <p className="text-[0.78rem] text-[var(--color-ink3)] mt-1.5 leading-[1.6] max-w-[400px]">{e.description}</p>}
                </div>
              </div>
              <button onClick={() => handleDelete(e.id)} className="opacity-0 group-hover:opacity-100 text-[var(--color-ink4)] hover:text-[var(--color-warm)] text-[0.8rem] transition-all">✕</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.85rem] text-[var(--color-ink4)] text-center py-6">No experience added yet.</p>
      )}
    </div>
  );
}

// ─── Applications Tab ─────────────────────────────────────────────────────────
function ApplicationsTab({ applications }: { applications: JobApplication[] }) {
  const statusColor = (status: string) => {
    switch (status) {
      case "APPLIED": return "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]";
      case "REVIEWED": return "bg-[rgba(200,230,60,0.2)] text-[#8CAF00]";
      case "SHORTLISTED": return "bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)]";
      case "REJECTED": return "bg-[rgba(232,128,58,0.12)] text-[#B85A1A]";
      default: return "bg-[var(--color-cream2)] text-[var(--color-ink3)]";
    }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">My Applications</h2>
          <p className="text-[0.78rem] text-[var(--color-ink4)] mt-0.5">{applications.length} total applications</p>
        </div>
      </div>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <Link key={app.id} href={`/jobs/${app.job_id}`} className="flex items-center justify-between p-4 bg-[var(--color-cream)] rounded-[14px] hover:bg-[var(--color-cream2)] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-white border border-[rgba(26,23,20,0.06)] flex items-center justify-center font-[var(--font-serif)] text-[0.85rem] font-semibold text-[var(--color-ink2)]">
                  {app.company_name?.[0]?.toUpperCase() || "J"}
                </div>
                <div>
                  <h4 className="text-[0.88rem] font-medium text-[var(--color-ink)] group-hover:text-[var(--color-teal)] transition-colors">{app.job_title || "Job"}</h4>
                  <p className="text-[0.75rem] text-[var(--color-ink3)]">{app.company_name} · {new Date(app.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
              <span className={`text-[0.7rem] px-3 py-1 rounded-full font-medium ${statusColor(app.application_status)}`}>
                {app.application_status}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-[2rem] mb-3">📋</p>
          <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">No applications yet</h3>
          <p className="text-[0.85rem] text-[var(--color-ink4)] mb-5">Start applying to jobs to track them here.</p>
          <Link href="/jobs" className="inline-block px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium hover:bg-[var(--color-ink2)] transition-colors">
            Browse Jobs
          </Link>
        </div>
      )}
    </div>
  );
}


// ─── Network Tab ──────────────────────────────────────────────────────────────
function NetworkTab({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"followers" | "following">("followers");
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNetwork();
  }, [userId]);

  const loadNetwork = async () => {
    try {
      const [fRes, gRes] = await Promise.all([
        api.get(`/profile/${userId}/followers`),
        api.get(`/profile/${userId}/following`),
      ]);
      setFollowers(fRes.data.items);
      setFollowing(gRes.data.items);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const handleUnfollow = async (targetId: string) => {
    try {
      await api.post(`/profile/${targetId}/follow`);
      toast.success("Unfollowed");
      loadNetwork();
    } catch { toast.error("Failed"); }
  };

  const list = tab === "followers" ? followers : following;

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">My Network</h2>
        <Link href="/network" className="text-[0.8rem] text-[var(--color-teal)] hover:underline">Discover People →</Link>
      </div>

      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("followers")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${tab === "followers" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
          Followers ({followers.length})
        </button>
        <button onClick={() => setTab("following")} className={`px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${tab === "following" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
          Following ({following.length})
        </button>
      </div>

      {isLoading ? (
        <p className="text-[0.85rem] text-[var(--color-ink4)]">Loading...</p>
      ) : list.length > 0 ? (
        <div className="space-y-3">
          {list.map((person: any) => (
            <div key={person.user_id} className="flex items-center justify-between p-3 bg-[var(--color-cream)] rounded-[12px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.8rem] font-semibold text-[var(--color-cream)]">
                  {person.full_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <Link href={`/profile/${person.user_id}`} className="text-[0.88rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-teal)]">
                    {person.full_name}
                  </Link>
                  <p className="text-[0.72rem] text-[var(--color-ink4)]">{person.headline || ""}</p>
                </div>
              </div>
              {tab === "following" && (
                <button onClick={() => handleUnfollow(person.user_id)} className="text-[0.75rem] px-3 py-1.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-ink3)] hover:text-[var(--color-warm)] hover:border-[var(--color-warm)] transition-all">
                  Unfollow
                </button>
              )}
              {tab === "followers" && (
                <Link href={`/profile/${person.user_id}`} className="text-[0.75rem] px-3 py-1.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-all">
                  View
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[0.85rem] text-[var(--color-ink4)] text-center py-6">
          {tab === "followers" ? "No followers yet." : "Not following anyone yet."}
        </p>
      )}
    </div>
  );
}


// ─── Groups Tab ───────────────────────────────────────────────────────────────
function GroupsTab() {
  const { user } = useAuthStore();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [isCreating, setIsCreating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => { loadMyGroups(); }, []);

  const loadMyGroups = async () => {
    try {
      const res = await groupsApi.getMyGroups(1, 50);
      setMyGroups(res.items);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    setIsCreating(true);
    try {
      const formData = new FormData();
      formData.append("name", createForm.name);
      if (createForm.description) formData.append("description", createForm.description);
      if (coverFile) formData.append("cover_image", coverFile);
      await groupsApi.createGroup(formData);
      toast.success("Group created!");
      setCreateForm({ name: "", description: "" });
      setCoverFile(null);
      setShowCreate(false);
      loadMyGroups();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
    finally { setIsCreating(false); }
  };

  const handleLeave = async (groupId: string) => {
    try {
      await groupsApi.leaveGroup(groupId);
      toast.success("Left group");
      loadMyGroups();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleDelete = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await groupsApi.deleteGroup(groupId);
      toast.success("Group deleted");
      loadMyGroups();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">My Groups</h2>
          <p className="text-[0.78rem] text-[var(--color-ink4)] mt-0.5">{myGroups.length} groups joined</p>
        </div>
        <div className="flex gap-2">
          <Link href="/groups" className="px-4 py-2 border border-[rgba(26,23,20,0.1)] rounded-full text-[0.8rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">
            Discover Groups
          </Link>
          <button onClick={() => setShowCreate(!showCreate)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
            + Create
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 p-5 bg-[var(--color-cream)] rounded-[14px] border border-[rgba(26,23,20,0.04)]">
          <h4 className="text-[0.88rem] font-medium text-[var(--color-ink)] mb-3">Create New Group</h4>
          <div className="space-y-3">
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Group name"
              className="w-full px-4 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]"
            />
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-4 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none"
            />
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="text-[0.8rem] text-[var(--color-ink3)] px-3 py-1.5 border border-[rgba(26,23,20,0.08)] rounded-[8px] hover:bg-white transition-colors">
                {coverFile ? `📷 ${coverFile.name.slice(0, 20)}` : "📷 Add Cover"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              <div className="flex-1" />
              <button onClick={() => setShowCreate(false)} className="text-[0.8rem] text-[var(--color-ink3)] px-4 py-2 hover:text-[var(--color-ink)]">Cancel</button>
              <button onClick={handleCreate} disabled={!createForm.name.trim() || isCreating} className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium disabled:opacity-50 transition-all">
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups list */}
      {isLoading ? (
        <p className="text-[0.85rem] text-[var(--color-ink4)]">Loading...</p>
      ) : myGroups.length > 0 ? (
        <div className="space-y-3">
          {myGroups.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4 bg-[var(--color-cream)] rounded-[14px] group hover:bg-[var(--color-cream2)] transition-colors">
              <Link href={`/groups/${g.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[var(--color-teal)] to-[var(--color-teal2)] flex items-center justify-center shrink-0 overflow-hidden">
                  {g.cover_image ? (
                    <img src={g.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-[var(--font-serif)] text-[1rem] font-semibold text-[var(--color-cream)]">{g.name[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.9rem] font-medium text-[var(--color-ink)] truncate group-hover:text-[var(--color-teal)] transition-colors">{g.name}</p>
                  <p className="text-[0.72rem] text-[var(--color-ink4)]">{g.member_count} members{g.category ? ` · ${g.category.replace("_", " ")}` : ""}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/groups/${g.id}`} className="text-[0.72rem] px-3 py-1.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">
                  Open
                </Link>
                {user && g.created_by === user.id ? (
                  <button onClick={() => handleDelete(g.id)} className="text-[0.72rem] px-3 py-1.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-warm)] hover:border-[var(--color-warm)] transition-colors">
                    Delete
                  </button>
                ) : (
                  <button onClick={() => handleLeave(g.id)} className="text-[0.72rem] px-3 py-1.5 border border-[rgba(26,23,20,0.1)] rounded-full text-[var(--color-ink3)] hover:text-[var(--color-warm)] hover:border-[var(--color-warm)] transition-colors">
                    Leave
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[2rem] mb-3">🏘️</p>
          <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-2">No groups yet</h3>
          <p className="text-[0.85rem] text-[var(--color-ink4)] mb-4">Create a group or discover existing ones.</p>
          <Link href="/groups" className="inline-block px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.82rem] font-medium">
            Discover Groups
          </Link>
        </div>
      )}
    </div>
  );
}


// ─── Employer: My Jobs Tab ────────────────────────────────────────────────────
function EmployerJobsTab() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try { const res = await api.get("/jobs/my", { params: { page: 1, page_size: 50 } }); setJobs(res.data.items); } catch {} finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (jobId: string) => {
    if (!confirm("Delete this job?")) return;
    try { await api.delete(`/jobs/${jobId}`); toast.success("Deleted"); load(); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const handleStatus = async (jobId: string, status: string) => {
    try { await api.patch(`/jobs/${jobId}`, { status }); toast.success(`Job ${status.toLowerCase()}`); load(); } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  if (isLoading) return <p className="text-[0.85rem] text-[var(--color-ink4)]">Loading jobs...</p>;

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)] mb-5">My Job Postings ({jobs.length})</h2>
      {jobs.length > 0 ? (
        <div className="space-y-3">
          {jobs.map((j: any) => (
            <div key={j.id} className="flex items-center justify-between p-4 bg-[var(--color-cream)] rounded-[14px] group hover:bg-[var(--color-cream2)] transition-colors">
              <div className="flex-1 min-w-0">
                <Link href={`/jobs/${j.id}`} className="text-[0.9rem] font-medium text-[var(--color-ink)] hover:text-[var(--color-teal)] transition-colors">{j.title}</Link>
                <p className="text-[0.72rem] text-[var(--color-ink4)] mt-0.5">{j.company_name || "—"} · {j.location || "Remote"} · {new Date(j.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <select value={j.status} onChange={(e) => handleStatus(j.id, e.target.value)} className="text-[0.72rem] px-2 py-1.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[8px] focus:outline-none focus:border-[var(--color-teal)]">
                  <option value="OPEN">OPEN</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
                <button onClick={() => handleDelete(j.id)} className="text-[0.72rem] px-3 py-1.5 text-[var(--color-warm)] opacity-0 group-hover:opacity-100 transition-all">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-[1.5rem] mb-2">💼</p>
          <p className="text-[0.85rem] text-[var(--color-ink4)]">No jobs posted yet. Go to "Post a Job" to create one.</p>
        </div>
      )}
    </div>
  );
}

// ─── Employer: Applicants Tab ─────────────────────────────────────────────────
function EmployerApplicantsTab() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get("/jobs/my", { params: { page: 1, page_size: 50 } }).then((r) => setJobs(r.data.items)).catch(() => {});
  }, []);

  const loadApplicants = async (jobId: string) => {
    if (!jobId) { setApplicants([]); return; }
    setIsLoading(true);
    try { const res = await api.get(`/jobs/${jobId}/applicants`, { params: { page: 1, page_size: 50 } }); setApplicants(res.data.items); } catch { setApplicants([]); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)] mb-5">View Applicants</h2>

      <div className="mb-5">
        <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Select Job</label>
        <select value={selectedJob} onChange={(e) => { setSelectedJob(e.target.value); loadApplicants(e.target.value); }} className="w-full px-4 py-3 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
          <option value="">Choose a job...</option>
          {jobs.map((j: any) => <option key={j.id} value={j.id}>{j.title} ({j.status})</option>)}
        </select>
      </div>

      {selectedJob && (
        isLoading ? <p className="text-[0.85rem] text-[var(--color-ink4)]">Loading...</p> :
        applicants.length > 0 ? (
          <div className="space-y-3">
            {applicants.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between p-4 bg-[var(--color-cream)] rounded-[12px]">
                <div>
                  <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">Applicant</p>
                  <p className="text-[0.72rem] text-[var(--color-ink4)]">Applied {new Date(a.applied_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[0.68rem] px-2.5 py-1 rounded-full font-medium ${a.application_status === "APPLIED" ? "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]" : "bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)]"}`}>{a.application_status}</span>
                  {a.resume_url && <a href={a.resume_url} target="_blank" rel="noopener" className="text-[0.72rem] px-3 py-1.5 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full font-medium hover:bg-[var(--color-lime2)]">Resume</a>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-[0.85rem] text-[var(--color-ink4)]">No applicants yet for this job.</p>
        )
      )}

      {!selectedJob && <p className="text-center py-8 text-[0.85rem] text-[var(--color-ink4)]">Select a job above to see applicants.</p>}
    </div>
  );
}

// ─── Employer: Post Job Tab ───────────────────────────────────────────────────
function EmployerPostJobTab() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [form, setForm] = useState({ company_id: "", title: "", description: "", employment_type: "Full-time", experience_required: "", salary_min: "", salary_max: "", location: "", remote_type: "On-site", job_category: "white_collar", skills: "" });
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => { api.get("/jobs/companies").then((r) => setCompanies(r.data)).catch(() => {}); }, []);

  const handlePost = async () => {
    if (!form.company_id || !form.title || !form.description) { toast.error("Fill company, title, and description"); return; }
    setIsPosting(true);
    try {
      const payload: any = { company_id: form.company_id, title: form.title, description: form.description, employment_type: form.employment_type, remote_type: form.remote_type, job_category: form.job_category };
      if (form.experience_required) payload.experience_required = form.experience_required;
      if (form.salary_min) payload.salary_min = Number(form.salary_min);
      if (form.salary_max) payload.salary_max = Number(form.salary_max);
      if (form.location) payload.location = form.location;
      if (form.skills) payload.skills = form.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
      await api.post("/jobs/", payload);
      toast.success("Job posted!");
      setForm({ company_id: "", title: "", description: "", employment_type: "Full-time", experience_required: "", salary_min: "", salary_max: "", location: "", remote_type: "On-site", job_category: "white_collar", skills: "" });
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") toast.error(detail);
      else if (Array.isArray(detail)) toast.error(detail.map((d: any) => d.msg || d).join(", "));
      else toast.error("Failed to post job. Check all required fields.");
    }
    finally { setIsPosting(false); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)] mb-5">Post a New Job</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Company *</label>
          <select value={form.company_id} onChange={(e) => setForm({ ...form, company_id: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]">
            <option value="">Select company</option>
            {companies.map((c: any) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2"><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
        <div className="md:col-span-2"><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description..." rows={5} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)] resize-none" /></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Employment Type</label><select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]"><option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option></select></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Remote Type</label><select value={form.remote_type} onChange={(e) => setForm({ ...form, remote_type: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]"><option>On-site</option><option>Remote</option><option>Hybrid</option></select></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Category</label><select value={form.job_category} onChange={(e) => setForm({ ...form, job_category: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]"><option value="white_collar">White Collar</option><option value="blue_collar">Blue Collar</option></select></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Experience</label><input type="text" value={form.experience_required} onChange={(e) => setForm({ ...form, experience_required: e.target.value })} placeholder="e.g. 2-4 years" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Salary Min (₹)</label><input type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Salary Max (₹)</label><input type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
        <div><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Location</label><input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
        <div className="md:col-span-2"><label className="block text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.05em] mb-1.5">Skills (comma-separated)</label><input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="e.g. React, Node.js, Python" className="w-full px-4 py-2.5 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" /></div>
      </div>
      <button onClick={handlePost} disabled={isPosting} className="mt-6 px-8 py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.88rem] font-medium hover:bg-[var(--color-ink2)] disabled:opacity-50 transition-all">
        {isPosting ? "Posting..." : "Post Job"}
      </button>
    </div>
  );
}

// ─── Employer: Companies Tab ──────────────────────────────────────────────────
function EmployerCompaniesTab() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ company_name: "", company_description: "", industry: "", headquarters: "", company_size: "", website: "" });
  const [isCreating, setIsCreating] = useState(false);

  const load = async () => { try { const r = await api.get("/jobs/companies"); setCompanies(r.data); } catch {} };
  useEffect(() => { load(); }, []);

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
      load();
    } catch (e: any) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setIsCreating(false); }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-7">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[var(--font-serif)] text-[1.2rem] font-medium text-[var(--color-ink)]">My Companies ({companies.length})</h2>
        <button onClick={() => setShowCreate(!showCreate)} className="px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.8rem] font-medium hover:bg-[var(--color-lime2)]">+ Add Company</button>
      </div>

      {showCreate && (
        <div className="mb-5 p-5 bg-[var(--color-cream)] rounded-[14px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Company name *" className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.headquarters} onChange={(e) => setForm({ ...form, headquarters: e.target.value })} placeholder="Headquarters" className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
            <input type="text" value={form.company_size} onChange={(e) => setForm({ ...form, company_size: e.target.value })} placeholder="Size (e.g. 50-200)" className="px-3 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-[10px] text-[0.85rem] focus:outline-none focus:border-[var(--color-teal)]" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} disabled={!form.company_name.trim() || isCreating} className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium disabled:opacity-50">{isCreating ? "Creating..." : "Create"}</button>
            <button onClick={() => setShowCreate(false)} className="px-5 py-2 text-[0.8rem] text-[var(--color-ink3)]">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {companies.map((c: any) => (
          <div key={c.id} className="p-4 bg-[var(--color-cream)] rounded-[12px]">
            <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{c.company_name}</p>
            <p className="text-[0.72rem] text-[var(--color-ink4)]">{[c.industry, c.headquarters].filter(Boolean).join(" · ") || "—"}</p>
          </div>
        ))}
        {companies.length === 0 && <p className="text-center py-8 text-[0.85rem] text-[var(--color-ink4)]">No companies. Create one to start posting jobs.</p>}
      </div>
    </div>
  );
}
