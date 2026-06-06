"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { groupsApi } from "@/modules/groups/api";
import type { Group, GroupMember, GroupPost, GroupComment } from "@/modules/groups/api";
import { toast } from "sonner";

export default function GroupDetailPage() {
  useAuthHydration();
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<GroupPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState("");

  useEffect(() => {
    if (!id) return;
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      const [g, m, p] = await Promise.allSettled([
        groupsApi.getGroup(id),
        groupsApi.getMembers(id),
        groupsApi.getPosts(id),
      ]);
      if (g.status === "fulfilled") setGroup(g.value);
      if (m.status === "fulfilled") setMembers(m.value);
      if (p.status === "fulfilled") setPosts(p.value.items);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  const handleJoinLeave = async () => {
    if (!user || !group) return;
    try {
      if (group.is_member) {
        await groupsApi.leaveGroup(group.id);
        toast.success("Left group");
      } else {
        await groupsApi.joinGroup(group.id);
        toast.success("Joined!");
      }
      loadGroup();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() || !group) return;
    try {
      await groupsApi.createPost(group.id, { content: newPost });
      toast.success("Posted!");
      setNewPost("");
      loadGroup();
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-ink)] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!group) {
    return <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center"><p className="text-[var(--color-ink3)]">Group not found.</p></div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-4 sm:px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">ChitranshTech</span>
        </Link>
        <Link href="/groups" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)]">← Back to Groups</Link>
      </nav>

      {/* Group header */}
      <div className="max-w-[900px] mx-auto px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-[var(--color-teal)] to-[var(--color-teal2)] relative">
            {group.cover_image && <img src={group.cover_image} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div>
                <h1 className="font-[var(--font-serif)] text-[1.2rem] sm:text-[1.5rem] font-medium text-[var(--color-ink)] tracking-[-0.02em]">{group.name}</h1>
                {group.description && <p className="text-[0.85rem] text-[var(--color-ink3)] mt-1 max-w-[500px]">{group.description}</p>}
                <div className="flex items-center gap-4 mt-3 text-[0.78rem] text-[var(--color-ink4)]">
                  <span>👥 {group.member_count} members</span>
                  {group.category && <span className="capitalize">{group.category.replace("_", " ")}</span>}
                </div>
              </div>
              {user && (
                <button onClick={handleJoinLeave} className={`px-5 py-2 rounded-full text-[0.82rem] font-medium transition-all ${group.is_member ? "bg-[var(--color-cream2)] text-[var(--color-ink3)] border border-[rgba(26,23,20,0.1)] hover:border-[var(--color-warm)] hover:text-[var(--color-warm)]" : "bg-[var(--color-ink)] text-[var(--color-cream)] hover:bg-[var(--color-ink2)]"}`}>
                  {group.is_member ? "Leave Group" : "Join Group"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content: Posts + Members sidebar */}
      <div className="max-w-[900px] mx-auto px-3 sm:px-4 pb-6 sm:pb-8 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 sm:gap-6">
        {/* Posts feed */}
        <div>
          {/* Create post (only for members) */}
          {group.is_member && user && (
            <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.75rem] font-semibold text-[var(--color-cream)] shrink-0">
                  {user.full_name?.[0]?.toUpperCase()}
                </div>
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the group..."
                  rows={2}
                  className="flex-1 bg-[var(--color-cream)] rounded-[10px] px-3 py-2.5 text-[0.85rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)] resize-none"
                />
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={handleCreatePost} disabled={!newPost.trim()} className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.8rem] font-medium disabled:opacity-40 transition-all">
                  Post
                </button>
              </div>
            </div>
          )}

          {/* Posts */}
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <GroupPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-10 text-center">
              <p className="text-[1.5rem] mb-2">💬</p>
              <p className="text-[0.85rem] text-[var(--color-ink4)]">No posts in this group yet. {group.is_member ? "Be the first to post!" : "Join to start posting."}</p>
            </div>
          )}
        </div>

        {/* Members sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 sticky top-[76px]">
            <h3 className="text-[0.82rem] font-medium text-[var(--color-ink)] mb-4">Members ({members.length})</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {members.map((m) => (
                <Link key={m.user_id} href={`/profile/${m.user_id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-cream2)] flex items-center justify-center font-[var(--font-serif)] text-[0.65rem] font-semibold text-[var(--color-ink2)]">
                    {m.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[0.78rem] font-medium text-[var(--color-ink)]">{m.full_name}</p>
                    <p className="text-[0.65rem] text-[var(--color-ink4)] capitalize">{m.role}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Group Post Card ──────────────────────────────────────────────────────────
function GroupPostCard({ post }: { post: GroupPost }) {
  const { user } = useAuthStore();
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<GroupComment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    try {
      await groupsApi.toggleLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch { /* ignore */ }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      try { const res = await groupsApi.getComments(post.id); setComments(res); } catch { /* */ }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      const c = await groupsApi.addComment(post.id, newComment);
      setComments([...comments, c]);
      setNewComment("");
    } catch (err: any) { toast.error(err.response?.data?.detail || "Failed"); }
  };

  const timeAgo = () => {
    const diff = Date.now() - new Date(post.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] overflow-hidden">
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.75rem] font-semibold text-[var(--color-cream)]">
            {post.author_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="text-[0.85rem] font-medium text-[var(--color-ink)]">{post.author_name || "User"}</p>
            <p className="text-[0.68rem] text-[var(--color-ink4)]">{timeAgo()} ago</p>
          </div>
        </div>

        {post.title && <h4 className="text-[0.92rem] font-semibold text-[var(--color-ink)] mb-1">{post.title}</h4>}
        <p className="text-[0.85rem] text-[var(--color-ink2)] leading-[1.7] whitespace-pre-wrap">{post.content}</p>
        {post.media_url && <img src={post.media_url} alt="" className="w-full max-h-[300px] object-cover rounded-[10px] mt-3" />}
      </div>

      {/* Stats */}
      <div className="px-5 py-2 text-[0.72rem] text-[var(--color-ink4)] flex gap-4">
        <span>{likeCount} likes</span>
        <span>{post.comment_count} comments</span>
      </div>

      {/* Actions */}
      <div className="px-5 py-2 border-t border-[rgba(26,23,20,0.06)] flex gap-2">
        <button onClick={handleLike} className={`flex-1 py-2 rounded-[8px] text-[0.82rem] font-medium transition-all ${isLiked ? "text-[var(--color-warm)]" : "text-[var(--color-ink3)] hover:bg-[var(--color-cream2)]"}`}>
          {isLiked ? "🔥" : "👍"} Like
        </button>
        <button onClick={handleToggleComments} className="flex-1 py-2 rounded-[8px] text-[0.82rem] text-[var(--color-ink3)] hover:bg-[var(--color-cream2)] transition-all">
          💬 Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-4 border-t border-[rgba(26,23,20,0.04)]">
          {comments.length > 0 && (
            <div className="space-y-2 py-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-cream2)] flex items-center justify-center text-[0.55rem] font-semibold text-[var(--color-ink3)] shrink-0">
                    {c.author_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="bg-[var(--color-cream)] rounded-[8px] px-3 py-1.5 flex-1">
                    <p className="text-[0.72rem] font-medium text-[var(--color-ink)]">{c.author_name}</p>
                    <p className="text-[0.78rem] text-[var(--color-ink2)]">{c.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {user && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddComment()} placeholder="Write a comment..." className="flex-1 px-3 py-2 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-full text-[0.8rem] focus:outline-none focus:border-[var(--color-teal)]" />
              <button onClick={handleAddComment} disabled={!newComment.trim()} className="px-3 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.72rem] font-medium disabled:opacity-40">Post</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
