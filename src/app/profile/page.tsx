"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { profileApi } from "@/modules/profile/api";
import { api } from "@/lib/api";
import type { ProfileData, Skill, Education, Experience } from "@/modules/profile/api";
import { toast } from "sonner";

interface FollowItem {
  user_id: string;
  full_name: string;
  headline: string | null;
  profile_image: string | null;
}

export default function MyProfilePage() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [followers, setFollowers] = useState<FollowItem[]>([]);
  const [following, setFollowing] = useState<FollowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnections, setShowConnections] = useState<"followers" | "following" | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const p = await profileApi.getMyProfile();
      setProfile(p);

      const [skRes, edRes, exRes, flRes, fgRes] = await Promise.allSettled([
        profileApi.getMySkills(p.user_id),
        profileApi.getEducation(p.user_id),
        profileApi.getExperience(p.user_id),
        api.get(`/profile/${p.user_id}/followers`),
        api.get(`/profile/${p.user_id}/following`),
      ]);

      if (skRes.status === "fulfilled") setSkills(skRes.value);
      if (edRes.status === "fulfilled") setEducation(edRes.value);
      if (exRes.status === "fulfilled") setExperience(exRes.value);
      if (flRes.status === "fulfilled") setFollowers(flRes.value.data.items);
      if (fgRes.status === "fulfilled") setFollowing(fgRes.value.data.items);
    } catch { /* not logged in */ }
    finally { setIsLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[1.5rem] mb-3">🔒</p>
          <p className="text-[var(--color-ink3)] mb-4">Please sign in to view your profile.</p>
          <Link href="/login" className="px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium">Sign In</Link>
        </div>
      </div>
    );
  }

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
          <li><Link href="/profile" className="text-[0.85rem] text-[var(--color-ink)] font-medium border-b-2 border-[var(--color-ink)] pb-0.5">Profile</Link></li>
        </ul>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/dashboard" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
          <button onClick={() => { logout(); router.push("/"); }} className="text-[0.85rem] text-[var(--color-warm)] px-3 py-1.5 rounded-[10px] hover:bg-[rgba(232,128,58,0.08)] transition-colors">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile header */}
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-teal2)] to-[var(--color-teal)]" />
          <div className="px-4 sm:px-7 pb-5 sm:pb-7">
            <div className="-mt-12 flex items-end justify-between mb-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-cream)] border-4 border-white flex items-center justify-center font-[var(--font-serif)] text-[1.5rem] sm:text-[2rem] font-semibold text-[var(--color-ink)] shadow-md">
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
              <Link href="/dashboard" className="px-4 sm:px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.78rem] sm:text-[0.82rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
                ✏️ Edit Profile
              </Link>
            </div>

            <h1 className="font-[var(--font-serif)] text-[1.3rem] sm:text-[1.6rem] font-medium text-[var(--color-ink)] tracking-[-0.02em]">{profile.full_name}</h1>
            <p className="text-[0.9rem] text-[var(--color-ink3)] mt-0.5">{profile.headline || profile.email}</p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-[0.78rem] text-[var(--color-ink4)]">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.current_company && <span>🏢 {profile.current_company}</span>}
              {profile.current_position && <span>💼 {profile.current_position}</span>}
              {profile.experience_years && <span>📊 {profile.experience_years} years exp.</span>}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-5 pt-5 border-t border-[rgba(26,23,20,0.06)]">
              <button onClick={() => setShowConnections(showConnections === "followers" ? null : "followers")} className="text-left hover:opacity-80 transition-opacity">
                <span className="font-[var(--font-serif)] text-[1rem] sm:text-[1.1rem] font-semibold text-[var(--color-ink)]">{profile.follower_count}</span>
                <span className="text-[0.72rem] sm:text-[0.78rem] text-[var(--color-ink4)] ml-1.5">followers</span>
              </button>
              <button onClick={() => setShowConnections(showConnections === "following" ? null : "following")} className="text-left hover:opacity-80 transition-opacity">
                <span className="font-[var(--font-serif)] text-[1rem] sm:text-[1.1rem] font-semibold text-[var(--color-ink)]">{profile.following_count}</span>
                <span className="text-[0.72rem] sm:text-[0.78rem] text-[var(--color-ink4)] ml-1.5">following</span>
              </button>
              <div>
                <span className="font-[var(--font-serif)] text-[1rem] sm:text-[1.1rem] font-semibold text-[var(--color-ink)]">{profile.profile_view_count}</span>
                <span className="text-[0.72rem] sm:text-[0.78rem] text-[var(--color-ink4)] ml-1.5">profile views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connections panel */}
        {showConnections && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button onClick={() => setShowConnections("followers")} className={`px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all ${showConnections === "followers" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
                  Followers ({followers.length})
                </button>
                <button onClick={() => setShowConnections("following")} className={`px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all ${showConnections === "following" ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
                  Following ({following.length})
                </button>
              </div>
              <button onClick={() => setShowConnections(null)} className="text-[0.78rem] text-[var(--color-ink4)] hover:text-[var(--color-ink)]">✕</button>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(showConnections === "followers" ? followers : following).length > 0 ? (
                (showConnections === "followers" ? followers : following).map((person) => (
                  <Link key={person.user_id} href={`/profile/${person.user_id}`} className="flex items-center gap-3 p-3 rounded-[10px] hover:bg-[var(--color-cream)] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.8rem] font-semibold text-[var(--color-cream)]">
                      {person.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">{person.full_name}</p>
                      <p className="text-[0.72rem] text-[var(--color-ink4)]">{person.headline || ""}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-[0.82rem] text-[var(--color-ink4)] text-center py-4">No {showConnections} yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-3">About</h3>
            <p className="text-[0.88rem] text-[var(--color-ink2)] leading-[1.8] whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}

        {/* Links */}
        {(profile.portfolio_url || profile.linkedin_url || profile.github_url) && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-3">Links</h3>
            <div className="flex flex-wrap gap-4">
              {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline">🌐 Portfolio</a>}
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline">💼 LinkedIn</a>}
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline">🐙 GitHub</a>}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)]">Skills ({skills.length})</h3>
              <Link href="/dashboard" className="text-[0.75rem] text-[var(--color-teal)] hover:underline">+ Add more</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-[var(--color-cream)] rounded-full border border-[rgba(26,23,20,0.04)]">
                  <span className="text-[0.82rem] text-[var(--color-ink)]">{s.skill_name}</span>
                  {s.skill_level && <span className="text-[0.65rem] text-[var(--color-ink4)]">· {s.skill_level}</span>}
                  {s.endorsement_count > 0 && <span className="text-[0.65rem] text-[var(--color-teal)] font-medium">({s.endorsement_count})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)]">Experience</h3>
              <Link href="/dashboard" className="text-[0.75rem] text-[var(--color-teal)] hover:underline">+ Add more</Link>
            </div>
            <div className="space-y-4">
              {experience.map((e) => (
                <div key={e.id} className="flex gap-3 pb-4 border-b border-[rgba(26,23,20,0.04)] last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-[10px] bg-[rgba(232,128,58,0.08)] flex items-center justify-center text-[0.85rem] shrink-0">💼</div>
                  <div>
                    <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{e.designation || "Role"}</p>
                    <p className="text-[0.8rem] text-[var(--color-ink3)]">{e.company_name}</p>
                    {(e.start_date || e.end_date) && <p className="text-[0.72rem] text-[var(--color-ink4)] mt-0.5">{e.start_date} – {e.end_date || "Present"}</p>}
                    {e.description && <p className="text-[0.8rem] text-[var(--color-ink3)] mt-2 leading-[1.6]">{e.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)]">Education</h3>
              <Link href="/dashboard" className="text-[0.75rem] text-[var(--color-teal)] hover:underline">+ Add more</Link>
            </div>
            <div className="space-y-4">
              {education.map((e) => (
                <div key={e.id} className="flex gap-3 pb-4 border-b border-[rgba(26,23,20,0.04)] last:border-0 last:pb-0">
                  <div className="w-10 h-10 rounded-[10px] bg-[rgba(44,110,106,0.08)] flex items-center justify-center text-[0.85rem] shrink-0">🎓</div>
                  <div>
                    <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{e.institution_name}</p>
                    <p className="text-[0.8rem] text-[var(--color-ink3)]">{[e.degree, e.specialization].filter(Boolean).join(" · ")}</p>
                    {(e.start_year || e.end_year) && <p className="text-[0.72rem] text-[var(--color-ink4)] mt-0.5">{e.start_year} – {e.end_year || "Present"}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty states */}
        {skills.length === 0 && education.length === 0 && experience.length === 0 && !profile.bio && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-10 text-center">
            <p className="text-[2rem] mb-3">✨</p>
            <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">Complete your profile</h3>
            <p className="text-[0.85rem] text-[var(--color-ink4)] mb-5 max-w-[300px] mx-auto">Add your bio, skills, education, and experience to stand out to employers.</p>
            <Link href="/dashboard" className="inline-block px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium hover:bg-[var(--color-ink2)] transition-colors">
              Complete Profile →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
