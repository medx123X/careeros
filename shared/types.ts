export type ProfileType = 'master' | 'job' | 'freelance';

export type PlatformCategory = 'job' | 'freelance';

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  type: ProfileType;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  job_title: string | null;
  bio: string | null;
  skills: string | null;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: number;
  user_id: number;
  company: string;
  position: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Education {
  id: number;
  user_id: number;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  technologies: string | null;
  link: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: number;
  user_id: number;
  name: string;
  organization: string;
  date: string;
  credential_url: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: number;
  user_id: number;
  name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  is_cv: boolean;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  hashtags: string | null;
  links: string | null;
  attachments: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostVersion {
  id: number;
  post_id: number;
  platform: string;
  content: string;
  hashtags: string | null;
  links: string | null;
  created_at: string;
  updated_at: string;
}

export interface Platform {
  id: number;
  name: string;
  category: PlatformCategory;
  profile_url: string | null;
  logo: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
