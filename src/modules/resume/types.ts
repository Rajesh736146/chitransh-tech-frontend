export interface PersonalDetails {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study?: string;
  grade?: string;
  start_year?: number;
  end_year?: number;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Project {
  title: string;
  description: string;
  role?: string;
  technologies_or_tools: string[];
  url?: string;
  impact?: string;
}

export interface WorkExperience {
  company: string;
  role: string;
  responsibilities: string[];
  tools_or_technologies: string[];
  achievements: string[];
  start_date?: string;
  end_date?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
  year?: number;
}

export interface BuildResumeRequest {
  title: string;
  target_role: string;
  personal_details: PersonalDetails;
  education: Education[];
  skills: Skill[];
  projects: Project[];
  work_experience: WorkExperience[];
  certifications: Certification[];
  extra_sections?: Record<string, any>;
}

export interface EnhancedSummary {
  summary: string;
  keywords: string[];
}

export interface EnhancedSkills {
  skills: Skill[];
  keywords: string[];
}

export interface EnhancedProject {
  title: string;
  bullets: string[];
  keywords: string[];
}

export interface EnhancedExperience {
  company: string;
  role: string;
  start_date?: string;
  end_date?: string;
  duration?: string;
  bullets: string[];
  keywords: string[];
}

export interface AIEnhanced {
  summary: EnhancedSummary;
  skills?: EnhancedSkills;
  projects: EnhancedProject[];
  work_experience: EnhancedExperience[];
}

export interface BuildResumeResponse {
  title: string;
  target_role: string;
  personal_details: Record<string, any>;
  education: Record<string, any>[];
  certifications: Record<string, any>[];
  extra_sections: Record<string, any>;
  ai_enhanced: AIEnhanced;
}
