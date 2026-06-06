"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { jobsApi } from "@/modules/jobs/api";
import { useAuthStore, useAuthHydration } from "@/modules/auth/store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Job } from "@/modules/jobs/types";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    jobsApi.getJob(id).then(setJob).catch(() => router.push("/jobs")).finally(() => setIsLoading(false));
  }, [id, router]);

  const handleApply = async (file: File) => {
    if (!job || !user) return;
    setIsApplying(true);
    try {
      // Step 1: Get presigned URL
      const presignRes = await api.post(`/jobs/${job.id}/apply/presigned-url`, {
        filename: file.name,
        content_type: file.type,
      });
      const { upload_url, object_key } = presignRes.data;

      // Step 2: Upload to R2
      await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      // Step 3: Apply
      await api.post(`/jobs/${job.id}/apply`, { resume_key: object_key });
      toast.success("Application submitted successfully!");
      setShowApplyModal(false);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Failed to apply. Please try again.";
      toast.error(detail);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--color-ink3)]">Loading...</div>
      </div>
    );
  }

  if (!job) return null;

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const min = job.salary_min ? `₹${Number(job.salary_min).toLocaleString()}` : "";
    const max = job.salary_max ? `₹${Number(job.salary_max).toLocaleString()}` : "";
    if (min && max) return `${min} – ${max}`;
    return min || max;
  };
  const salary = formatSalary();

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Nav */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between px-6 lg:px-12 h-[60px] bg-[rgba(245,242,236,0.88)] backdrop-blur-[16px] border-b border-[rgba(26,23,20,0.06)]">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="ChitranshTech" width={30} height={30} className="w-[30px] h-[30px] object-contain" />
          <span className="font-[var(--font-serif)] text-[1.05rem] font-semibold tracking-[-0.01em]">ChitranshTech</span>
        </Link>
        <Link href="/jobs" className="text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] transition-colors">
          ← Back to Jobs
        </Link>
      </nav>

      <div className="max-w-[900px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-[var(--font-serif)] text-[1.8rem] font-medium text-[var(--color-ink)] tracking-[-0.02em] mb-2">
                {job.title}
              </h1>
              <p className="text-[0.9rem] text-[var(--color-ink3)]">
                {job.company_name || "Company"} · {job.location || "Remote"}
              </p>
            </div>
            {user && user.role_id === 1 && (
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-7 py-3 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-lime2)] hover:scale-[1.02] transition-all shrink-0"
              >
                Apply Now
              </button>
            )}
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3">
            {job.employment_type && (
              <span className="text-[0.78rem] px-3 py-1.5 rounded-full bg-[rgba(44,110,106,0.08)] text-[var(--color-teal)] font-medium">
                {job.employment_type}
              </span>
            )}
            {job.remote_type && (
              <span className="text-[0.78rem] px-3 py-1.5 rounded-full bg-[var(--color-cream2)] text-[var(--color-ink3)] font-medium">
                {job.remote_type}
              </span>
            )}
            {job.experience_required && (
              <span className="text-[0.78rem] px-3 py-1.5 rounded-full bg-[var(--color-cream2)] text-[var(--color-ink3)] font-medium">
                {job.experience_required}
              </span>
            )}
            {salary && (
              <span className="text-[0.78rem] px-3 py-1.5 rounded-full bg-[rgba(200,230,60,0.2)] text-[var(--color-lime-dk)] font-medium">
                {salary}
              </span>
            )}
            <span className="text-[0.78rem] px-3 py-1.5 rounded-full bg-[var(--color-cream2)] text-[var(--color-ink4)] capitalize">
              {job.job_category.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-8 mb-6">
          <h2 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-4">Job Description</h2>
          <div className="text-[0.88rem] text-[var(--color-ink2)] leading-[1.8] whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* Skills */}
        {job.skills.length > 0 && (
          <div className="bg-white border border-[rgba(26,23,20,0.06)] rounded-[20px] p-8 mb-6">
            <h2 className="font-[var(--font-serif)] text-[1.1rem] font-medium text-[var(--color-ink)] mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <span
                  key={s.id}
                  className={`text-[0.8rem] px-3 py-1.5 rounded-full border ${
                    s.mandatory
                      ? "border-[var(--color-teal)] text-[var(--color-teal)] bg-[rgba(44,110,106,0.05)]"
                      : "border-[rgba(26,23,20,0.1)] text-[var(--color-ink3)] bg-[var(--color-cream)]"
                  }`}
                >
                  {s.skill_name} {s.mandatory && "★"}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Not logged in CTA */}
        {!user && (
          <div className="bg-[var(--color-ink)] rounded-[20px] p-8 text-center">
            <h3 className="font-[var(--font-serif)] text-[1.2rem] text-[var(--color-cream)] mb-2">Interested in this role?</h3>
            <p className="text-[rgba(245,242,236,0.5)] text-[0.88rem] mb-5">Sign in to apply with your resume.</p>
            <Link href="/login" className="inline-block px-8 py-3 bg-[var(--color-lime)] text-[var(--color-ink)] rounded-full text-[0.9rem] font-medium hover:bg-[var(--color-lime2)] transition-all">
              Sign In to Apply
            </Link>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          onClose={() => setShowApplyModal(false)}
          onSubmit={handleApply}
          isApplying={isApplying}
        />
      )}
    </div>
  );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({
  onClose,
  onSubmit,
  isApplying,
}: {
  onClose: () => void;
  onSubmit: (file: File) => void;
  isApplying: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[20px] p-8 w-full max-w-[440px] shadow-xl">
        <h3 className="font-[var(--font-serif)] text-[1.3rem] font-medium text-[var(--color-ink)] mb-2">
          Apply to this job
        </h3>
        <p className="text-[0.85rem] text-[var(--color-ink3)] mb-6">
          Upload your resume (PDF, DOC, or DOCX). Max 10MB.
        </p>

        <label className="block border-2 border-dashed border-[rgba(26,23,20,0.12)] rounded-[14px] p-8 text-center cursor-pointer hover:border-[var(--color-teal)] hover:bg-[rgba(44,110,106,0.02)] transition-all mb-6">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file ? (
            <div>
              <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">{file.name}</p>
              <p className="text-[0.75rem] text-[var(--color-ink4)] mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div>
              <p className="text-[1.5rem] mb-2">📄</p>
              <p className="text-[0.85rem] text-[var(--color-ink3)]">Click to select or drag your resume here</p>
              <p className="text-[0.72rem] text-[var(--color-ink4)] mt-1">PDF, DOC, DOCX up to 10MB</p>
            </div>
          )}
        </label>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[rgba(26,23,20,0.1)] rounded-full text-[0.85rem] text-[var(--color-ink3)] hover:text-[var(--color-ink)] hover:border-[var(--color-ink3)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => file && onSubmit(file)}
            disabled={!file || isApplying}
            className="flex-1 py-3 bg-[var(--color-ink)] text-[var(--color-cream)] rounded-full text-[0.85rem] font-medium hover:bg-[var(--color-ink2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? "Uploading..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
