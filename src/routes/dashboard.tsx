import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ScanSearch, Upload, X } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useResume } from "@/context/ResumeContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ResumeAI" },
      { name: "description", content: "Your resumes, ATS scores, and job matches at a glance." },
      { property: "og:title", content: "Dashboard — ResumeAI" },
      { property: "og:description", content: "Your resumes, ATS scores, and job matches at a glance." },
    ],
  }),
  component: Dashboard,
});

const TIPS = [
  "Use a single-column layout — ATS parsers choke on tables and text boxes.",
  "Mirror the exact keywords from the job description in your skills section.",
  "Start every bullet with a strong action verb and end it with a measurable result.",
];

const actions = [
  { title: "Upload Resume", description: "Parse a PDF or DOCX", to: "/ats-checker" as const, icon: Upload },
  { title: "Check ATS Score", description: "AI scoring in seconds", to: "/ats-checker" as const, icon: ScanSearch },
  { title: "Find Jobs", description: "Live remote listings", to: "/jobs" as const, icon: Briefcase },
];

function Dashboard() {
  const { state } = useResume();
  const [dismissed, setDismissed] = useState<number[]>([]);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-lg border border-border bg-gradient-to-r from-primary to-accent p-6 text-primary-foreground">
          <h2 className="text-xl font-semibold">Welcome back! Ready to land your next role?</h2>
          <p className="mt-1 text-sm opacity-90">
            {state.ats
              ? `Your last resume scored ${state.ats.overall_score}/100.`
              : "Start by uploading a resume to get your ATS score."}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.title} to={action.to}>
              <Card className="h-full shadow-card transition-shadow hover:shadow-soft">
                <CardHeader>
                  <action.icon className="size-5 text-accent" />
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Recent resumes</h3>
          <Card className="shadow-card">
            <CardContent className="p-0">
              {state.history.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground">
                  No resumes analyzed yet.{" "}
                  <Link to="/ats-checker" className="text-accent underline">
                    Upload your first one
                  </Link>
                  .
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {state.history.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="flex items-center gap-3 px-5 py-3.5">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                      {item.score !== null ? (
                        <Badge
                          variant="secondary"
                          className={
                            item.score > 75
                              ? "metric bg-success/10 text-success"
                              : item.score >= 50
                                ? "metric bg-warning/15 text-warning-foreground"
                                : "metric bg-destructive/10 text-destructive"
                          }
                        >
                          {item.score}
                        </Badge>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">ATS tips</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {TIPS.map((tip, index) =>
              dismissed.includes(index) ? null : (
                <Card key={index} className="shadow-card">
                  <CardContent className="flex gap-3 p-4">
                    <p className="flex-1 text-sm text-muted-foreground">{tip}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Dismiss tip"
                      onClick={() => setDismissed((d) => [...d, index])}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
