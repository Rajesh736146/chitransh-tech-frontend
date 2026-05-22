import api from "@/lib/axios";
import type {
  FeedListResponse,
  FeedPost,
  CreatePostPayload,
  UpdatePostPayload,
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  MessageResponse,
} from "./types";

export const feedApi = {
  listFeed: (page = 1, pageSize = 20) =>
    api.get<FeedListResponse>("/feed/", { params: { page, page_size: pageSize } }).then((r) => r.data),

  getPost: (postId: string) =>
    api.get<FeedPost>(`/feed/${postId}`).then((r) => r.data),

  createPost: (payload: CreatePostPayload) =>
    api.post<FeedPost>("/feed/", payload).then((r) => r.data),

  updatePost: (postId: string, payload: UpdatePostPayload) =>
    api.patch<FeedPost>(`/feed/${postId}`, payload).then((r) => r.data),

  deletePost: (postId: string) =>
    api.delete<MessageResponse>(`/feed/${postId}`).then((r) => r.data),

  toggleLike: (postId: string) =>
    api.post<MessageResponse>(`/feed/${postId}/like`).then((r) => r.data),

  getComments: (postId: string) =>
    api.get<Comment[]>(`/feed/${postId}/comments`).then((r) => r.data),

  addComment: (postId: string, payload: CreateCommentPayload) =>
    api.post<Comment>(`/feed/${postId}/comments`, payload).then((r) => r.data),

  deleteComment: (postId: string, commentId: string) =>
    api.delete<MessageResponse>(`/feed/${postId}/comments/${commentId}`).then((r) => r.data),

  updateComment: (postId: string, commentId: string, payload: UpdateCommentPayload) =>
    api.patch<Comment>(`/feed/${postId}/comments/${commentId}`, payload).then((r) => r.data),

  getMyPosts: (page = 1, pageSize = 20) =>
    api.get<FeedListResponse>("/feed/my", { params: { page, page_size: pageSize } }).then((r) => r.data),
};
