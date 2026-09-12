import {
  CircleAlert,
  TriangleAlert,
  Lightbulb,
  Wrench,
  Pin,
  X,
  Brain,
  FilePlusCorner,
  GripHorizontal,
  Code2,
  Sparkles,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { generateCode } from "../../services/aiServices.js";

// Language/tech options per code_type
const CODE_TYPE_LANGUAGES = {
  sql: ["SQL", "MongoDB (Mongoose)", "Prisma", "Sequelize"],
  // "pseudocode" = flowchart/algorithm type diagrams → generate real runnable code
  pseudocode: ["C++", "Python", "JavaScript", "Java"],
  api_boilerplate: [
    "Node.js (Express)",
    "Python (FastAPI)",
    "Java (Spring Boot)",
    "Go (Gin)",
  ],
  default: ["C++", "Python", "JavaScript", "Java"],
};

function getLanguageOptions(codeType) {
  return CODE_TYPE_LANGUAGES[codeType] || CODE_TYPE_LANGUAGES.default;
}

export default function AiSuggestionPanel({
  aiResponse,
  onClose,
  onAddToNotes,
  loading,
  setCodeDrawerOpen,
  setGeneratedCode,
  setGeneratedLang,
}) {
  const suggestions = aiResponse?.suggestions;
  const summary = aiResponse?.summary;
  const diagramType = aiResponse?.diagram_type;
  const codeable = aiResponse?.codeable;
  const codeType = aiResponse?.code_type;
  const detailed_analysis = aiResponse?.detailed_analysis;

  const icons = {
    error: <CircleAlert size={16} className="text-error" />,
    missing: <TriangleAlert size={16} className="text-warning" />,
    improvement: <Wrench size={16} className="text-info" />,
    recommendation: <Lightbulb size={16} className="text-primary" />,
    algorithm: <Lightbulb size={16} className="text-primary" />,
    other: <Pin size={16} className="text-base-content/50" />,
  };

  const [added, setAdded] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: 16,
    y: window.innerHeight / 2 - 200,
  }));

  // ---- Language selection (per code_type) ----
  const languageOptions = getLanguageOptions(codeType);
  const [selectedLanguage, setSelectedLanguage] = useState(languageOptions[0]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [prevCodeType, setPrevCodeType] = useState(codeType);
  const [generatedForLanguage, setGeneratedForLanguage] = useState(null); // NEW
  // Reset language when code_type changes — computed during render, not in an effect
  if (codeType !== prevCodeType) {
    setPrevCodeType(codeType);
    setSelectedLanguage(getLanguageOptions(codeType)[0]);
  }
  // ---- end language selection ----

  const panelRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragAbortController = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    const panel = panelRef.current;
    const maxX = window.innerWidth - (panel?.offsetWidth || 320);
    const maxY = window.innerHeight - (panel?.offsetHeight || 400);
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, maxX)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, maxY)),
    });
  }, []);

  const stopDragging = useCallback(() => {
    isDragging.current = false;
    dragAbortController.current?.abort();
    dragAbortController.current = null;
  }, []);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragAbortController.current?.abort();
    const controller = new AbortController();
    dragAbortController.current = controller;

    window.addEventListener("mousemove", handleMouseMove, {
      signal: controller.signal,
    });
    window.addEventListener("mouseup", stopDragging, {
      signal: controller.signal,
    });
  };

  // Safety net: if the panel unmounts mid-drag, abort the listeners.
  useEffect(() => {
    return () => {
      dragAbortController.current?.abort();
    };
  }, []);

  const onGenerateCode = async () => {
    console.log("Sending language:", selectedLanguage);
    setGeneratingCode(true);
    try {
      const result = await generateCode(
        detailed_analysis,
        codeType,
        selectedLanguage,
      );

      console.log(result);
      setCodeDrawerOpen(true);
      setGeneratedCode(result.code);

      setGeneratedLang(result.language);

      setGeneratedForLanguage(selectedLanguage);
    } catch (error) {
      console.log(error);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleAddToNotes = async () => {
    setAdded(true);
    await onAddToNotes();
    setTimeout(() => setAdded(false), 3000);
  };

  return loading ? (
    <div
      ref={panelRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 border border-base-300 w-[90vw] max-w-sm max-h-[90vh] bg-base-100 rounded-xl shadow-xl flex flex-col px-3! pt-3!"
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-base-300 select-none -mx-3"
      >
        <GripHorizontal size={16} className="text-base-content/30" />
      </div>

      <div className="flex justify-between items-center p-4">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>

      <div className="divider my-0" />

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 pb-3">
        <div className="skeleton h-6 w-3/4 rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
      </div>

      <div className="m-3! flex gap-2">
        <div className="skeleton h-8 w-32 rounded-2xl" />
        <div className="skeleton h-8 w-24 rounded-2xl" />
      </div>
    </div>
  ) : (
    <div
      ref={panelRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 border border-primary/40 w-[90vw] max-w-sm max-h-[70vh] bg-base-100 rounded-xl shadow-xl flex flex-col px-3! pt-3!"
    >
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing select-none -mx-3"
      >
        <GripHorizontal size={16} className="text-base-content/30" />
      </div>

      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold">AI Suggestions</h3>
        </div>
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="divider my-0" />

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
        {(diagramType || summary) && (
          <div className="card bg-base-200 border border-base-300 p-3! flex-row items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl shrink-0">
              <Brain size={22} className="text-primary" />
            </div>
            <div>
              {diagramType && (
                <p className="font-bold text-base">
                  Detected:{" "}
                  <span className="capitalize">
                    {diagramType.replace(/_/g, " ")} Diagram
                  </span>
                </p>
              )}
              {summary && (
                <p className="text-sm text-base-content/60 mt-0.5">{summary}</p>
              )}
            </div>
          </div>
        )}

        {suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="card bg-primary/5 border border-primary/20 p-2!"
            >
              <div className="flex items-center gap-2 mb-2! justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {suggestion.title || suggestion.type}
                </span>
                <div className="flex items-center gap-1 mt-2">
                  {icons[suggestion.type] || icons.other}
                  <span className="text-xs text-base-content/50 capitalize">
                    {suggestion.type}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-base-content/90">
                {suggestion.message}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-base-content/50 text-center py-8 mb-3!">
            No suggestions found.
          </p>
        )}
      </div>

      {(suggestions?.length > 0 || codeable) && (
        <div className="m-3! grid grid-cols-2 gap-2">
          {codeable && (
            <div className="card bg-secondary/5 border border-secondary/20 p-3!">
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={14} className="text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wide text-secondary">
                  Generate Code
                </span>
              </div>
              <select
                className="select select-sm select-bordered w-full my-2! px-2!"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                aria-label="Select language"
              >
                {languageOptions.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-secondary btn-sm w-full gap-2"
                onClick={onGenerateCode}
                disabled={
                  generatingCode || selectedLanguage === generatedForLanguage
                }
              >
                {generatingCode ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Sparkles size={14} />
                )}
                {generatingCode ? "Generating..." : "Generate code"}
              </button>
            </div>
          )}

          {suggestions && suggestions.length > 0 && (
            <button
              onClick={handleAddToNotes}
              disabled={added}
              className="card bg-primary/5 border border-primary/20 p-3! items-center justify-center text-center gap-1 hover:bg-primary/10 transition-colors disabled:opacity-70"
            >
              <FilePlusCorner size={18} className="text-primary" />
              <span className="text-sm font-bold text-primary">
                {added ? "Added" : "Add to Notes"}
              </span>
              <span className="text-xs text-base-content/50">
                {added ? "Saved!" : "Save this suggestion"}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
