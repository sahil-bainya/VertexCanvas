import { useEffect, useState } from "react";
import { ContextPanel } from "../";
import { useBoard } from "./useBoard.js";
import "./BoardStyle.css";
import { messCleanup, architectureAssist } from "../../services/aiServices.js";
import { getElkPositions } from "./elk.js";
import AisuggestionPannel from "./AiSuggestionPannel.jsx";
import NotesPage from "./NotesPage.jsx";
import Toolbar from "./Toolbar.jsx";
import StageCanvas from "./StageCanvas.jsx";
import CanvasControls from "./CanvasControls.jsx";
import SelectionControls from "./SelectionControls..jsx";
import { notify } from "../../utils/toast.jsx";
import { Maximize, Minimize } from "lucide-react";
import CollabModal from "./CollabModel.jsx";
import RequestAccessScreen from "./RequestAccessScreen.jsx";
import { useParams } from "react-router-dom";
export default function Board() {
  const {
    eraseWholeCanvas,
    shapes,
    boardId,
    setShapes,
    addToNotes,
    boardNotes,
    updateNote,
    boardName,
    setBoardName,
    selectedId,
    saveBoard,
    setSelectedId,
    handleTextDblClick,
    tool,
    setTool,
    isEditingTitle,
    setIsEditingTitle,
    stageRef,
    transformerRef,
    removeNotes,
    shapeRefs,
    toolbarRef,
    addShape,
    handleDragEnd,
    deleteSelected,
    handleTransformEnd,
    saveTitle,
    stageSize,
    arrows,
    connectingFrom,
    setConnectingFrom,
    updateArrowPoints,
    connectShapes,
    removeArrowsForShape,
    undo,
    updateColorEmiter,
    redo,
    zoomIn,
    zoomOut,
    resetZoom,
    saveHistory,
    exportPNG,
    exportPDF,
    setArrows,
    canvasChangedSinceAI,
    setCanvasChangedSinceAI,
    pendingShapeType,
    setPendingShapeType,
    isDrawing,
    startFreehandDraw,
    continueFreehandDraw,
    endFreehandDraw,
    pencilColor,
    setPencilColor,
    pencilStrokeWidth,
    deleteArrow,
    setPencilStrokeWidth,
    fullScreen,
    setFullScreen,
    addLabel,
    selectedArrowId,
    setSelectedArrowId,
    remoteCursors,
    startCursorTracking,
    updateCursorPosition,
    stopCursorTracking,
    boardAccess,
    pendingRequests,
    setPendingRequests,
  } = useBoard();

  const [loading, setLoading] = useState(false); // for cleanup
  const [pendingCleanup, setPendingCleanup] = useState(false);
  const [notesShowing, setNotesShowing] = useState(false);
  const [contextShape, setContextShape] = useState(null);

  const [aiResponse, setAiresponse] = useState(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [grid, setGrid] = useState(false);

  const { id } = useParams();
  useEffect(() => {
    const handleAccessRequest = (event) => {
      const { requesterId, requesterName, boardId: reqBoardId } = event.detail;
      if (reqBoardId === id) {
        setPendingRequests((prev) => [
          ...prev,
          { userId: requesterId, userName: requesterName, boardId: reqBoardId },
        ]);
        notify.info(`${requesterName} wants to join your board`);
      }
    };
    window.addEventListener("access-request", handleAccessRequest);
    return () =>
      window.removeEventListener("access-request", handleAccessRequest);
  }, [id, setPendingRequests]);

  const handleAssist = async () => {
    if (!canvasChangedSinceAI && aiResponse) {
      setAiPanelOpen(true);
      return;
    }
    if (shapes.length === 0) {
      notify.error("Canvas is empty");
      return;
    }
    setAiPanelOpen(true);
    setAiLoading(true);
    try {
      const result = await architectureAssist(shapes, arrows);
      setAiresponse(result);
      setCanvasChangedSinceAI(false);
    } catch (error) {
      notify.error(error.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCleanup = async () => {
    setLoading(true);
    try {
      const result = await messCleanup(shapes, arrows);
      const elkNodes = await getElkPositions(shapes, result.edges);
      console.log(shapes);
      const updatedShapes = shapes.map((shape) => {
        const elkNode = elkNodes.find((n) => n.id === shape.id);
        if (!elkNode) return shape;
        return {
          ...shape,
          x:
            shape.type === "circle" ? elkNode.x + elkNode.width / 2 : elkNode.x,
          y:
            shape.type === "circle"
              ? elkNode.y + elkNode.height / 2
              : elkNode.y,
        };
      });
      console.log(updatedShapes);
      setShapes(updatedShapes);
      setPendingCleanup(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleShapeClick = (e, id) => {
    if (tool === "eraser") {
      deleteSelected(id, removeArrowsForShape);
      return;
    }
    if (tool === "connect") {
      if (!connectingFrom) {
        setConnectingFrom(id);
      } else if (connectingFrom !== id) {
        connectShapes(connectingFrom, id);
        setConnectingFrom(null);
        setTool("select");
      }
    } else {
      setSelectedId(id);
      setSelectedArrowId(null);
    }
  };

  useEffect(() => {
    startCursorTracking();

    // Cleanup on unmount
    return () => {
      stopCursorTracking();
    };
  }, []);

  // Mouse move handler
  const handleMouseMove = (e) => {
    const stage = e.target.getStage();

    const pointerPos = stage.getPointerPosition();
    const transform = stage.getAbsoluteTransform().copy().invert();
    const canvasPos = transform.point(pointerPos);

    if (canvasPos) {
      updateCursorPosition(canvasPos.x, canvasPos.y);
    }
  };

  // Mouse leave - cursor hide karo
  const handleMouseLeave = () => {
    // Optional: Cursor hide karne ke liye
    stopCursorTracking();
  };

  // Mouse enter - cursor tracking restart
  const handleMouseEnter = () => {
    startCursorTracking();
  };

  useEffect(() => {
    if (!pendingCleanup) return;
    shapes.forEach((shape) => updateArrowPoints(shape.id));
    setTimeout(() => setPendingCleanup(false), 0);
  }, [pendingCleanup, shapes, updateArrowPoints]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (document.activeElement.tagName === "TEXTAREA") return;

        if (selectedId) {
          deleteSelected(selectedId, removeArrowsForShape);
        } else if (selectedArrowId) {
          // ← NAYA-condition
          deleteArrow(selectedArrowId);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedId,
    selectedArrowId,
    deleteSelected,
    removeArrowsForShape,
    deleteArrow,
  ]);

  useEffect(() => {
    const handleKeydown = (e) => {
      if (e.ctrlKey && e.key === "z") undo();
      if (e.ctrlKey && e.key === "y") redo();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown); //cleanup function hai — React automatically call karta hai jab component unmount ho.
  }, [undo, redo]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.position({
      x: stageSize.width / 2,
      y: stageSize.height / 2,
    });
  }, [stageSize, stageRef]);

  const [showCollabModal, setShowCollabModal] = useState(false);
  if (boardAccess === null) {
    return (
      <div className="flex items-center justify-center h-screen w-screen">
        <span className="loading loading-spinner loading-xl"></span>
      </div>
    );
  }
  if (!boardAccess.isOwner && !boardAccess.isCollaborator) {
    return (
      <RequestAccessScreen
        boardId={boardId}
        hasPendingRequest={boardAccess.hasPendingRequest}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {!fullScreen && (
        <div ref={toolbarRef} className="shrink-0 z-50">
          <Toolbar
            loading={loading}
            handleAssist={handleAssist}
            handleCleanup={handleCleanup}
            notesShowing={notesShowing}
            setNotesShowing={setNotesShowing}
            boardName={boardName}
            setBoardName={setBoardName}
            tool={tool}
            saveBoard={saveBoard}
            setTool={setTool}
            arrows={arrows}
            addShape={addShape}
            saveTitle={saveTitle}
            isEditingTitle={isEditingTitle}
            setIsEditingTitle={setIsEditingTitle}
            undo={undo}
            redo={redo}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetZoom={resetZoom}
            selectedId={selectedId}
            shapes={shapes}
            setShapes={setShapes}
            saveHistory={saveHistory}
            exportPNG={exportPNG}
            exportPDF={exportPDF}
            grid={grid}
            setGrid={setGrid}
            setArrows={setArrows}
            shapeRefs={shapeRefs}
            pendingShapeType={pendingShapeType}
            setPendingShapeType={setPendingShapeType}
            stageRef={stageRef}
            stageSize={stageSize}
            connectingFrom={connectingFrom}
            setSelectedId={setSelectedId}
            setSelectedArrowId={setSelectedArrowId}
            setShowCollabModal={setShowCollabModal}
            eraseWholeCanvas={eraseWholeCanvas}
            pendingRequests={pendingRequests}
            setPendingRequests={setPendingRequests}
          />
        </div>
      )}

      {/* CANVAS AREA — baaki poori height */}
      <div className="relative flex-1 overflow-hidden">
        {/* Konva Canvas */}
        <div
          className={
            pendingShapeType
              ? "cursor-crosshair"
              : tool === "freehand"
                ? "cursor-pencil"
                : tool === "eraser"
                  ? ""
                  : "cursor-default"
          }
        >
          <StageCanvas
            stageRef={stageRef}
            stageSize={stageSize}
            setSelectedId={setSelectedId}
            arrows={arrows}
            shapes={shapes}
            shapeRefs={shapeRefs}
            updateArrowPoints={updateArrowPoints}
            handleDragEnd={handleDragEnd}
            handleTransformEnd={handleTransformEnd}
            handleTextDblClick={handleTextDblClick}
            setContextShape={setContextShape}
            transformerRef={transformerRef}
            selectedId={selectedId}
            handleShapeClick={handleShapeClick}
            grid={grid}
            addShape={addShape}
            pendingShapeType={pendingShapeType}
            setPendingShapeType={setPendingShapeType}
            tool={tool}
            isDrawing={isDrawing}
            startFreehandDraw={startFreehandDraw}
            continueFreehandDraw={continueFreehandDraw}
            endFreehandDraw={endFreehandDraw}
            selectedArrowId={selectedArrowId}
            setSelectedArrowId={setSelectedArrowId}
            remoteCursors={remoteCursors}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
          />
        </div>

        {showCollabModal && (
          <CollabModal
            boardId={boardId}
            onClose={() => setShowCollabModal(false)}
          />
        )}

        {/* AI Suggestion Panel — mid left, canvas ke andar */}
        {!fullScreen && aiPanelOpen && (
          <AisuggestionPannel
            suggestions={aiResponse?.suggestions}
            summary={aiResponse?.summary}
            diagramType={aiResponse?.diagram_type}
            onClose={() => setAiPanelOpen(false)}
            loading={aiLoading}
            onAddToNotes={async () => {
              const newNote = {
                id: crypto.randomUUID(),
                text: `${aiResponse?.summary}\n\n${aiResponse?.suggestions
                  .map((s) => `• ${s.title}: ${s.message}`)
                  .join("\n")}`,
                source: "AI",
                createdAt: new Date().toISOString(),
              };
              addToNotes(newNote);
            }}
          />
        )}

        {/* ContextPanel — bottom center, SelectionControls ke upar */}
        {!fullScreen && contextShape && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-[35vw] max-w-xl max-h-[60vh]">
            {" "}
            {/* ← max-h-[60vh] add-kiya */}
            <ContextPanel
              shape={contextShape}
              onClose={() => setContextShape(null)}
              onSave={(updatedShape) => {
                setShapes(
                  shapes.map((s) =>
                    s.id === updatedShape.id ? updatedShape : s,
                  ),
                );
                setContextShape(null);
              }}
            />
          </div>
        )}

        {/* SelectionControls — bottom center */}
        {!fullScreen && (selectedId || tool === "freehand") && (
          <div
            className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-200 ${
              contextShape ? "opacity-40 pointer-events-none" : "opacity-100"
            }`}
          >
            <SelectionControls
              shapes={shapes}
              selectedId={selectedId}
              tool={tool}
              pencilColor={pencilColor}
              setPencilColor={setPencilColor}
              pencilStrokeWidth={pencilStrokeWidth}
              setPencilStrokeWidth={setPencilStrokeWidth}
              setShapes={setShapes}
              saveHistory={saveHistory}
              setContextShape={setContextShape}
              addLabel={addLabel}
              setSelectedId={setSelectedId}
              updateColorEmiter={updateColorEmiter}
            />
          </div>
        )}

        {/* CanvasControls — bottom left */}
        {!fullScreen && (
          <div className="absolute bottom-4 left-4 z-40">
            <CanvasControls
              undo={undo}
              redo={redo}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
              resetZoom={resetZoom}
              grid={grid}
              setGrid={setGrid}
            />
          </div>
        )}

        <div className="absolute bottom-6 right-7 z-49  rounded-md px-1.5! pt-1.5! bg-base-300">
          <button onClick={() => setFullScreen((prev) => !prev)}>
            {fullScreen ? <Minimize /> : <Maximize />}
          </button>
        </div>
      </div>

      {/* Notes Page — right side slide-in */}
      {notesShowing && (
        <div className="absolute right-0 top-0 h-full z-50 shadow-xl border-l border-base-300 w-[clamp(260px,25vw,380px)] overflow-hidden">
          <NotesPage
            boardNotes={boardNotes}
            onDelete={(id) => removeNotes(id)}
            updateNote={updateNote}
            addNotes={addToNotes}
            setNotesShowing={setNotesShowing}
          />
        </div>
      )}
    </div>
  );
}
