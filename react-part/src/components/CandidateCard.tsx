type CandidateCardProps = {
  name: string;
  score: number;
  scoreColor: string;
  strengths: string[];
  weaknesses: string[];
};

export default function CandidateCard({
  name,
  score,
  scoreColor,
  strengths,
  weaknesses,
}: CandidateCardProps) {
  return (
    <div
      className="relative flex items-center justify-between border-2 rounded-lg shadow-md transition-all duration-300 group overflow-hidden"
      style={{ borderColor: scoreColor }}
    >
      {/* Left side: candidate info */}
      <div className="p-5 flex-1 z-10 transition-colors duration-300 group-hover:text-white">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-xl font-bold">{score}%</p>
      </div>

      {/* Right side: pros & cons (hidden until hover) */}
      <div
        className="absolute right-0 top-0 h-full w-1/2 bg-white shadow-inner p-4 translate-x-full 
                   group-hover:translate-x-0 transition-transform duration-300 z-20"
      >
        <h4 className="text-green-600 font-medium mb-2">✅ Strengths</h4>
        <ul className="list-disc list-inside space-y-1 text-green-600">
          {strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        <h4 className="text-red-600 font-medium mt-4 mb-2">❌ Weaknesses</h4>
        <ul className="list-disc list-inside space-y-1 text-red-600">
          {weaknesses.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      </div>

      {/* Hover background fill */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: scoreColor }}
      />
    </div>
  );
}
