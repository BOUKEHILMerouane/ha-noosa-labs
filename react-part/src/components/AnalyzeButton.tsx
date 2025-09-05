import Lottie from "lottie-react";
import sleepingBear from "../assets/SleepingPolarBear.json";
import meditatingKoala from "../assets/MeditatingKoala.json";
import { useState } from "react";

type AnalyzeButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function AnalyzeButton({ onClick, disabled, isLoading }: AnalyzeButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative flex items-center justify-center gap-6 w-full max-w-sm py-3 rounded-xl font-bold text-white text-lg shadow-lg transition
            bg-gradient-to-r from-slate-900 to-indigo-900
            ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:shadow-xl"}`}
    >
      {/* icon/animation*/}
      <div className="w-8 h-8 flex items-center justify-center">
        {isLoading ? (
          <Lottie
            animationData={meditatingKoala}
            loop
            autoplay
            className="w-8 h-8 [&>svg]:scale-150 [&>svg]:origin-center"
          />
        ) : (
          <Lottie
            animationData={sleepingBear}
            loop
            autoplay
            className="w-8 h-8 [&>svg]:scale-215 [&>svg]:origin-center"
          />
        ) }
      </div>

      {/* Text stays stable */}
      <span className="text-xl font-bold">Analyze</span>
    </button>
  );
}
