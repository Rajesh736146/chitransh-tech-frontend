export interface FeedPost {
  id: string;
  author_id: string | null;
  post_type: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  external_link: string | null;
  visibility: string;
  created_at: string;
  author_name: string | null;
  author_email: string | null;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface FeedListResponse {
  total: number;
  page: number;
  page_size: number;
  items: FeedPost[];
}

export interface CreatePostPayload {
  content: string;
  title?: string;
  media_url?: string;
  external_link?: string;
  visibility?: string;
}

export interface UpdatePostPayload {
  title?: string;
  content?: string;
  media_url?: string;
  external_link?: string;
  visibility?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author_name: string | null;
}

export interface CreateCommentPayload {
  comment_text: string;
}

export interface UpdateCommentPayload {
  comment_text: string;
}

export interface MessageResponse {
  message: string;
}
