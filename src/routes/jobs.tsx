import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { FallbackJobLinks } from "@/components/jobs/FallbackJobLinks";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters, type JobFilterState } from "@/components/jobs/JobFilters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useResume } from "@/context/ResumeContext";
import { searchJobs } from "@/lib/jobs.functions";
import { atsMatchScore, matchingSkills } from "@/lib/keywordMatcher";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Job Search — ResumeAI" },
      {
        name: "description",
        content: "Search live remote roles from RemoteOK, Himalayas and Arbeitnow with skill-match scoring.",
      },
      { property: "og:title", content: "Job Search — ResumeAI" },
      { property: "og:description", content: "Live remote job listings ranked by how well they match your resume." },
    ],
  }),
  component: Jobs,
});

function Jobs() {
  const { state, dispatch } = useResume();
  const search = useServerFn(searchJobs);
  const [query, setQuery] = useState(state.resume.jobTitle || "");
  const [submitted, setSubmitted] = useState(state.resume.jobTitle || "");
  const [filters, setFilters] = useState<JobFilterState>({
    remoteOnly: false,
    jobTypes: [],
    location: "",
    skills: state.resume.skills.slice(0, 5),
  });

  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["jobs", submitted, filters.skills.join(",")],
    queryFn: () => search({ data: { query: submitted, skills: filters.skills, limit: 60 } }),
    staleTime: 5 * 60 * 1000,
  });

  const jobs = useMemo(() => {
    const all = data?.jobs ?? [];
    return all.filter((job) => {
      if (filters.remoteOnly && job.workMode !== "Remote") return false;
      if (filters.jobTypes.length && !filters.jobTypes.some((t) => job.jobTypes.includes(t))) return false;
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase()))
        return false;
      return true;
    });
  }, [data, filters]);

  const savedIds = new Set(state.savedJobs.map((job) => job.id));

  return (
    <AppShell title="Job Search">
      <div className="space-y-6">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(query.trim());
          }}
        >
          <Input
            className="min-w-56 flex-1"
            placeholder="Job title or keyword (e.g. frontend engineer)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="mr-1 size-4" /> Search
          </Button>
        </form>

        {data?.failedSources?.length ? (
          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>
              Some sources were unavailable ({data.failedSources.join(", ")}). Showing results from the rest.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="space-y-4">
            <JobFilters filters={filters} onChange={setFilters} />
            <FallbackJobLinks jobTitle={submitted || state.resume.jobTitle} skills={state.resume.skills} />
          </div>

          <div className="space-y-4">
            {isFetching ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-36" />
                ))}
              </div>
            ) : isError ? (
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">We couldn't load job listings right now.</p>
                <Button variant="outline" className="mt-3" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-lg border border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No roles matched your search. Try a broader keyword or clear your filters.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">{jobs.length} roles found</p>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    matchedSkills={matchingSkills(state.resume.skills, [...job.tags, ...job.title.split(/\s+/)])}
                    atsMatch={atsMatchScore(
                      `${state.rawText} ${state.resume.skills.join(" ")}`,
                      `${job.title} ${job.tags.join(" ")} ${job.description}`,
                    )}
                    saved={savedIds.has(job.id)}
                    onToggleSave={() => {
                      if (savedIds.has(job.id)) {
                        dispatch({ type: "REMOVE_JOB", payload: job.id });
                        toast.success("Job removed");
                      } else {
                        dispatch({
                          type: "SAVE_JOB",
                          payload: {
                            id: job.id,
                            title: job.title,
                            company: job.company,
                            url: job.url,
                            location: job.location,
                            savedAt: new Date().toISOString(),
                          },
                        });
                        toast.success("Job saved");
                      }
                    }}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
