import { api } from "@/lib/api";

export interface Group {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  category: string | null;
  created_by: string;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

export interface GroupListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Group[];
}

export interface GroupMember {
  user_id: string;
  full_name: string;
  profile_image: string | null;
  role: string;
  joined_at: string;
}

export interface GroupPost {
  id: string;
  group_id: string;
  author_id: string;
  title: string | null;
  content: string;
  media_url: string | null;
  created_at: string;
  author_name: string | null;
  group_name: string | null;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface GroupComment {
  id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  author_name: string | null;
}

export const groupsApi = {
  listGroups: async (page = 1, page_size = 20, search?: string, category?: string): Promise<GroupListResponse> => {
    const params: Record<string, any> = { page, page_size };
    if (search) params.search = search;
    if (category) params.category = category;
    const res = await api.get("/groups/", { params });
    return res.data;
  },

  getMyGroups: async (page = 1, page_size = 20): Promise<GroupListResponse> => {
    const res = await api.get("/groups/my", { params: { page, page_size } });
    return res.data;
  },

  getGroup: async (id: string): Promise<Group> => {
    const res = await api.get(`/groups/${id}`);
    return res.data;
  },

  createGroup: async (data: FormData): Promise<Group> => {
    const res = await api.post("/groups/", data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data;
  },

  joinGroup: async (id: string): Promise<{ message: string }> => {
    const res = await api.post(`/groups/${id}/join`);
    return res.data;
  },

  leaveGroup: async (id: string): Promise<{ message: string }> => {
    const res = await api.post(`/groups/${id}/leave`);
    return res.data;
  },

  getMembers: async (id: string): Promise<GroupMember[]> => {
    const res = await api.get(`/groups/${id}/members`);
    return res.data;
  },

  getPosts: async (groupId: string, page = 1, page_size = 20): Promise<{ total: number; items: GroupPost[] }> => {
    const res = await api.get(`/groups/${groupId}/posts`, { params: { page, page_size } });
    return res.data;
  },

  createPost: async (groupId: string, data: { title?: string; content: string; media_url?: string }): Promise<GroupPost> => {
    const res = await api.post(`/groups/${groupId}/posts`, data);
    return res.data;
  },

  toggleLike: async (postId: string): Promise<{ message: string }> => {
    const res = await api.post(`/groups/posts/${postId}/like`);
    return res.data;
  },

  getComments: async (postId: string): Promise<GroupComment[]> => {
    const res = await api.get(`/groups/posts/${postId}/comments`);
    return res.data;
  },

  addComment: async (postId: string, comment_text: string): Promise<GroupComment> => {
    const res = await api.post(`/groups/posts/${postId}/comments`, { comment_text });
    return res.data;
  },

  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },
};
