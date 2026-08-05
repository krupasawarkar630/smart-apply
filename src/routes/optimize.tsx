import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, ListChecks, Plus, Trash2, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { AiButton } from "@/components/optimizer/AiButton";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResume, type ExperienceEntry } from "@/context/ResumeContext";
import { rewriteSection } from "@/lib/ai.functions";
import { downloadElementAsPdf } from "@/lib/pdfService";

export const Route = createFileRoute("/optimize")({
  head: () => ({
    meta: [
      { title: "AI Resume Optimizer — ResumeAI" },
      {
        name: "description",
        content: "Rewrite your summary, bullets and keywords with AI while watching a live ATS-friendly preview.",
      },
      { property: "og:title", content: "AI Resume Optimizer — ResumeAI" },
      { property: "og:description", content: "AI rewrites with a live ATS-friendly resume preview and PDF export." },
    ],
  }),
  component: Optimizer,
});

const newId = () => Math.random().toString(36).slice(2, 10);

function Optimizer() {
  const { state, dispatch } = useResume();
  const rewrite = useServerFn(rewriteSection);
  const previewRef = useRef<HTMLDivElement>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [skillDraft, setSkillDraft] = useState("");
  const { resume, ats } = state;

  const update = (payload: Partial<typeof resume>) => dispatch({ type: "SET_RESUME", payload });

  const flashSection = (key: string) => {
    setFlash(key);
    setTimeout(() => setFlash((f) => (f === key ? null : f)), 900);
  };

  const runRewrite = async (
    action: Parameters<typeof rewriteSection>[0] extends never ? never : string,
    content: string,
    apply: (text: string) => void,
    sectionKey: string,
  ) => {
    if (!content.trim()) {
      toast.info("Add some content first, then let AI improve it.");
      throw new Error("empty");
    }
    try {
      const { text } = await rewrite({
        data: {
          action: action as "summary",
          content,
          context: `Target role: ${resume.jobTitle || "unspecified"}. Skills: ${resume.skills.join(", ")}. Missing keywords: ${(ats?.missing_keywords ?? []).join(", ")}`,
        },
      });
      apply(text);
      flashSection(sectionKey);
      toast.success("Section updated");
    } catch (err) {
      console.error(err);
      toast.error("AI request failed", { duration: Infinity });
      throw err;
    }
  };

  const updateExperience = (id: string, patch: Partial<ExperienceEntry>) =>
    update({ experience: resume.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    try {
      await downloadElementAsPdf(previewRef.current, `${resume.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    }
  };

  const flashClass = (key: string) =>
    flash === key ? "ring-2 ring-success/60 transition-shadow" : "transition-shadow";

  return (
    <AppShell title="AI Resume Optimizer">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <AiButton
            onRun={() => runRewrite("summary", resume.summary, (t) => update({ summary: t }), "summary")}
          >
            Rewrite Full Summary
          </AiButton>
          <AiButton
            loadingLabel="Enhancing…"
            onRun={async () => {
              for (const entry of resume.experience) {
                await runRewrite(
                  "bullets",
                  entry.bullets.join("\n"),
                  (t) =>
                    updateExperience(entry.id, {
                      bullets: t.split("\n").map((l) => l.replace(/^[-•*\d.\s]+/, "").trim()).filter(Boolean),
                    }),
                  entry.id,
                );
              }
            }}
            icon={<ListChecks className="mr-1 size-3.5" />}
          >
            Enhance All Bullet Points
          </AiButton>
          <AiButton
            loadingLabel="Adding…"
            onRun={() => {
              const keywords = ats?.missing_keywords ?? [];
              if (keywords.length === 0) {
                toast.info("Run an ATS check first to detect missing keywords.");
                throw new Error("no-keywords");
              }
              return runRewrite(
                "keywords",
                `${resume.summary}\n\nKeywords to include: ${keywords.join(", ")}`,
                (t) => update({ summary: t, skills: Array.from(new Set([...resume.skills, ...keywords])) }),
                "summary",
              );
            }}
          >
            Add Missing Keywords
          </AiButton>
          <AiButton
            loadingLabel="Fixing…"
            onRun={() => runRewrite("formatting", resume.summary, (t) => update({ summary: t }), "summary")}
            icon={<Wand2 className="mr-1 size-3.5" />}
          >
            Fix All Formatting
          </AiButton>
          <Button size="sm" onClick={downloadPdf}>
            <Download className="mr-1 size-3.5" /> Download PDF
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className={`shadow-card ${flashClass("summary")}`}>
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Professional Summary</CardTitle>
                <AiButton
                  onRun={() => runRewrite("summary", resume.summary, (t) => update({ summary: t }), "summary")}
                >
                  AI Improve
                </AiButton>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Target job title"
                  value={resume.jobTitle}
                  onChange={(e) => update({ jobTitle: e.target.value })}
                />
                <Textarea
                  rows={6}
                  placeholder="A results-driven engineer with…"
                  value={resume.summary}
                  onChange={(e) => update({ summary: e.target.value })}
                />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Work Experience</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update({
                      experience: [
                        ...resume.experience,
                        {
                          id: newId(),
                          title: "",
                          company: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          bullets: [""],
                        },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-5">
                {resume.experience.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No experience entries yet.</p>
                ) : null}
                {resume.experience.map((entry) => (
                  <div key={entry.id} className={`space-y-3 rounded-md border border-border p-4 ${flashClass(entry.id)}`}>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Job title"
                        value={entry.title}
                        onChange={(e) => updateExperience(entry.id, { title: e.target.value })}
                      />
                      <Input
                        placeholder="Company"
                        value={entry.company}
                        onChange={(e) => updateExperience(entry.id, { company: e.target.value })}
                      />
                      <Input
                        placeholder="Start (e.g. Jan 2022)"
                        value={entry.startDate}
                        onChange={(e) => updateExperience(entry.id, { startDate: e.target.value })}
                      />
                      <Input
                        placeholder={entry.current ? "Present" : "End (e.g. Mar 2024)"}
                        value={entry.endDate}
                        disabled={entry.current}
                        onChange={(e) => updateExperience(entry.id, { endDate: e.target.value })}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(e) => updateExperience(entry.id, { current: e.target.checked })}
                      />
                      I currently work here
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="One bullet point per line"
                      value={entry.bullets.join("\n")}
                      onChange={(e) => updateExperience(entry.id, { bullets: e.target.value.split("\n") })}
                    />
                    <div className="flex gap-2">
                      <AiButton
                        loadingLabel="Enhancing…"
                        onRun={() =>
                          runRewrite(
                            "bullets",
                            entry.bullets.join("\n"),
                            (t) =>
                              updateExperience(entry.id, {
                                bullets: t
                                  .split("\n")
                                  .map((l) => l.replace(/^[-•*\d.\s]+/, "").trim())
                                  .filter(Boolean),
                              }),
                            entry.id,
                          )
                        }
                      >
                        AI Improve
                      </AiButton>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          update({ experience: resume.experience.filter((e) => e.id !== entry.id) })
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Education</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update({
                      education: [
                        ...resume.education,
                        { id: newId(), degree: "", institution: "", year: "", gpa: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.education.map((entry) => (
                  <div key={entry.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-3">
                    <Input
                      placeholder="Degree"
                      value={entry.degree}
                      onChange={(e) =>
                        update({
                          education: resume.education.map((x) =>
                            x.id === entry.id ? { ...x, degree: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Institution"
                      value={entry.institution}
                      onChange={(e) =>
                        update({
                          education: resume.education.map((x) =>
                            x.id === entry.id ? { ...x, institution: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Year"
                      value={entry.year}
                      onChange={(e) =>
                        update({
                          education: resume.education.map((x) =>
                            x.id === entry.id ? { ...x, year: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base">Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {resume.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 font-normal">
                      {skill}
                      <button
                        type="button"
                        aria-label={`Remove ${skill}`}
                        onClick={() => update({ skills: resume.skills.filter((s) => s !== skill) })}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <Label htmlFor="skill-input" className="text-xs text-muted-foreground">
                  Add a skill and press Enter
                </Label>
                <Input
                  id="skill-input"
                  value={skillDraft}
                  onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && skillDraft.trim()) {
                      e.preventDefault();
                      update({ skills: Array.from(new Set([...resume.skills, skillDraft.trim()])) });
                      setSkillDraft("");
                    }
                  }}
                />
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Certifications</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    update({
                      certifications: [
                        ...resume.certifications,
                        { id: newId(), name: "", issuer: "", year: "" },
                      ],
                    })
                  }
                >
                  <Plus className="mr-1 size-3.5" /> Add
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.certifications.map((cert) => (
                  <div key={cert.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-3">
                    <Input
                      placeholder="Certification"
                      value={cert.name}
                      onChange={(e) =>
                        update({
                          certifications: resume.certifications.map((x) =>
                            x.id === cert.id ? { ...x, name: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Issuer"
                      value={cert.issuer}
                      onChange={(e) =>
                        update({
                          certifications: resume.certifications.map((x) =>
                            x.id === cert.id ? { ...x, issuer: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      placeholder="Year"
                      value={cert.year}
                      onChange={(e) =>
                        update({
                          certifications: resume.certifications.map((x) =>
                            x.id === cert.id ? { ...x, year: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:sticky lg:top-20 lg:h-fit">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Live preview</p>
            <ResumePreview ref={previewRef} resume={resume} template={state.template} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
