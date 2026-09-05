import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

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
) {
  const socketRef = useRef(null);
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", {
      withCredentials: true, // cookie-bhi-bhejni-hai, JWT-ke-liye (auth-baad-mein-add-karenge)
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to server:", socketRef.current.id);
    });

    socketRef.current.emit("join-board", boardId);

    socketRef.current.on("shape-moved", ({ shapeId, x, y, rotation }) => {
      onShapeMoved({ shapeId, x, y, rotation });
    });

    socketRef.current.on("shape-added", ({ shapeId, x, y, type }) => {
      onShapeAdded({ shapeId, x, y, type });
    });

    socketRef.current.on("shape-deleted", ({ shapeId }) => {
      onShapedeleted(shapeId);
    });

    socketRef.current.on("shape-transformed", (data) => {
      onShapeTransformed(data);
    });
    socketRef.current.on("arrow-connected", (data) => {
      onArrowConnected(data);
    });

    socketRef.current.on("label-updated", ({ shapeId, updatedText }) => {
      onUpdateLabel({ shapeId, updatedText });
    });
    socketRef.current.on("color-updated", ({ shapeId, key, value }) => {
      onColorUpdated({ shapeId, key, value });
    });

    socketRef.current.on("arrow-deleted", ({ arrowId }) => {
      onArrowDeleted(arrowId);
    });

    socketRef.current.on("freehand-start", (data) => {
      onFreehandStart(data);
    });

    socketRef.current.on("freehand-points-binary", (data) => {
      onFreehandPoints(data);
    });
    socketRef.current.on("cursor-move-binary", (data) => {
      onCursorMove(data);
    });
    socketRef.current.on("user-left", (data) => {
      onUserLeft(data);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [boardId]);

  return socketRef;
}
