import { useState, useEffect } from "react";
import {
  Wand2,
  GitBranch,
  Server,
  Database,
  Brain,
  Share2,
  Loader2,
} from "lucide-react";
import { textTodiagram } from "../../services/aiServices.js";
import { notify } from "../../utils/toast.jsx";
import {
  getShapeCenter,
  getShapeEdgePoint,
  getExistingContentBounds,
} from "./canvasHelper.js";

const sanitizeShape = (shape) => {
  const isValidHex = (color) =>
    typeof color === "string" && /^#[0-9A-F]{6}$/i.test(color);

  let sanitized = {
    ...shape,
    fill: isValidHex(shape.fill) ? shape.fill : "#f3f4f6",
    stroke: isValidHex(shape.stroke) ? shape.stroke : "#374151",
    context: shape.context || { notes: [], links: [], code: "" },
  };

  if (
    ["diamond", "parallelogram", "triangle", "line", "arrow"].includes(
      shape.type,
    )
  ) {
    if (!Array.isArray(shape.points) || shape.points.length === 0) {
      const w = (shape.width || 120) / 2;
      const h = (shape.height || 80) / 2;

      sanitized.points = [0, -h, w, 0, 0, h, -w, 0, 0, -h];
    }
    sanitized.closed = true;
  }

  return sanitized;
};

const fitStageToContent = (allShapes, stage, stageSize) => {
  if (allShapes.length === 0) return;

  const bounds = getExistingContentBounds(allShapes);
  if (!bounds) return;

  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  const contentCenterX = (bounds.minX + bounds.maxX) / 2;
  const contentCenterY = (bounds.minY + bounds.maxY) / 2;

  const padding = 100;
  const scaleX = stageSize.width / (contentWidth + padding * 2);
  const scaleY = stageSize.height / (contentHeight + padding * 2);
  const scale = Math.min(scaleX, scaleY, 1.5);
  const finalScale = Math.max(scale, 0.1);

  stage.scale({ x: finalScale, y: finalScale });
  stage.position({
    x: stageSize.width / 2 - contentCenterX * finalScale,
    y: stageSize.height / 2 - contentCenterY * finalScale,
  });
  stage.batchDraw();
};

const DIAGRAM_TYPES = [
  {
    id: "auto",
    label: "Auto Detect",
    sub: "AI chooses the best type for you",
    icon: Wand2,
    color: "text-primary",
  },
  {
    id: "flowchart",
    label: "Flowchart",
    sub: "Process flow and logic",
    icon: GitBranch,
    color: "text-blue-500",
  },
  {
    id: "architecture",
    label: "System Architecture",
    sub: "High level system design",
    icon: Server,
    color: "text-emerald-500",
  },
  {
    id: "er",
    label: "ER Diagram",
    sub: "Database structure and relations",
    icon: Database,
    color: "text-violet-500",
  },
  {
    id: "mindmap",
    label: "Mind Map",
    sub: "Ideas and concepts",
    icon: Brain,
    color: "text-pink-500",
  },
  {
    id: "dataflow",
    label: "Data Flow Diagram",
    sub: "Data movement and processing",
    icon: Share2,
    color: "text-red-500",
  },
];

const MAX_LENGTH = 1000;

export default function TextToDiagram({
  onClose,
  onLoadingChange,
  saveHistory,
  setShapes,
  setArrows,
  shapes,
  shapeRefs,
  stageRef,
  stageSize,
}) {
  const [selectedType, setSelectedType] = useState("auto");
  const [description, setDescription] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [newlyGeneratedShapes, setNewlyGeneratedShapes] = useState(null);

  const canGenerate = description.trim().length > 0 && !genLoading;

  const setLoading = (value) => {
    setGenLoading(value);
    onLoadingChange?.(value);
  };

  const handleGenerateDiagram = async () => {
    if (!description || description.trim().length === 0) {
      notify.error("Description is required");
      return;
    }

    setLoading(true);
    try {
      const currentDescription = description;
      setDescription("");
      const bounds = getExistingContentBounds(shapes);
      const suggestedStartX = bounds ? bounds.maxX + 150 : 100;
      const suggestedStartY = bounds ? bounds.minY : 100;

      const response = await textTodiagram(
        currentDescription,
        suggestedStartX,
        suggestedStartY,
        selectedType,
      );
      saveHistory();

      const idMap = {};
      const newShapes = response.shapes.map((shape) => {
        const newId = crypto.randomUUID();
        idMap[shape.id] = newId;
        return sanitizeShape({ ...shape, id: newId });
      });

      const newArrows = response.arrows.map((arrow) => ({
        ...arrow,
        id: crypto.randomUUID(),
        from: idMap[arrow.from],
        to: idMap[arrow.to],
      }));

      const allShapes = [...shapes, ...newShapes];
      setShapes(allShapes);
      setArrows((prev) => [...prev, ...newArrows]);
      setNewlyGeneratedShapes(Date.now());

      setTimeout(() => {
        fitStageToContent(allShapes, stageRef.current, stageSize);
        setLoading(false);
        onClose?.();
      }, 100);
    } catch (err) {
      notify.error(err?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!newlyGeneratedShapes) return;

    setArrows((prevArrows) =>
      prevArrows.map((arrow) => {
        const fromNode = shapeRefs.current[arrow.from];
        const toNode = shapeRefs.current[arrow.to];
        if (!fromNode || !toNode) return arrow;

        const fromShape = shapes.find((s) => s.id === arrow.from);
        const toShape = shapes.find((s) => s.id === arrow.to);

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
  }, [newlyGeneratedShapes, setArrows, shapeRefs, shapes]);

  return (
    <>
      <h4 className="font-semibold text-sm mb-2.5! px-4!">
        Select Diagram Type
      </h4>
      <div className="grid grid-cols-3 gap-2.5 mb-5! px-6!">
        {DIAGRAM_TYPES.map((type) => {
          const Icon = type.icon;
          const active = selectedType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              disabled={genLoading}
              onClick={() => setSelectedType(type.id)}
              className={`flex flex-col items-center text-center gap-1 rounded-2xl border py-3! transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-base-300 hover:border-base-content/20"
              }`}
            >
              <Icon size={20} className={type.color} />
              <span className="font-semibold text-sm leading-tight">
                {type.label}
              </span>
              <span className="text-xs text-base-content/50 leading-snug">
                {type.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div className="px-5!">
        <h4 className="font-semibold text-sm mb-2.5!">Describe your diagram</h4>
        <div className="relative ">
          <textarea
            value={description}
            maxLength={MAX_LENGTH}
            disabled={genLoading}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Create a system architecture for a food delivery app with user, restaurant, payment and delivery flow…"
            className="textarea textarea-bordered w-full h-25 resize-none text-sm rounded-2xl p-4!"
          />
          <span className="absolute bottom-3 right-4 text-xs text-base-content/40">
            {description.length}/{MAX_LENGTH}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-end p-4!">
        <button
          type="button"
          onClick={handleGenerateDiagram}
          disabled={!canGenerate}
          className="btn btn-primary gap-1.5 rounded-xl px-2!"
        >
          {genLoading && <Loader2 size={16} className="animate-spin" />}
          {genLoading ? "Generating..." : "Generate Diagram"}
        </button>
      </div>
    </>
  );
}
