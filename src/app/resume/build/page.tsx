"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { resumeApi } from "@/modules/resume/api";
import type { BuildResumeRequest, BuildResumeResponse } from "@/modules/resume/types";
import { toast } from "sonner";
import {
  User, GraduationCap, Code2, FolderGit2, Briefcase, Award,
  Plus, Trash2, Sparkles, Loader2, Copy, ChevronRight,
  CheckCircle2, ArrowLeft, ExternalLink, FileDown, FileText,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Section = "personal" | "education" | "skills" | "projects" | "experience" | "certifications";

const SECTIONS: { id: Section; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "personal",       label: "Personal",        icon: User,          desc: "Contact info" },
  { id: "education",      label: "Education",       icon: GraduationCap, desc: "Degrees & grades" },
  { id: "skills",         label: "Skills",          icon: Code2,         desc: "Tech & tools" },
  { id: "projects",       label: "Projects",        icon: FolderGit2,    desc: "What you built" },
  { id: "experience",     label: "Experience",      icon: Briefcase,     desc: "Work history" },
  { id: "certifications", label: "Certifications",  icon: Award,         desc: "Credentials" },
];

const INIT: BuildResumeRequest = {
  title: "My Resume", target_role: "",
  personal_details: { name: "", email: "", phone: "", linkedin: "", github: "", portfolio: "", location: "" },
  education: [], skills: [], projects: [], work_experience: [], certifications: [],
};

/* ─── Shared input styles ────────────────────────────────────────────────── */
const inp = [
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900",
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent",
  "transition-shadow",
].join(" ");
const ta = `${inp} resize-none`;

