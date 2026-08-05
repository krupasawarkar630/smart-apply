# Smart Apply

### Job Search Page (`/jobs`)

IMPORTANT: Do NOT use any paid API keys or services for job search.
Use only free, open, no-auth-required methods:

**Data Sources (no API key required):**

1. **LinkedIn Jobs RSS / Public Search URL:**
   - Construct LinkedIn job search URLs dynamically:
     `https://www.linkedin.com/jobs/search?keywords={jobTitle}&location={location}&f_TPR=r86400`
   - Open results in a new tab via "Search on LinkedIn" button
   - Embed LinkedIn job search as an iframe (with fallback if blocked)

2. **Indeed Public Search (no key):**
   - Construct search URL: `https://www.indeed.com/jobs?q={jobTitle}&l={location}`
   - Open as external tab with pre-filled query from resume

3. **RemoteOK API (completely free, no auth):**
   - Endpoint: `https://remoteok.com/api` — returns JSON array of remote jobs
   - Filter by tags that match resume skills
   - Display job cards: position, company, location, salary, tags, apply URL

4. **Himalayas API (free, no key needed):**
   - Endpoint: `https://himalayas.app/jobs/api` — free remote job listings
   - Query params: `?skills=react,python&limit=20`

5. **Arbeitnow API (free, no key):**
   - Endpoint: `https://arbeitnow.com/api/job-board-api` — European + remote jobs
   - Filter by tags matching resume skills

6. **GitHub Jobs (via awesome-github-jobs scrape or public JSON):**
   - Fallback static curated list of job boards with direct links

**Implementation:**

- On page load, extract top 5 skills + job title from the resume stored in context
- Fetch simultaneously from RemoteOK, Himalayas, and Arbeitnow using Promise.allSettled()
- Merge, deduplicate, and sort results by date posted
- Each job card shows:
  - Company name + logo (use favicon fallback: `https://logo.clearbit.com/{companydomain}`)
  - Job title, location (Remote/Hybrid/On-site), salary if available
  - Skill match badges (highlight skills from resume that appear in job tags)
  - "ATS Match %" — simple keyword overlap score between resume text and job description
  - "Apply Now" button (opens original job URL)
  - "View on LinkedIn" button (constructs LinkedIn search for that company + role)
  - "Save Job" bookmark button (saved to React Context)

- Search bar at top: pre-filled with detected job title from resume
- Filter panel: Remote Only toggle, Full-time/Part-time, Location text input, Skills filter chips
- Tabs: "All Jobs" | "Remote" | "Saved Jobs"
- If all APIs fail or return empty: show a fallback panel with direct search buttons:
  - "Search LinkedIn Jobs →" 
  - "Search Indeed →"
  - "Search Wellfound (AngelList) →"
  - "Search We Work Remotely →"
  Each button opens the site pre-filled with the resume's detected job title + skills

**CORS Handling:**
- RemoteOK, Himalayas, Arbeitnow all support CORS headers for browser requests
- Use native fetch() with no-cors mode as fallback if needed
- Add error boundary per API source so one failure doesn't break the whole page

Also update the Tech Stack section — remove job API key reference:

- **Job Search:** RemoteOK API + Himalayas API + Arbeitnow API (all free, no auth required)
- Remove: VITE_JOB_API_KEY environment variable entirely

And update the Environment Variables section to:

## 🔒 Environment Variables

- `VITE_ANTHROPIC_API_KEY` — for Claude AI (ATS analysis + resume optimization only)
- No other API keys required anywhere in the application

This approach gives you real live job data from three free APIs (RemoteOK, Himalayas, Arbeitnow) that require zero authentication, plus graceful fallback buttons for LinkedIn and Indeed using pre-constructed search URLs built from the user's resume data. No keys, no rate limit headaches, no billing.

give me complete prompt for lovaable

Here's the complete, final prompt to paste directly into Lovable:

You are a senior full-stack developer with 20+ years of experience. Build a complete, production-ready AI Resume Builder web application using React.js. The app must be minimalistic, professional, and polished — no clutter, no unnecessary animations, clean whitespace-driven UI.

