import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function FallbackJobLinks({ jobTitle, skills }: { jobTitle: string; skills: string[] }) {
  const q = encodeURIComponent(jobTitle || "Software Engineer");
  const keywords = encodeURIComponent([jobTitle, ...skills.slice(0, 3)].filter(Boolean).join(" "));

  const boards = [
    { label: "Search LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search?keywords=${keywords}&f_TPR=r86400` },
    { label: "Search Indeed", url: `https://www.indeed.com/jobs?q=${q}` },
    { label: "Search Wellfound", url: `https://wellfound.com/jobs?role=${q}` },
    { label: "Search We Work Remotely", url: `https://weworkremotely.com/remote-jobs/search?term=${q}` },
    { label: "Search Glassdoor", url: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${q}` },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-base">Search Manually on Top Job Boards</CardTitle>
        <CardDescription>
          Live feeds are unavailable right now. These links open pre-filled searches for{" "}
          <span className="font-medium text-foreground">{jobTitle || "your role"}</span>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {boards.map((board) => (
          <Button key={board.label} asChild variant="outline" size="sm">
            <a href={board.url} target="_blank" rel="noreferrer noopener">
              {board.label} <ArrowUpRight className="ml-1 size-3.5" />
            </a>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
