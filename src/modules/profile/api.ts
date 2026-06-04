import api from "@/lib/axios";
import type {
  Profile, Skill, Education, Experience,
  FollowListResponse, ProfileView,
} from "./types";

interface MessageResponse { message: string; }

export const profileApi = {
  // Profile
  getMyProfile: () =>
    api.get<Profile>("/profile/me").then((r) => r.data),

  getProfile: (userId: string) =>
    api.get<Profile>(`/profile/${userId}`).then((r) => r.data),

  updateProfile: (data: Partial<Profile>) =>
    api.patch<Profile>("/profile/me", data).then((r) => r.data),

  // Follow
  toggleFollow: (userId: string) =>
    api.post<MessageResponse>(`/profile/${userId}/follow`).then((r) => r.data),

  getFollowers: (userId: string) =>
    api.get<FollowListResponse>(`/profile/${userId}/followers`).then((r) => r.data),

  getFollowing: (userId: string) =>
    api.get<FollowListResponse>(`/profile/${userId}/following`).then((r) => r.data),

  // Skills
  addSkill: (data: { skill_name: string; experience_years?: number; skill_level?: string }) =>
    api.post<Skill>("/profile/skills", data).then((r) => r.data),

  getUserSkills: (userId: string) =>
    api.get<Skill[]>(`/profile/${userId}/skills`).then((r) => r.data),

  deleteSkill: (skillId: string) =>
    api.delete<MessageResponse>(`/profile/skills/${skillId}`).then((r) => r.data),

  endorseSkill: (skillId: string) =>
    api.post<MessageResponse>(`/profile/skills/${skillId}/endorse`).then((r) => r.data),

  // Education
  addEducation: (data: { institution_name: string; degree?: string; specialization?: string; start_year?: number; end_year?: number }) =>
    api.post<Education>("/profile/education", data).then((r) => r.data),

  getUserEducation: (userId: string) =>
    api.get<Education[]>(`/profile/${userId}/education`).then((r) => r.data),

  deleteEducation: (eduId: string) =>
    api.delete<MessageResponse>(`/profile/education/${eduId}`).then((r) => r.data),

  // Experience
  addExperience: (data: { company_name: string; designation?: string; start_date?: string; end_date?: string; description?: string }) =>
    api.post<Experience>("/profile/experience", data).then((r) => r.data),

  getUserExperience: (userId: string) =>
    api.get<Experience[]>(`/profile/${userId}/experience`).then((r) => r.data),

  deleteExperience: (expId: string) =>
    api.delete<MessageResponse>(`/profile/experience/${expId}`).then((r) => r.data),

  // Share
  shareProfile: (userId: string, platform?: string) =>
    api.post<MessageResponse>(`/profile/${userId}/share`, { platform }).then((r) => r.data),

  // Profile views
  getProfileViews: () =>
    api.get<ProfileView[]>("/profile/me/views").then((r) => r.data),
};
