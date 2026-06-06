"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface ProfileData {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  headline: string | null;
  bio: string | null;
  current_company: string | null;
  current_position: string | null;
  experience_years: number | null;
  location: string | null;
  notice_period: string | null;
  portfolio_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
  profile_view_count: number;
}

interface Skill {
  id: string;
  skill_name: string;
  experience_years: number | null;
  skill_level: string | null;
  endorsement_count: number;
  is_endorsed_by_me: boolean;
}

interface Education {
  id: string;
  institution_name: string;
  degree: string | null;
  specialization: string | null;
  start_year: number | null;
  end_year: number | null;
}

interface Experience {
  id: string;
  company_name: string;
  designation: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

interface FollowItem {
  user_id: string;
  full_name: string;
  headline: string | null;
  profile_image: string | null;
}

export default function ProfileViewPage() {
  useAuthHydration();
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [followers, setFollowers] = useState<FollowItem[]>([]);
  const [following, setFollowing] = useState<FollowItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const pRes = await api.get(`/profile/${id}`);
      setProfile(pRes.data);
      setIsFollowing(pRes.data.is_following);

      // Load other data independently — don't let one failure break everything
      const [skRes, edRes, exRes, flRes, fgRes] = await Promise.allSettled([
        api.get(`/profile/${id}/skills`),
        api.get(`/profile/${id}/education`),
        api.get(`/profile/${id}/experience`),
        api.get(`/profile/${id}/followers`),
        api.get(`/profile/${id}/following`),
      ]);

      if (skRes.status === "fulfilled") setSkills(skRes.value.data);
      if (edRes.status === "fulfilled") setEducation(edRes.value.data);
      if (exRes.status === "fulfilled") setExperience(exRes.value.data);
      if (flRes.status === "fulfilled") setFollowers(flRes.value.data.items);
      if (fgRes.status === "fulfilled") setFollowing(fgRes.value.data.items);
    } catch (err: any) {
      // If 403/401, user needs to sign in to view profiles
      if (err.response?.status === 403 || err.response?.status === 401) {
        setProfile(null);
      }
    }
    finally { setIsLoading(false); }
  };

  const handleFollow = async () => {
    if (!user) { toast.error("Please sign in to follow"); return; }
    try {
      const res = await api.post(`/profile/${id}/follow`);
      const newState = !isFollowing;
      setIsFollowing(newState);
      toast.success(res.data.message);
      if (profile) {
        setProfile({
          ...profile,
          follower_count: newState ? profile.follower_count + 1 : profile.follower_count - 1,
        });
      }
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleShare = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    try {
      await api.post(`/profile/${id}/share`, { platform: "copy_link" });
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied!");
    } catch { toast.error("Failed to share"); }
  };

  const handleEndorse = async (skillId: string) => {
    if (!user) { toast.error("Please sign in"); return; }
    try {
      const res = await api.post(`/profile/skills/${skillId}/endorse`);
      toast.success(res.data.message);
      setSkills(skills.map((s) => s.id === skillId ? { ...s, is_endorsed_by_me: !s.is_endorsed_by_me, endorsement_count: s.is_endorsed_by_me ? s.endorsement_count - 1 : s.endorsement_count + 1 } : s));
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
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
          <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">
            {user ? "Profile not found" : "Sign in to view profiles"}
          </h3>
          <p className="text-[0.85rem] text-[var(--color-ink4)] mb-4">
            {user ? "This user may not exist." : "You need to be logged in to view full profiles."}
          </p>
          {!user && (
            <Link href="/login" className="inline-block px-6 py-2.5 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium">Sign In</Link>
          )}
        </div>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.user_id;

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">ChitranshTech</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/network" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">← Network</Link>
          <Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors hidden sm:inline">Find Jobs</Link>
          <Link href="/feed" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors hidden sm:inline">Feed</Link>
        </div>
      </nav>

      <div className="max-w-[900px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile header card */}
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-[var(--color-ink)] via-[var(--color-teal2)] to-[var(--color-teal)]" />

          <div className="px-4 sm:px-7 pb-5 sm:pb-7">
            <div className="-mt-12 flex items-end justify-between mb-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[var(--color-cream)] border-4 border-white flex items-center justify-center font-[var(--font-serif)] text-[1.5rem] sm:text-[2rem] font-semibold text-[var(--color-ink)] shadow-md">
                {profile.full_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex gap-2">
                {!isOwnProfile && user && (
                  <>
                    <button onClick={handleFollow} className={`px-4 sm:px-5 py-2 rounded-full text-[0.78rem] sm:text-[0.82rem] font-medium transition-all ${isFollowing ? "bg-[var(--color-cream2)] text-[var(--color-ink3)] border border-[rgba(26,23,20,0.1)] hover:border-[var(--color-warm)] hover:text-[var(--color-warm)] hover:bg-[rgba(232,128,58,0.05)]" : "bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink2)]"}`}>
                      {isFollowing ? "Unfollow" : "Follow +"}
                    </button>
                    <button onClick={handleShare} className="hidden sm:inline-block px-4 py-2 rounded-full text-[0.82rem] border border-[rgba(26,23,20,0.1)] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-all">
                      Share
                    </button>
                  </>
                )}
                {isOwnProfile && (
                  <Link href="/dashboard" className="px-4 sm:px-5 py-2 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.78rem] sm:text-[0.82rem] font-medium hover:bg-[var(--color-lime2)] transition-colors">
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            <h1 className="font-[var(--font-serif)] text-[1.3rem] sm:text-[1.6rem] font-medium text-[var(--color-ink)] tracking-[-0.02em]">{profile.full_name}</h1>
            <p className="text-[0.9rem] text-[var(--color-ink3)] mt-0.5">{profile.headline || profile.current_position || profile.email}</p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-[0.78rem] text-[var(--color-ink4)]">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.current_company && <span>🏢 {profile.current_company}</span>}
              {profile.experience_years && <span>💼 {profile.experience_years} years exp.</span>}
            </div>

            {/* Stats — clickable */}
            <div className="flex flex-wrap gap-4 sm:gap-6 mt-5 pt-5 border-t border-[rgba(26,23,20,0.06)]">
              <button onClick={() => { setShowFollowers(true); setShowFollowing(false); }} className="text-left hover:opacity-80 transition-opacity">
                <span className="font-[var(--font-serif)] text-[1rem] sm:text-[1.1rem] font-semibold text-[var(--color-ink)]">{profile.follower_count}</span>
                <span className="text-[0.72rem] sm:text-[0.78rem] text-[var(--color-ink4)] ml-1.5">followers</span>
              </button>
              <button onClick={() => { setShowFollowing(true); setShowFollowers(false); }} className="text-left hover:opacity-80 transition-opacity">
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

        {/* Followers/Following panel */}
        {(showFollowers || showFollowing) && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button onClick={() => { setShowFollowers(true); setShowFollowing(false); }} className={`px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all ${showFollowers ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
                  Followers ({followers.length})
                </button>
                <button onClick={() => { setShowFollowing(true); setShowFollowers(false); }} className={`px-4 py-1.5 rounded-full text-[0.8rem] font-medium transition-all ${showFollowing ? "bg-[var(--color-ink)] text-[var(--color-cream)]" : "bg-[var(--color-cream2)] text-[var(--color-ink3)]"}`}>
                  Following ({following.length})
                </button>
              </div>
              <button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} className="text-[0.78rem] text-[var(--color-ink4)] hover:text-[var(--color-ink)]">✕ Close</button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {(showFollowers ? followers : following).length > 0 ? (
                (showFollowers ? followers : following).map((person) => (
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
                <p className="text-[0.82rem] text-[var(--color-ink4)] text-center py-4">No {showFollowers ? "followers" : "following"} yet.</p>
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
              {profile.portfolio_url && <a href={profile.portfolio_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline flex items-center gap-1.5">🌐 Portfolio</a>}
              {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline flex items-center gap-1.5">💼 LinkedIn</a>}
              {profile.github_url && <a href={profile.github_url} target="_blank" rel="noopener" className="text-[0.82rem] text-[var(--color-teal)] hover:underline flex items-center gap-1.5">🐙 GitHub</a>}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-4">Skills ({skills.length})</h3>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-[rgba(26,23,20,0.04)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(44,110,106,0.08)] flex items-center justify-center text-[0.7rem] font-semibold text-[var(--color-teal)]">
                      {s.skill_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">{s.skill_name}</p>
                      <p className="text-[0.7rem] text-[var(--color-ink4)]">
                        {[s.skill_level, s.experience_years && `${s.experience_years} yrs`].filter(Boolean).join(" · ")}
                        {s.endorsement_count > 0 && ` · ${s.endorsement_count} endorsement${s.endorsement_count > 1 ? "s" : ""}`}
                      </p>
                    </div>
                  </div>
                  {!isOwnProfile && user && (
                    <button onClick={() => handleEndorse(s.id)} className={`text-[0.72rem] px-3 py-1.5 rounded-full transition-all ${s.is_endorsed_by_me ? "bg-[rgba(44,110,106,0.1)] text-[var(--color-teal)] font-medium" : "border border-[rgba(26,23,20,0.1)] text-[var(--color-ink3)] hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"}`}>
                      {s.is_endorsed_by_me ? "Endorsed ✓" : "Endorse +"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[16px] p-6 mb-4">
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-4">Experience</h3>
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
            <h3 className="font-[var(--font-serif)] text-[1rem] font-medium text-[var(--color-ink)] mb-4">Education</h3>
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
      </div>
    </div>
  );
}
