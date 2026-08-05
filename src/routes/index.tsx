import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Download, FileSearch, PenLine, ScanSearch, Sparkles, Upload } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeAI — Build a Resume That Gets You Hired" },
      {
        name: "description",
        content:
          "AI-powered ATS analysis, resume optimization, and live remote job matching. Free job data, no API keys required.",
      },
      { property: "og:title", content: "ResumeAI — Build a Resume That Gets You Hired" },
      {
        property: "og:description",
        content: "AI-powered ATS analysis, resume optimization, and real job matching in one place.",
      },
    ],
  }),
  component: Landing,
});

const steps = [
  { icon: Upload, title: "Upload Resume", body: "Drop in a PDF or DOCX. We extract the text instantly." },
  { icon: Sparkles, title: "AI Analyzes & Optimizes", body: "Get an ATS score, missing keywords, and rewrites." },
  { icon: Download, title: "Download + Apply", body: "Export a clean PDF and apply to matched live jobs." },
];

const features = [
  { icon: ScanSearch, title: "ATS Score Checker", body: "Keyword, formatting, readability, and section scoring in seconds." },
  { icon: PenLine, title: "AI Resume Rewriter", body: "STAR-format bullet points and keyword-rich summaries." },
  { icon: Briefcase, title: "Smart Job Matching", body: "Live roles from RemoteOK, Himalayas, and Arbeitnow." },
  { icon: FileSearch, title: "One-Click PDF Download", body: "Three ATS-friendly templates, exported pixel-perfect." },
];

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Build a Resume That Actually Gets You Hired
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            AI-powered ATS analysis, resume optimization, and real job matching — all in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent">
              <Link to="/ats-checker">
                Upload My Resume <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/builder">Build from Scratch</Link>
            </Button>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold">How It Works</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-border p-6">
                  <span className="metric text-xs text-muted-foreground">STEP 0{index + 1}</span>
                  <step.icon className="mt-3 size-5 text-accent" />
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold">Everything you need to land the interview</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-card">
                  <CardHeader>
                    <feature.icon className="size-5 text-accent" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.body}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold">Pricing</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free while in beta. Job data comes from free public APIs — no keys, no billing.
            </p>
            <Card className="mt-8 text-left shadow-card">
              <CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div>
                  <p className="metric text-3xl font-bold">$0</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Unlimited ATS checks, AI rewrites, and job matching.
                  </p>
                </div>
                <Button asChild>
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
