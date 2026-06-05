export interface SkillOut {
  id: string;
  skill_name: string;
  mandatory: boolean;
}

export interface Job {
  id: string;
  company_id: string;
  company_name: string | null;
  title: string;
  description: string;
  employment_type: string | null;
  experience_required: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  remote_type: string | null;
  status: string;
  posted_by: string;
  created_at: string;
  updated_at: string;
  skills: SkillOut[];
  view_count?: number;
  application_count?: number;
  company_logo?: string | null;
}

export interface JobListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Job[];
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  resume_id?: string | null;
  resume_url?: string | null;
  application_status: string;
  ai_match_score?: number | null;
  applied_at: string;
  job_title?: string | null;
  company_name?: string | null;
}

export interface JobApplicationListResponse {
  total: number;
  page: number;
  page_size: number;
  items: JobApplication[];
}

export interface Company {
  id: string;
  company_name: string;
  company_description: string | null;
  website: string | null;
  logo_url: string | null;
  company_size: string | null;
  industry: string | null;
  headquarters: string | null;
  created_at: string;
}

export interface JobCreatePayload {
  company_id: string;
  title: string;
  description: string;
  employment_type?: string;
  experience_required?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  remote_type?: string;
  skills: string[];
}

export interface JobSearchParams {
  page?: number;
  page_size?: number;
  search?: string;
  location?: string;
  employment_type?: string;
  remote_type?: string;
  company_name?: string;
}
