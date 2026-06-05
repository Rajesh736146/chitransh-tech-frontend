"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { jobsApi } from "@/modules/jobs/api";
import { useAuthStore } from "@/modules/auth/store";
import type { Job } from "@/modules/jobs/types";
import { toast } from "sonner";
import {
  MapPin, Clock, Briefcase, DollarSign, Users, ArrowLeft,
  Upload, FileText, CheckCircle, XCircle, Building2, Globe,
  Share2, Bookmark, AlertCircle,
} from "lucide-react";

// ─── helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number | null) {
  if (!n) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString()}`;
}
function salaryRange(min: number | null, max: number | null) {
  const a = fmt(min), b = fmt(max);
  if (a && b) return `${a} – ${b} per annum`;
  if (a) return `${a}+ per annum`;
  return null;
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Posted today";
  if (d === 1) return "Posted yesterday";
  if (d < 7) return `Posted ${d} days ago`;
  if (d < 30) return `Posted ${Math.floor(d / 7)} weeks ago`;
  return `Posted on ${new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────
function ApplyModal({ jobId, jobTitle, onClose, onSuccess }: {
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type === "application/pdf" || dropped.name.endsWith(".pdf") || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
    } else {
      toast.error("Please upload a PDF or DOCX file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please upload your resume");
      return;
    }
    setLoading(true);
    try {
      await jobsApi.applyToJob(jobId, file);
      toast.success("Application submitted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else {
        toast.error("Failed to submit application");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Apply for this position</h2>
            <p className="text-sm text-gray-500 mt-0.5">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Upload area */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-blue-400 bg-blue-50"
              : file
              ? "border-green-300 bg-green-50"
              : "border-gray-200 hover:border-gray-400"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center">
              <CheckCircle size={40} className="text-green-500 mb-3" />
              <p className="font-medium text-gray-900 text-sm">{file.name}</p>
              <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(0)} KB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="text-xs text-red-500 mt-2 hover:underline"
              >
                Remove & choose another
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={40} className="text-gray-400 mb-3" />
              <p className="font-medium text-gray-700 text-sm">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 mt-3">Supports PDF, DOCX (Max 5MB)</p>
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
          <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            Your resume will be shared with the employer. Make sure it&apos;s up to date with your latest experience and skills.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    jobsApi.getJob(jobId)
      .then((data) => { setJob(data); setError(false); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <XCircle size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job not found</h2>
          <p className="text-sm text-gray-500 mb-6">This job may have been removed or the link is incorrect.</p>
          <Link href="/jobs" className="text-sm text-[var(--color-primary)] font-medium hover:underline">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const salary = salaryRange(job.salary_min, job.salary_max);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to jobs
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600 shrink-0">
                  {(job.company_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <p className="text-sm text-gray-600">{job.company_name ?? "—"}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(job.created_at)}</p>
                </div>
              </div>

              {/* Meta badges */}
              <div className="flex flex-wrap gap-2 mb-5">
                {job.employment_type && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
                    <Briefcase size={12} /> {job.employment_type}
                  </span>
                )}
                {job.remote_type && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                    <Globe size={12} /> {job.remote_type}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                    <MapPin size={12} /> {job.location}
                  </span>
                )}
                {job.experience_required && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
                    <Clock size={12} /> {job.experience_required}
                  </span>
                )}
                {salary && (
                  <span className="inline-flex items-center gap-1.5 text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full font-semibold">
                    <DollarSign size={12} /> {salary}
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {applied ? (
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl text-sm font-medium">
                    <CheckCircle size={16} /> Applied Successfully
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!user) {
                        toast.error("Please login to apply");
                        router.push("/login");
                        return;
                      }
                      setShowApply(true);
                    }}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
                <button className="border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Bookmark size={18} />
                </button>
                <button className="border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose prose-sm prose-gray max-w-none">
                <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </p>
              </div>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((s) => (
                    <span
                      key={s.id}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        s.mandatory
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {s.skill_name}
                      {!s.mandatory && <span className="ml-1.5 text-xs opacity-60">(preferred)</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Quick Apply Card */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Apply for this job</h3>
              <p className="text-xs text-gray-500 mb-4">
                Upload your resume and let the employer know you&apos;re interested.
              </p>
              {applied ? (
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} /> You&apos;ve applied
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error("Please login to apply");
                      router.push("/login");
                      return;
                    }
                    setShowApply(true);
                  }}
                  className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={16} /> Upload Resume & Apply
                </button>
              )}
            </div>

            {/* Job Summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-sm text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3">
                {job.company_name && (
                  <div className="flex items-center gap-3">
                    <Building2 size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Company</p>
                      <p className="text-sm text-gray-700">{job.company_name}</p>
                    </div>
                  </div>
                )}
                {job.location && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Location</p>
                      <p className="text-sm text-gray-700">{job.location}</p>
                    </div>
                  </div>
                )}
                {job.employment_type && (
                  <div className="flex items-center gap-3">
                    <Briefcase size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Job Type</p>
                      <p className="text-sm text-gray-700">{job.employment_type}</p>
                    </div>
                  </div>
                )}
                {job.experience_required && (
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Experience</p>
                      <p className="text-sm text-gray-700">{job.experience_required}</p>
                    </div>
                  </div>
                )}
                {salary && (
                  <div className="flex items-center gap-3">
                    <DollarSign size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Salary</p>
                      <p className="text-sm text-gray-700">{salary}</p>
                    </div>
                  </div>
                )}
                {job.remote_type && (
                  <div className="flex items-center gap-3">
                    <Globe size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Work Mode</p>
                      <p className="text-sm text-gray-700">{job.remote_type}</p>
                    </div>
                  </div>
                )}
                {(job.view_count !== undefined || job.application_count !== undefined) && (
                  <div className="flex items-center gap-3">
                    <Users size={16} className="text-gray-400" />
                    <div>
                      <p className="text-[11px] text-gray-400">Activity</p>
                      <p className="text-sm text-gray-700">
                        {job.application_count !== undefined && `${job.application_count} applicants`}
                        {job.view_count !== undefined && job.application_count !== undefined && " · "}
                        {job.view_count !== undefined && `${job.view_count} views`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Jobs placeholder */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">Explore more</h3>
              <Link
                href="/jobs"
                className="block text-sm text-[var(--color-primary)] font-medium hover:underline"
              >
                Browse all jobs →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <ApplyModal
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setShowApply(false)}
          onSuccess={() => setApplied(true)}
        />
      )}
    </div>
  );
}
