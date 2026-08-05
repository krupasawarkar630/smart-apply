import { Bookmark, BookmarkCheck, Building2, ExternalLink, Linkedin, MapPin } from "lucide-react";
import { useState } from "react";
import type { UnifiedJob } from "@/lib/jobs.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { relativeDate } from "@/lib/keywordMatcher";

function initials(company: string) {
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function JobCard({
  job,
  matchedSkills,
  atsMatch,
  saved,
  onToggleSave,
}: {
  job: UnifiedJob;
  matchedSkills: string[];
  atsMatch: number;
  saved: boolean;
  onToggleSave: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const logo =
    job.logo ?? (job.companyDomain ? `https://logo.clearbit.com/${job.companyDomain}` : null);
  const linkedinUrl = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(
    `${job.title} ${job.company}`,
  )}`;

  return (
    <Card className="shadow-card transition-shadow hover:shadow-soft">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary text-xs font-semibold text-secondary-foreground">
            {logo && !logoFailed ? (
              <img
                src={logo}
                alt={`${job.company} logo`}
                className="size-full object-contain"
                loading="lazy"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              initials(job.company) || <Building2 className="size-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{job.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{job.company}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {job.location || job.workMode}
              </span>
              <Badge variant="secondary">{job.workMode}</Badge>
              {job.salary ? <span className="metric">{job.salary}</span> : null}
              <span>· {relativeDate(job.postedAt)}</span>
              <span>· {job.source}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="metric rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
              {atsMatch}% match
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label={saved ? "Remove saved job" : "Save job"}
              onClick={onToggleSave}
            >
              {saved ? <BookmarkCheck className="size-4 text-accent" /> : <Bookmark className="size-4" />}
            </Button>
          </div>
        </div>

        {matchedSkills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matchedSkills.slice(0, 6).map((skill) => (
              <Badge key={skill} className="bg-success/10 text-success" variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}

        {job.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {job.tags.slice(0, 6).map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {job.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <a href={job.url} target="_blank" rel="noreferrer noopener">
              Apply Now <ExternalLink className="ml-1 size-3.5" />
            </a>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a href={linkedinUrl} target="_blank" rel="noreferrer noopener">
              <Linkedin className="mr-1 size-3.5" /> View on LinkedIn
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
