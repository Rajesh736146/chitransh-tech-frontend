import api from "@/lib/axios";
import type {
  DashboardStats, AdminUserList, AdminJobList,
  AdminFeedList, AdminCompanyList,
} from "./types";

interface MessageResponse { message: string; }

export const adminApi = {
  // Dashboard
  getDashboard: () =>
    api.get<DashboardStats>("/admin/dashboard").then((r) => r.data),

  // Users
  listUsers: (params: { page?: number; page_size?: number; search?: string; role_id?: number; status?: string } = {}) =>
    api.get<AdminUserList>("/admin/users", { params }).then((r) => r.data),

  updateUserStatus: (userId: string, status: string) =>
    api.patch<MessageResponse>(`/admin/users/${userId}/status`, { status }).then((r) => r.data),

  updateUserRole: (userId: string, role_id: number) =>
    api.patch<MessageResponse>(`/admin/users/${userId}/role`, { role_id }).then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete<MessageResponse>(`/admin/users/${userId}`).then((r) => r.data),

  // Jobs
  listJobs: (params: { page?: number; page_size?: number; search?: string; status?: string } = {}) =>
    api.get<AdminJobList>("/admin/jobs", { params }).then((r) => r.data),

  updateJobStatus: (jobId: string, status: string) =>
    api.patch<MessageResponse>(`/admin/jobs/${jobId}/status`, { status }).then((r) => r.data),

  deleteJob: (jobId: string) =>
    api.delete<MessageResponse>(`/admin/jobs/${jobId}`).then((r) => r.data),

  // Feed
  listPosts: (params: { page?: number; page_size?: number; search?: string } = {}) =>
    api.get<AdminFeedList>("/admin/feed", { params }).then((r) => r.data),

  deletePost: (postId: string) =>
    api.delete<MessageResponse>(`/admin/feed/${postId}`).then((r) => r.data),

  // Companies
  listCompanies: (params: { page?: number; page_size?: number; search?: string } = {}) =>
    api.get<AdminCompanyList>("/admin/companies", { params }).then((r) => r.data),

  deleteCompany: (companyId: string) =>
    api.delete<MessageResponse>(`/admin/companies/${companyId}`).then((r) => r.data),
};
