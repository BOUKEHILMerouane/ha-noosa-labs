import Sidebar from "./components/Sidebar";
import Tabs from "./components/Tabs";
import UploadPanel from "./components/UploadPanel";
import ResultsPanel from "./components/ResultsPanel";
import { AnalyzerProvider, useAnalyzer } from "./context/AnalyzerContext";

function MainStage() {
  const { state } = useAnalyzer();

  return (
    <main className="flex-1 h-screen overflow-y-auto bg-slate-50">
      <div className="sticky top-0 bg-white backdrop-blur-md shadow border-b border-slate-200 z-10">
        <Tabs />
      </div>
      <div className="p-8 flex justify-center">
        <div className={`w-full mt-16 ${state.view === "setup" ? "max-w-2xl" : "max-w-7xl"}`}>
          {state.view === "setup" ? <UploadPanel /> : <ResultsPanel />}
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AnalyzerProvider>
      <div className="flex">
        <Sidebar />
        <MainStage />
      </div>
    </AnalyzerProvider>
  );
}
