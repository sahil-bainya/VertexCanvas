import { useState } from "react";
import { FileSearch, Layers, Share2, Sparkles, Loader2, X } from "lucide-react";
import TextToDiagram from "./TextToDiagram.jsx";

// ---- Static config -------------------------------------------------------

const TOP_TABS = [
  {
    id: "analyze",
    label: "Analyze",
    sub: "Detect issues & get insights",
    icon: FileSearch,
  },
  {
    id: "organize",
    label: "Organize",
    sub: "Clean up your diagram",
    icon: Layers,
  },
  { id: "generate", label: "Generate", sub: "Create from text", icon: Share2 },
];

// ---- Modal content ---------------------------------------------------------

function GeneratorModal({
  onClose,
  // Analyze
  onAssist,
  // Organize
  onCleanup,
  loading,
  loadingText = "cleaning...",
  // Generate
  saveHistory,
  setShapes,
  setArrows,
  shapes,
  shapeRefs,
  stageRef,
  stageSize,
}) {
  const [activeTab, setActiveTab] = useState("generate");
  const [genLoading, setGenLoading] = useState(false);

  // Analyze and Organize are action buttons, not panels — they fire their
  // handler straight away and close the popover, same as the old dropdown
  // menu items. Generate is the only tab with a panel underneath it.
  const handleTabClick = (tab) => {
    if (genLoading) return;
    if (tab.id === "analyze") {
      onAssist?.();
      onClose();
      return;
    }
    if (tab.id === "organize") {
      if (loading) return;
      onCleanup?.();
      onClose();
      return;
    }
    setActiveTab(tab.id);
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl  rounded-2xl">
        <div className="flex justify-end mb-1!">
          <button
            type="button"
            onClick={onClose}
            disabled={genLoading}
            className="btn btn-ghost gap-1.5 px-2.5! rounded-full "
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5! px-3!">
          {TOP_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const isOrganizeLoading = tab.id === "organize" && loading;
            return (
              <button
                key={tab.id}
                type="button"
                disabled={isOrganizeLoading || genLoading}
                onClick={() => handleTabClick(tab)}
                className={`flex items-start gap-3 rounded-2xl border p-3! text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-base-300 hover:border-base-content/20"
                } ${isOrganizeLoading && "opacity-70 cursor-not-allowed"}`}
              >
                {isOrganizeLoading ? (
                  <Loader2 size={22} className="text-primary animate-spin" />
                ) : (
                  <Icon
                    size={22}
                    className={active ? "text-primary" : "text-base-content/70"}
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`font-semibold text-sm ${active ? "text-primary" : ""}`}
                    >
                      {tab.label}
                    </span>
                    {tab.badge && (
                      <span className="badge badge-primary badge-xs font-medium px-1.5!">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-base-content/50 mt-0.5!">
                    {isOrganizeLoading ? loadingText : tab.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {activeTab === "generate" && (
          <TextToDiagram
            onClose={onClose}
            onLoadingChange={setGenLoading}
            saveHistory={saveHistory}
            setShapes={setShapes}
            setArrows={setArrows}
            shapes={shapes}
            shapeRefs={shapeRefs}
            stageRef={stageRef}
            stageSize={stageSize}
          />
        )}
      </div>
      <div
        className="modal-backdrop"
        onClick={genLoading ? undefined : onClose}
      />
    </div>
  );
}

// ---- Exported toolbar button ----------------------------------------------

export default function AiHelpPannel({
  className = "",
  handleAssist,
  handleCleanup,
  loading,

  saveHistory,
  setShapes,
  setArrows,
  shapes,
  shapeRefs,
  stageRef,
  stageSize,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${className}`}
      >
        <Sparkles size={15} className="text-primary" />
        AI
      </button>

      {open && (
        <GeneratorModal
          onClose={() => setOpen(false)}
          onAssist={handleAssist}
          onCleanup={handleCleanup}
          loading={loading}
          loadingText="Loading"
          saveHistory={saveHistory}
          setShapes={setShapes}
          setArrows={setArrows}
          shapes={shapes}
          shapeRefs={shapeRefs}
          stageRef={stageRef}
          stageSize={stageSize}
        />
      )}
    </>
  );
}
