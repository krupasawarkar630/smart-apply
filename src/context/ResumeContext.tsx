import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";

export type ExperienceEntry = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type EducationEntry = {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
};

export type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

export type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  portfolio: string;
  location: string;
  jobTitle: string;
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  skills: string[];
};

export type AtsIssue = {
  type: "critical" | "warning" | "suggestion";
  message: string;
  section: string;
};

export type AtsResult = {
  overall_score: number;
  keyword_score: number;
  formatting_score: number;
  readability_score: number;
  section_score: number;
  issues: AtsIssue[];
  missing_keywords: string[];
  strengths: string[];
  improvements: string[];
};

export type SavedJob = {
  id: string;
  title: string;
  company: string;
  url: string;
  location: string;
  source: string;
};

export type ResumeMeta = { name: string; date: string; score: number | null };

export type TemplateId = "classic" | "modern" | "compact";

export type ResumeState = {
  resume: ResumeData;
  rawText: string;
  fileName: string | null;
  ats: AtsResult | null;
  savedJobs: SavedJob[];
  template: TemplateId;
  history: ResumeMeta[];
};

export const emptyResume: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  linkedin: "",
  portfolio: "",
  location: "",
  jobTitle: "",
  summary: "",
  experience: [],
  education: [],
  certifications: [],
  skills: [],
};

const initialState: ResumeState = {
  resume: emptyResume,
  rawText: "",
  fileName: null,
  ats: null,
  savedJobs: [],
  template: "modern",
  history: [],
};

export type ResumeAction =
  | { type: "SET_RESUME"; payload: Partial<ResumeData> }
  | { type: "SET_RAW_TEXT"; payload: { text: string; fileName: string } }
  | { type: "SET_ATS"; payload: AtsResult }
  | { type: "TOGGLE_SAVED_JOB"; payload: SavedJob }
  | { type: "SET_TEMPLATE"; payload: TemplateId }
  | { type: "ADD_HISTORY"; payload: ResumeMeta }
  | { type: "HYDRATE"; payload: ResumeState }
  | { type: "RESET" };

function reducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case "SET_RESUME":
      return { ...state, resume: { ...state.resume, ...action.payload } };
    case "SET_RAW_TEXT":
      return { ...state, rawText: action.payload.text, fileName: action.payload.fileName };
    case "SET_ATS":
      return { ...state, ats: action.payload };
    case "TOGGLE_SAVED_JOB": {
      const exists = state.savedJobs.some((j) => j.id === action.payload.id);
      return {
        ...state,
        savedJobs: exists
          ? state.savedJobs.filter((j) => j.id !== action.payload.id)
          : [action.payload, ...state.savedJobs],
      };
    }
    case "SET_TEMPLATE":
      return { ...state, template: action.payload };
    case "ADD_HISTORY":
      return { ...state, history: [action.payload, ...state.history].slice(0, 8) };
    case "HYDRATE":
      return action.payload;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const STORAGE_KEY = "resumeai-state-v1";

const ResumeContext = createContext<{
  state: ResumeState;
  dispatch: Dispatch<ResumeAction>;
} | null>(null);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) dispatch({ type: "HYDRATE", payload: { ...initialState, ...JSON.parse(stored) } });
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error("useResume must be used inside ResumeProvider");
  return ctx;
}
