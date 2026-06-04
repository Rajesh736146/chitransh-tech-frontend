export interface Profile {
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

export interface FollowUser {
  user_id: string;
  full_name: string;
  headline: string | null;
  profile_image: string | null;
}

export interface FollowListResponse {
  total: number;
  items: FollowUser[];
}

export interface ProfileView {
  viewer_id: string;
  full_name: string;
  headline: string | null;
  profile_image: string | null;
  viewed_at: string;
}
