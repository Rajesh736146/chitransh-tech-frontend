import { api } from "@/lib/api";

export interface ProfileData {
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

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  profile_image?: string;
  headline?: string;
  bio?: string;
  current_company?: string;
  current_position?: string;
  experience_years?: number;
  location?: string;
  notice_period?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface Skill {
  id: string;
  skill_name: string;
  experience_years: number | null;
  skill_level: string | null;
  endorsement_count: number;
  is_endorsed_by_me: boolean;
}

export interface Education {
  id: string;
  institution_name: string;
  degree: string | null;
  specialization: string | null;
  start_year: number | null;
  end_year: number | null;
}

export interface Experience {
  id: string;
  company_name: string;
  designation: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_id: string | null;
  resume_url: string | null;
  application_status: string;
  ai_match_score: number | null;
  applied_at: string;
  job_title: string | null;
  company_name: string | null;
}

export const profileApi = {
  getMyProfile: async (): Promise<ProfileData> => {
    const res = await api.get("/profile/me");
    return res.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<ProfileData> => {
    const res = await api.patch("/profile/me", data);
    return res.data;
  },

  getMySkills: async (userId: string): Promise<Skill[]> => {
    const res = await api.get(`/profile/${userId}/skills`);
    return res.data;
  },

  addSkill: async (data: { skill_name: string; experience_years?: number; skill_level?: string }): Promise<Skill> => {
    const res = await api.post("/profile/skills", data);
    return res.data;
  },

  deleteSkill: async (skillId: string): Promise<void> => {
    await api.delete(`/profile/skills/${skillId}`);
  },

  getEducation: async (userId: string): Promise<Education[]> => {
    const res = await api.get(`/profile/${userId}/education`);
    return res.data;
  },

  addEducation: async (data: { institution_name: string; degree?: string; specialization?: string; start_year?: number; end_year?: number }): Promise<Education> => {
    const res = await api.post("/profile/education", data);
    return res.data;
  },

  deleteEducation: async (eduId: string): Promise<void> => {
    await api.delete(`/profile/education/${eduId}`);
  },

  getExperience: async (userId: string): Promise<Experience[]> => {
    const res = await api.get(`/profile/${userId}/experience`);
    return res.data;
  },

  addExperience: async (data: { company_name: string; designation?: string; start_date?: string; end_date?: string; description?: string }): Promise<Experience> => {
    const res = await api.post("/profile/experience", data);
    return res.data;
  },

  deleteExperience: async (expId: string): Promise<void> => {
    await api.delete(`/profile/experience/${expId}`);
  },

  getMyApplications: async (page = 1, page_size = 20): Promise<{ total: number; items: JobApplication[] }> => {
    const res = await api.get("/jobs/my-applications", { params: { page, page_size } });
    return res.data;
  },
};
