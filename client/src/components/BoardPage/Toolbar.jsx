import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { SHAPE_CONFIG } from "./shapeConfig.jsx";
import {
  Workflow,
  NotebookText,
  ImageDown,
  Download,
  Pencil,
  ChevronLeft,
  BrushCleaning,
  Eraser,
  Link,
  MousePointer2,
  Menu,
} from "lucide-react";
import "./Toolbar.css";
import { ToggleTheme } from "../";
import PendingRequestsButton from "./PendingRequestsButton.jsx";
import AiHelpPannel from "./AiHelpPannel.jsx";

export default function Toolbar({
  loading,
  stageRef,
  stageSize,
  handleAssist,
  handleCleanup,
  notesShowing,
  setNotesShowing,
  boardName,
  setBoardName,
  tool,
  setTool,
  setArrows,
  saveTitle,
  isEditingTitle,
  setIsEditingTitle,
  shapes,
  setShapes,
  saveHistory,
  exportPNG,
  exportPDF,
  shapeRefs,
  setPendingShapeType,
  pendingShapeType,
  connectingFrom,
  setSelectedId,
  setSelectedArrowId,
  setShowCollabModal,
  eraseWholeCanvas,
  pendingRequests,
  setPendingRequests,
}) {
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.mode);

  return (
    <div className="flex items-center justify-between w-auto m-5! ">
      <div className="flex gap-2">
        <button onClick={() => navigate("/dashboard")}>
          <ChevronLeft />
        </button>

        {isEditingTitle ? (
          <input
            autoFocus
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="text-xl font-semibold"
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                saveTitle();
                setIsEditingTitle(false);
              }
              if (e.key === "Escape") setIsEditingTitle(false);
            }}
          />
        ) : (
          <h2
            className="text-xl font-semibold"
            onDoubleClick={() => setIsEditingTitle(true)}
          >
            {boardName}
          </h2>
        )}
      </div>

      <ul className="menu menu-horizontal bg-base-300 rounded-box mt-6 flex gap-3 p-1! border border-primary/40">
        <li>
          <div className="tooltip" data-tip="Selection">
            <button
              onClick={() => {
                setSelectedId(null);
                setSelectedArrowId(null);
                setPendingShapeType(null);
                setTool("select");
              }}
              className="p-2!"
            >
              <MousePointer2 size={18} />
            </button>
          </div>
        </li>
        {Object.entries(SHAPE_CONFIG)
          .filter(([type]) => type !== "freehand")
          .map(([type, config]) => (
            <li>
              <div className="tooltip tooltip-bottom" data-tip={config.datatip}>
                <button
                  key={type}
                  onClick={() => {
                    setSelectedId(null);
                    setTool("select");
                    setPendingShapeType(type);
                  }}
                  className={
                    pendingShapeType === type
                      ? "bg-primary p-2! rounded-md text-primary-content"
                      : " p-2!"
                  }
                >
                  {config.icon}
                </button>
              </div>
            </li>
          ))}

        <li>
          <div className="tooltip" data-tip="Pencil">
            <button
              onClick={() => {
                setSelectedId(null);
                setPendingShapeType(null);
                setTool(tool === "freehand" ? "select" : "freehand");
              }}
              className={
                tool === "freehand"
                  ? "bg-primary p-2! rounded-md text-primary-content"
                  : "p-2!"
              }
            >
              <Pencil size={18} />
            </button>
          </div>
        </li>

        <li>
          <div className="tooltip" data-tip="Eraser">
            <button
              onClick={() => {
                setSelectedId(null);
                setPendingShapeType(null);
                setTool(tool === "eraser" ? "select" : "eraser");
              }}
              className={
                tool === "eraser"
                  ? "bg-primary p-2! rounded-md text-primary-content"
                  : "p-2!"
              }
            >
              <Eraser size={18} />
            </button>
          </div>
        </li>
        <li>
          <div className="tooltip" data-tip="Connect">
            <button
              onClick={() => {
                setSelectedId(null);
                setPendingShapeType(null);
                setTool(tool === "connect" ? "select" : "connect");
              }}
              className={
                tool === "connect"
                  ? connectingFrom
                    ? "bg-primary/40 p-2! rounded-md text-primary-content"
                    : "bg-primary p-2! rounded-md text-primary-content"
                  : "p-2!"
              }
            >
              <Workflow size={18} />
            </button>
          </div>
        </li>
      </ul>

      <div className="flex flex-row gap-1.5 flex-wrap">
        <AiHelpPannel
          className={`btn btn-sm btn-ghost  bg-base-300 rounded-xl py-5! px-3! ${theme === "dark" && "border border-primary/40"}`}
          handleAssist={handleAssist}
          handleCleanup={handleCleanup}
          loading={loading}
          shapes={shapes}
          setShapes={setShapes}
          saveHistory={saveHistory}
          shapeRefs={shapeRefs}
          setArrows={setArrows}
          stageRef={stageRef}
          stageSize={stageSize}
        />

        <div className="tooltip tooltip-bottom" data-tip="Notes">
          <button
            className={`btn btn-sm btn-ghost bg-base-300 rounded-xl py-5! px-3! ${notesShowing && "hidden"} ${theme === "dark" && "border border-primary/40"}`}
            onClick={() => {
              setNotesShowing((prev) => !prev);
            }}
          >
            <NotebookText size={18} />
          </button>
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Notification">
          <PendingRequestsButton
            style={`btn btn-sm btn-ghost bg-base-300 rounded-xl py-5!  px-3! ${theme === "dark" && "border border-primary/40"}`}
            pendingRequests={pendingRequests}
            onHandled={(userId) => {
              setPendingRequests((prev) =>
                prev.filter((r) => r.userId !== userId),
              );
            }}
          />
        </div>

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-sm btn-ghost bg-base-300 rounded-xl py-5! px-3! ${theme === "dark" && "border border-primary/40"}`}
          >
            <Menu size={18} />
          </div>

          <ul
            tabIndex={0}
            className={`dropdown-content menu bg-base-200 rounded-xl z-1 w-44 p-2! mt-2! shadow-lg gap-1 ${theme === "dark" && "border border-primary/40"}`}
          >
            <li>
              <a onClick={eraseWholeCanvas} className="p-2! rounded-lg">
                <BrushCleaning size={18} /> Clean Canvas
              </a>
            </li>

            <li>
              <ToggleTheme style=" rounded-lg flex gap-2 p-2!" text="Themes" />
            </li>

            <li>
              <details>
                <summary className="p-2! rounded-lg">
                  <ImageDown size={18} /> Export
                </summary>
                <ul className="p-2! rounded-lg">
                  <li>
                    <a onClick={exportPNG} className="p-2! rounded-lg">
                      <Download size={16} /> Export PNG
                    </a>
                  </li>
                  <li>
                    <a onClick={exportPDF} className="p-2! rounded-lg">
                      <Download size={16} /> Export PDF
                    </a>
                  </li>
                </ul>
              </details>
            </li>

            <li>
              <a
                onClick={() => setShowCollabModal(true)}
                className="p-2! rounded-lg"
              >
                <Link size={18} /> Collab
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
