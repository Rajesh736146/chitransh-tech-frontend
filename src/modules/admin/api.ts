import { api } from "@/lib/api";

export interface DashboardStats {
  total_users: number;
  total_job_seekers: number;
  total_employers: number;
  total_admins: number;
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
  total_companies: number;
  total_feed_posts: number;
  new_users_last_7_days: number;
  new_jobs_last_7_days: number;
  new_applications_last_7_days: number;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role_id: number;
  profile_image: string | null;
  status: string;
  email_verified: boolean;
  created_at: string;
}

export interface AdminJob {
  id: string;
  title: string;
  company_name: string | null;
  location: string | null;
  employment_type: string | null;
  status: string;
  posted_by: string;
  poster_name: string | null;
  application_count: number;
  created_at: string;
}

export interface AdminFeedPost {
  id: string;
  author_id: string | null;
  author_name: string | null;
  post_type: string;
  title: string | null;
  content: string | null;
  visibility: string;
  like_count: number;
  comment_count: number;
  created_at: string;
}

export interface AdminCompany {
  id: string;
  company_name: string;
  industry: string | null;
  company_size: string | null;
  headquarters: string | null;
  job_count: number;
  created_at: string;
}

export const adminApi = {
  getDashboard: async (): Promise<DashboardStats> => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },

  listUsers: async (params: { page?: number; page_size?: number; search?: string; role_id?: number; status?: string } = {}) => {
    const res = await api.get("/admin/users", { params });
    return res.data as { total: number; page: number; page_size: number; items: AdminUser[] };
  },

  updateUserStatus: async (userId: string, status: string) => {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  updateUserRole: async (userId: string, role_id: number) => {
    const res = await api.patch(`/admin/users/${userId}/role`, { role_id });
    return res.data;
  },

  deleteUser: async (userId: string) => {
    const res = await api.delete(`/admin/users/${userId}`);
    return res.data;
  },

  listJobs: async (params: { page?: number; page_size?: number; search?: string; status?: string } = {}) => {
    const res = await api.get("/admin/jobs", { params });
    return res.data as { total: number; page: number; page_size: number; items: AdminJob[] };
  },

  updateJobStatus: async (jobId: string, status: string) => {
    const res = await api.patch(`/admin/jobs/${jobId}/status`, { status });
    return res.data;
  },

  deleteJob: async (jobId: string) => {
    const res = await api.delete(`/admin/jobs/${jobId}`);
    return res.data;
  },

  listPosts: async (params: { page?: number; page_size?: number; search?: string } = {}) => {
    const res = await api.get("/admin/feed", { params });
    return res.data as { total: number; page: number; page_size: number; items: AdminFeedPost[] };
  },

  deletePost: async (postId: string) => {
    const res = await api.delete(`/admin/feed/${postId}`);
    return res.data;
  },

  listCompanies: async (params: { page?: number; page_size?: number; search?: string } = {}) => {
    const res = await api.get("/admin/companies", { params });
    return res.data as { total: number; page: number; page_size: number; items: AdminCompany[] };
  },

  deleteCompany: async (companyId: string) => {
    const res = await api.delete(`/admin/companies/${companyId}`);
    return res.data;
  },
};
