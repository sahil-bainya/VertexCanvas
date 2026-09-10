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
} from "lucide-react";
import { useState, useRef } from "react";

export default function AiSuggestionPanel({
  suggestions,
  summary,
  diagramType,
  onClose,
  onAddToNotes,
  loading,
}) {
  const icons = {
    error: <CircleAlert size={16} className="text-error" />,
    missing: <TriangleAlert size={16} className="text-warning" />,
    improvement: <Wrench size={16} className="text-info" />,
    recommendation: <Lightbulb size={16} className="text-primary" />,
    algorithm: <Lightbulb size={16} className="text-primary" />,
    other: <Pin size={16} className="text-base-content/50" />,
  };

  const [added, setAdded] = useState(false);
  const [position, setPosition] = useState({
    x: 16,
    y: window.innerHeight / 2 - 200,
  });

  const panelRef = useRef(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const panel = panelRef.current;
    const maxX = window.innerWidth - (panel?.offsetWidth || 320);
    const maxY = window.innerHeight - (panel?.offsetHeight || 400);
    setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, maxX)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, maxY)),
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
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
      className="fixed z-50 border border-base-300 w-[90vw] max-w-sm max-h-[70vh] bg-base-100 rounded-xl shadow-xl flex flex-col px-3! pt-3!"
    >
      {/* Drag handle — same */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing border-b border-base-300 select-none -mx-3"
      >
        <GripHorizontal size={16} className="text-base-content/30" />
      </div>

      {/* Header skeleton — same height as actual header */}
      <div className="flex justify-between items-center p-4">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="skeleton h-8 w-8 rounded-full" />
      </div>

      <div className="divider my-0" />

      {/* Content skeletons — same padding as actual content */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3 pb-3">
        <div className="skeleton h-6 w-3/4 rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
        <div className="skeleton h-20 w-full rounded-lg" />
      </div>

      {/* Footer skeleton — same as "Add to Notes" */}
      <div className="m-3!">
        <div className="skeleton h-8 w-32 rounded-2xl" />
      </div>
    </div>
  ) : (
    <div
      ref={panelRef}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 border border-primary/40 w-[90vw] max-w-sm max-h-[70vh] bg-base-100 rounded-xl shadow-xl flex flex-col px-3! pt-3!"
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing  select-none -mx-3"
      >
        <GripHorizontal size={16} className="text-base-content/30" />
      </div>

      {/* Header — same as before */}
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Brain size={18} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold">AI Suggestions</h3>
        </div>
        <button
          className="btn btn-sm btn-ghost btn-circle"
          onClick={onClose}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={18} />
        </button>
      </div>
      <div className="divider my-0" />

      {/* Scrollable content — same as before */}
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
        {(diagramType || summary) && (
          <div className="text-sm text-base-content/70">
            {diagramType && (
              <p>
                Detected:{" "}
                <span className="font-semibold capitalize">
                  {diagramType} diagram
                </span>
              </p>
            )}
            {summary && <p className="mt-1">{summary}</p>}
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

      {/* Add to notes — same as before */}
      {suggestions && suggestions.length > 0 && (
        <div className="m-3!">
          <button
            className="btn btn-primary btn-soft w-auto gap-2 rounded-2xl px-2!"
            onClick={handleAddToNotes}
            disabled={added}
          >
            <FilePlusCorner size={14} />
            {added ? "Added" : "Add to Notes"}
          </button>
        </div>
      )}
    </div>
  );
}
