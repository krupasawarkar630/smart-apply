import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { FileUploader, type UploadStage } from "@/components/ats/FileUploader";
import { IssuesList, StrengthsList } from "@/components/ats/IssuesList";
import { ScoreBreakdown } from "@/components/ats/ScoreBreakdown";
import { ScoreGauge } from "@/components/ats/ScoreGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useResume, type AtsResult } from "@/context/ResumeContext";
import { analyzeResume } from "@/lib/ai.functions";
import { detectJobTitle, extractSkills } from "@/lib/keywordMatcher";
import { downloadTextReport } from "@/lib/pdfService";

export const Route = createFileRoute("/ats-checker")({
  head: () => ({
    meta: [
      { title: "ATS Score Checker — ResumeAI" },
      {
        name: "description",
        content: "Upload a PDF or DOCX resume and get an AI-generated ATS score with fixes.",
      },
      { property: "og:title", content: "ATS Score Checker — ResumeAI" },
      { property: "og:description", content: "AI ATS scoring with keyword, formatting and readability breakdown." },
    ],
  }),
  component: AtsChecker,
});

function clampScore(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalize(raw: string): AtsResult {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  const json = JSON.parse(start >= 0 ? raw.slice(start, end + 1) : raw) as Record<string, unknown>;
  return {
    overall_score: clampScore(json["overall_score"]),
    keyword_score: clampScore(json["keyword_score"]),
    formatting_score: clampScore(json["formatting_score"]),
    readability_score: clampScore(json["readability_score"]),
    section_score: clampScore(json["section_score"]),
    issues: Array.isArray(json["issues"]) ? (json["issues"] as AtsResult["issues"]) : [],
    missing_keywords: Array.isArray(json["missing_keywords"]) ? (json["missing_keywords"] as string[]) : [],
    strengths: Array.isArray(json["strengths"]) ? (json["strengths"] as string[]) : [],
    improvements: Array.isArray(json["improvements"]) ? (json["improvements"] as string[]) : [],
  };
}

function AtsChecker() {
  const { state, dispatch } = useResume();
  const router = useRouter();
  const analyze = useServerFn(analyzeResume);
  const [stage, setStage] = useState<UploadStage>(state.ats ? "done" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<{ name: string; size: number } | null>(
    state.fileName ? { name: state.fileName, size: 0 } : null,
  );
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFile = async (selected: File) => {
    setError(null);
    setFile({ name: selected.name, size: selected.size });
    setStage("uploading");
    try {
      const { extractTextFromFile, guessSections } = await import("@/lib/resumeParser");
      setStage("parsing");
      const text = await extractTextFromFile(selected);
      if (text.trim().length < 50) throw new Error("We couldn't read enough text from that file.");

      dispatch({ type: "SET_RAW_TEXT", payload: { text, fileName: selected.name } });
      const skills = extractSkills(text);
      const jobTitle = detectJobTitle(text);
      const guessed = guessSections(text);
      dispatch({
        type: "SET_RESUME",
        payload: {
          skills: skills.length ? skills : state.resume.skills,
          jobTitle,
          fullName: guessed.fullName || state.resume.fullName,
          email: guessed.email || state.resume.email,
          phone: guessed.phone || state.resume.phone,
          linkedin: guessed.linkedin || state.resume.linkedin,
          portfolio: guessed.portfolio || state.resume.portfolio,
          summary: state.resume.summary || guessed.summary,
        },
      });

      setStage("analyzing");
      const { raw } = await analyze({ data: { resumeText: text, jobTitle } });
      const result = normalize(raw);
      dispatch({ type: "SET_ATS", payload: result });
      dispatch({
        type: "ADD_HISTORY",
        payload: { name: selected.name, date: new Date().toISOString(), score: result.overall_score },
      });
      setStage("done");
      toast.success("ATS analysis complete");
      requestAnimationFrame(() =>
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch (err) {
      console.error(err);
      setStage("error");
      const message =
        err instanceof SyntaxError
          ? "The AI response couldn't be parsed. Please try again."
          : err instanceof Error
            ? err.message
            : "Analysis failed.";
      setError(message);
      toast.error(message, { action: { label: "Retry", onClick: () => handleFile(selected) } });
    }
  };

  const ats = state.ats;

  const downloadReport = async () => {
    if (!ats) return;
    await downloadTextReport(
      "ATS Analysis Report",
      [
        `Resume: ${state.fileName ?? "Untitled"}`,
        `Overall score: ${ats.overall_score}/100`,
        "",
        "## Score breakdown",
        `Keyword match: ${ats.keyword_score}`,
        `Formatting: ${ats.formatting_score}`,
        `Readability: ${ats.readability_score}`,
        `Section completeness: ${ats.section_score}`,
        "",
        "## Issues",
        ...ats.issues.map((i) => `[${i.type}] ${i.section}: ${i.message}`),
        "",
        "## Missing keywords",
        ats.missing_keywords.join(", ") || "None",
        "",
        "## Strengths",
        ...ats.strengths,
        "",
        "## Improvements",
        ...ats.improvements,
      ],
      "ats-report.pdf",
    );
    toast.success("Report downloaded");
  };

  return (
    <AppShell title="ATS Checker">
      <div className="mx-auto max-w-5xl space-y-8">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-base">Upload your resume</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploader
              stage={stage}
              error={error}
              fileName={file?.name ?? null}
              fileSize={file?.size ?? null}
              onFile={handleFile}
            />
          </CardContent>
        </Card>

        {stage === "analyzing" ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : null}

        {ats ? (
          <div ref={resultsRef} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center gap-4 p-6">
                  <ScoreGauge score={ats.overall_score} />
                  <p className="text-center text-sm text-muted-foreground">
                    {ats.overall_score > 75
                      ? "Strong ATS compatibility."
                      : ats.overall_score >= 50
                        ? "Decent, but there's room to improve."
                        : "This resume likely gets filtered out. Let's fix it."}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Score breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoreBreakdown scores={ats as unknown as Record<string, number>} />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-base">Issues found</CardTitle>
                </CardHeader>
                <CardContent>
                  <IssuesList issues={ats.issues} />
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StrengthsList strengths={ats.strengths} />
                  </CardContent>
                </Card>

                <Card className="shadow-card">
                  <CardHeader>
                    <CardTitle className="text-base">Missing keywords</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-1.5">
                    {ats.missing_keywords.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No major keyword gaps detected.</p>
                    ) : (
                      ats.missing_keywords.map((keyword) => (
                        <Badge key={keyword} variant="outline" className="font-normal">
                          {keyword}
                        </Badge>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.navigate({ to: "/optimize" })}>
                <Sparkles className="mr-1 size-4" /> Optimize My Resume
              </Button>
              <Button variant="outline" onClick={downloadReport}>
                <Download className="mr-1 size-4" /> Download Report
              </Button>
              <Button asChild variant="ghost">
                <Link to="/jobs">Find matching jobs</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
