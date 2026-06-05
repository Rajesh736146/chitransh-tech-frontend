import api from "@/lib/axios";
import type {
  Job,
  JobListResponse,
  Company,
  JobCreatePayload,
  JobSearchParams,
  JobApplication,
  JobApplicationListResponse,
} from "./types";

export const jobsApi = {
  // ── public ──────────────────────────────────────────────────────────────
  listJobs: (params: JobSearchParams = {}) =>
    api.get<JobListResponse>("/jobs/", { params }).then((r) => r.data),

  getFeaturedJobs: (limit = 10) =>
    api.get<JobListResponse>("/jobs/featured", { params: { limit } }).then((r) => r.data),

  getJob: (id: string) =>
    api.get<Job>(`/jobs/${id}`).then((r) => r.data),

  listCompanies: () =>
    api.get<Company[]>("/jobs/companies").then((r) => r.data),

  // ── employer ─────────────────────────────────────────────────────────────
  createJob: (payload: JobCreatePayload) =>
    api.post<Job>("/jobs/", payload).then((r) => r.data),

  getMyJobs: (page = 1, page_size = 20) =>
    api.get<JobListResponse>("/jobs/my", { params: { page, page_size } }).then((r) => r.data),

  getMyApplications: (page = 1, page_size = 20) =>
    api.get<JobApplicationListResponse>("/jobs/my-applications", { params: { page, page_size } }).then((r) => r.data),

  applyToJob: (id: string, file: File) => {
    // Apply with file name as reference (R2 upload handled separately if needed)
    return api
      .post<JobApplication>(`/jobs/${id}/apply-with-url`, {
        resume_url: `uploaded://${file.name}`,
      })
      .then((r) => r.data);
  },

  getJobApplicants: (id: string, page = 1, page_size = 20) =>
    api.get<JobApplicationListResponse>(`/jobs/${id}/applicants`, { params: { page, page_size } }).then((r) => r.data),

  updateJob: (id: string, payload: Partial<JobCreatePayload> & { status?: string }) =>
    api.patch<Job>(`/jobs/${id}`, payload).then((r) => r.data),

  deleteJob: (id: string) =>
    api.delete(`/jobs/${id}`).then((r) => r.data),

  createCompany: (payload: { company_name: string; industry?: string; headquarters?: string }) =>
    api.post<Company>("/jobs/companies", payload).then((r) => r.data),
};
