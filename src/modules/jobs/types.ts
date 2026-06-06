export interface JobSkill {
  id: string;
  skill_name: string;
  mandatory: boolean;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  employment_type: string | null;
  experience_required: string | null;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  remote_type: string | null;
  job_category: string;
  status: string;
  posted_by: string;
  created_at: string;
  updated_at: string;
  skills: JobSkill[];
  company_name: string | null;
}

export interface FeaturedJob extends Job {
  company_logo: string | null;
  view_count: number;
  application_count: number;
}

export interface JobListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Job[];
}

export interface FeaturedJobListResponse {
  total: number;
  items: FeaturedJob[];
}
