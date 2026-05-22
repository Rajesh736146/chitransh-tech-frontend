"use client";

import { forwardRef } from "react";

interface EducationItem {
  institution: string;
  degree: string;
  field_of_study?: string;
  grade?: string;
  start_year?: number;
  end_year?: number;
}

interface CertificationItem {
  name: string;
  issuer?: string;
  year?: number;
}

interface ResumePreviewProps {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  targetRole: string;
  education: EducationItem[];
  certifications: CertificationItem[];
  summary: string;
  skills: string;
  projects: string;
  experience: string;
}

function parseSkills(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { category: line, items: [] as string[] };
      return {
        category: line.slice(0, idx).trim(),
        items: line
          .slice(idx + 1)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    });
}

function parseSections(text: string) {
  return text
    .split(/(?=^## )/m)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n");
      const title = lines[0].replace(/^##\s*/, "").trim();
      const bullets = lines
        .slice(1)
        .filter((l) => l.trim().startsWith("-"))
        .map((l) => l.trim().replace(/^-\s*/, ""));
      return { title, bullets };
    });
}

function SectionDivider() {
  return <div className="border-t border-gray-300 my-4" />;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  (
    {
      name,
      email,
      phone,
      location,
      linkedin,
      github,
      portfolio,
      targetRole,
      education,
      certifications,
      summary,
      skills,
      projects,
      experience,
    },
    ref
  ) => {
    const skillGroups = parseSkills(skills);
    const projectList = parseSections(projects);
    const experienceList = parseSections(experience);

    const contactItems = [
      email && `✉ ${email}`,
      phone && `📞 ${phone}`,
      location && `📍 ${location}`,
      linkedin && `🔗 ${linkedin}`,
      github && `🐙 ${github}`,
      portfolio && `🌐 ${portfolio}`,
    ].filter(Boolean);

    return (
      <div
        ref={ref}
        className="bg-white text-gray-900"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "20mm 15mm",
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          fontSize: "11pt",
          lineHeight: "1.5",
        }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-2xl font-bold tracking-tight text-gray-900 mb-1"
            style={{ fontSize: "22pt" }}
          >
            {name}
          </h1>
          <p className="text-base font-medium text-blue-700 mb-2">
            {targetRole}
          </p>
          <div
            className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600"
            style={{ fontSize: "9pt" }}
          >
            {contactItems.map((item, i) => (
              <span key={i}>{item}</span>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* Professional Summary */}
        {summary.trim() && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-sm leading-relaxed text-gray-800">
                {summary.trim()}
              </p>
            </div>
            <SectionDivider />
          </>
        )}

        {/* Skills */}
        {skillGroups.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
                Skills
              </h2>
              <div className="space-y-1">
                {skillGroups.map((group, i) => (
                  <div key={i} className="flex text-sm">
                    <span className="font-semibold text-gray-800 min-w-[140px] shrink-0">
                      {group.category}:
                    </span>
                    <span className="text-gray-700">
                      {group.items.join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <SectionDivider />
          </>
        )}

        {/* Experience */}
        {experienceList.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {experienceList.map((exp, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm text-gray-900">
                      {exp.title}
                    </p>
                    {exp.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-5 mt-1 text-sm text-gray-700 space-y-0.5">
                        {exp.bullets.map((bullet, j) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <SectionDivider />
          </>
        )}

        {/* Projects */}
        {projectList.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-3">
                {projectList.map((proj, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm text-gray-900">
                      {proj.title}
                    </p>
                    {proj.bullets.length > 0 && (
                      <ul className="list-disc list-outside ml-5 mt-1 text-sm text-gray-700 space-y-0.5">
                        {proj.bullets.map((bullet, j) => (
                          <li key={j}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <SectionDivider />
          </>
        )}

        {/* Education */}
        {education.length > 0 && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {education.map((edu, i) => (
                  <div key={i}>
                    <p className="font-semibold text-sm text-gray-900">
                      {edu.degree}
                      {edu.field_of_study ? ` in ${edu.field_of_study}` : ""}
                    </p>
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    <div className="flex gap-4 text-xs text-gray-600">
                      {edu.start_year && edu.end_year && (
                        <span>
                          {edu.start_year} - {edu.end_year}
                        </span>
                      )}
                      {edu.grade && <span>Grade: {edu.grade}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <SectionDivider />
          </>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-2 border-b border-gray-200 pb-1">
              Certifications
            </h2>
            <div className="space-y-1">
              {certifications.map((cert, i) => (
                <div key={i} className="flex text-sm">
                  <span className="font-semibold text-gray-800">
                    {cert.name}
                  </span>
                  {cert.issuer && (
                    <span className="text-gray-600">
                      {" — "}
                      {cert.issuer}
                    </span>
                  )}
                  {cert.year && (
                    <span className="text-gray-500"> ({cert.year})</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export { ResumePreview };
export type { ResumePreviewProps };