---

## 🎨 Design System

**Color Palette:**
- Background: #F9FAFB (off-white)
- Surface/Cards: #FFFFFF
- Primary Accent: #1A1A2E (deep navy)
- Secondary Accent: #4F46E5 (indigo-600)
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444
- Text Primary: #111827
- Text Secondary: #6B7280
- Border: #E5E7EB

**Typography:**
- Display/Headings: Inter (700, 600)
- Body: Inter (400, 500)
- Mono/Labels: JetBrains Mono (for ATS scores and metrics only)

**Design Rules:**
- Border radius: 8px on cards, 6px on buttons
- Subtle box-shadows only (no dramatic drop shadows)
- Consistent 16px / 24px / 32px spacing grid
- No gradients except one subtle one on the hero CTA button
- All icons: Lucide React
- All UI components: shadcn/ui

---

## 📁 App Pages & Structure

### 1. Landing Page (`/`)
- Sticky navbar: Logo ("ResumeAI") on the left, nav links (How it Works, Features, Pricing) in the center, "Get Started" CTA button on the right
- Hero section:
  - Bold headline: "Build a Resume That Actually Gets You Hired"
  - Subtext: "AI-powered ATS analysis, resume optimization, and real job matching — all in one place."
  - Two CTA buttons: "Upload My Resume" (primary) and "Build from Scratch" (secondary outline)
- How It Works section: 3-step horizontal layout
  - Step 1: Upload Resume
  - Step 2: AI Analyzes & Optimizes
  - Step 3: Download + Apply to Jobs
- Features section: 4 feature cards in a 2x2 grid
  - ATS Score Checker
  - AI Resume Rewriter
  - Smart Job Matching
  - One-Click PDF Download
- Minimal footer: copyright, links (Privacy, Terms, Contact)

---

### 2. Dashboard (`/dashboard`)
- Left sidebar (collapsible on mobile) with navigation links:
  - Dashboard
  - My Resumes
  - ATS Checker
  - Job Search
  - Settings
- Main content area:
  - Welcome banner: "Welcome back! Ready to land your next role?"
  - 3 quick action cards: "Upload Resume", "Check ATS Score", "Find Jobs"
  - Recent resumes list (name, date, ATS score badge)
  - Tips section: 3 ATS tips shown as dismissible cards

---

### 3. ATS Checker Page (`/ats-checker`)

**Upload Section:**
- Large drag-and-drop file upload zone
- Accepts: PDF and DOCX only
- Shows file name and size after selection
- Upload states: idle → uploading → parsing → analyzing → results
- Progress bar during analysis
- Error state: inline message for wrong file type

**Results Section (shown after analysis):**
- Large circular ATS Score Gauge (0–100)
  - Red for scores below 50
  - Yellow for scores 50–75
  - Green for scores above 75
  - Animate from 0 to final score over 1.5 seconds on load
- Score Breakdown panel with 4 individual scores shown as progress bars:
  - Keyword Match Score
  - Formatting Score
  - Readability Score
  - Section Completeness Score
- Issues List:
  - Each issue shown as a labeled badge: Critical (red), Warning (yellow), Suggestion (blue)
  - Each issue has a short title and a one-line description
- Strengths List: green checkmark items showing what the resume does well
- Missing Keywords: chip/tag display of keywords Claude detected are missing
- Two action buttons:
  - "Optimize My Resume" (navigates to `/optimize`)
  - "Download Report" (downloads a simple PDF summary)

**AI Analysis via Claude API:**
Send extracted resume text to Claude with this exact system prompt:

You are an expert ATS (Applicant Tracking System) analyst. Analyze the following resume text and return ONLY a valid JSON object with no explanation, no markdown, no backticks. The JSON must follow this exact structure:
{
"overall_score": number between 0 and 100,
"keyword_score": number between 0 and 100,
"formatting_score": number between 0 and 100,
"readability_score": number between 0 and 100,
"section_score": number between 0 and 100,
"issues": [
{ "type": "critical|warning|suggestion", "message": "string", "section": "string" }
],
"missing_keywords": ["string"],
"strengths": ["string"],
"improvements": ["string"]
}


