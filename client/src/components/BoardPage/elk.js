import ELK from "elkjs";

const elk = new ELK();

// layout config acc. to Diagram type
const getLayoutOptions = (diagramType) => {
  const baseOptions = {
    "elk.spacing.nodeNode": "80",
    "elk.layered.spacing.nodeNodeBetweenLayers": "100",
  };

  const configs = {
    flowchart: {
      ...baseOptions,
      "elk.algorithm": "layered",
      "elk.direction": "DOWN", // Flowcharts top-to-bottom
      "elk.layered.spacing.edgeNodeBetweenLayers": "40",
    },
    architecture: {
      ...baseOptions,
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT", // Architecture left-to-right
      "elk.layered.spacing.nodeNodeBetweenLayers": "120",
    },
    er_diagram: {
      ...baseOptions,
      "elk.algorithm": "organic", // ER diagrams organic layout
      "elk.spacing.nodeNode": "120",
    },
    mindmap: {
      ...baseOptions,
      "elk.algorithm": "radial", // Mind maps radial
      "elk.radial.radius": "200",
    },
    default: {
      ...baseOptions,
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
    },
  };

  return configs[diagramType] || configs.default;
};

const getShapeSize = (shape) => {
  switch (shape.type) {
    case "circle":
      return {
        width: (shape.radius || 50) * 2,
        height: (shape.radius || 50) * 2,
      };
    case "ellipse":
      return {
        width: (shape.radiusX || 50) * 2,
        height: (shape.radiusY || 50) * 2,
      };
    case "diamond":
    case "triangle":
    case "parallelogram":
      if (shape.points && shape.points.length > 0) {
        const xs = shape.points.filter((_, i) => i % 2 === 0);
        const ys = shape.points.filter((_, i) => i % 2 === 1);
        const width = Math.max(...xs) - Math.min(...xs);
        const height = Math.max(...ys) - Math.min(...ys);
        return { width: width || 100, height: height || 80 };
      }
      return { width: 100, height: 80 };
    case "rect":
    case "roundedRect":
    case "text":
    default:
      return { width: shape.width || 100, height: shape.height || 70 };
  }
};

export const getElkPositions = async (
  shapes,
  edges,
  diagramType = "default",
) => {
  const shapeIds = new Set(shapes.map((s) => s.id));
  const validEdges = edges.filter(
    (e) => shapeIds.has(e.from) && shapeIds.has(e.to) && e.from !== e.to,
  );

  const uniqueEdges = [];
  const edgeSet = new Set();
  validEdges.forEach((e) => {
    const key = `${e.from}-${e.to}`;
    const reverseKey = `${e.to}-${e.from}`;
    if (!edgeSet.has(key) && !edgeSet.has(reverseKey)) {
      edgeSet.add(key);
      uniqueEdges.push(e);
    }
  });

  const graph = {
    id: "root",
    layoutOptions: getLayoutOptions(diagramType),
    children: shapes.map((s) => {
      const size = getShapeSize(s);
      return {
        id: s.id,
        width: size.width,
        height: size.height,
      };
    }),
    edges: uniqueEdges.map((e, index) => ({
      id: `edge-${index}-${e.from}-${e.to}`,
      sources: [e.from],
      targets: [e.to],
    })),
  };

  try {
    const result = await elk.layout(graph);
    return result.children;
  } catch (error) {
    console.error("ELK layout error:", error);

    return shapes.map((s) => ({
      id: s.id,
      x: s.x,
      y: s.y,
      width: getShapeSize(s).width,
      height: getShapeSize(s).height,
    }));
  }
};
