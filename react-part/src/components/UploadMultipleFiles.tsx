import { useRef, useState } from "react";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import animationData from "../assets/uploadAnimation.json";
import { useAnalyzer } from "../context/AnalyzerContext";

export default function UploadResumes() {
  const [isHovered, setIsHovered] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const resumesInputRef = useRef<HTMLInputElement>(null);

  const { state, dispatch } = useAnalyzer();

  const localResumes = state.resumes;
  const remoteResumes = state.resumesRemote;

  const handleResumesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (f) => f.type === "application/pdf"
      );
      if (newFiles.length > 0) {
        dispatch({ type: "ADD_RESUMES", payload: newFiles });
      }
    }
    e.target.value = "";
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(false);
    const newFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "application/pdf"
    );
    if (newFiles.length > 0) {
      dispatch({ type: "ADD_RESUMES", payload: newFiles });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(true);
  };

  const handleEnter = () => {
    setIsHovered(true);
    lottieRef.current?.play();
  };

  const handleLeave = () => {
    setIsHovered(false);
    lottieRef.current?.stop();
  };

  const removeLocalResume = (index: number) => {
    dispatch({ type: "REMOVE_RESUME_AT", payload: index });
  };

  const clearRemoteResumes = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: "SET_RESUMES_REMOTE", payload: [] });
  };

  return (
    <div
      className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white shadow-sm flex flex-col items-center justify-center transition ring-offset-2 
        ${isHovered ? "ring-2 ring-indigo-400 cursor-copy" : "cursor-pointer"}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => resumesInputRef.current?.click()}
      onDrop={handleResumeDrop}
      onDragOver={handleDragOver}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop
        autoplay={false}
        style={{ width: 120, height: 120 }}
      />

      {/* LOCAL RESUMES */}
      {localResumes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center w-full px-2">
          {(showAll ? localResumes : localResumes.slice(0, 5)).map((resume, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-400 text-indigo-700 rounded-full shadow-sm hover:bg-indigo-100 hover:border-indigo-500 transition space-x-2"
            >
              <a
                href={URL.createObjectURL(resume)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium truncate max-w-[120px] underline-offset-2 hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {resume.name}
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeLocalResume(index);
                }}
                className="text-gray-400 hover:text-red-500 hover:scale-110 transition font-bold"
              >
                ×
              </button>
            </div>
          ))}
          {localResumes.length > 5 && !showAll && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              +{localResumes.length - 5} more
            </button>
          )}
          {showAll && localResumes.length > 5 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(false);
              }}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              Show less
            </button>
          )}
        </div>
      )}

      {/* REMOTE RESUMES */}
      {localResumes.length === 0 && remoteResumes.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center w-full px-2">
          {(showAll ? remoteResumes : remoteResumes.slice(0, 5)).map((resume, index) => (
            <div
              key={index}
              className="flex items-center px-3 py-1.5 bg-indigo-50 border border-indigo-400 text-indigo-700 rounded-full shadow-sm hover:bg-indigo-100 hover:border-indigo-500 transition space-x-2"
            >
              <a
                href={resume.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium truncate max-w-[120px] underline-offset-2 hover:underline cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {resume.name}
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newRemotes = [...remoteResumes];
                  newRemotes.splice(index, 1);
                  dispatch({ type: "SET_RESUMES_REMOTE", payload: newRemotes });
                }}
                className="text-gray-400 hover:text-red-500 hover:scale-110 transition font-bold"
              >
                ×
              </button>
            </div>
          ))}
          {remoteResumes.length > 5 && !showAll && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(true);
              }}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              +{remoteResumes.length - 5} more
            </button>
          )}
          {showAll && remoteResumes.length > 5 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(false);
              }}
              className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition"
            >
              Show less
            </button>
          )}
          <button
            onClick={clearRemoteResumes}
            className="mt-2 px-3 py-1 bg-red-100 border border-red-300 rounded-full text-sm text-red-600 hover:bg-red-200 transition"
          >
            Clear all
          </button>
        </div>
      )}

      {/* TEXT */}
      <p className="mt-3 font-medium text-slate-700">
        {isHovered
          ? "Drop PDFs to upload"
          : localResumes.length === 0 && remoteResumes.length === 0
            ? "Upload Candidate Resumes"
            : `${localResumes.length > 0 ? localResumes.length : remoteResumes.length} Resume${(localResumes.length > 0 ? localResumes.length : remoteResumes.length) > 1 ? "s" : ""
            } loaded`}
      </p>

      <input
        type="file"
        accept="application/pdf"
        multiple
        hidden
        ref={resumesInputRef}
        onChange={handleResumesChange}
      />
    </div>
  );
}