Parse the JSON response safely inside a try/catch block. Show a friendly error toast if parsing fails.

---

### 4. AI Resume Optimizer Page (`/optimize`)

**Layout:** Split-panel view (50/50 on desktop, stacked on mobile)

**Left Panel — Resume Editor:**
- Editable sections:
  - Professional Summary (textarea)
  - Work Experience (multiple entries: job title, company, dates, bullet points)
  - Education (degree, institution, year)
  - Skills (tag input with add/remove)
  - Certifications (list)
- Each section has:
  - An "AI Improve" button that calls Claude API to rewrite that specific section
  - Loading spinner state while Claude is working
  - Brief green flash confirmation when text updates

**Right Panel — Live Preview:**
- Renders a clean, ATS-friendly resume preview
- Updates live as the user edits text on the left
- Template: single-column, clean serif headings, bullet points, no tables or columns

**Toolbar (above split panel):**
- "Rewrite Full Summary" button
- "Enhance All Bullet Points" button
- "Add Missing Keywords" button (uses missing_keywords from ATS analysis stored in context)
- "Fix All Formatting" button
- "Download PDF" button (uses jsPDF + html2canvas on the preview panel)

**Claude API calls for each action:**
- Rewrite Summary: prompt Claude to rewrite the summary with ATS keywords, active voice, under 5 sentences
- Enhance Bullet Points: prompt Claude to rewrite each bullet using the STAR format (Situation, Task, Action, Result) and strong action verbs
- Add Keywords: prompt Claude to naturally insert the missing keywords into the appropriate sections
- All Claude calls use model: `claude-sonnet-4-6`, max_tokens: 1000

---

### 5. Job Search Page (`/jobs`)

**IMPORTANT: Use zero paid APIs or API keys. Use only free, no-auth sources.**

**Data Sources:**

1. **RemoteOK API** (free, no auth, CORS-friendly)
   - Endpoint: `https://remoteok.com/api`
   - Returns JSON array of remote tech jobs
   - Filter by tags matching resume skills extracted from context

2. **Himalayas API** (free, no auth)
   - Endpoint: `https://himalayas.app/jobs/api?limit=20`
   - Filter by skills from resume

3. **Arbeitnow API** (free, no auth)
   - Endpoint: `https://arbeitnow.com/api/job-board-api`
   - Returns remote-friendly jobs globally

**On Page Load:**
- Extract top 5 skills and job title from resume stored in React Context
- Fetch all 3 APIs simultaneously using Promise.allSettled()
- Merge all results, deduplicate by job URL, sort by date posted (newest first)
- Pre-fill search bar with detected job title from resume

**Job Card Design:**
- Company logo: fetch from `https://logo.clearbit.com/{companydomain}` with fallback to initials avatar
- Job title (bold)
- Company name
- Location tag: Remote / Hybrid / On-site
- Salary (if available)
- Skill match chips: highlight skills from the resume that match job tags
- ATS Match %: calculate keyword overlap between resume text and job description text (simple word intersection ÷ total job keywords × 100)
- Posted date (relative: "2 days ago")
- "Apply Now" button → opens original job URL in new tab
- "View on LinkedIn" button → opens `https://www.linkedin.com/jobs/search?keywords={jobTitle}&f_C={company}` in new tab
- "Save Job" bookmark icon button → saves to Saved Jobs in React Context

**Search & Filters:**
- Search bar (pre-filled from resume, debounced 300ms)
- Filters panel:
  - Remote Only toggle
  - Job type: Full-time / Part-time / Contract (multi-select chips)
  - Location text input
  - Skills filter chips (auto-populated from resume, removable)
- Tabs: "All Jobs" | "Remote Only" | "Saved Jobs"

