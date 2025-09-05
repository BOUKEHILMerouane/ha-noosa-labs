import { useRef, useState } from "react";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import animationData from "../assets/uploadAnimation.json";
import { useAnalyzer } from "../context/AnalyzerContext";

export default function UploadSingleFile() {
    const [isHovered, setIsHovered] = useState(false);
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { state, dispatch } = useAnalyzer();

    const localFile = state.jdFile;          // File | null
    const remote = state.jdRemote;           // {name,url} | null

    const handleEnter = () => { setIsHovered(true); lottieRef.current?.play(); };
    const handleLeave = () => { setIsHovered(false); lottieRef.current?.stop(); };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected && selected.type === "application/pdf") {
            dispatch({ type: "SET_JD", payload: selected }); // clears remote automatically
        } else {
            alert("Please upload a PDF file only.");
        }
        e.target.value = "";
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsHovered(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type === "application/pdf") {
            dispatch({ type: "SET_JD", payload: dropped }); // clears remote automatically
        } else {
            alert("Please upload a PDF file only.");
        }
    };

    const removeAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch({ type: "SET_JD", payload: null });       // clears local
        dispatch({ type: "SET_JD_REMOTE", payload: null }); // clears remote
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsHovered(true);
    };

    return (
        <div
            className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white shadow-sm flex flex-col items-center justify-center transition ring-offset-2
        ${isHovered ? "ring-2 ring-indigo-400 cursor-copy" : "cursor-pointer"}`}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop
                autoplay={false}
                style={{ width: 120, height: 120 }}
            />

            {/* Show LOCAL file */}
            {localFile && (
                <div className="flex items-center mt-3 px-3 py-1.5 bg-indigo-50 border border-indigo-400 text-indigo-700 rounded-full shadow-sm transition space-x-2">
                    <a
                        href={URL.createObjectURL(localFile)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium truncate max-w-[240px] underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {localFile.name}
                    </a>
                    <button onClick={removeAll} className="text-gray-400 hover:text-red-500 font-bold">×</button>
                </div>
            )}

            {/* Show REMOTE file */}
            {!localFile && remote && (
                <div className="flex items-center mt-3 px-3 py-1.5 bg-indigo-50 border border-indigo-400 text-indigo-700 rounded-full shadow-sm transition space-x-3">
                    <a
                        href={remote.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium truncate max-w-[240px] underline-offset-2 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {remote.name}
                    </a>

                    <button onClick={removeAll} className="text-gray-400 hover:text-red-500 font-bold">×</button>
                </div>
            )}

            {/* Empty state text */}
            {!localFile && !remote && (
                <p className="mt-3 font-medium text-slate-700">
                    {isHovered ? "Drop PDF to upload" : "Upload Job Description PDF"}
                </p>
            )}

            <input
                type="file"
                accept="application/pdf"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
            />
        </div>
    );
}
