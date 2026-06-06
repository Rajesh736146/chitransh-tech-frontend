import { api } from "@/lib/api";

export interface FeedPost {
  id: string;
  author_id: string | null;
  post_type: string;
  title: string | null;
  content: string | null;
  media_url: string | null;
  external_link: string | null;
  category: string | null;
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

export interface Comment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author_name: string | null;
}

export const feedApi = {
  listFeed: async (page = 1, page_size = 20, category?: string): Promise<FeedListResponse> => {
    const params: Record<string, any> = { page, page_size };
    if (category) params.category = category;
    const res = await api.get("/feed/", { params });
    return res.data;
  },

  createPost: async (data: FormData): Promise<FeedPost> => {
    const res = await api.post("/feed/with-media", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  toggleLike: async (postId: string): Promise<{ message: string }> => {
    const res = await api.post(`/feed/${postId}/like`);
    return res.data;
  },

  getComments: async (postId: string): Promise<Comment[]> => {
    const res = await api.get(`/feed/${postId}/comments`);
    return res.data;
  },

  addComment: async (postId: string, comment_text: string): Promise<Comment> => {
    const res = await api.post(`/feed/${postId}/comments`, { comment_text });
    return res.data;
  },

  deletePost: async (postId: string): Promise<void> => {
    await api.delete(`/feed/${postId}`);
  },
};
