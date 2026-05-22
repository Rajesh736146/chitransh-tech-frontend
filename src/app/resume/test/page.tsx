"use client";

import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sparkles, Download, Eye, Loader2, X, Printer } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { resumeApi } from "@/modules/resume/api";
import { BuildResumeResponse } from "@/modules/resume/types";
import { toast } from "sonner";
import { ResumePreview } from "@/components/resume/ResumePreview";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function ResumeTestPage() {
  const [loading, setLoading] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<BuildResumeResponse | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const sampleData = {
    title: "Software Engineer Resume",
    target_role: "Senior Full Stack Developer",
    personal_details: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@example.com",
      phone: "+91 9876543210",
      linkedin: "linkedin.com/in/rajeshkumar",
      github: "github.com/rajeshkumar",
      portfolio: "rajeshkumar.dev",
      location: "Bangalore, India",
    },
    education: [
      {
        institution: "Indian Institute of Technology, Delhi",
        degree: "Bachelor of Technology",
        field_of_study: "Computer Science",
        grade: "8.5/10 CGPA",
        start_year: 2016,
        end_year: 2020,
      },
    ],
    skills: [
      {
        category: "Programming Languages",
        items: ["JavaScript", "TypeScript", "Python", "Java", "Go"],
      },
      {
        category: "Frontend",
        items: ["React", "Next.js", "Vue.js", "Tailwind CSS", "Framer Motion"],
      },
      {
        category: "Backend",
        items: ["Node.js", "Express", "FastAPI", "PostgreSQL", "MongoDB"],
      },
      {
        category: "DevOps & Tools",
        items: ["Docker", "Kubernetes", "AWS", "Git", "CI/CD"],
      },
    ],
    projects: [
      {
        title: "E-Commerce Platform",
        description: "Built a scalable e-commerce platform handling 10K+ daily users",
        role: "Lead Developer",
        technologies_or_tools: ["React", "Node.js", "PostgreSQL", "Redis", "AWS"],
        url: "github.com/rajesh/ecommerce",
        impact: "Increased conversion rate by 35% and reduced page load time by 60%",
      },
      {
        title: "Real-time Analytics Dashboard",
        description: "Developed a real-time analytics dashboard for business intelligence",
        role: "Full Stack Developer",
        technologies_or_tools: ["Next.js", "Python", "FastAPI", "WebSocket", "Chart.js"],
        url: "github.com/rajesh/analytics",
        impact: "Enabled data-driven decisions, saving 20 hours per week in manual reporting",
      },
    ],
    work_experience: [
      {
        company: "TechCorp Solutions",
        role: "Senior Software Engineer",
        responsibilities: [
          "Led development of microservices architecture",
          "Mentored junior developers",
          "Implemented CI/CD pipelines",
        ],
        tools_or_technologies: ["React", "Node.js", "Docker", "Kubernetes"],
        achievements: [
          "Reduced deployment time by 70%",
          "Improved system reliability to 99.9% uptime",
        ],
        start_date: "Jan 2022",
        end_date: "Present",
      },
      {
        company: "StartupHub",
        role: "Full Stack Developer",
        responsibilities: [
          "Built customer-facing web applications",
          "Optimized database queries",
          "Collaborated with design team",
        ],
        tools_or_technologies: ["Vue.js", "Python", "PostgreSQL", "AWS"],
        achievements: [
          "Launched 3 major features ahead of schedule",
          "Reduced API response time by 50%",
        ],
        start_date: "Jun 2020",
        end_date: "Dec 2021",
      },
    ],
    certifications: [
      {
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        year: 2023,
      },
      {
        name: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        year: 2022,
      },
    ],
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await resumeApi.buildResume(sampleData);
      setGeneratedResume(response);
      toast.success("Resume generated successfully!");
    } catch (error: any) {
      console.error("Resume generation error:", error);
      toast.error(error.response?.data?.detail || "Failed to generate resume");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current || !generatedResume) return;
    try {
      toast.loading("Generating PDF...");
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      const pageHeight = 297;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${sampleData.personal_details.name.replace(/\s+/g, "_")}_Resume.pdf`);
      toast.dismiss();
      toast.success("PDF downloaded!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow pop-ups to print");
      return;
    }
    const content = previewRef.current;
    if (!content) return;

    const styles = Array.from(document.styleSheets)
      .map((sheet) => {
        try {
          return Array.from(sheet.cssRules || [])
            .map((rule) => rule.cssText)
            .join("\n");
        } catch {
          return "";
        }
      })
      .join("\n");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${sampleData.personal_details.name}</title>
          <style>${styles}</style>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; justify-content: center; background: #fff; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} className="text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">AI Resume Builder Test</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Test Resume Generation
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Click the button below to generate a resume with sample data
            </p>
          </motion.div>

          {/* Sample Data Preview */}
          <motion.div variants={staggerItem}>
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sample Data</h2>
              <div className="bg-gray-50 rounded-xl p-4 overflow-auto max-h-96">
                <pre className="text-xs text-gray-700">
                  {JSON.stringify(sampleData, null, 2)}
                </pre>
              </div>
            </Card>
          </motion.div>

          {/* Generate Button */}
          <motion.div variants={staggerItem} className="flex justify-center">
            <Button
              onClick={handleGenerate}
              loading={loading}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI-Enhanced Resume
                </>
              )}
            </Button>
          </motion.div>

          {/* Generated Resume */}
          {generatedResume && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              variants={staggerItem}
            >
              <Card className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">AI-Enhanced Resume</h2>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      {showPreview ? "Close Preview" : "Preview"}
                    </Button>
                    <Button size="sm" onClick={handleDownloadPdf}>
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handlePrint}>
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      {generatedResume.personal_details.name}
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{generatedResume.personal_details.email}</p>
                      {generatedResume.personal_details.phone && (
                        <p>{generatedResume.personal_details.phone}</p>
                      )}
                      {generatedResume.personal_details.location && (
                        <p>{generatedResume.personal_details.location}</p>
                      )}
                      <div className="flex gap-4 mt-2">
                        {generatedResume.personal_details.linkedin && (
                          <a href="#" className="text-blue-600 hover:underline">
                            LinkedIn
                          </a>
                        )}
                        {generatedResume.personal_details.github && (
                          <a href="#" className="text-blue-600 hover:underline">
                            GitHub
                          </a>
                        )}
                        {generatedResume.personal_details.portfolio && (
                          <a href="#" className="text-blue-600 hover:underline">
                            Portfolio
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {generatedResume.ai_enhanced.summary?.summary && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Professional Summary</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {generatedResume.ai_enhanced.summary.summary}
                      </p>
                    </div>
                  )}

                  {/* Education */}
                  {generatedResume.education && generatedResume.education.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Education</h3>
                      <div className="space-y-4">
                        {generatedResume.education.map((edu: any, index: number) => (
                          <div key={index} className="border-l-2 border-gray-200 pl-4">
                            <p className="font-semibold text-gray-900">{edu.degree}</p>
                            <p className="text-gray-700">{edu.institution}</p>
                            {edu.field_of_study && (
                              <p className="text-sm text-gray-600">{edu.field_of_study}</p>
                            )}
                            {edu.grade && (
                              <p className="text-sm text-gray-600">Grade: {edu.grade}</p>
                            )}
                            {edu.start_year && edu.end_year && (
                              <p className="text-sm text-gray-500">
                                {edu.start_year} - {edu.end_year}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI-Enhanced Skills */}
                  {generatedResume.ai_enhanced.skills?.skills && generatedResume.ai_enhanced.skills.skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
                      <div className="space-y-3">
                        {generatedResume.ai_enhanced.skills.skills.map((skill: any, index: number) => (
                          <div key={index}>
                            <p className="font-semibold text-gray-900 mb-2">{skill.category}</p>
                            <div className="flex flex-wrap gap-2">
                              {skill.items.map((item: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI-Enhanced Projects */}
                  {generatedResume.ai_enhanced.projects && generatedResume.ai_enhanced.projects.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Projects</h3>
                      <div className="space-y-6">
                        {generatedResume.ai_enhanced.projects.map((project: any, index: number) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{project.title}</p>
                                {project.role && (
                                  <p className="text-sm text-gray-600">{project.role}</p>
                                )}
                              </div>
                              {project.url && (
                                <a href="#" className="text-sm text-blue-600 hover:underline">
                                  View Project
                                </a>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{project.description}</p>
                            {project.bullets && project.bullets.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                                {project.bullets.map((bullet: string, i: number) => (
                                  <li key={i}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                            {project.technologies && project.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {project.technologies.map((tech: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI-Enhanced Work Experience */}
                  {generatedResume.ai_enhanced.work_experience && generatedResume.ai_enhanced.work_experience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Work Experience</h3>
                      <div className="space-y-6">
                        {generatedResume.ai_enhanced.work_experience.map((exp: any, index: number) => (
                          <div key={index} className="border-l-2 border-green-200 pl-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{exp.role}</p>
                                <p className="text-gray-700">{exp.company}</p>
                              </div>
                              {exp.start_date && (
                                <p className="text-sm text-gray-600">
                                  {exp.start_date} - {exp.end_date || "Present"}
                                </p>
                              )}
                            </div>
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mb-2">
                                {exp.bullets.map((bullet: string, i: number) => (
                                  <li key={i}>{bullet}</li>
                                ))}
                              </ul>
                            )}
                            {exp.keywords && exp.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {exp.keywords.map((keyword: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {generatedResume.certifications && generatedResume.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-3">Certifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {generatedResume.certifications.map((cert: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <p className="font-semibold text-gray-900">{cert.name}</p>
                            {cert.issuer && (
                              <p className="text-sm text-gray-600">{cert.issuer}</p>
                            )}
                            {cert.year && (
                              <p className="text-sm text-gray-500">{cert.year}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Raw JSON */}
                  <details className="mt-8">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Raw JSON Response
                    </summary>
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 overflow-auto max-h-96">
                      <pre className="text-xs text-gray-700">
                        {JSON.stringify(generatedResume, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </Card>

              {/* Preview section */}
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-gray-900">
                        Resume Preview
                      </h2>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handlePrint}
                        >
                          <Printer className="w-4 h-4" /> Print
                        </Button>
                        <Button size="sm" onClick={handleDownloadPdf}>
                          <Download className="w-4 h-4" /> Download PDF
                        </Button>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-xl p-8 flex justify-center overflow-auto">
                      <div className="shadow-2xl mx-auto">
                        <ResumePreview
                          ref={previewRef}
                          name={generatedResume.personal_details.name}
                          email={generatedResume.personal_details.email}
                          phone={generatedResume.personal_details.phone}
                          location={generatedResume.personal_details.location}
                          linkedin={generatedResume.personal_details.linkedin}
                          github={generatedResume.personal_details.github}
                          portfolio={generatedResume.personal_details.portfolio}
                          targetRole={generatedResume.target_role}
                          education={generatedResume.education as any}
                          certifications={generatedResume.certifications as any}
                          summary={generatedResume.ai_enhanced.summary?.summary || ""}
                          skills={
                            generatedResume.ai_enhanced.skills?.skills
                              ?.map((s: any) => `${s.category}: ${s.items.join(", ")}`)
                              .join("\n") || ""
                          }
                          projects={
                            generatedResume.ai_enhanced.projects
                              ?.map(
                                (p: any) =>
                                  `## ${p.title}\n${p.bullets?.map((b: string) => `- ${b}`).join("\n")}`
                              )
                              .join("\n\n") || ""
                          }
                          experience={
                            generatedResume.ai_enhanced.work_experience
                              ?.map(
                                (e: any) =>
                                  `## ${e.role} at ${e.company}${e.duration ? ` (${e.duration})` : ""}\n${e.bullets?.map((b: string) => `- ${b}`).join("\n")}`
                              )
                              .join("\n\n") || ""
                          }
                        />
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
