"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/modules/auth/store";
import { feedApi } from "@/modules/feed/api";
import type { FeedPost, Comment } from "@/modules/feed/types";
import { toast } from "sonner";

function PostCard({
  post,
  currentUserId,
  onLike,
  onDelete,
  onEdit,
  onCommentAdded,
}: {
  post: FeedPost;
  currentUserId: string | null;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onCommentAdded: () => void;
}) {
  const [liked, setLiked] = useState(post.is_liked);
  const [likes, setLikes] = useState(post.like_count);
  const [showComment, setShowComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editText, setEditText] = useState(post.content || "");
  const [showActions, setShowActions] = useState(false);

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likes;
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    try {
      await onLike(post.id);
    } catch {
      setLiked(prevLiked);
      setLikes(prevCount);
    }
  };

  const handleToggleComments = async () => {
    if (!showComment && comments.length === 0) {
      setLoadingComments(true);
      try {
        const data = await feedApi.getComments(post.id);
        setComments(data);
      } catch {
        toast.error("Failed to load comments");
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComment(!showComment);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const text = commentText;
    setCommentText("");
    try {
      await feedApi.addComment(post.id, { comment_text: text });
      const data = await feedApi.getComments(post.id);
      setComments(data);
      onCommentAdded();
    } catch {
      toast.error("Failed to add comment");
      setCommentText(text);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await feedApi.updatePost(post.id, { content: editText });
      setShowEdit(false);
      toast.success("Post updated");
    } catch {
      toast.error("Failed to update post");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await feedApi.deleteComment(post.id, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const isOwner = currentUserId && post.author_id === currentUserId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
          {(post.author_name || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{post.author_name || "Unknown"}</p>
          <p className="text-xs text-gray-500 truncate">{post.author_email}</p>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
            {post.post_type === "JOB_POST" && (
              <span className="ml-2 text-blue-600 font-medium">Job Post</span>
            )}
          </p>
        </div>
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              ⋯
            </button>
            {showActions && (
              <div className="absolute right-0 top-5 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-28 text-xs">
                <button
                  onClick={() => { setShowEdit(true); setShowActions(false); }}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(post.id); setShowActions(false); }}
                  className="block w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.title && (
        <p className="text-sm font-semibold text-gray-900 mb-1">{post.title}</p>
      )}

      {showEdit ? (
        <div className="mb-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-black"
          />
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleEdit}
              className="text-xs bg-black text-white px-3 py-1 rounded-lg hover:bg-gray-800"
            >
              Save
            </button>
            <button
              onClick={() => { setShowEdit(false); setEditText(post.content || ""); }}
              className="text-xs text-gray-500 px-3 py-1 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 pb-2 border-b border-gray-100 mb-2">
        <span>{likes} likes</span>
        <span>{post.comment_count} comments</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            liked ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          👍 {liked ? "Liked" : "Like"}
        </button>
        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          💬 Comment
        </button>
        {post.external_link && (
          <a
            href={post.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
          >
            🔗 View Job
          </a>
        )}
      </div>

      {showComment && (
        <div className="mt-3 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-gray-400">Loading comments...</p>
          ) : comments.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <div className="w-5 h-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {(c.author_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-700">{c.author_name} </span>
                    <span className="text-gray-600">{c.comment_text}</span>
                    <div className="text-gray-400 mt-0.5">
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {currentUserId === c.user_id && (
                    <button
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No comments yet</p>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(); }}
              placeholder="Write a comment…"
              className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="text-xs bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");

  const fetchFeed = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await feedApi.listFeed(p, 20);
      setPosts(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch {
      toast.error("Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleCreatePost = async () => {
    if (!postText.trim()) return;
    const text = postText;
    setPostText("");
    try {
      await feedApi.createPost({ content: text });
      toast.success("Post created!");
      fetchFeed(1);
    } catch {
      toast.error("Failed to create post");
      setPostText(text);
    }
  };

  const handleLike = async (postId: string) => {
    await feedApi.toggleLike(postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      await feedApi.deletePost(postId);
      toast.success("Post deleted");
      setPosts(posts.filter((p) => p.id !== postId));
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const handleEdit = async (_postId: string, _content: string) => {
    // handled inside PostCard
  };

  const handleCommentAdded = () => {
    fetchFeed(page);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="h-14 bg-gray-900" />
              <div className="px-4 pb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-base font-bold -mt-6 border-2 border-white">
                  {user ? user.full_name[0].toUpperCase() : "?"}
                </div>
                <p className="font-semibold text-sm mt-2">{user?.full_name ?? "Guest"}</p>
                <p className="text-xs text-gray-500">{user?.email ?? "Sign in to continue"}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Quick links</p>
              {["Saved Jobs", "Applied Jobs", "My Resume", "Notifications"].map((item) => (
                <button key={item} className="w-full text-left text-sm text-gray-600 hover:text-black py-1 transition-colors">
                  {item}
                </button>
              ))}
            </div>
          </aside>

          {/* Feed */}
          <main className="lg:col-span-6 space-y-4">
            {user && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                    {user.full_name[0].toUpperCase()}
                  </div>
                  <textarea
                    value={postText}
                    onChange={(e) => setPostText(e.target.value)}
                    placeholder="Share an update, insight, or opportunity…"
                    rows={3}
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleCreatePost}
                    disabled={!postText.trim()}
                    className="text-xs bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                        <div className="h-2 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id ?? null}
                  onLike={handleLike}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onCommentAdded={handleCommentAdded}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => fetchFeed(page - 1)}
                  disabled={page <= 1}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => fetchFeed(page + 1)}
                  disabled={page >= totalPages}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </main>

          {/* Right sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trending</p>
              {["#OpenToWork", "#TechJobs", "#ProductManagement", "#AIResume", "#StartupHiring"].map((tag, i) => (
                <div key={tag} className="mb-2">
                  <p className="text-sm font-medium text-gray-800">{tag}</p>
                  <p className="text-xs text-gray-400">{(5 - i) * 1200 + 800} posts</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">People to follow</p>
              {[
                { name: "Kunal Shah", role: "Founder, CRED", avatar: "K" },
                { name: "Deepinder Goyal", role: "CEO, Zomato", avatar: "D" },
                { name: "Nikhil Kamath", role: "Co-founder, Zerodha", avatar: "N" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">{p.role}</p>
                  </div>
                  <button className="text-xs text-blue-600 hover:underline shrink-0">Follow</button>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