/* ─── Micro-components ───────────────────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{children}</label>;
}
function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Grid3({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>;
}
function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-gray-50/60 p-5 space-y-4">
      <button
        onClick={onRemove}
        className="absolute top-3.5 right-3.5 p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title="Remove"
      >
        <Trash2 size={14} />
      </button>
      {children}
    </div>
  );
}
function EmptySlate({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <Icon size={36} strokeWidth={1.2} className="mb-3 text-gray-300" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
function SectionHeader({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between pb-5 mb-5 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{desc}</p>
        </div>
      </div>
      {action}
    </div>
  );
}
function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:border-gray-300 transition-colors"
    >
      <Plus size={14} />
      {label}
    </button>
  );
}

/* ─── Result view ────────────────────────────────────────────────────────── */
function buildResumeHTML(r: BuildResumeResponse): string {
  const ai = r.ai_enhanced;
  const pd = r.personal_details;

  const esc = (s: string) => s?.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") ?? "";

  const contactParts = [pd.email, pd.phone, pd.location].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ");
  const linkParts = [pd.linkedin, pd.github, pd.portfolio].filter(Boolean).map(esc).join(" &nbsp;·&nbsp; ");

  const summary = typeof ai.summary === "string" ? ai.summary : (ai.summary as any)?.summary ?? "";

  const eduHTML = (r.education ?? []).map((e: any) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${esc(e.degree)}${e.field_of_study ? `, ${esc(e.field_of_study)}` : ""}</span>
        ${e.start_year ? `<span class="entry-date">${e.start_year}–${e.end_year ?? "Present"}</span>` : ""}
      </div>
      <div class="entry-sub">${esc(e.institution)}${e.grade ? ` &nbsp;·&nbsp; ${esc(e.grade)}` : ""}</div>
    </div>`).join("");

  const skillsHTML = ((ai.skills as any)?.skills ?? []).map((s: any) =>
    `<div class="skill-row"><span class="skill-cat">${esc(s.category)}:</span> <span class="skill-items">${s.items?.map(esc).join(", ")}</span></div>`
  ).join("");

  const projectsHTML = ((ai.projects ?? []) as any[]).map((p: any) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${esc(p.title)}${p.role ? ` <span class="entry-sub-inline">· ${esc(p.role)}</span>` : ""}</span>
        ${p.url ? `<a href="${esc(p.url)}" class="entry-link">${esc(p.url)}</a>` : ""}
      </div>
      ${(p.bullets ?? []).map((b: string) => `<div class="bullet">• ${esc(b)}</div>`).join("")}
      ${p.technologies?.length ? `<div class="tags">${p.technologies.map((t: string) => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
    </div>`).join("");

  const expHTML = ((ai.work_experience ?? []) as any[]).map((e: any) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${esc(e.role)}</span>
        <span class="entry-date">${e.start_date ?? ""}${e.end_date ? `–${e.end_date}` : ""}${e.duration ? ` · ${esc(e.duration)}` : ""}</span>
      </div>
      <div class="entry-sub">${esc(e.company)}</div>
      ${(e.bullets ?? []).map((b: string) => `<div class="bullet">• ${esc(b)}</div>`).join("")}
    </div>`).join("");

  const certHTML = ((r.certifications ?? []) as any[]).map((c: any) => `
    <div class="entry">
      <div class="entry-header">
        <span class="entry-title">${esc(c.name)}</span>
        ${c.year ? `<span class="entry-date">${c.year}</span>` : ""}
      </div>
      ${c.issuer ? `<div class="entry-sub">${esc(c.issuer)}</div>` : ""}
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(pd.name)} — Resume</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    background: #fff;
    padding: 40px 48px;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.5;
  }
  /* Header */
  .resume-header { border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 20px; }
  .resume-name { font-size: 22pt; font-weight: 700; letter-spacing: -0.5px; color: #111; }
  .resume-role { font-size: 11pt; font-weight: 500; color: #555; margin-top: 2px; }
  .resume-contact { font-size: 9pt; color: #666; margin-top: 6px; }
  .resume-links { font-size: 9pt; color: #2563eb; margin-top: 3px; }
  /* Sections */
  .section { margin-bottom: 18px; }
  .section-title {
    font-size: 8.5pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.12em; color: #888; border-bottom: 1px solid #e5e5e5;
    padding-bottom: 4px; margin-bottom: 10px;
  }
  /* Entries */
  .entry { margin-bottom: 12px; }
  .entry-header { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
  .entry-title { font-size: 10.5pt; font-weight: 600; color: #111; }
  .entry-sub-inline { font-weight: 400; color: #666; font-size: 9.5pt; }
  .entry-date { font-size: 9pt; color: #888; white-space: nowrap; flex-shrink: 0; }
  .entry-sub { font-size: 9.5pt; color: #555; margin-top: 1px; }
  .entry-link { font-size: 8.5pt; color: #2563eb; text-decoration: none; }
  /* Bullets */
  .bullet { font-size: 10pt; color: #333; margin-top: 3px; padding-left: 4px; }
  /* Skills */
  .skill-row { font-size: 10pt; margin-bottom: 4px; }
  .skill-cat { font-weight: 600; color: #111; }
  .skill-items { color: #444; }
  /* Tags */
  .tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
  .tag { font-size: 8pt; background: #f3f4f6; color: #555; padding: 2px 7px; border-radius: 4px; }
  /* Print */
  @media print {
    body { padding: 20px 28px; }
    @page { margin: 1.5cm; size: A4; }
  }
</style>
</head>
<body>
  <div class="resume-header">
    <div class="resume-name">${esc(pd.name)}</div>
    <div class="resume-role">${esc(r.target_role)}</div>
    ${contactParts ? `<div class="resume-contact">${contactParts}</div>` : ""}
    ${linkParts ? `<div class="resume-links">${linkParts}</div>` : ""}
  </div>

  ${summary ? `<div class="section"><div class="section-title">Professional Summary</div><p style="font-size:10pt;color:#333;line-height:1.6">${esc(summary)}</p></div>` : ""}
  ${eduHTML ? `<div class="section"><div class="section-title">Education</div>${eduHTML}</div>` : ""}
  ${skillsHTML ? `<div class="section"><div class="section-title">Skills</div>${skillsHTML}</div>` : ""}
  ${projectsHTML ? `<div class="section"><div class="section-title">Projects</div>${projectsHTML}</div>` : ""}
  ${expHTML ? `<div class="section"><div class="section-title">Work Experience</div>${expHTML}</div>` : ""}
  ${certHTML ? `<div class="section"><div class="section-title">Certifications</div>${certHTML}</div>` : ""}
</body>
</html>`;
}

function downloadDOCX(r: BuildResumeResponse) {
  const html = buildResumeHTML(r);
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.personal_details.name?.replace(/\s+/g, "_") || "Resume"}.doc`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Downloaded as Word document!");
}

function downloadPDF(r: BuildResumeResponse) {
  const html = buildResumeHTML(r);
  const win = window.open("", "_blank");
  if (!win) { toast.error("Allow pop-ups to download PDF"); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
    win.close();
  }, 600);
  toast.success("Print dialog opened — save as PDF");
}
function ResultView({ r, onBack }: { r: BuildResumeResponse; onBack: () => void }) {
  const ai = r.ai_enhanced;

  const copy = () => {
    const el = document.getElementById("resume-doc");
    navigator.clipboard.writeText(el?.innerText || "").then(() => toast.success("Copied!"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={15} /> Back to editor
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Copy size={14} /> Copy text
            </button>
            <button
              onClick={() => downloadDOCX(r)}
              className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} /> Download DOCX
            </button>
            <button
              onClick={() => downloadPDF(r)}
              className="flex items-center gap-1.5 text-sm bg-gray-900 text-white px-3.5 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <FileDown size={14} /> Download PDF
            </button>
          </div>
        </div>

        {/* Resume document */}
        <div id="resume-doc" className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-8 md:p-10 space-y-7">

          {/* Header */}
          <div className="border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{r.personal_details.name}</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{r.target_role}</p>
            <p className="text-xs text-gray-400 mt-2 space-x-2">
              {[r.personal_details.email, r.personal_details.phone, r.personal_details.location]
                .filter(Boolean).join("  ·  ")}
            </p>
            {[r.personal_details.linkedin, r.personal_details.github, r.personal_details.portfolio].some(Boolean) && (
              <div className="flex flex-wrap gap-3 mt-2">
                {[
                  { val: r.personal_details.linkedin, label: "LinkedIn" },
                  { val: r.personal_details.github, label: "GitHub" },
                  { val: r.personal_details.portfolio, label: "Portfolio" },
                ].filter(x => x.val).map(x => (
                  <span key={x.label} className="flex items-center gap-1 text-xs text-blue-600">
                    <ExternalLink size={10} /> {x.val}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {ai.summary && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-2">Professional Summary</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {typeof ai.summary === "string" ? ai.summary : (ai.summary as any)?.summary || ""}
              </p>
            </div>
          )}

          {/* Education */}
          {r.education?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Education</p>
              <div className="space-y-3">
                {r.education.map((e: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{e.degree}{e.field_of_study ? `, ${e.field_of_study}` : ""}</p>
                      <p className="text-xs text-gray-500">{e.institution}{e.grade ? ` · ${e.grade}` : ""}</p>
                    </div>
                    {e.start_year && <p className="text-xs text-gray-400 shrink-0">{e.start_year}–{e.end_year || "Present"}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {ai.skills && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Skills</p>
              <div className="space-y-2">
                {((ai.skills as any)?.skills || []).map((s: any, i: number) => (
                  <p key={i} className="text-sm">
                    <span className="font-semibold text-gray-800">{s.category}: </span>
                    <span className="text-gray-600">{s.items?.join(", ")}</span>
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {ai.projects?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Projects</p>
              <div className="space-y-5">
                {(ai.projects as any[]).map((p: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                        {p.role && <p className="text-xs text-gray-500">{p.role}</p>}
                      </div>
                      {p.url && <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:underline shrink-0"><ExternalLink size={10} /> View</a>}
                    </div>
                    {p.bullets?.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                        {p.bullets.map((b: string, j: number) => <li key={j} className="text-sm text-gray-600">{b}</li>)}
                      </ul>
                    )}
                    {p.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.technologies.map((t: string, j: number) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {ai.work_experience?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Work Experience</p>
              <div className="space-y-5">
                {(ai.work_experience as any[]).map((e: any, i: number) => (
                  <div key={i}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{e.role}</p>
                        <p className="text-xs text-gray-500">{e.company}</p>
                      </div>
                      <p className="text-xs text-gray-400 shrink-0">
                        {e.start_date}{e.end_date ? `–${e.end_date}` : ""}{e.duration ? ` · ${e.duration}` : ""}
                      </p>
                    </div>
                    {e.bullets?.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                        {e.bullets.map((b: string, j: number) => <li key={j} className="text-sm text-gray-600">{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {r.certifications?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] mb-3">Certifications</p>
              <div className="space-y-2">
                {(r.certifications as any[]).map((c: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      {c.issuer && <p className="text-xs text-gray-500">{c.issuer}</p>}
                    </div>
                    {c.year && <p className="text-xs text-gray-400 shrink-0">{c.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function ResumeBuilderPage() {
  const [active, setActive] = useState<Section>("personal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuildResumeResponse | null>(null);
  const [form, setForm] = useState<BuildResumeRequest>(INIT);

  const pd = form.personal_details;
  const setPd = (k: string, v: string) => setForm(f => ({ ...f, personal_details: { ...f.personal_details, [k]: v } }));
  const add = <T,>(field: keyof BuildResumeRequest, empty: T) =>
    setForm(f => ({ ...f, [field]: [...(f[field] as T[]), empty] }));
  const del = (field: keyof BuildResumeRequest, i: number) =>
    setForm(f => ({ ...f, [field]: (f[field] as any[]).filter((_: any, idx: number) => idx !== i) }));
  const upd = (field: keyof BuildResumeRequest, i: number, k: string, v: any) =>
    setForm(f => { const a = [...(f[field] as any[])]; a[i] = { ...a[i], [k]: v }; return { ...f, [field]: a }; });

  const generate = async () => {
    if (!form.target_role) { toast.error("Enter your target role"); return; }
    if (!pd.name || !pd.email) { toast.error("Name and email are required"); return; }
    setLoading(true);
    try {
      const res = await resumeApi.buildResume(form);
      setResult(res);
      toast.success("Resume generated!");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const isFilled = (s: Section) => {
    if (s === "personal") return !!pd.name && !!pd.email;
    const map: Record<Section, keyof BuildResumeRequest> = {
      personal: "personal_details", education: "education", skills: "skills",
      projects: "projects", experience: "work_experience", certifications: "certifications",
    };
    return ((form[map[s]] as any[])?.length ?? 0) > 0;
  };

  if (result) return <ResultView r={result} onBack={() => setResult(null)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full mb-2">
            <Sparkles size={12} /> AI-Powered Resume Builder
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Build Your ATS-Friendly Resume</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in your details — AI will enhance every section</p>
        </div>
      </div>

      {/* ── Mobile tab bar ── */}
      <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max px-4 py-2 gap-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            const filled = isFilled(s.id);
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filled && !isActive
                  ? <CheckCircle2 size={13} className="text-green-500" />
                  : <Icon size={13} />
                }
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden sticky top-24">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active_ = active === s.id;
                const filled = isFilled(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-gray-100 last:border-0 ${
                      active_ ? "bg-gray-900 text-white" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      active_ ? "bg-white/20" : filled ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      {filled && !active_
                        ? <CheckCircle2 size={14} className="text-green-600" />
                        : <Icon size={14} className={active_ ? "text-white" : "text-gray-500"} />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold truncate ${active_ ? "text-white" : "text-gray-800"}`}>{s.label}</p>
                      <p className={`text-[10px] truncate ${active_ ? "text-white/60" : "text-gray-400"}`}>{s.desc}</p>
                    </div>
                    {active_ && <ChevronRight size={14} className="text-white/60 ml-auto shrink-0" />}
                  </button>
                );
              })}
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={generate}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Generating…</> : <><Sparkles size={14} /> Generate</>}
                </button>
              </div>
            </div>
          </aside>

          {/* ── Form panel ── */}
          <main className="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-4 sm:p-6 min-h-[480px]">

            {/* Personal */}
            {active === "personal" && (
              <div className="space-y-5">
                <SectionHeader icon={User} title="Personal Details" desc="Your contact information" />
                <Grid2>
                  <div><Label>Resume Title</Label><input className={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="My Professional Resume" /></div>
                  <div><Label>Target Role *</Label><input className={inp} value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} placeholder="Senior Software Engineer" /></div>
                </Grid2>
                <Grid2>
                  <div><Label>Full Name *</Label><input className={inp} value={pd.name} onChange={e => setPd("name", e.target.value)} placeholder="Jane Doe" /></div>
                  <div><Label>Email *</Label><input className={inp} type="email" value={pd.email} onChange={e => setPd("email", e.target.value)} placeholder="jane@example.com" /></div>
                </Grid2>
                <Grid2>
                  <div><Label>Phone</Label><input className={inp} value={pd.phone || ""} onChange={e => setPd("phone", e.target.value)} placeholder="+91 9876543210" /></div>
                  <div><Label>Location</Label><input className={inp} value={pd.location || ""} onChange={e => setPd("location", e.target.value)} placeholder="Bangalore, India" /></div>
                </Grid2>
                <Grid3>
                  <div><Label>LinkedIn</Label><input className={inp} value={pd.linkedin || ""} onChange={e => setPd("linkedin", e.target.value)} placeholder="linkedin.com/in/jane" /></div>
                  <div><Label>GitHub</Label><input className={inp} value={pd.github || ""} onChange={e => setPd("github", e.target.value)} placeholder="github.com/jane" /></div>
                  <div><Label>Portfolio</Label><input className={inp} value={pd.portfolio || ""} onChange={e => setPd("portfolio", e.target.value)} placeholder="janedoe.dev" /></div>
                </Grid3>
              </div>
            )}

            {/* Education */}
            {active === "education" && (
              <div className="space-y-4">
                <SectionHeader icon={GraduationCap} title="Education" desc="Your academic background"
                  action={<AddButton onClick={() => add("education", { institution: "", degree: "", field_of_study: "", grade: "", start_year: undefined, end_year: undefined })} label="Add" />}
                />
                {form.education.length === 0 ? <EmptySlate icon={GraduationCap} label="No education added yet" /> :
                  form.education.map((e, i) => (
                    <ItemCard key={i} onRemove={() => del("education", i)}>
                      <Grid2>
                        <div><Label>Institution</Label><input className={inp} value={e.institution} onChange={ev => upd("education", i, "institution", ev.target.value)} placeholder="IIT Delhi" /></div>
                        <div><Label>Degree</Label><input className={inp} value={e.degree} onChange={ev => upd("education", i, "degree", ev.target.value)} placeholder="B.Tech" /></div>
                      </Grid2>
                      <Grid2>
                        <div><Label>Field of Study</Label><input className={inp} value={e.field_of_study || ""} onChange={ev => upd("education", i, "field_of_study", ev.target.value)} placeholder="Computer Science" /></div>
                        <div><Label>Grade / CGPA</Label><input className={inp} value={e.grade || ""} onChange={ev => upd("education", i, "grade", ev.target.value)} placeholder="8.5/10" /></div>
                      </Grid2>
                      <Grid2>
                        <div><Label>Start Year</Label><input className={inp} type="number" value={e.start_year || ""} onChange={ev => upd("education", i, "start_year", parseInt(ev.target.value))} placeholder="2018" /></div>
                        <div><Label>End Year</Label><input className={inp} type="number" value={e.end_year || ""} onChange={ev => upd("education", i, "end_year", parseInt(ev.target.value))} placeholder="2022" /></div>
                      </Grid2>
                    </ItemCard>
                  ))
                }
              </div>
            )}

            {/* Skills */}
            {active === "skills" && (
              <div className="space-y-4">
                <SectionHeader icon={Code2} title="Skills" desc="Technologies and tools"
                  action={<AddButton onClick={() => add("skills", { category: "", items: [] })} label="Add Category" />}
                />
                {form.skills.length === 0 ? <EmptySlate icon={Code2} label="No skills added yet" /> :
                  form.skills.map((s, i) => (
                    <ItemCard key={i} onRemove={() => del("skills", i)}>
                      <div><Label>Category</Label><input className={inp} value={s.category} onChange={e => upd("skills", i, "category", e.target.value)} placeholder="Programming Languages" /></div>
                      <div><Label>Skills (comma-separated)</Label><textarea className={ta} rows={2} value={s.items.join(", ")} onChange={e => upd("skills", i, "items", e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))} placeholder="JavaScript, React, Node.js" /></div>
                    </ItemCard>
                  ))
                }
              </div>
            )}

            {/* Projects */}
            {active === "projects" && (
              <div className="space-y-4">
                <SectionHeader icon={FolderGit2} title="Projects" desc="What you've built"
                  action={<AddButton onClick={() => add("projects", { title: "", description: "", role: "", technologies_or_tools: [], url: "", impact: "" })} label="Add" />}
                />
                {form.projects.length === 0 ? <EmptySlate icon={FolderGit2} label="No projects added yet" /> :
                  form.projects.map((p, i) => (
                    <ItemCard key={i} onRemove={() => del("projects", i)}>
                      <Grid2>
                        <div><Label>Title</Label><input className={inp} value={p.title} onChange={e => upd("projects", i, "title", e.target.value)} placeholder="E-Commerce Platform" /></div>
                        <div><Label>Your Role</Label><input className={inp} value={p.role || ""} onChange={e => upd("projects", i, "role", e.target.value)} placeholder="Lead Developer" /></div>
                      </Grid2>
                      <div><Label>Description</Label><textarea className={ta} rows={3} value={p.description} onChange={e => upd("projects", i, "description", e.target.value)} placeholder="What did you build and why?" /></div>
                      <Grid2>
                        <div><Label>URL</Label><input className={inp} value={p.url || ""} onChange={e => upd("projects", i, "url", e.target.value)} placeholder="github.com/project" /></div>
                        <div><Label>Impact</Label><input className={inp} value={p.impact || ""} onChange={e => upd("projects", i, "impact", e.target.value)} placeholder="Reduced load by 40%" /></div>
                      </Grid2>
                      <div><Label>Technologies (comma-separated)</Label><input className={inp} value={p.technologies_or_tools.join(", ")} onChange={e => upd("projects", i, "technologies_or_tools", e.target.value.split(",").map((x: string) => x.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL" /></div>
                    </ItemCard>
                  ))
                }
              </div>
            )}

            {/* Experience */}
            {active === "experience" && (
              <div className="space-y-4">
                <SectionHeader icon={Briefcase} title="Work Experience" desc="Your professional history"
                  action={<AddButton onClick={() => add("work_experience", { company: "", role: "", responsibilities: [], tools_or_technologies: [], achievements: [], start_date: "", end_date: "" })} label="Add" />}
                />
                {form.work_experience.length === 0 ? <EmptySlate icon={Briefcase} label="No experience added yet" /> :
                  form.work_experience.map((e, i) => (
                    <ItemCard key={i} onRemove={() => del("work_experience", i)}>
                      <Grid2>
                        <div><Label>Company</Label><input className={inp} value={e.company} onChange={ev => upd("work_experience", i, "company", ev.target.value)} placeholder="Razorpay" /></div>
                        <div><Label>Role</Label><input className={inp} value={e.role} onChange={ev => upd("work_experience", i, "role", ev.target.value)} placeholder="Software Engineer" /></div>
                      </Grid2>
                      <Grid2>
                        <div><Label>Start Date</Label><input className={inp} value={e.start_date || ""} onChange={ev => upd("work_experience", i, "start_date", ev.target.value)} placeholder="Aug 2021" /></div>
                        <div><Label>End Date</Label><input className={inp} value={e.end_date || ""} onChange={ev => upd("work_experience", i, "end_date", ev.target.value)} placeholder="Present" /></div>
                      </Grid2>
                      <div><Label>Responsibilities (comma-separated)</Label><textarea className={ta} rows={2} value={e.responsibilities.join(", ")} onChange={ev => upd("work_experience", i, "responsibilities", ev.target.value.split(",").map((x: string) => x.trim()))} placeholder="Built APIs, Led team of 4..." /></div>
                      <div><Label>Achievements (comma-separated)</Label><textarea className={ta} rows={2} value={e.achievements.join(", ")} onChange={ev => upd("work_experience", i, "achievements", ev.target.value.split(",").map((x: string) => x.trim()))} placeholder="Reduced latency by 60%..." /></div>
                    </ItemCard>
                  ))
                }
              </div>
            )}

            {/* Certifications */}
            {active === "certifications" && (
              <div className="space-y-4">
                <SectionHeader icon={Award} title="Certifications" desc="Credentials and licenses"
                  action={<AddButton onClick={() => add("certifications", { name: "", issuer: "", year: undefined })} label="Add" />}
                />
                {form.certifications.length === 0 ? <EmptySlate icon={Award} label="No certifications added yet" /> :
                  form.certifications.map((c, i) => (
                    <ItemCard key={i} onRemove={() => del("certifications", i)}>
                      <Grid3>
                        <div><Label>Name</Label><input className={inp} value={c.name} onChange={e => upd("certifications", i, "name", e.target.value)} placeholder="AWS Solutions Architect" /></div>
                        <div><Label>Issuer</Label><input className={inp} value={c.issuer || ""} onChange={e => upd("certifications", i, "issuer", e.target.value)} placeholder="Amazon" /></div>
                        <div><Label>Year</Label><input className={inp} type="number" value={c.year || ""} onChange={e => upd("certifications", i, "year", parseInt(e.target.value))} placeholder="2023" /></div>
                      </Grid3>
                    </ItemCard>
                  ))
                }
              </div>
            )}

            {/* Mobile generate button */}
            <div className="lg:hidden mt-6 pt-5 border-t border-gray-100">
              <button
                onClick={generate}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Sparkles size={15} /> Generate Resume</>}
              </button>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
