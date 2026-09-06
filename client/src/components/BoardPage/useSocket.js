import { useEffect } from "react";
import { useGlobalSocketContext } from "../../globalSocket/SocketContext.js";

export function useSocket(
  boardId,
  onShapeMoved,
  onShapeAdded,
  onShapedeleted,
  onShapeTransformed,
  onArrowConnected,
  onUpdateLabel,
  onColorUpdated,
  onArrowDeleted,
  onFreehandStart,
  onFreehandPoints,
  onCursorMove,
  onUserLeft,
  onCleanCanvas
) {
  const { socketRef, isConnected } = useGlobalSocketContext();

  useEffect(() => {
    if (!boardId || !isConnected || !socketRef.current) return;

    const socket = socketRef.current;

    // ===== JOIN-BOARD =====
    socket.emit("join-board", boardId);

    // ===== LISTENERS — named-functions-banaye, cleanup-ke-liye-zaroori =====
    const handleShapeMoved = ({ shapeId, x, y, rotation }) => {
      onShapeMoved({ shapeId, x, y, rotation });
    };
    const handleShapeAdded = ({ shapeId, x, y, type }) => {
      onShapeAdded({ shapeId, x, y, type });
    };
    const handleShapeDeleted = ({ shapeId }) => {
      onShapedeleted(shapeId);
    };
    const handleShapeTransformed = (data) => {
      onShapeTransformed(data);
    };
    const handleArrowConnected = (data) => {
      onArrowConnected(data);
    };
    const handleLabelUpdated = ({ shapeId, updatedText }) => {
      onUpdateLabel({ shapeId, updatedText });
    };
    const handleColorUpdated = ({ shapeId, key, value }) => {
      onColorUpdated({ shapeId, key, value });
    };
    const handleArrowDeleted = ({ arrowId }) => {
      onArrowDeleted(arrowId);
    };
    const handleFreehandStart = (data) => {
      onFreehandStart(data);
    };
    const handleFreehandPoints = (data) => {
      onFreehandPoints(data);
    };

    const handleCleanCanvas=()=>{
      onCleanCanvas();
    }
    const handleCursorMove = (data) => {
      onCursorMove(data);
    };
    const handleUserLeft = (data) => {
      onUserLeft(data);
    };
   
    socket.on("shape-moved", handleShapeMoved);
    socket.on("shape-added", handleShapeAdded);
    socket.on("shape-deleted", handleShapeDeleted);
    socket.on("shape-transformed", handleShapeTransformed);
    socket.on("arrow-connected", handleArrowConnected);
    socket.on("label-updated", handleLabelUpdated);
    socket.on("color-updated", handleColorUpdated);
    socket.on("arrow-deleted", handleArrowDeleted);
    socket.on("freehand-start", handleFreehandStart);
    socket.on("freehand-points-binary", handleFreehandPoints);
    socket.on("canvas-cleaned", handleCleanCanvas);
    socket.on("cursor-move-binary", handleCursorMove);
    socket.on("user-left", handleUserLeft);

    // ===== CLEANUP — sirf-LISTENERS-hatao, DISCONNECT-NAHI =====
    return () => {
      socket.off("shape-moved", handleShapeMoved);
      socket.off("shape-added", handleShapeAdded);
      socket.off("shape-deleted", handleShapeDeleted);
      socket.off("shape-transformed", handleShapeTransformed);
      socket.off("arrow-connected", handleArrowConnected);
      socket.off("label-updated", handleLabelUpdated);
      socket.off("color-updated", handleColorUpdated);
      socket.off("arrow-deleted", handleArrowDeleted);
      socket.off("freehand-start", handleFreehandStart);
      socket.off("freehand-points-binary", handleFreehandPoints);
      socket.off("cursor-move-binary", handleCursorMove);
      socket.off("user-left", handleUserLeft);
    };
  }, [boardId, isConnected]);

  return socketRef;
}
