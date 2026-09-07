import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "../";
import { SHAPE_CONFIG } from "./shapeConfig.jsx";
import {
  Workflow,
  NotebookText,
  ImageDown,
  Download,
  Brain,
  Pencil,
  ChevronLeft,
  BrushCleaning,
  Eraser,
  Link,
  MousePointer2,
} from "lucide-react";
import TextToDiagram from "./TextToDiagram.jsx";
import "./Toolbar.css";
import { ToggleTheme } from "../";
import PendingRequestsButton from "./PendingRequestsButton.jsx";
export default function Toolbar({
  loading,
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
  stageRef,
  stageSize,
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
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="tooltip tooltip-bottom"
            data-tip="use AI features"
          >
            <button
              className={`btn btn-sm btn-ghost p-5! bg-base-300 rounded-xl ${theme === "dark" && "border border-primary/40"}`}
            >
              <Brain size={18} />
              AI
            </button>
          </div>
          <ul
            tabIndex="-1"
            className={`dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm ${theme === "dark" && "border border-primary/40"}`}
          >
            <li className="tooltip" data-tip="Get AI suggestions">
              <Button onClick={handleAssist} children="Assist"></Button>
            </li>
            <li>
              <Button
                onClick={handleCleanup}
                children="cleanup"
                loading={loading}
                loadingText="cleaning..."
              ></Button>
            </li>
            <li>
              <TextToDiagram
                saveHistory={saveHistory}
                setShapes={setShapes}
                setArrows={setArrows}
                shapes={shapes}
                shapeRefs={shapeRefs}
                stageRef={stageRef}
                stageSize={stageSize}
              />
            </li>
          </ul>
        </div>
        <div
          className="dropdown dropdown-end tooltip tooltip-bottom"
          data-tip="Export"
        >
          <button
            className={`btn btn-sm btn-ghost  bg-base-300 rounded-xl py-5! px-3! ${theme === "dark" && "border border-primary/40"}`}
          >
            <ImageDown size={18} />
          </button>
          <ul className="dropdown-content menu bg-base-200 rounded-box w-max p-2!">
            <li>
              <button onClick={exportPNG} className="btn btn-s px-2!">
                <Download /> Export PNG
              </button>
            </li>
            <li>
              <button onClick={exportPDF} className="btn btn-s px-2!">
                <Download /> Export PDF
              </button>
            </li>
          </ul>
        </div>
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
        <div className="tooltip tooltip-bottom" data-tip="Erase whole canvas">
          <button
            className={`btn btn-sm btn-ghost bg-base-300 rounded-xl py-5! px-3!  ${theme === "dark" && "border border-primary/40"}`}
            onClick={eraseWholeCanvas}
          >
            <BrushCleaning size={18} />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Invite">
          <button
            className={`btn btn-sm btn-ghost bg-base-300 rounded-xl py-5! px-3!  ${theme === "dark" && "border border-primary/40"}`}
            onClick={() => setShowCollabModal(true)}
          >
            <Link size={18} /> Collab
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
        /></div>
        <div className="tooltip tooltip-bottom" data-tip="Change theme">
          <ToggleTheme
            style={`${theme === "dark" && "border border-primary/40 "} btn btn-sm btn-ghost bg-base-300 rounded-xl py-5! px-3!`}
          />
        </div>
      </div>
    </div>
  );
}
