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

export interface AdminUserList {
  total: number;
  page: number;
  page_size: number;
  items: AdminUser[];
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

export interface AdminJobList {
  total: number;
  page: number;
  page_size: number;
  items: AdminJob[];
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

export interface AdminFeedList {
  total: number;
  page: number;
  page_size: number;
  items: AdminFeedPost[];
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

export interface AdminCompanyList {
  total: number;
  page: number;
  page_size: number;
  items: AdminCompany[];
}
