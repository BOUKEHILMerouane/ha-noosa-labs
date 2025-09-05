import { useAnalyzer } from "../context/AnalyzerContext";

export default function Tabs() {
  const { state, dispatch } = useAnalyzer();

  const tabClass = (
    isActive: boolean,
    side: "left" | "right",
    type: "setup" | "results"
  ) =>
    `relative flex-1 flex items-center justify-center gap-2 h-12 font-semibold transition-all duration-200 
     ${
       isActive
         ? type === "results"
           ? "bg-green-600 text-white"
           : "bg-indigo-600 text-white"
         : "bg-slate-200 text-slate-700 hover:bg-slate-300"
     }
     ${side === "left" ? "rounded-l-lg" : "rounded-r-lg"}
     overflow-hidden`;

  return (
    <div className="flex w-full h-12 mb-0">
      {/* Left tab */}
      <button
        className={tabClass(state.view === "setup", "left", "setup")}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "setup" })}
      >
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          1
        </span>
        Setup
        {/* Slanted divider on the right */}
        <div className="absolute right-0 top-0 h-full w-[2px] bg-white/40 transform skew-x-12"></div>
      </button>

      {/* Right tab */}
      <button
        className={tabClass(state.view === "results", "right", "results")}
        onClick={() => dispatch({ type: "SET_VIEW", payload: "results" })}
      >
        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold">
          2
        </span>
        Results
      </button>
    </div>
  );
}
