import jsPDF from "jspdf";
import { useState, useRef, useEffect } from "react";
import api from "../../services/api.js";
import { useParams } from "react-router-dom";
import { SHAPE_CONFIG } from "./shapeConfig.jsx";
import { getShapeCenter, getShapeEdgePoint } from "./canvasHelper.js";
import { useSelector } from "react-redux";
import { useSocket } from "./useSocket.js";

export function useBoard() {
  const { id } = useParams();
  const boardId = id;
  const theme = useSelector((state) => state.theme.mode);

  const getDefaultStrokeColor = () =>
    theme === "dark" || theme === "luxury" || theme === "sunset"
      ? "#ffffff"
      : "#000000";

  const [shapes, setShapes] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [boardNotes, setBoardNotes] = useState([]);
  const [boardName, setBoardName] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [tool, setTool] = useState("select");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const shapeRefs = useRef({});

  const toolbarRef = useRef(null);
  const [connectingFrom, setConnectingFrom] = useState(null);

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [canvasChangedSinceAI, setCanvasChangedSinceAI] = useState(true);

  const [pendingShapeType, setPendingShapeType] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const currentFreehandId = useRef(null); // jo-shape-abhi-draw-ho-rahi-hai, uski-id-yaad-rakhne-ke-liye
  const [pencilColor, setPencilColor] = useState(getDefaultStrokeColor());
  const [pencilStrokeWidth, setPencilStrokeWidth] = useState(3);

  const [fullScreen, setFullScreen] = useState(false);
  const [selectedArrowId, setSelectedArrowId] = useState(null);

  const saveHistory = () => {
    setPast((prev) => [...prev, { shapes, arrows }]);
    setFuture([]);
    setCanvasChangedSinceAI(true);
  };

  const removeArrowsForShape = (id) => {
    saveHistory();
    setArrows((prev) => prev.filter((a) => a.from !== id && a.to !== id));
  };
  const updateColorEmiter = (shapeId, key, value) => {
    if (socketRef.current) {
      socketRef.current.emit("color-updated", {
        boardId,
        shapeId,
        key,
        value,
      });
    }
  };
  const updateArrowPoints = (movedId) => {
    setArrows((prev) =>
      prev.map((arrow) => {
        if (arrow.from !== movedId && arrow.to !== movedId) return arrow;
        const fromShape = shapes.find((s) => s.id === arrow.from);
        const toShape = shapes.find((s) => s.id === arrow.to);
        const fromNode = shapeRefs.current[arrow.from];
        const toNode = shapeRefs.current[arrow.to];
        const fromCenter = getShapeCenter(fromNode, fromShape);
        const toCenter = getShapeCenter(toNode, toShape);
        const from = getShapeEdgePoint(
          fromNode,
          fromShape,
          toCenter.x,
          toCenter.y,
        );
        const to = getShapeEdgePoint(
          toNode,
          toShape,
          fromCenter.x,
          fromCenter.y,
        );
        return { ...arrow, points: [from.x, from.y, to.x, to.y] };
      }),
    );
  };
  // Helper function to update arrows after shape update
  const updateArrowsAfterShapeUpdate = (updatedShapeId, updatedShapes) => {
    console.log("Updating arrows after shape update:", updatedShapeId);

    setArrows((prevArrows) => {
      return prevArrows.map((arrow) => {
        // Only update arrows connected to this shape
        if (arrow.from !== updatedShapeId && arrow.to !== updatedShapeId) {
          return arrow;
        }

        const fromShape = updatedShapes.find((s) => s.id === arrow.from);
        const toShape = updatedShapes.find((s) => s.id === arrow.to);
        const fromNode = shapeRefs.current[arrow.from];
        const toNode = shapeRefs.current[arrow.to];

        if (!fromShape || !toShape || !fromNode || !toNode) {
          console.log("Missing shape or node for arrow:", arrow.id);
          return arrow;
        }

        try {
          const fromCenter = getShapeCenter(fromNode, fromShape);
          const toCenter = getShapeCenter(toNode, toShape);

          const from = getShapeEdgePoint(
            fromNode,
            fromShape,
            toCenter.x,
            toCenter.y,
          );
          const to = getShapeEdgePoint(
            toNode,
            toShape,
            fromCenter.x,
            fromCenter.y,
          );

          return { ...arrow, points: [from.x, from.y, to.x, to.y] };
        } catch (error) {
          console.error("Error updating arrow points:", error);
          return arrow;
        }
      });
    });
  };

  const handleRemoteShapeMoved = ({ shapeId, x, y, rotation }) => {
    setShapes((prevShapes) => {
      const updatedShapes = prevShapes.map((s) =>
        s.id === shapeId ? { ...s, x, y, rotation } : s,
      );

      // Schedule arrow update after shapes are updated
      setTimeout(() => {
        updateArrowsAfterShapeUpdate(shapeId, updatedShapes);
      }, 50); // Small delay to ensure Konva nodes are updated

      return updatedShapes;
    });
  };

  const handleRemoteShapeAdded = ({ shapeId, x, y, type }) => {
    const color = getDefaultStrokeColor();
    saveHistory();
    setShapes((prev) => [
      // <line 68
      ...prev,
      {
        id: shapeId,
        type,
        x,
        y,
        ...SHAPE_CONFIG[type].defaults,
        ...(type === "text"
          ? { fill: color, isDefaultColor: true }
          : { stroke: color, isDefaultColor: true }),
        context: { notes: "", links: [], code: "" },
      },
    ]);
  };

  const handleRemoteShapeDeleted = (shapeId) => {
    console.log(`handle remote shape deleted ${shapeId}`);
    saveHistory();
    setShapes((prev) => prev.filter((s) => s.id !== shapeId));
    removeArrowsForShape(shapeId);
  };

  const handleRemoteShapeTransformed = ({
    shapeId,
    x,
    y,
    rotation,
    ...rest
  }) => {
    setShapes((prevShapes) => {
      const updatedShapes = prevShapes.map((s) =>
        s.id === shapeId ? { ...s, x, y, rotation, ...rest } : s,
      );

      // Schedule arrow update after shapes are updated
      setTimeout(() => {
        updateArrowsAfterShapeUpdate(shapeId, updatedShapes);
      }, 50);

      return updatedShapes;
    });
  };

  const handleRemoteArrowConnected = ({
    arrowId,
    fromId,
    toId,
    points,
    stroke,
    fill,
  }) => {
    setArrows((prev) => [
      ...prev,
      {
        id: arrowId,
        from: fromId,
        to: toId,
        points,
        stroke,
        fill,
        isDefaultColor: true,
      },
    ]);
  };

  const handleRemoteLabelUpdated = ({ shapeId, updatedText }) => {
    saveHistory();
    console.log(`${shapeId} text ${updatedText}`);
    setShapes((prevShapes) =>
      prevShapes.map((s) =>
        s.id === shapeId ? { ...s, text: updatedText } : s,
      ),
    );
  };

  const handleRemoteColorUpdated = ({ shapeId, key, value }) => {
    saveHistory();
    setShapes((prev) =>
      prev.map((s) => (s.id === shapeId ? { ...s, [key]: value } : s)),
    );
  };

  const handleRemoteArrowDeleted = (arrowId) => {
    saveHistory();
    setArrows((prev) => prev.filter((a) => a.id !== arrowId));
  };

  const handleRemoteFreehandStart = ({
    shapeId,
    point,
    stroke,
    strokeWidth,
  }) => {
    setShapes((prev) => [
      ...prev,
      {
        id: shapeId,
        type: "freehand",
        x: 0,
        y: 0,
        points: [point.x, point.y],
        stroke,
        strokeWidth,
        lineCap: "round",
        lineJoin: "round",
        isDefaultColor: true,
        context: { notes: [], links: [], code: "" },
      },
    ]);
  };

  const handleRemoteFreehandPoints = ({ shapeId, data }) => {
    // Convert binary to array of deltas
    const view = new Int16Array(data);
    const deltas = Array.from(view);

    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== shapeId) return s;

        // Reconstruct points from deltas
        const points = [...s.points];
        let lastX = points[points.length - 2];
        let lastY = points[points.length - 1];

        for (let i = 0; i < deltas.length; i += 2) {
          lastX += deltas[i];
          lastY += deltas[i + 1];
          points.push(lastX, lastY);
        }

        return { ...s, points };
      }),
    );
  };

  const socketRef = useSocket(
    boardId,
    handleRemoteShapeMoved,
    handleRemoteShapeAdded,
    handleRemoteShapeDeleted,
    handleRemoteShapeTransformed,
    handleRemoteArrowConnected,
    handleRemoteLabelUpdated,
    handleRemoteColorUpdated,
    handleRemoteArrowDeleted,
    handleRemoteFreehandStart,
    handleRemoteFreehandPoints,
  );

  useEffect(() => {
    const newColor = getDefaultStrokeColor();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShapes((prev) =>
      prev.map((s) =>
        s.isDefaultColor
          ? s.type === "text"
            ? { ...s, fill: newColor }
            : { ...s, stroke: newColor }
          : s,
      ),
    );
    setArrows((prev) =>
      prev.map((a) =>
        a.isDefaultColor ? { ...a, stroke: newColor, fill: newColor } : a,
      ),
    );
    setPencilColor(getDefaultStrokeColor());
  }, [theme]);

  const addLabel = (shapeId, updatedText) => {
    console.log(`${shapeId} text - ${updatedText}`);
    if (socketRef.current) {
      socketRef.current.emit("label-updated", {
        boardId,
        shapeId,
        updatedText,
      });
    }
  };
  // export
  const exportPNG = () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 2 }); // high quality

    const link = document.createElement("a");
    link.download = `${boardName || "board"}.png`;
    link.href = dataURL;
    link.click();
  };

  const exportPDF = () => {
    const stage = stageRef.current;
    const dataURL = stage.toDataURL({ pixelRatio: 2 });

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [stage.width(), stage.height()],
    });

    pdf.addImage(dataURL, "PNG", 0, 0, stage.width(), stage.height());
    pdf.save(`${boardName || "board"}.pdf`);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, -1));
    setFuture((prev) => [{ shapes, arrows }, ...prev]);
    setShapes(previous.shapes);
    setArrows(previous.arrows);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [...prev, { shapes, arrows }]);
    setShapes(next.shapes);
    setArrows(next.arrows);
  };

  //Zoom
  const zoomIn = () => {
    const stage = stageRef.current;
    const newScale = Math.min(stage.scaleX() * 1.2, 5);
    stage.scale({ x: newScale, y: newScale });
  };

  const zoomOut = () => {
    const stage = stageRef.current;
    const newScale = Math.max(stage.scaleX() / 1.2, 0.1);
    stage.scale({ x: newScale, y: newScale });
  };

  const resetZoom = () => {
    const stage = stageRef.current;
    stage.scale({ x: 1, y: 1 });
    stage.position({
      x: stageSize.width / 2,
      y: stageSize.height / 2,
    });
  };

  const connectShapes = (fromId, toId) => {
    saveHistory();
    const color = getDefaultStrokeColor();
    const fromShape = shapes.find((s) => s.id === fromId);
    const toShape = shapes.find((s) => s.id === toId);
    const fromNode = shapeRefs.current[fromId];
    console.log(`from node : ${fromNode}`);
    console.log(fromNode);
    const toNode = shapeRefs.current[toId];
    console.log(`to node : ${toNode}`);
    const fromCenter = getShapeCenter(fromNode, fromShape);
    const toCenter = getShapeCenter(toNode, toShape);
    const from = getShapeEdgePoint(fromNode, fromShape, toCenter.x, toCenter.y);
    const to = getShapeEdgePoint(toNode, toShape, fromCenter.x, fromCenter.y);
    const arrowId = crypto.randomUUID();
    const points = [from.x, from.y, to.x, to.y];
    setArrows((prev) => [
      ...prev,
      {
        id: arrowId,
        from: fromId,
        to: toId,
        points: [from.x, from.y, to.x, to.y],
        stroke: color,
        fill: color,
        isDefaultColor: true, // ←
      },
    ]);
    if (socketRef.current) {
      socketRef.current.emit("arrow-connected", {
        boardId,
        arrowId,
        fromId,
        toId,
        points,
        stroke: color,
        fill: color,
      });
    }
  };

  const handleTextDblClick = (id) => {
    const node = shapeRefs.current[id];
    const stage = stageRef.current;

    node.hide();
    transformerRef.current.hide();

    const stageBox = stage.container().getBoundingClientRect();
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    textarea.value = node.text();
    textarea.style.position = "absolute";
    textarea.style.top = stageBox.top + node.absolutePosition().y + "px";
    textarea.style.left = stageBox.left + node.absolutePosition().x + "px";
    textarea.style.fontSize = node.fontSize() + "px";
    textarea.style.border = "1px dashed #999";
    textarea.style.padding = "0px";
    textarea.style.margin = "0px";
    textarea.style.background = "transparent";
    textarea.style.resize = "none";
    textarea.style.outline = "none";
    textarea.style.overflow = "hidden";
    textarea.style.whiteSpace = "pre";
    textarea.style.minWidth = "50px";
    textarea.style.minHeight = node.fontSize() * 1.2 + "px";

    const autoResize = () => {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
      const span = document.createElement("span");
      span.style.cssText = `
      position: absolute; visibility: hidden;
      white-space: pre; font-size: ${node.fontSize()}px;
      font-family: Arial; line-height: 1.2; padding: 0;
      `;
      const longestLine = textarea.value
        .split("\n")
        .reduce((a, b) => (a.length > b.length ? a : b), "");
      span.textContent = longestLine || " ";
      document.body.appendChild(span);
      textarea.style.width = Math.max(50, span.offsetWidth + 10) + "px";
      document.body.removeChild(span);
    };

    autoResize();
    textarea.addEventListener("input", autoResize);
    textarea.focus();
    textarea.select();

    const save = () => {
      if (!document.body.contains(textarea)) return;
      saveHistory();
      setShapes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, text: textarea.value } : s)),
      );
      if (socketRef.current) {
        socketRef.current.emit("label-updated", {
          boardId,
          shapeId: id,
          updatedText: textarea.value,
        });
      }
      textarea.removeEventListener("input", autoResize);
      document.body.removeChild(textarea);
      node.show();
      transformerRef.current.show();
      transformerRef.current.getLayer().batchDraw();
    };

    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Escape") save();
    });
    textarea.addEventListener("blur", save);
    stage.container().addEventListener("mousedown", save, { once: true });
  };

  const addShape = (type, x = -50, y = -40) => {
    saveHistory();
    const color = getDefaultStrokeColor();
    const id = crypto.randomUUID();
    setShapes((prev) => [
      ...prev,
      {
        id,
        type,
        x,
        y,
        ...SHAPE_CONFIG[type].defaults,
        ...(type === "text"
          ? { fill: color, isDefaultColor: true }
          : { stroke: color, isDefaultColor: true }),
        context: { notes: "", links: [], code: "" },
      },
    ]);
    console.log("add shape moved called ", id);
    setSelectedId(id);
    if (socketRef.current) {
      socketRef.current.emit("shape-added", {
        boardId: boardId,
        shapeId: id,
        x: x,
        y: y,
        type: type,
      });
    }
  };

  const handleDragEnd = (e, id) => {
    saveHistory();
    const newX = e.target.x();
    const newY = e.target.y();
    const newRotation = e.target.rotation();
    setShapes((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              x: newX,
              y: newY,
              rotation: newRotation,
            }
          : s,
      ),
    );
    updateArrowPoints(id);
    console.log("handle drag end called ", id);
    if (socketRef.current) {
      socketRef.current.emit("shape-moved", {
        boardId: boardId,
        shapeId: id,
        x: newX,
        y: newY,
        rotation: newRotation,
      });
    }
  };

  const deleteSelected = (id, removeArrowsForShape) => {
    saveHistory();
    setShapes((prev) => prev.filter((s) => s.id !== id));
    removeArrowsForShape(id);
    setSelectedId(null);
    if (socketRef.current) {
      socketRef.current.emit("shape-deleted", {
        boardId: boardId,
        shapeId: id,
      });
    }
  };

  const handleTransformEnd = (id) => {
    saveHistory();
    const node = shapeRefs.current[id];
    if (!node) return;
    const shape = shapes.find((s) => s.id === id);
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    const updatedFields =
      {
        rect: () => {
          const w = Math.max(10, node.width() * scaleX);
          const h = Math.max(10, node.height() * scaleY);
          node.width(w);
          node.height(h);
          return { width: w, height: h };
        },

        roundedRect: () => {
          // rect jaisa hi hai, sirf cornerRadius bhi scale karna chahiye (consistency ke liye, optional)
          const w = Math.max(10, node.width() * scaleX);
          const h = Math.max(10, node.height() * scaleY);
          node.width(w);
          node.height(h);
          return { width: w, height: h };
        },

        circle: () => {
          const r = Math.max(5, shape.radius * scaleX);
          node.radius(r);
          return { radius: r };
        },

        ellipse: () => {
          // Ellipse ke alag-alag radiusX, radiusY hote hain — independent scale
          const rx = Math.max(5, shape.radiusX * scaleX);
          const ry = Math.max(5, shape.radiusY * scaleY);
          node.radiusX(rx);
          node.radiusY(ry);
          return { radiusX: rx, radiusY: ry };
        },

        triangle: () => {
          const newPoints = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY,
          );
          node.points(newPoints);
          return { points: newPoints };
        },

        text: () => ({ fontSize: Math.max(8, shape.fontSize * scaleX) }),

        arrow: () => {
          const newPoints = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY,
          );
          node.points(newPoints);
          return { points: newPoints };
        },

        line: () => {
          // line same pattern jaisa arrow
          const newPoints = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY,
          );
          node.points(newPoints);
          return { points: newPoints };
        },

        diamond: () => {
          // points array hai, isliye arrow/line jaisa hi scale karo
          const newPoints = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY,
          );
          node.points(newPoints);
          return { points: newPoints };
        },

        parallelogram: () => {
          // same pattern
          const newPoints = shape.points.map((p, i) =>
            i % 2 === 0 ? p * scaleX : p * scaleY,
          );
          node.points(newPoints);
          return { points: newPoints };
        },
      }[shape.type]?.() ?? {};
    const updatedX = node.x();
    const updatedY = node.y();
    const updatedRotation = node.rotation();
    const updatedShape = {
      ...shape,
      x: updatedX,
      y: updatedY,
      rotation: updatedRotation,
      ...updatedFields,
    };

    // Update shapes state
    setShapes((prev) => {
      const updatedShapes = prev.map((s) => (s.id === id ? updatedShape : s));

      // Schedule arrow update after shapes are updated
      setTimeout(() => {
        updateArrowsAfterShapeUpdate(id, updatedShapes);
      }, 50);

      return updatedShapes;
    });

    if (socketRef.current) {
      socketRef.current.emit("shape-transformed", {
        boardId: boardId,
        shapeId: id,
        x: updatedX,
        y: updatedY,
        rotation: updatedRotation,
        ...updatedFields,
      });
    }
  };

  const saveBoard = async (arrows) => {
    await api.patch(`/boards/${id}/canvas`, { canvasData: shapes, arrows });
  };

  const saveTitle = async () => {
    await api.patch(`/boards/${id}`, { title: boardName || "Untitled Board" });
  };

  const addToNotes = async (notes) => {
    const updatedNotes = [...boardNotes, notes];
    setBoardNotes(updatedNotes);
    await api.patch(`/boards/${id}/notes`, { boardNotes: updatedNotes });
  };

  const removeNotes = async (notesid) => {
    const updatedNotes = boardNotes.filter((notes) => notes.id !== notesid);
    setBoardNotes(updatedNotes);
    await api.patch(`/boards/${id}/notes`, { boardNotes: updatedNotes });
  };
  const deleteArrow = (arrowId) => {
    saveHistory();
    setArrows((prev) => prev.filter((a) => a.id !== arrowId));
    setSelectedArrowId(null);

    if (socketRef.current) {
      socketRef.current.emit("arrow-deleted", { boardId, arrowId });
    }
  };
  useEffect(() => {
    (async () => {
      const res = await api.get(`/boards/${id}`);
      setShapes(res.data.data.board.canvasData || []);
      setBoardName(res.data.data.board.title);
      setArrows(res.data.data.board.arrows);
      setBoardNotes(res.data.data.board.boardNotes || []);
      console.log(res.data.data.board.boardNotes);
    })();
  }, [id]);

  useEffect(() => {
    if (!transformerRef.current) return;
    if (selectedId) {
      const node = shapeRefs.current[selectedId];
      if (node) {
        transformerRef.current.nodes([node]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);

  useEffect(() => {
    const updateSize = () => {
      const toolbarHeight = fullScreen
        ? 0
        : toolbarRef.current?.offsetHeight || 50;
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight - toolbarHeight,
      });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [fullScreen]);

  const autoSaveTimer = useRef(null);
  const isInitialLoad = useRef(true); // taaki "load-hote-hi-save"-na-ho-jaaye

  useEffect(() => {
    // pehli-baar-jab-board-load-hota-hai, "shapes"-empty-se-populate-hota-hai — yeh-save-trigger-nahi-karna
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);

    autoSaveTimer.current = setTimeout(() => {
      saveBoard(arrows);
    }, 6000); // 1.5-second-debounce

    return () => clearTimeout(autoSaveTimer.current);
  }, [shapes, arrows]);

  const freehandBuffer = useRef([]);
  const freehandThrottleRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastSentPoint = useRef(null);
  // Helper function to send buffer

  const sendFreehandBuffer = () => {
    if (freehandBuffer.current.length === 0 || !currentFreehandId.current)
      return;

    // Convert to Int16Array (2 bytes per value)
    const buffer = new ArrayBuffer(freehandBuffer.current.length * 2);
    const view = new Int16Array(buffer);

    freehandBuffer.current.forEach((val, index) => {
      view[index] = val;
    });

    // Send binary data
    if (socketRef.current) {
      socketRef.current.emit("freehand-points-binary", {
        boardId,
        shapeId: currentFreehandId.current,
        data: buffer, // Binary data
      });
    }

    freehandBuffer.current = [];
  };

  const startFreehandDraw = (x, y) => {
    saveHistory();
    const id = crypto.randomUUID();
    currentFreehandId.current = id;
    isDrawingRef.current = true;
    lastSentPoint.current = { x, y };
    setShapes((prev) => [
      ...prev,
      {
        id,
        type: "freehand",
        x: 0, // freehand-ke-liye-x,y-ka-koi-special-matlab-nahi, points-absolute-hain
        y: 0,
        points: [x, y], // ← shuru-ka-pehla-point

        stroke: pencilColor, // ← yeh-change-karo (pehle-shayad-getDefaultStrokeColor()-tha)
        strokeWidth: pencilStrokeWidth,
        lineCap: "round",
        lineJoin: "round",
        isDefaultColor: true,
        context: { notes: [], links: [], code: "" },
      },
    ]);
    setIsDrawing(true);
    if (socketRef.current) {
      socketRef.current.emit("freehand-start", {
        boardId,
        shapeId: id,
        point: { x, y },
        stroke: pencilColor,
        strokeWidth: pencilStrokeWidth,
      });
    }
  };

  const continueFreehandDraw = (x, y) => {
    if (!isDrawing || !currentFreehandId.current) return;

    setShapes((prev) =>
      prev.map((s) =>
        s.id === currentFreehandId.current
          ? { ...s, points: [...s.points, x, y] } // ← naya-point-add-karte-jao
          : s,
      ),
    );
    // Buffer points with delta encoding
    const lastPoint = lastSentPoint.current;
    const dx = Math.round(x - lastPoint.x);
    const dy = Math.round(y - lastPoint.y);

    // Only buffer if movement is significant
    if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
      freehandBuffer.current.push(dx, dy);
      lastSentPoint.current = { x, y };
    }

    // Send every 50ms
    if (!freehandThrottleRef.current && freehandBuffer.current.length > 0) {
      freehandThrottleRef.current = setTimeout(() => {
        sendFreehandBuffer();
        freehandThrottleRef.current = null;
      }, 50);
    }
  };

  const endFreehandDraw = () => {
    if (freehandBuffer.current.length > 0) {
      sendFreehandBuffer(true);
    }

    // Cleanup
    freehandBuffer.current = [];
    isDrawingRef.current = false;
    setIsDrawing(false);
    currentFreehandId.current = null;
    lastSentPoint.current = null;

    if (freehandThrottleRef.current) {
      clearTimeout(freehandThrottleRef.current);
      freehandThrottleRef.current = null;
    }
  };

  return {
    pencilColor,
    setPencilColor,
    pencilStrokeWidth,
    setPencilStrokeWidth,
    isDrawing,
    startFreehandDraw,
    continueFreehandDraw,
    endFreehandDraw,
    saveHistory,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    shapes,
    setShapes,
    boardName,
    boardNotes,
    setBoardName,
    selectedId,
    setSelectedId,
    tool,
    setTool,
    isEditingTitle,
    setIsEditingTitle,
    stageRef,
    transformerRef,
    shapeRefs,
    toolbarRef,
    removeNotes,
    handleTextDblClick,
    addShape,
    handleDragEnd,
    deleteSelected,
    handleTransformEnd,
    getShapeEdgePoint,
    saveBoard,
    saveTitle,
    stageSize,
    arrows,
    setArrows,
    connectingFrom,
    setConnectingFrom,
    updateArrowPoints,
    connectShapes,
    removeArrowsForShape,
    getShapeCenter,
    addToNotes,
    exportPNG,
    exportPDF,
    canvasChangedSinceAI,
    setCanvasChangedSinceAI,
    pendingShapeType,
    setPendingShapeType,
    fullScreen,
    setFullScreen,
    socketRef,
    addLabel,
    updateColorEmiter,
    selectedArrowId,
    setSelectedArrowId,
    deleteArrow,
  };
}
