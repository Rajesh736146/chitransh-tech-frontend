import { api } from "@/lib/api";
import type { JobListResponse, FeaturedJobListResponse } from "./types";

interface ListJobsParams {
  page?: number;
  page_size?: number;
  search?: string;
  location?: string;
  employment_type?: string;
  remote_type?: string;
  company_name?: string;
  category?: string;
}

export const jobsApi = {
  listJobs: async (params: ListJobsParams = {}): Promise<JobListResponse> => {
    const res = await api.get("/jobs/", { params });
    return res.data;
  },

  getFeaturedJobs: async (limit = 6, category?: string): Promise<FeaturedJobListResponse> => {
    const params: Record<string, string | number> = { limit };
    if (category) params.category = category;
    const res = await api.get("/jobs/featured", { params });
    return res.data;
  },

  getJob: async (id: string) => {
    const res = await api.get(`/jobs/${id}`);
    return res.data;
  },
};
