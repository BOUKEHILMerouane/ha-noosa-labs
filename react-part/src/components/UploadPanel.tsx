import { useState } from "react";
import { useAnalyzer } from "../context/AnalyzerContext";
import UploadSingleFile from "./UploadSingleFile";
import UploadMultipleFiles from "./UploadMultipleFiles";
import AnalyzeButton from "./AnalyzeButton";
import Lottie from "lottie-react";
import meditatingKoala from "../assets/MeditatingKoala.json";
import type { AnalysisHistoryItem } from "../context/AnalyzerContext";

export default function UploadPanel() {
  const { state, dispatch } = useAnalyzer();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      if (!state.jobTitle) {
        alert("Please provide a job title.");
        setIsAnalyzing(false);
        return;
      }

      // ✅ Validation
      if (!state.selectedId) {
        if (!state.jdFile || state.resumes.length === 0) {
          alert("Please provide job title, JD file, and at least one candidate resume.");
          setIsAnalyzing(false);
          return;
        }
      } else {
        if (!state.jdFile && !state.jdRemote) {
          alert("Please provide a JD file (local or from history).");
          setIsAnalyzing(false);
          return;
        }
        if (state.resumes.length === 0 && state.resumesRemote.length === 0) {
          alert("Please provide at least one candidate resume (local or from history).");
          setIsAnalyzing(false);
          return;
        }
      }

      const formData = new FormData();
      formData.append("title", state.jobTitle);
      if (state.jdFile) formData.append("jd", state.jdFile);
      if (state.resumes.length > 0) {
        state.resumes.forEach((file) => formData.append("candidates[]", file));
      }

      let url = "http://localhost:8000/api/analyses";
      let method: "POST" | "PUT" = "POST";
      if (state.selectedId) {
        url = `http://localhost:8000/api/analyses/${state.selectedId}`;
        formData.append("_method", "PUT");
      }

      const response = await fetch(url, {
        method,
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to analyze candidates");

      const data = await response.json();

      if (Array.isArray(data.candidates)) {
        const normalized = data.candidates.map((ca: any) => ({
          name: ca.name,
          score: ca.final_score,
          scoreColor: ca.score_color,
          strengths: ca.strengths,
          weaknesses: ca.weaknesses,
        }));

        dispatch({
          type: "SET_RESULTS",
          payload: {
            job: data.job,
            candidates: normalized,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            analyzedAt: new Date().toISOString(),
          },
        });
      }

      dispatch({ type: "SET_VIEW", payload: "results" });

      // 🔄 Refresh history
      const historyRes = await fetch("http://localhost:8000/api/analyses");
      if (historyRes.ok) {
        const list = await historyRes.json();
        const mapped = list.map((a: any) => ({
          id: a.id,
          title: a.job?.title || "Untitled",
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          resumesCount: a.candidate_analyses_count || 0,
        }));

        mapped.sort((a: AnalysisHistoryItem, b: AnalysisHistoryItem) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        dispatch({ type: "SET_HISTORY", payload: mapped });
        dispatch({ type: "SET_SELECTED", payload: String(data.job.id) });
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative space-y-6 max-w-2xl">
      {/* 🔄 Overlay while analyzing */}
      {isAnalyzing && (
        <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10 rounded-lg">
          <Lottie
            animationData={meditatingKoala}
            loop
            autoplay
            className="w-20 h-20 mb-2"
          />
          <span className="text-indigo-600 font-semibold">
            Analyzing resumes…
          </span>
        </div>
      )}

      {/* Job Title */}
      <div>
        <label className="block text-sm font-semibold text-indigo-600 mb-1">
          Role / Position
        </label>
        <input
          type="text"
          value={state.jobTitle}
          onChange={(e) =>
            dispatch({ type: "SET_TITLE", payload: e.target.value })
          }
          placeholder="e.g., Software Engineer"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none 
               text-slate-800 font-medium text-base tracking-wide placeholder-slate-400"
          disabled={isAnalyzing}
        />
        <p className="text-xs text-slate-400 mt-1">
          Specify the position you're evaluating candidates for.
        </p>
      </div>



      {/* Job Description Upload */}
      <UploadSingleFile />

      {/* Resumes Upload */}
      <UploadMultipleFiles />

      {/* Analyze Button */}
      <div className="flex justify-center mt-6">
        <AnalyzeButton
          onClick={handleAnalyze}
          isLoading={isAnalyzing}
          disabled={isAnalyzing}
        />
      </div>
    </div>
  );
}