**Fallback Panel (shown if all 3 APIs return empty or fail):**
Display a clean card with the heading "Search Manually on Top Job Boards" and these buttons, each opening a pre-filled URL using the resume's detected job title:
- "Search LinkedIn Jobs →" → `https://www.linkedin.com/jobs/search?keywords={jobTitle}`
- "Search Indeed →" → `https://www.indeed.com/jobs?q={jobTitle}`
- "Search Wellfound →" → `https://wellfound.com/jobs?role={jobTitle}`
- "Search We Work Remotely →" → `https://weworkremotely.com/remote-jobs/search?term={jobTitle}`
- "Search Glassdoor →" → `https://www.glassdoor.com/Job/jobs.htm?sc.keyword={jobTitle}`

**CORS Error Handling:**
- Wrap each API fetch in its own try/catch
- One API failing must never break the others
- Show a subtle "Some sources unavailable" note if any single API fails
- Never show a full-page error for a partial failure

---

### 6. Resume Builder from Scratch (`/builder`)

**Step Wizard — 5 Steps with progress bar at top:**

Step 1 — Personal Info:
- Full Name, Email, Phone, LinkedIn URL, Portfolio/GitHub URL, Location (City, Country)

Step 2 — Professional Summary:
- Large textarea
- "AI Write My Summary" button → Claude generates a summary based on job title entered in Step 1

Step 3 — Work Experience:
- Add multiple entries
- Fields per entry: Job Title, Company, Start Date, End Date (or "Present" checkbox), Bullet Points (add/remove rows)
- "AI Improve Bullets" button per entry

Step 4 — Education & Certifications:
- Education: Degree, Institution, Year, GPA (optional)
- Certifications: Name, Issuer, Year (add multiple)

Step 5 — Skills:
- Tag input: type a skill and press Enter to add
- Auto-suggestions based on job title (hardcoded common skills per role)
- Remove tags with X button

**Right side (desktop): Live resume preview panel** — updates as the user types, using the selected template

**Template Selector (above the wizard):**
3 clean, ATS-friendly templates to choose from:
- Classic: Traditional single column, Times New Roman style headings
- Modern: Inter font, subtle left border accent, clean spacing
- Compact: Dense layout, good for experienced professionals

**Bottom navigation:**
- "Back" and "Next" buttons to move between steps
- Final step shows: "Check ATS Score" and "Download PDF" buttons

---

## 🧰 Full Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (dialogs, dropdowns, tooltips, progress, tabs, badges)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **State Management:** React Context + useReducer (no Redux, no Zustand)
- **PDF Generation:** jsPDF + html2canvas (applied to the live preview panel)
- **Resume Parsing:**
  - PDF: pdfjs-dist (extract raw text from uploaded PDF)
  - DOCX: mammoth.js (extract text from uploaded Word files)
- **File Upload:** react-dropzone
- **Charts/Gauges:** Recharts (circular progress for ATS score gauge)
- **Notifications:** sonner (toast notifications)
- **HTTP:** Native fetch() with async/await, Promise.allSettled() for parallel requests
- **Job Search:** RemoteOK API + Himalayas API + Arbeitnow API (all free, no auth)
- **AI:** Anthropic Claude API (claude-sonnet-4-6) for ATS analysis and resume optimization

---

## 📂 Project File Structure

src/
├── components/
│ ├── layout/
│ │ ├── Navbar.jsx
│ │ ├── Sidebar.jsx
│ │ └── Footer.jsx
│ ├── ats/
│ │ ├── FileUploader.jsx
│ │ ├── ScoreGauge.jsx
│ │ ├── ScoreBreakdown.jsx
│ │ ├── IssuesList.jsx
│ │ └── ResumePreview.jsx
│ ├── optimizer/
│ │ ├── ResumeEditor.jsx
│ │ ├── SectionEditor.jsx
│ │ └── LivePreview.jsx
│ ├── jobs/
│ │ ├── JobCard.jsx
│ │ ├── JobFilters.jsx
│ │ ├── JobSearch.jsx
│ │ └── FallbackJobLinks.jsx
│ ├── builder/
│ │ ├── StepWizard.jsx
│ │ ├── TemplateSelector.jsx
│ │ └── steps/
│ │ ├── PersonalInfo.jsx
│ │ ├── Summary.jsx
│ │ ├── Experience.jsx
│ │ ├── Education.jsx
│ │ └── Skills.jsx
│ └── ui/ ← shadcn/ui components
├── pages/
│ ├── Landing.jsx
│ ├── Dashboard.jsx
│ ├── ATSChecker.jsx
│ ├── Optimizer.jsx
│ ├── JobSearch.jsx
│ └── Builder.jsx
├── hooks/
│ ├── useResumeParser.js
│ ├── useATSAnalysis.js
│ ├── useJobSearch.js
│ └── useClaudeAI.js
├── services/
│ ├── claudeService.js
│ ├── jobSearchService.js
│ └── pdfService.js
├── context/
│ └── ResumeContext.jsx
└── utils/
├── resumeParser.js
├── keywordMatcher.js
└── scoreCalculator.js


