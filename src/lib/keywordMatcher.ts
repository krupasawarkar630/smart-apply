const STOP_WORDS = new Set(
  `a an and the or but for with without to from in on at by of as is are was were be been being this that these those you your our their we they it its i me my will can may should would could have has had do does did not no than then so such more most other into over under about after before during
  experience work working years year company team teams role roles job jobs project projects using use used strong ability responsible responsibilities including etc via per new`
    .split(/\s+/)
    .filter(Boolean),
);

const KNOWN_SKILLS = [
  "react","react native","next.js","vue","angular","svelte","javascript","typescript","node.js","express","nestjs",
  "python","django","flask","fastapi","java","spring","kotlin","swift","go","golang","rust","php","laravel","ruby","rails",
  "c++","c#",".net","sql","postgresql","mysql","mongodb","redis","graphql","rest api","docker","kubernetes","terraform",
  "aws","gcp","azure","ci/cd","jenkins","github actions","git","linux","tailwind","css","html","sass","figma","ui/ux",
  "pandas","numpy","pytorch","tensorflow","machine learning","deep learning","nlp","data analysis","power bi","tableau",
  "excel","jira","agile","scrum","product management","seo","marketing","salesforce","testing","jest","cypress","playwright",
  "microservices","system design","html5","webpack","vite","supabase","firebase","stripe","kafka","rabbitmq","spark","airflow",
];

const TITLE_PATTERNS = [
  "software engineer","frontend developer","front end developer","backend developer","back end developer",
  "full stack developer","fullstack developer","full-stack engineer","web developer","mobile developer",
  "data scientist","data analyst","data engineer","machine learning engineer","ai engineer","devops engineer",
  "site reliability engineer","cloud engineer","qa engineer","product manager","project manager","ui/ux designer",
  "product designer","graphic designer","business analyst","marketing manager","digital marketer","sales manager",
  "hr manager","accountant","financial analyst","teacher","content writer","react developer","python developer",
  "java developer","node developer","android developer","ios developer","intern",
];

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/** Detects skills present in free-form resume text, ordered by frequency. */
export function extractSkills(text: string, limit = 12): string[] {
  const lower = ` ${text.toLowerCase()} `;
  const found = KNOWN_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()));
  const scored = found.map((skill) => ({
    skill,
    count: lower.split(skill.toLowerCase()).length - 1,
  }));
  scored.sort((a, b) => b.count - a.count || a.skill.length - b.skill.length);
  return scored.slice(0, limit).map((s) => titleCaseSkill(s.skill));
}

function titleCaseSkill(skill: string) {
  const overrides: Record<string, string> = {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "node.js": "Node.js",
    "next.js": "Next.js",
    "react": "React",
    "aws": "AWS",
    "gcp": "GCP",
    "sql": "SQL",
    "nlp": "NLP",
    "ui/ux": "UI/UX",
    "ci/cd": "CI/CD",
    "html": "HTML",
    "css": "CSS",
    "rest api": "REST API",
    "graphql": "GraphQL",
  };
  return overrides[skill] ?? skill.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Best-effort job title detection from resume text. */
export function detectJobTitle(text: string, fallback = "Software Engineer"): string {
  const lower = text.toLowerCase();
  let best: { title: string; index: number } | null = null;
  for (const title of TITLE_PATTERNS) {
    const index = lower.indexOf(title);
    if (index !== -1 && (best === null || index < best.index)) best = { title, index };
  }
  if (!best) return fallback;
  return best.title.replace(/\b[a-z]/g, (c) => c.toUpperCase());
}

/** Simple keyword-overlap ATS match score between resume text and a job description. */
export function atsMatchScore(resumeText: string, jobText: string): number {
  if (!resumeText.trim() || !jobText.trim()) return 0;
  const resumeSet = new Set(tokenize(resumeText));
  const jobWords = Array.from(new Set(tokenize(jobText)));
  if (jobWords.length === 0) return 0;
  const overlap = jobWords.filter((w) => resumeSet.has(w)).length;
  return Math.min(99, Math.round((overlap / jobWords.length) * 100));
}

export function matchingSkills(skills: string[], tags: string[]): string[] {
  const normalized = tags.map((t) => t.toLowerCase());
  return skills.filter((skill) =>
    normalized.some((tag) => tag.includes(skill.toLowerCase()) || skill.toLowerCase().includes(tag)),
  );
}

export function relativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "recently";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}
