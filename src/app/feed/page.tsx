"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { feedApi } from "@/modules/feed/api";
import type { FeedPost, Comment } from "@/modules/feed/api";
import { toast } from "sonner";

// ─── Trending topics (static for now) ─────────────────────────────────────────
const TRENDING = [
  { tag: "#OpenToWork", posts: "6800 posts" },
  { tag: "#TechJobs", posts: "5600 posts" },
  { tag: "#ProductManagement", posts: "4400 posts" },
  { tag: "#AIResume", posts: "3200 posts" },
  { tag: "#StartupHiring", posts: "2000 posts" },
];

const QUICK_LINKS = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Applied Jobs", href: "/dashboard" },
  { label: "My Resume", href: "/resume/build" },
  { label: "My Profile", href: "/dashboard" },
];

export default function FeedPage() {
  useAuthHydration();
  const { user, logout } = useAuthStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeed = async (p = 1) => {
    setIsLoading(p === 1);
    try {
      const res = await feedApi.listFeed(p, 15);
      if (p === 1) setPosts(res.items);
      else setPosts((prev) => [...prev, ...res.items]);
      setTotal(res.total);
      setPage(p);
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadFeed(); }, []);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">ChitranshTech</span>
        </Link>

        <ul className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
          <li><Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Find Jobs</Link></li>
          <li><Link href="/feed" className="text-[0.85rem] text-[var(--color-ink)] font-medium border-b-2 border-[var(--color-ink)] pb-0.5">Feed</Link></li>
          <li><Link href="/network" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Network</Link></li>
          <li><Link href="/resume/build" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Build ATS CV</Link></li>
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">Dashboard</Link>
              <button onClick={() => { logout(); window.location.href = "/"; }} className="text-[0.85rem] text-[var(--color-warm)] px-3 py-1.5 rounded-[10px] hover:bg-[rgba(232,128,58,0.08)] transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="text-[0.85rem] font-medium text-[var(--color-cream)] bg-[var(--color-ink)] px-5 py-[0.45rem] rounded-full hover:bg-[var(--color-ink2)] transition-all">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Main layout: 3 columns */}
      <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-6">
        {/* Left sidebar */}
        <aside className="hidden lg:block">
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 mb-4">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-cream2)] flex items-center justify-center font-[var(--font-serif)] text-[1.3rem] font-semibold text-[var(--color-ink2)] mb-2">
                {user ? user.full_name?.[0]?.toUpperCase() : "?"}
              </div>
              <h3 className="text-[0.9rem] font-medium text-[var(--color-ink)]">{user ? user.full_name : "Guest"}</h3>
              <p className="text-[0.75rem] text-[var(--color-ink4)]">{user ? user.email : "Sign in to continue"}</p>
            </div>
          </div>

          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-4">
            <h4 className="text-[0.72rem] text-[var(--color-ink4)] uppercase tracking-[0.08em] font-medium mb-3">Quick Links</h4>
            <div className="space-y-1">
              {QUICK_LINKS.map((link) => (
                <Link key={link.label} href={link.href} className="block text-[0.85rem] text-[var(--color-ink2)] py-1.5 hover:text-[var(--color-teal)] transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Center feed */}
        <main className="min-w-0">
          {/* Create post */}
          {user && <CreatePostCard onCreated={() => loadFeed(1)} />}

          {/* Posts */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-cream2)]" />
                    <div><div className="h-3 w-28 bg-[var(--color-cream2)] rounded" /><div className="h-2 w-20 bg-[var(--color-cream2)] rounded mt-1.5" /></div>
                  </div>
                  <div className="h-3 w-full bg-[var(--color-cream2)] rounded mb-2" />
                  <div className="h-3 w-2/3 bg-[var(--color-cream2)] rounded" />
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onUpdate={() => loadFeed(1)} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-10 text-center">
              <p className="text-[2rem] mb-3">📰</p>
              <h3 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-2">No posts yet</h3>
              <p className="text-[0.85rem] text-[var(--color-ink4)]">Be the first to share something!</p>
            </div>
          )}

          {/* Load more */}
          {posts.length < total && (
            <div className="text-center mt-6">
              <button onClick={() => loadFeed(page + 1)} className="px-6 py-2.5 bg-white border border-[rgba(26,23,20,0.08)] rounded-full text-[0.82rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-all">
                Load More Posts
              </button>
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block">
          {/* Trending */}
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 mb-4">
            <h4 className="text-[0.75rem] text-[var(--color-ink4)] uppercase tracking-[0.08em] font-medium mb-4">Trending</h4>
            <div className="space-y-3">
              {TRENDING.map((t) => (
                <div key={t.tag}>
                  <p className="text-[0.88rem] font-medium text-[var(--color-ink)]">{t.tag}</p>
                  <p className="text-[0.72rem] text-[var(--color-ink4)]">{t.posts}</p>
                </div>
              ))}
            </div>
          </div>

          {/* People to follow (placeholder) */}
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5">
            <h4 className="text-[0.75rem] text-[var(--color-ink4)] uppercase tracking-[0.08em] font-medium mb-4">People to Follow</h4>
            <div className="space-y-3">
              {[
                { name: "Kunal Shah", role: "Founder, CRED", color: "bg-[rgba(200,230,60,0.3)] text-[#8CAF00]" },
                { name: "Deepinder Goyal", role: "CEO, Zomato", color: "bg-[rgba(59,130,246,0.1)] text-[#1D4ED8]" },
                { name: "Nikhil Kamath", role: "Co-founder, Zerodha", color: "bg-[rgba(44,110,106,0.12)] text-[#1A4D4A]" },
              ].map((p) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[0.65rem] font-semibold ${p.color}`}>
                      {p.name[0]}
                    </div>
                    <div>
                      <p className="text-[0.8rem] font-medium text-[var(--color-ink)]">{p.name}</p>
                      <p className="text-[0.68rem] text-[var(--color-ink4)]">{p.role}</p>
                    </div>
                  </div>
                  <button className="text-[0.72rem] text-[var(--color-teal)] font-medium hover:underline">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Create Post Card ─────────────────────────────────────────────────────────
function CreatePostCard({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (f && f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("file", file);
      await feedApi.createPost(formData);
      toast.success("Post published!");
      setContent("");
      setFile(null);
      setPreview(null);
      setExpanded(false);
      onCreated();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] p-5 mb-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.85rem] font-semibold text-[var(--color-cream)] shrink-0">
          {user?.full_name?.[0]?.toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => { setContent(e.target.value); if (!expanded) setExpanded(true); }}
            onFocus={() => setExpanded(true)}
            placeholder="What's on your mind? Share a thought, update, or opportunity..."
            rows={expanded ? 4 : 2}
            className="w-full bg-[var(--color-cream)] rounded-[10px] px-4 py-3 text-[0.88rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:ring-1 focus:ring-[var(--color-teal)] resize-none transition-all"
          />
        </div>
      </div>

      {/* Image preview */}
      {preview && (
        <div className="mt-3 ml-[52px] relative inline-block">
          <img src={preview} alt="Preview" className="max-h-[200px] rounded-[10px] border border-[rgba(26,23,20,0.06)]" />
          <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full text-[0.7rem] flex items-center justify-center hover:bg-black/80">✕</button>
        </div>
      )}

      {/* File name for non-image */}
      {file && !preview && (
        <div className="mt-2 ml-[52px] flex items-center gap-2 text-[0.8rem] text-[var(--color-ink3)]">
          <span>📎 {file.name}</span>
          <button onClick={() => setFile(null)} className="text-[var(--color-warm)] text-[0.75rem]">✕</button>
        </div>
      )}

      {expanded && (
        <div className="flex items-center justify-between mt-3 ml-[52px]">
          <div className="flex items-center gap-1">
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-[0.8rem] text-[var(--color-ink3)] px-3 py-1.5 rounded-[8px] hover:bg-[var(--color-cream2)] transition-colors">
              🖼️ Photo
            </button>
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-[0.8rem] text-[var(--color-ink3)] px-3 py-1.5 rounded-[8px] hover:bg-[var(--color-cream2)] transition-colors">
              🎥 Video
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" className="hidden" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} />
          </div>
          <button
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className="px-5 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.82rem] font-medium hover:bg-[var(--color-ink2)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, onUpdate }: { post: FeedPost; onUpdate: () => void }) {
  const { user } = useAuthStore();
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiked, setIsLiked] = useState(post.is_liked);

  const formatDate = () => {
    const d = new Date(post.created_at);
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleLike = async () => {
    if (!user) { toast.error("Please sign in to like"); return; }
    try {
      await feedApi.toggleLike(post.id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch { /* ignore */ }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      try {
        const res = await feedApi.getComments(post.id);
        setComments(res);
      } catch { /* ignore */ }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;
    try {
      const comment = await feedApi.addComment(post.id, newComment);
      setComments([...comments, comment]);
      setNewComment("");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to comment");
    }
  };

  return (
    <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[14px] overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-[var(--font-serif)] text-[0.85rem] font-semibold text-[var(--color-cream)] shrink-0">
            {post.author_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{post.author_name || "User"}</p>
            <p className="text-[0.72rem] text-[var(--color-ink4)]">{post.author_email}</p>
            <p className="text-[0.7rem] text-[var(--color-ink4)]">{formatDate()}</p>
          </div>
          {post.post_type === "JOB_POST" && (
            <span className="text-[0.65rem] px-2 py-0.5 rounded bg-[rgba(200,230,60,0.2)] text-[var(--color-lime-dk)] font-medium">JOB</span>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-[0.95rem] font-semibold text-[var(--color-ink)] mb-1">{post.title}</h3>
        )}

        {/* Content */}
        {post.content && (
          <p className="text-[0.88rem] text-[var(--color-ink2)] leading-[1.7] whitespace-pre-wrap mb-3">{post.content}</p>
        )}

        {/* Media */}
        {post.media_url && (
          <div className="mb-3 -mx-5">
            <img src={post.media_url} alt="" className="w-full max-h-[450px] object-cover" />
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="px-5 py-2 flex items-center justify-between text-[0.75rem] text-[var(--color-ink4)]">
        <span>{likeCount} likes</span>
        <span>{post.comment_count} comments</span>
      </div>

      {/* Actions */}
      <div className="px-5 py-2 border-t border-[rgba(26,23,20,0.06)] flex items-center gap-1">
        <button onClick={handleLike} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-[0.82rem] font-medium transition-all ${isLiked ? "text-[var(--color-warm)]" : "text-[var(--color-ink3)] hover:bg-[var(--color-cream2)]"}`}>
          {isLiked ? "🔥" : "👍"} Like
        </button>
        <button onClick={handleToggleComments} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-[0.82rem] font-medium text-[var(--color-ink3)] hover:bg-[var(--color-cream2)] transition-all">
          💬 Comment
        </button>
        {post.external_link && post.post_type === "JOB_POST" && (
          <Link href={post.external_link} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[8px] text-[0.82rem] font-medium text-[var(--color-teal)] hover:bg-[rgba(44,110,106,0.05)] transition-all">
            🔗 View Job
          </Link>
        )}
      </div>

      {/* Comments */}
      {showComments && (
        <div className="px-5 pb-4 border-t border-[rgba(26,23,20,0.04)]">
          {comments.length > 0 && (
            <div className="space-y-3 py-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--color-cream2)] flex items-center justify-center text-[0.6rem] font-semibold text-[var(--color-ink3)] shrink-0">
                    {c.author_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="bg-[var(--color-cream)] rounded-[10px] px-3 py-2 flex-1">
                    <p className="text-[0.78rem] font-medium text-[var(--color-ink)]">{c.author_name || "User"}</p>
                    <p className="text-[0.82rem] text-[var(--color-ink2)] leading-[1.5]">{c.comment_text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {user && (
            <div className="flex gap-2 mt-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-[0.6rem] font-semibold text-[var(--color-cream)] shrink-0">
                {user.full_name?.[0]?.toUpperCase()}
              </div>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 px-3 py-2 bg-[var(--color-cream)] border border-[rgba(26,23,20,0.06)] rounded-full text-[0.82rem] text-[var(--color-ink)] placeholder:text-[var(--color-ink4)] focus:outline-none focus:border-[var(--color-teal)]"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-2 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.75rem] font-medium disabled:opacity-40 transition-all"
              >
                Post
              </button>
            </div>
          )}

          {!user && (
            <p className="text-center text-[0.8rem] text-[var(--color-ink4)] py-3">
              <Link href="/login" className="text-[var(--color-teal)] font-medium hover:underline">Sign in</Link> to comment
            </p>
          )}
        </div>
      )}
    </div>
  );
}
