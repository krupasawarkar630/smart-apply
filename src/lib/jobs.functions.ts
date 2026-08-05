import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type UnifiedJob = {
  id: string;
  title: string;
  company: string;
  companyDomain: string | null;
  logo: string | null;
  location: string;
  workMode: "Remote" | "Hybrid" | "On-site";
  salary: string | null;
  tags: string[];
  jobTypes: string[];
  url: string;
  postedAt: string;
  description: string;
  source: "RemoteOK" | "Himalayas" | "Arbeitnow";
};

export type JobSearchResult = {
  jobs: UnifiedJob[];
  failedSources: string[];
};

const TIMEOUT_MS = 9000;

async function getJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "ResumeAI/1.0 (job aggregator)" },
    });
    if (!res.ok) throw new Error(`${url} responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function clean(html: string | undefined | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);
}

function domainFromUrl(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const generic = ["remoteok.com", "himalayas.app", "arbeitnow.com", "boards.greenhouse.io", "jobs.lever.co"];
    return generic.includes(host) ? null : host;
  } catch {
    return null;
  }
}

function workMode(location: string, remote: boolean): UnifiedJob["workMode"] {
  const l = location.toLowerCase();
  if (remote || l.includes("remote") || l.includes("anywhere")) return "Remote";
  if (l.includes("hybrid")) return "Hybrid";
  return "On-site";
}

async function fromRemoteOK(): Promise<UnifiedJob[]> {
  const data = (await getJson("https://remoteok.com/api")) as Array<Record<string, unknown>>;
  return data
    .filter((item) => typeof item["position"] === "string")
    .map((item) => {
      const url = String(item["url"] ?? "");
      const salaryMin = Number(item["salary_min"] ?? 0);
      const salaryMax = Number(item["salary_max"] ?? 0);
      return {
        id: `remoteok-${String(item["id"] ?? item["slug"] ?? url)}`,
        title: String(item["position"]),
        company: String(item["company"] ?? "Unknown"),
        companyDomain: domainFromUrl(String(item["apply_url"] ?? "")),
        logo: (item["company_logo"] as string) || null,
        location: String(item["location"] || "Remote"),
        workMode: "Remote" as const,
        salary:
          salaryMin && salaryMax
            ? `$${Math.round(salaryMin / 1000)}k – $${Math.round(salaryMax / 1000)}k`
            : null,
        tags: Array.isArray(item["tags"]) ? (item["tags"] as string[]).slice(0, 8) : [],
        jobTypes: ["Full-time"],
        url,
        postedAt: String(item["date"] ?? new Date().toISOString()),
        description: clean(String(item["description"] ?? "")),
        source: "RemoteOK" as const,
      };
    });
}

async function fromHimalayas(limit: number): Promise<UnifiedJob[]> {
  const data = (await getJson(`https://himalayas.app/jobs/api?limit=${limit}`)) as {
    jobs?: Array<Record<string, unknown>>;
  };
  return (data.jobs ?? []).map((item) => {
    const url = String(item["applicationLink"] ?? item["guid"] ?? "");
    const min = Number(item["minSalary"] ?? 0);
    const max = Number(item["maxSalary"] ?? 0);
    const restrictions = Array.isArray(item["locationRestrictions"])
      ? (item["locationRestrictions"] as string[]).join(", ")
      : "Remote";
    const pub = item["pubDate"];
    return {
      id: `himalayas-${String(item["guid"] ?? url)}`,
      title: String(item["title"] ?? "Role"),
      company: String(item["companyName"] ?? "Unknown"),
      companyDomain: domainFromUrl(String(item["companyWebsite"] ?? url)),
      logo: (item["companyLogo"] as string) || null,
      location: restrictions || "Remote",
      workMode: "Remote" as const,
      salary: min && max ? `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k` : null,
      tags: Array.isArray(item["categories"]) ? (item["categories"] as string[]).slice(0, 8) : [],
      jobTypes: [String(item["employmentType"] ?? "Full-time")],
      url,
      postedAt:
        typeof pub === "number"
          ? new Date(pub * 1000).toISOString()
          : String(pub ?? new Date().toISOString()),
      description: clean(String(item["description"] ?? item["excerpt"] ?? "")),
      source: "Himalayas" as const,
    };
  });
}

async function fromArbeitnow(): Promise<UnifiedJob[]> {
  const data = (await getJson("https://arbeitnow.com/api/job-board-api")) as {
    data?: Array<Record<string, unknown>>;
  };
  return (data.data ?? []).map((item) => {
    const location = String(item["location"] ?? "");
    const remote = Boolean(item["remote"]);
    const created = Number(item["created_at"] ?? 0);
    return {
      id: `arbeitnow-${String(item["slug"] ?? item["url"])}`,
      title: String(item["title"] ?? "Role"),
      company: String(item["company_name"] ?? "Unknown"),
      companyDomain: null,
      logo: null,
      location: location || (remote ? "Remote" : "Europe"),
      workMode: workMode(location, remote),
      salary: null,
      tags: Array.isArray(item["tags"]) ? (item["tags"] as string[]).slice(0, 8) : [],
      jobTypes: Array.isArray(item["job_types"])
        ? (item["job_types"] as string[]).map((t) => t.replace(/_/g, "-"))
        : ["Full-time"],
      url: String(item["url"] ?? ""),
      postedAt: created ? new Date(created * 1000).toISOString() : new Date().toISOString(),
      description: clean(String(item["description"] ?? "")),
      source: "Arbeitnow" as const,
    };
  });
}

export const searchJobs = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        query: z.string().optional().default(""),
        skills: z.array(z.string()).optional().default([]),
        limit: z.number().min(1).max(100).optional().default(60),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }): Promise<JobSearchResult> => {
    const settled = await Promise.allSettled([fromRemoteOK(), fromHimalayas(30), fromArbeitnow()]);
    const names = ["RemoteOK", "Himalayas", "Arbeitnow"];
    const failedSources: string[] = [];
    let jobs: UnifiedJob[] = [];

    settled.forEach((result, index) => {
      if (result.status === "fulfilled") jobs = jobs.concat(result.value);
      else failedSources.push(names[index]!);
    });

    // Deduplicate by URL (fall back to id).
    const seen = new Set<string>();
    jobs = jobs.filter((job) => {
      const key = job.url || job.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const query = data.query.trim().toLowerCase();
    const skills = data.skills.map((s) => s.toLowerCase());
    const relevance = (job: UnifiedJob) => {
      const haystack = `${job.title} ${job.tags.join(" ")} ${job.description}`.toLowerCase();
      let score = 0;
      if (query && haystack.includes(query)) score += 3;
      if (query && query.split(/\s+/).some((w) => w.length > 3 && haystack.includes(w))) score += 1;
      score += skills.filter((s) => haystack.includes(s)).length;
      return score;
    };

    jobs.sort((a, b) => {
      const diff = relevance(b) - relevance(a);
      if (diff !== 0) return diff;
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    return { jobs: jobs.slice(0, data.limit), failedSources };
  });
