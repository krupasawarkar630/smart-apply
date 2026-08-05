import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Download, Plus, Trash2 } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useResume, type TemplateId } from "@/context/ResumeContext";
import { rewriteSection } from "@/lib/ai.functions";
import { downloadElementAsPdf } from "@/lib/pdfService";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Resume Builder — ResumeAI" },
      {
        name: "description",
        content: "Build an ATS-friendly resume step by step with AI help and export it as a clean PDF.",
      },
      { property: "og:title", content: "Resume Builder — ResumeAI" },
      { property: "og:description", content: "A five-step wizard for ATS-friendly resumes with AI assistance." },
    ],
  }),
  component: Builder,
});

const STEPS = ["Contact", "Experience", "Education", "Skills", "Template"] as const;
const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Serif headings, timeless single column." },
  { id: "modern", name: "Modern", description: "Clean sans-serif with accent rules." },
  { id: "compact", name: "Compact", description: "Tight spacing to fit one page." },
];

const newId = () => Math.random().toString(36).slice(2, 10);

function Builder() {
  const { state, dispatch } = useResume();
  const rewrite = useServerFn(rewriteSection);
  const previewRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [skillDraft, setSkillDraft] = useState("");
  const { resume } = state;

  const update = (payload: Partial<typeof resume>) => dispatch({ type: "SET_RESUME", payload });

  const exportPdf = async () => {
    if (!previewRef.current) return;
    try {
      await downloadElementAsPdf(previewRef.current, `${resume.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded");
    } catch (err) {
      console.error(err);
      toast.error("PDF export failed");
    }
  };

  return (
    <AppShell title="Resume Builder">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Step {step + 1} of {STEPS.length} — {STEPS[step]}
              </span>
              <span className="metric">{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} />
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-base">{STEPS[step]}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Full name"
                    value={resume.fullName}
                    onChange={(e) => update({ fullName: e.target.value })}
                  />
                  <Input
                    placeholder="Target job title"
                    value={resume.jobTitle}
                    onChange={(e) => update({ jobTitle: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={resume.email}
                    onChange={(e) => update({ email: e.target.value })}
                  />
                  <Input
                    placeholder="Phone"
                    value={resume.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                  />
                  <Input
                    placeholder="LinkedIn"
                    value={resume.linkedin}
                    onChange={(e) => update({ linkedin: e.target.value })}
                  />
                  <Input
                    placeholder="Portfolio"
                    value={resume.portfolio}
                    onChange={(e) => update({ portfolio: e.target.value })}
                  />
                  <Input
                    placeholder="Location"
                    value={resume.location}
                    onChange={(e) => update({ location: e.target.value })}
                  />
                </div>
              ) : null}

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Professional summary</Label>
                      <AiButton
                        loadingLabel="Writing…"
                        onRun={async () => {
                          const { text } = await rewrite({
                            data: {
                              action: resume.summary.trim() ? "summary" : "generate_summary",
                              content:
                                resume.summary.trim() ||
                                `${resume.jobTitle || "Professional"} with skills: ${resume.skills.join(", ") || "n/a"}`,
                              context: `Target role: ${resume.jobTitle}`,
                            },
                          });
                          update({ summary: text });
                          toast.success("Summary updated");
                        }}
                      >
                        Generate with AI
                      </AiButton>
                    </div>
                    <Textarea
                      rows={5}
                      value={resume.summary}
                      onChange={(e) => update({ summary: e.target.value })}
                    />
                  </div>

                  {resume.experience.map((entry) => (
                    <div key={entry.id} className="space-y-3 rounded-md border border-border p-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          placeholder="Job title"
                          value={entry.title}
                          onChange={(e) =>
                            update({
                              experience: resume.experience.map((x) =>
                                x.id === entry.id ? { ...x, title: e.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          placeholder="Company"
                          value={entry.company}
                          onChange={(e) =>
                            update({
                              experience: resume.experience.map((x) =>
                                x.id === entry.id ? { ...x, company: e.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          placeholder="Start date"
                          value={entry.startDate}
                          onChange={(e) =>
                            update({
                              experience: resume.experience.map((x) =>
                                x.id === entry.id ? { ...x, startDate: e.target.value } : x,
                              ),
                            })
                          }
                        />
                        <Input
                          placeholder="End date"
                          value={entry.endDate}
                          onChange={(e) =>
                            update({
                              experience: resume.experience.map((x) =>
                                x.id === entry.id ? { ...x, endDate: e.target.value } : x,
                              ),
                            })
                          }
                        />
                      </div>
                      <Textarea
                        rows={4}
                        placeholder="One achievement per line"
                        value={entry.bullets.join("\n")}
                        onChange={(e) =>
                          update({
                            experience: resume.experience.map((x) =>
                              x.id === entry.id ? { ...x, bullets: e.target.value.split("\n") } : x,
                            ),
                          })
                        }
                      />
                      <div className="flex gap-2">
                        <AiButton
                          loadingLabel="Enhancing…"
                          onRun={async () => {
                            const { text } = await rewrite({
                              data: {
                                action: "bullets",
                                content: entry.bullets.join("\n") || entry.title,
                                context: `Role: ${entry.title} at ${entry.company}`,
                              },
                            });
                            update({
                              experience: resume.experience.map((x) =>
                                x.id === entry.id
                                  ? {
                                      ...x,
                                      bullets: text
                                        .split("\n")
                                        .map((l) => l.replace(/^[-•*\d.\s]+/, "").trim())
                                        .filter(Boolean),
                                    }
                                  : x,
                              ),
                            });
                            toast.success("Bullets enhanced");
                          }}
                        >
                          AI Improve
                        </AiButton>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            update({ experience: resume.experience.filter((x) => x.id !== entry.id) })
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
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
                    <Plus className="mr-1 size-3.5" /> Add position
                  </Button>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-3">
                  {resume.education.map((entry) => (
                    <div key={entry.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
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
                      <Input
                        placeholder="GPA (optional)"
                        value={entry.gpa}
                        onChange={(e) =>
                          update({
                            education: resume.education.map((x) =>
                              x.id === entry.id ? { ...x, gpa: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      update({
                        education: [
                          ...resume.education,
                          { id: newId(), degree: "", institution: "", year: "", gpa: "" },
                        ],
                      })
                    }
                  >
                    <Plus className="mr-1 size-3.5" /> Add education
                  </Button>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
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
                  <Input
                    placeholder="Type a skill and press Enter"
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
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Certifications</Label>
                    {resume.certifications.map((cert) => (
                      <div key={cert.id} className="grid gap-2 rounded-md border border-border p-3 sm:grid-cols-3">
                        <Input
                          placeholder="Name"
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        update({
                          certifications: [
                            ...resume.certifications,
                            { id: newId(), name: "", issuer: "", year: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="mr-1 size-3.5" /> Add certification
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => dispatch({ type: "SET_TEMPLATE", payload: template.id })}
                        className={`rounded-md border p-3 text-left transition-colors ${
                          state.template === template.id
                            ? "border-accent bg-accent/5"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                      </button>
                    ))}
                  </div>
                  <Button onClick={exportPdf}>
                    <Download className="mr-1 size-4" /> Download PDF
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="mr-1 size-4" /> Back
            </Button>
            <Button
              disabled={step === STEPS.length - 1}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
            >
              Next <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:h-fit">
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Live preview</p>
          <ResumePreview ref={previewRef} resume={resume} template={state.template} />
        </div>
      </div>
    </AppShell>
  );
}