---

## ⚙️ UX Behavior Requirements

**File Upload:**
- Drag-and-drop zone highlights with a dashed indigo border on hover
- Show file name, size, and a green checkmark after successful selection
- Show animated progress bar during text extraction and AI analysis
- Auto-scroll to results section once analysis is complete

**ATS Score Gauge:**
- Use Recharts RadialBarChart
- Animate from 0 to final score over 1.5 seconds with ease-out
- Color changes dynamically based on score range
- Display the numeric score in the center in JetBrains Mono font

**AI Button States (all AI-powered buttons must follow this pattern):**
- Default state: button with icon
- Loading state: spinner + "Analyzing..." or "Rewriting..." text
- Success state: brief green checkmark for 1 second
- Error state: red tint + "Try Again" text
- Never disable the entire page or form during an AI call — only the specific button

**Notifications (sonner toasts):**
- Success: green, bottom-right, auto-dismiss after 3 seconds
- Error: red, bottom-right, with "Retry" action button, stays until dismissed
- Info: neutral, for non-critical messages

**Responsive Breakpoints:**
- Mobile (< 640px): single column, bottom sheet for filters, hamburger menu
- Tablet (640–1024px): 2-column grid for cards
- Desktop (> 1024px): sidebar + main content, split panels

**Performance:**
- Lazy load all pages with React.lazy + Suspense
- Skeleton loaders (not spinners) for all job cards and resume sections while loading
- Debounce job search input at 300ms
- Memoize heavy components with React.memo

---

## 🔒 Environment Variables

Only one environment variable is needed:
- `VITE_ANTHROPIC_API_KEY` — used only for Claude API calls (ATS analysis + resume optimization)

No other API keys. No paid services. No backend required.

---

## ✅ Implementation Checklist (all must be implemented)

- [ ] Landing page fully designed and responsive
- [ ] File upload with PDF and DOCX parsing via pdfjs-dist and mammoth.js
- [ ] Claude API call for ATS analysis returning structured JSON
- [ ] ATS score gauge animated with Recharts
- [ ] Score breakdown with 4 individual progress bars
- [ ] Issues list with severity badges
- [ ] Split-panel resume optimizer with live preview
- [ ] AI rewrite buttons for each resume section
- [ ] PDF download via jsPDF + html2canvas
- [ ] Job search fetching from RemoteOK, Himalayas, and Arbeitnow simultaneously
- [ ] Job cards with skill match chips and ATS match percentage
- [ ] Fallback job board links if APIs fail
- [ ] Save job functionality via React Context
- [ ] 5-step resume builder wizard with live preview
- [ ] 3 resume template options
- [ ] Dashboard with sidebar navigation
- [ ] All loading states implemented as skeletons
- [ ] All error states handled with toasts
- [ ] Fully mobile responsive on all pages
- [ ] No console errors or warnings in production build

---

## 🔢 Build Order

Implement pages and features in this exact order:
1. Set up project structure, routing, context, and design system tokens
2. Landing Page
3. ATS Checker Page (upload + Claude analysis + score display)
4. Resume Optimizer Page (editor + live preview + AI buttons + PDF download)
5. Job Search Page (3 APIs + job cards + filters + fallback)
6. Resume Builder Page (wizard + templates)
7. Dashboard Page
8. Final pass: responsive fixes, loading states, error states, performance

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6caa2c8d-6a55-4c78-91f4-293b480c6261).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
