import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";

type RemoteFile = { name: string; url: string };



export type CandidateResult = {
  name: string;
  score: number;
  scoreColor: string;
  strengths?: string[];
  weaknesses?: string[];
};

type JobResult = {
  id: number;
  title: string;
};

export type AnalysisResult = {
  job: JobResult;
  candidates: CandidateResult[];
  createdAt: string;
  updatedAt?: string | null;
  analyzedAt: string;
};

export type AnalysisHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  jdFileName?: string;
  resumesCount: number;
  results?: AnalysisResult;
};

type View = "setup" | "results";

type State = {
  jobTitle: string;
  jdFile: File | null;
  resumes: File[];
  view: View;
  history: AnalysisHistoryItem[];
  results: AnalysisResult | null;   
  selectedId: string | null;
  jdRemote: RemoteFile | null;
  resumesRemote: RemoteFile[];
};

type Action =
  | { type: "SET_TITLE"; payload: string }
  | { type: "SET_JD"; payload: File | null }
  | { type: "ADD_RESUMES"; payload: File[] }
  | { type: "REMOVE_RESUME_AT"; payload: number }
  | { type: "RESET_FILES" }
  | { type: "SET_VIEW"; payload: View }
  | { type: "PUSH_HISTORY"; payload: AnalysisHistoryItem }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_RESULTS"; payload: AnalysisResult }
  | { type: "SET_HISTORY"; payload: AnalysisHistoryItem[] }
  | { type: "NEW_ANALYSIS" }
  | { type: "SELECT_ANALYSIS"; payload: string }
  | { type: "SET_SELECTED"; payload: string | null }
  | { type: "SET_JD_REMOTE"; payload: RemoteFile | null }
  | { type: "SET_RESUMES_REMOTE"; payload: RemoteFile[] }
  | { type: "RESET_ALL" };

const STORAGE_KEY = "noosaAnalyzer.v1";

const baseState: State = {
  jobTitle: "",
  jdFile: null,
  resumes: [],
  view: "setup",
  history: [],
  results: null,
  selectedId: null,
  jdRemote: null,
  resumesRemote: [],

};

function initFromStorage(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return baseState;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      ...baseState,
      ...parsed,
      jdFile: null,
      resumes: [],
      results: null,
    };
  } catch {
    return baseState;
  }
}


function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TITLE":
      return { ...state, jobTitle: action.payload };
    case "SET_JD":
      return { ...state, jdFile: action.payload };
    case "ADD_RESUMES":
      return { ...state, resumes: [...state.resumes, ...action.payload] };
    case "REMOVE_RESUME_AT":
      return { ...state, resumes: state.resumes.filter((_, i) => i !== action.payload) };
    case "RESET_FILES":
      return { ...state, jdFile: null, resumes: [] };
    case "SET_VIEW":
      return { ...state, view: action.payload };
    case "PUSH_HISTORY":
      return { ...state, history: [action.payload, ...state.history] };
    case "CLEAR_HISTORY":
      return { ...state, history: [] };
    case "SET_RESULTS":
      return { ...state, results: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_JD_REMOTE":
      return { ...state, jdRemote: action.payload, jdFile: null };
    case "SET_RESUMES_REMOTE":
      return { ...state, resumesRemote: action.payload };
    case "NEW_ANALYSIS":
      return {
        ...state,
        jobTitle: "",
        jdFile: null,
        resumes: [],
        jdRemote: null,
        resumesRemote: [],
        results: null,
        selectedId: null,
        view: "setup",
      };
    case "SELECT_ANALYSIS":
      const selected = state.history.find(h => h.id === action.payload);
      return selected
        ? { ...state, results: selected.results ?? null, view: "results" }
        : state;
    case "SET_SELECTED":
      return { ...state, selectedId: action.payload };
    case "RESET_ALL":
      return {
        ...state,
        jobTitle: "",
        jdFile: null,
        resumes: [],
        jdRemote: null,
        resumesRemote: [],
        results: null,
        selectedId: null,
        view: "setup",
      };
    default:
      return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export function AnalyzerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initFromStorage);

  // persist only serializable bits
  const persistable = useMemo(
    () => ({ history: state.history }),
    [state.history]
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  }, [persistable]);

  useEffect(() => {
    dispatch({ type: "RESET_ALL" });   // 👈 clears current analysis but keeps history
  }, []);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useAnalyzer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAnalyzer must be used within <AnalyzerProvider>");
  return ctx;
}
