import { useEffect, useState } from "react";
import { useAnalyzer } from "../context/AnalyzerContext";
import logo from "../assets/NoosaLabs.png";


export default function Sidebar() {
  const { state, dispatch } = useAnalyzer();
  const [loadingId, setLoadingId] = useState<string | null>(null);


  // 🔹 Fetch existing analyses from backend when sidebar loads
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/analyses");
        if (!res.ok) throw new Error("Failed to fetch analyses");
        const data = await res.json();

        const mapped = data.map((a: any) => ({
          id: String(a.id),
          title: a.job?.title || "Untitled",
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          resumesCount: a.candidate_analyses_count || 0,
        }));

        dispatch({ type: "SET_HISTORY", payload: mapped });
      } catch (err) {
        console.error("Error fetching analyses:", err);
      }
    };

    fetchAnalyses();
  }, [dispatch]);

  const loadAnalysis = async (id: string) => {
    setLoadingId(id);
    try {
      // 1. Check if we already cached this analysis in history
      const cached = state.history.find(h => h.id === id && h.results);
      if (cached) {
        console.log("Loaded from cache:", cached);
        dispatch({ type: "SET_SELECTED", payload: id });
        dispatch({ type: "SET_RESULTS", payload: cached.results! });
        dispatch({ type: "SET_VIEW", payload: "results" });
        return;
      }

      // 2. Otherwise, fetch from backend
      const res = await fetch(`http://localhost:8000/api/analyses/${id}`);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      const data = await res.json();

      dispatch({ type: "SET_SELECTED", payload: id });
      dispatch({ type: "RESET_FILES" });
      dispatch({ type: "SET_TITLE", payload: data.job.title });

      if (data.job.file_url) {
        const name = (data.job.pdf_path?.split("/")?.pop()) || "job_description.pdf";
        dispatch({ type: "SET_JD_REMOTE", payload: { name, url: data.job.file_url } });
      }

      if (Array.isArray(data.job.candidates)) {
        const rem = data.job.candidates
          .filter((c: any) => c.file_url)
          .map((c: any) => ({
            name: (c.pdf_path?.split("/")?.pop()) || `${c.name || "resume"}.pdf`,
            url: c.file_url,
          }));
        dispatch({ type: "SET_RESUMES_REMOTE", payload: rem });
      }

      if (Array.isArray(data.candidate_analyses)) {
        const normalized = data.candidate_analyses.map((ca: any) => ({
          name: ca.candidate?.name ?? `Candidate #${ca.candidate_id}`,
          score: ca.final_score,
          scoreColor: ca.score_color,
          strengths: ca.strengths ? JSON.parse(ca.strengths) : [],
          weaknesses: ca.weaknesses ? JSON.parse(ca.weaknesses) : [],
        }));

        const result = {
          job: data.job,
          candidates: normalized,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          analyzedAt: data.updated_at ?? data.created_at,
        };

        // 3. Save results in state
        dispatch({ type: "SET_RESULTS", payload: result });
        dispatch({ type: "SET_VIEW", payload: "results" });

        // 4. Update history so next time it's cached
        const updatedHistory = state.history.map(h =>
          h.id === id ? { ...h, results: result } : h
        );
        dispatch({ type: "SET_HISTORY", payload: updatedHistory });
      }
    } catch (err) {
      console.error(err);
    }
    finally {
      setLoadingId(null); // stop loading
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const res = await fetch(`http://localhost:8000/api/analyses/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) throw new Error("Failed to delete analysis");

      // Remove from state.history
      const updated = state.history.filter((h) => h.id !== id);
      dispatch({ type: "SET_HISTORY", payload: updated });

      // If the deleted one was selected, reset selection
      if (String(state.selectedId) === String(id)) {
        dispatch({ type: "SET_SELECTED", payload: null });
        dispatch({ type: "SET_VIEW", payload: "setup" });
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
      alert("Failed to delete analysis.");
    }
  };




  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col bg-gradient-to-b from-slate-900 to-indigo-900 text-white p-4 border-r border-white/10">

      {/* Logo + Title */}
      <div className="mb-6 flex items-center gap-3">
        <img
          src={logo}
          alt="Noosa Labs Logo"
          className="w-10 h-10 object-contain"
        />
        <div>
          <div className="text-xl font-bold tracking-wide">Noosa Analyzer</div>
          <div className="text-xs text-white/60">Candidate ↔ JD Fit</div>
        </div>
      </div>

      {/* 🔹 Create new job analysis */}
      <button
        onClick={() => dispatch({ type: "NEW_ANALYSIS" })}
        className="w-full mb-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-sm font-semibold transition"
      >
        ＋ New Job Analysis
      </button>

      <div className="text-xs uppercase tracking-wide text-white/50 mb-2">
        Analysis History
      </div>

      <div className="flex-1 overflow-y-auto sidebar-scroll">
        <ul>
          {state.history.length === 0 && (
            <li className="text-white/50 text-sm">No analyses yet.</li>
          )}
          {state.history.map((h) => (
            <li
              key={h.id}
              className={`group relative py-2 px-3 border-b border-white/10 cursor-pointer transition-colors 
      ${String(state.selectedId) === String(h.id)
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-white/10"}`}
            >
              <div
                className="flex justify-between items-center"
                onClick={() => loadAnalysis(h.id)}
              >
                <span className="font-medium truncate">{h.title}
                  {loadingId === h.id && (
                    <svg
                      className="ml-2 w-4 h-4 animate-spin text-white/70 inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                </span>
                <span className="text-xs text-white/60">
                  {h.resumesCount} candidate(s).
                </span>
              </div>

              {/* ❌ Delete button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteAnalysis(h.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 
     opacity-0 group-hover:opacity-100 transition
     text-red-500 hover:text-red-700 
     text-lg font-bold"
                title="Delete analysis"
              >
                ✕
              </button>

            </li>
          ))}

        </ul>
      </div>


      {/* tiny easter egg slot */}
      <div className="mt-4 text-[10px] text-white/40 select-none">
        ✨ Powered by Noosa Labs
      </div>
    </aside>
  );
}
