"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { profileApi } from "@/modules/profile/api";
import { useAuthStore } from "@/modules/auth/store";
import type { Profile, Skill, Education, Experience } from "@/modules/profile/types";
import { toast } from "sonner";
import {
  MapPin, Briefcase, GraduationCap, Award, Plus, Pencil,
  ExternalLink, Eye, Users, Share2, Trash2,
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ headline: "", bio: "", current_company: "", current_position: "", location: "" });

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const [p, s, edu, exp] = await Promise.all([
        profileApi.getMyProfile(),
        profileApi.getUserSkills(user!.id),
        profileApi.getUserEducation(user!.id),
        profileApi.getUserExperience(user!.id),
      ]);
      setProfile(p);
      setSkills(s);
      setEducation(edu);
      setExperience(exp);
      setEditData({
        headline: p.headline || "",
        bio: p.bio || "",
        current_company: p.current_company || "",
        current_position: p.current_position || "",
        location: p.location || "",
      });
    } catch {
      // Profile might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await profileApi.updateProfile(editData);
      toast.success("Profile updated");
      setEditMode(false);
      loadProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const handleAddSkill = async () => {
    const name = prompt("Enter skill name:");
    if (!name) return;
    try {
      await profileApi.addSkill({ skill_name: name });
      toast.success("Skill added");
      const s = await profileApi.getUserSkills(user!.id);
      setSkills(s);
    } catch {
      toast.error("Failed to add skill");
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await profileApi.deleteSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
    } catch {
      toast.error("Failed to delete skill");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Navbar />
        <div className="max-w-[1128px] mx-auto px-4 py-8">
          <div className="bg-white rounded-xl border border-[var(--color-border)] p-8 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Navbar />
      <div className="max-w-[1128px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Main content */}
          <div className="lg:col-span-8 space-y-4">

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
              {/* Banner */}
              <div className="h-[120px] gradient-primary relative" />

              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="w-[120px] h-[120px] rounded-full bg-white border-4 border-white -mt-[60px] relative flex items-center justify-center text-3xl font-bold text-[var(--color-primary)] shadow-md">
                  {user?.full_name[0].toUpperCase()}
                </div>

                <div className="mt-3 flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                    {profile?.headline ? (
                      <p className="text-[var(--color-text-secondary)] mt-0.5">{profile.headline}</p>
                    ) : (
                      <p className="text-[var(--color-text-muted)] mt-0.5 italic">Add a headline</p>
                    )}
                    {profile?.location && (
                      <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {profile.location}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-[var(--color-primary)] font-medium">{profile?.follower_count || 0} followers</span>
                      <span className="text-[var(--color-text-muted)]">{profile?.following_count || 0} following</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="p-2 text-[var(--color-text-secondary)] hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                </div>

                {/* Edit form */}
                {editMode && (
                  <div className="mt-4 p-4 bg-[var(--color-surface)] rounded-lg space-y-3">
                    <input
                      className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      placeholder="Headline (e.g. Full Stack Developer at Google)"
                      value={editData.headline}
                      onChange={(e) => setEditData({ ...editData, headline: e.target.value })}
                    />
                    <textarea
                      className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                      placeholder="About you..."
                      rows={3}
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="Current Company"
                        value={editData.current_company}
                        onChange={(e) => setEditData({ ...editData, current_company: e.target.value })}
                      />
                      <input
                        className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        placeholder="Location"
                        value={editData.location}
                        onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveProfile} className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[var(--color-primary-dark)]">
                        Save
                      </button>
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-full text-sm text-[var(--color-text-secondary)] hover:bg-gray-100">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Bio */}
                {profile?.bio && !editMode && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-4 leading-relaxed">{profile.bio}</p>
                )}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><Briefcase size={20} /> Experience</h2>
                <button className="p-1.5 hover:bg-gray-100 rounded-full"><Plus size={18} /></button>
              </div>
              {experience.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">Add your work experience to showcase your career journey.</p>
              ) : (
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="flex gap-3 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-sm font-bold text-[var(--color-text-secondary)]">
                        {exp.company_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{exp.designation || "Role"}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{exp.company_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {exp.start_date} — {exp.end_date || "Present"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><GraduationCap size={20} /> Education</h2>
                <button className="p-1.5 hover:bg-gray-100 rounded-full"><Plus size={18} /></button>
              </div>
              {education.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">Add your educational background.</p>
              ) : (
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="flex gap-3 pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                      <div className="w-10 h-10 rounded bg-blue-50 flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                        {edu.institution_name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{edu.institution_name}</p>
                        <p className="text-sm text-[var(--color-text-secondary)]">{edu.degree}{edu.specialization ? ` — ${edu.specialization}` : ""}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{edu.start_year} — {edu.end_year || "Present"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2"><Award size={20} /> Skills</h2>
                <button onClick={handleAddSkill} className="p-1.5 hover:bg-gray-100 rounded-full"><Plus size={18} /></button>
              </div>
              {skills.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">Add skills to get endorsed by your connections.</p>
              ) : (
                <div className="space-y-3">
                  {skills.map((skill) => (
                    <div key={skill.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                      <div>
                        <p className="font-medium text-sm">{skill.skill_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {skill.endorsement_count} endorsement{skill.endorsement_count !== 1 ? "s" : ""}
                          {skill.skill_level && ` · ${skill.skill_level}`}
                        </p>
                      </div>
                      <button onClick={() => handleDeleteSkill(skill.id)} className="text-[var(--color-text-muted)] hover:text-red-500 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Stats card */}
            <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
              <h3 className="text-sm font-semibold mb-3">Profile analytics</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Eye size={18} className="text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-sm font-medium">{profile?.profile_view_count || 0} profile views</p>
                    <p className="text-xs text-[var(--color-text-muted)]">See who viewed your profile</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-[var(--color-text-muted)]" />
                  <div>
                    <p className="text-sm font-medium">{profile?.follower_count || 0} connections</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Grow your network</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            {(profile?.linkedin_url || profile?.github_url || profile?.portfolio_url) && (
              <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
                <h3 className="text-sm font-semibold mb-3">Links</h3>
                <div className="space-y-2">
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline">
                      <ExternalLink size={14} /> LinkedIn
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline">
                      <ExternalLink size={14} /> GitHub
                    </a>
                  )}
                  {profile.portfolio_url && (
                    <a href={profile.portfolio_url} target="_blank" className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline">
                      <ExternalLink size={14} /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
