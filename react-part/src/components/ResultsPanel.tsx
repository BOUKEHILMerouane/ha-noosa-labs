import { useState, useEffect } from "react";
import { useAnalyzer } from "../context/AnalyzerContext";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";

export default function ResultsPanel() {
  const { state } = useAnalyzer();
  const analysis = state.results;

  const [selected, setSelected] = useState<any | null>(null);

  // Reset highlight whenever a new history item loads
  useEffect(() => {
    setSelected(null);
  }, [analysis]);


  if (!analysis || !analysis.candidates?.length) {
    return (
      <div className="p-6 border rounded-xl shadow bg-white text-slate-500 italic">
        No results available. Run an analysis first.
      </div>
    );
  }

  const lastAnalyzedISO =
    analysis.analyzedAt || analysis.updatedAt || analysis.createdAt;
  const lastAnalyzedStr = (() => {
    const d = new Date(lastAnalyzedISO);
    return isNaN(d.getTime()) ? "—" : d.toLocaleString();
  })();

  const candidates = [...analysis.candidates].sort(
    (a, b) => b.score - a.score
  );

  // Animation configs
  const listVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 1, 0.5, 1],
      },
    },
  };

  const listFadeVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // each line appears after the previous
      },
    },
  };

  const itemFadeVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] },
    },
  };



  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left column: candidates */}
      <div className="col-span-5 space-y-3">
        <h2 className="text-2xl font-semibold">
          Results for <span className="text-indigo-600">{analysis.job.title}</span>
        </h2>
        <div className="text-sm text-slate-500 mb-2">
          Last analyzed: <span className="font-medium">{lastAnalyzedStr}</span>
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-3 rounded-lg bg-gradient-to-r from-sky-200 to-sky-300 text-slate-700 font-semibold shadow">
          <span className="w-12 text-left">Rank</span>
          <span className="flex-1 text-left">Name</span>
          <span className="w-20 text-right">Rating</span>
        </div>


        {/* Candidate rows */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {candidates.map((c, i) => (
            <motion.div
              key={c.name + i}
              variants={itemVariants}
              onMouseEnter={() => setSelected(c)}
              onClick={() => setSelected(c)}
              className={`relative flex items-center justify-between px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-300
        ${selected?.name === c.name
                  ? "scale-[1.02] shadow-lg"
                  : "hover:scale-[1.01] shadow-sm"
                }
        group overflow-hidden`}
              style={{
                borderColor: c.scoreColor,
                background:
                  selected?.name === c.name
                    ? `linear-gradient(135deg, ${c.scoreColor}, ${c.scoreColor}dd)`
                    : "white",
              }}
            >
              {/* Rank */}
              <span
                className={`w-12 font-bold transition-colors ${selected?.name === c.name ? "text-white" : "text-slate-700"
                  }`}
              >
                {i + 1}
              </span>
              {/* Name */}
              <span
                className={`flex-1 font-semibold transition-colors ${selected?.name === c.name ? "text-white" : "text-slate-700"
                  }`}
              >
                {c.name}
              </span>
              {/* Score */}
              <span
                className={`w-20 text-right text-lg font-bold transition-colors ${selected?.name === c.name ? "text-white" : "text-slate-700"
                  }`}
              >
                {c.score}%
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* Right column: details */}
      <div className="col-span-7 ml-4">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.name} // important: triggers re-animation on change
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-8 border rounded-xl shadow-xl bg-white"
            >
              <h3 className="text-xl font-semibold mb-6">{selected.name}</h3>

              {/* Strengths */}
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h4 className="flex items-center text-green-600 font-semibold mb-3">
                  ✅ Strengths
                </h4>
                <motion.ul
                  key={selected.name + "-strengths"}
                  variants={listFadeVariants}
                  initial="hidden"
                  animate="visible"
                  className="ml-4 border-l-2 border-green-400 pl-5 space-y-2 text-green-700"
                >
                  {selected.strengths?.map((s: string, idx: number) => (
                    <motion.li key={idx} variants={itemFadeVariants} className="relative">
                      <span className="absolute -left-3 top-1/2 w-2 h-[1px] bg-green-400"></span>
                      {s}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="flex items-center text-red-600 font-semibold mb-3">
                  ❌ Weaknesses
                </h4>
                <motion.ul
                  key={selected.name + "-weaknesses"}
                  variants={listFadeVariants}
                  initial="hidden"
                  animate="visible"
                  className="ml-4 border-l-2 border-red-400 pl-5 space-y-2 text-red-700"
                >
                  {selected.weaknesses?.map((w: string, idx: number) => (
                    <motion.li key={idx} variants={itemFadeVariants} className="relative">
                      <span className="absolute -left-3 top-1/2 w-2 h-[1px] bg-red-400"></span>
                      {w}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-8 border rounded-xl shadow-xl bg-white text-slate-500 italic"
            >
              Hover or click a candidate to see details
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );

}
