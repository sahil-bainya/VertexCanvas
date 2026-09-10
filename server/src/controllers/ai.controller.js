import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import groq from "../config/groq.js";
import { APIError } from "groq-sdk";

const AI_MODELS = {
  assist: "openai/gpt-oss-120b",
  cleanup: "openai/gpt-oss-20b",
  textToDiagram: "openai/gpt-oss-120b",
};

const getDiagramTypeInstructions = (selectedType) => {
  const typeInstructions = {
    flowchart: `
This is a FLOWCHART. Follow these conventions strictly:
- Use "roundedRect" for start/end points
- Use "diamond" for every decision/conditional point
- Use "rect" for process/action steps
- Flow should be logical, mostly top-to-bottom or left-to-right`,

    er_diagram: `
This is an ENTITY-RELATIONSHIP (ER) DIAGRAM. Follow these conventions strictly:
- Use "rect" for entities (e.g. "User", "Order", "Product")
- Each entity's text should represent the table/entity name only
- Arrows represent relationships between entities (one-to-many, many-to-many)
- Do NOT use diamond or ellipse shapes — only rect for entities`,

    architecture: `
This is a SYSTEM ARCHITECTURE DIAGRAM. Follow these conventions strictly:
- Use "rect" for services, APIs, and application components
- Use "ellipse" for external systems, third-party services, or actors (e.g. "User", "Payment Gateway")
- Use "cylinder"-like representation via "roundedRect" for databases if no cylinder shape exists
- Arrows represent data flow or API calls between components`,

    mindmap: `
This is a MIND MAP. Follow these conventions strictly:
- Use "ellipse" or "circle" for the central idea and main branches
- Use "rect" for sub-points or details branching outward
- Arrows/connections radiate outward from the central idea`,

    auto: `
First, analyze the user's description and DETECT the most appropriate diagram type
(flowchart, er_diagram, architecture, or mindmap) based on the content. Then apply
the shape conventions appropriate to that detected type:
- Flowchart → roundedRect (start/end), diamond (decisions), rect (steps)
- ER diagram → rect for entities only, arrows for relationships
- Architecture → rect for services, ellipse for external systems/actors
- Mind map → ellipse/circle for central idea, rect for branches
Choose whichever type best matches the description's content and intent.`,
  };

  return typeInstructions[selectedType] || typeInstructions.auto;
};

const diagramSchema = {
  type: "object",
  properties: {
    shapes: {
      type: "array",
      items: {
        anyOf: [
          // rect / roundedRect — share the same fields
          {
            type: "object",
            description: "A rectangular or rounded-rectangular shape",
            properties: {
              id: {
                type: "string",
                description: "Sequential numeric string id, e.g. '1'",
              },
              type: { type: "string", enum: ["rect", "roundedRect"] },
              x: { type: "number" },
              y: { type: "number" },
              width: { type: "number" },
              height: { type: "number" },
              text: {
                type: "string",
                description: "Short label, max 3-4 words",
              },
              fill: { type: "string", description: "Hex color, e.g. #e0f2fe" },
              stroke: {
                type: "string",
                description: "Hex color, e.g. #0369a1",
              },
            },
            required: [
              "id",
              "type",
              "x",
              "y",
              "width",
              "height",
              "text",
              "fill",
              "stroke",
            ],
            additionalProperties: false,
          },
          // circle
          {
            type: "object",
            description: "A circular shape",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["circle"] },
              x: { type: "number" },
              y: { type: "number" },
              radius: { type: "number", description: "Roughly 50-70" },
              text: { type: "string" },
              fill: { type: "string" },
              stroke: { type: "string" },
            },
            required: [
              "id",
              "type",
              "x",
              "y",
              "radius",
              "text",
              "fill",
              "stroke",
            ],
            additionalProperties: false,
          },
          // ellipse
          {
            type: "object",
            description: "An elliptical shape",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["ellipse"] },
              x: { type: "number" },
              y: { type: "number" },
              radiusX: { type: "number" },
              radiusY: { type: "number" },
              text: { type: "string" },
              fill: { type: "string" },
              stroke: { type: "string" },
            },
            required: [
              "id",
              "type",
              "x",
              "y",
              "radiusX",
              "radiusY",
              "text",
              "fill",
              "stroke",
            ],
            additionalProperties: false,
          },
          // diamond
          {
            type: "object",
            description: "A diamond/decision shape",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["diamond"] },
              x: { type: "number" },
              y: { type: "number" },
              points: {
                type: "array",
                description:
                  "Exactly 8 numbers: 4 relative vertices [x1,y1,x2,y2,x3,y3,x4,y4], e.g. [0,-40,40,0,0,40,-40,0]",
                items: { type: "number" },
              },
              text: { type: "string" },
              fill: { type: "string" },
              stroke: { type: "string" },
            },
            required: [
              "id",
              "type",
              "x",
              "y",
              "points",
              "text",
              "fill",
              "stroke",
            ],
            additionalProperties: false,
          },
        ],
      },
    },
    arrows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "e.g. 'a1'" },
          from: { type: "string", description: "Must match a shape id above" },
          to: { type: "string", description: "Must match a shape id above" },
        },
        required: ["id", "from", "to"],
        additionalProperties: false,
      },
    },
  },
  required: ["shapes", "arrows"],
  additionalProperties: false,
};

const architectureAssist = asyncHandler(async (req, res) => {
  const { shapes, arrows } = req.body;
  if (!shapes || shapes.length === 0) {
    throw new ApiError(400, "Canvas is empty");
  }
  const diagramDescription = shapes
    .map((shape) => {
      return `${shape.type} at (${shape.x}, ${shape.y}) — label: "${shape.text || shape.type}"`;
    })
    .join("\n");

  const connectionDescription = arrows
    .map((arrow) => {
      const from = shapes.find((s) => s.id === arrow.from);
      const to = shapes.find((s) => s.id === arrow.to);
      return `"${from?.text || from?.type}" connects to "${to?.text || to?.type}"`;
    })
    .join("\n");

  const prompt = `
You are an expert diagram analyzer and software architect.
Analyze the following diagram and first identify what type it is, then provide relevant suggestions.

COMPONENTS:
${diagramDescription}

CONNECTIONS:
${connectionDescription.length > 0 ? connectionDescription : "No connections defined yet"}

STEP 1 — Detect diagram type:
- flowchart → if it shows a process or algorithm flow
- architecture → if it shows system components, services, databases
- mind_map → if it shows ideas branching from a center
- er_diagram → if it shows database entities and relations
- general → if it does not fit any specific type
- minimal → ONLY if there is truly nothing to analyze (a single shape with no label, an unconnected line, or empty/meaningless content)

STEP 2 — Based on detected type, provide relevant suggestions:

If FLOWCHART:
- Describe the algorithm this flowchart represents, even if it's a short 2-3 step process
- Point out any logical errors or missing steps
- Suggest one or two concrete improvements

If ARCHITECTURE:
- Missing components relevant to what's already drawn (even a 2-3 component diagram can be missing something important, like an API gateway between a client and database)
- Database or API recommendations based on the components shown
- Scaling, performance, or security considerations if relevant to the components present

If ER_DIAGRAM:
- Missing relationships, normalization issues, index recommendations

If MIND_MAP:
- Missing branches, better organization

If GENERAL:
- Explain what the diagram represents
- Point out any errors or genuinely useful improvements

If MINIMAL (truly empty/meaningless only):
- Briefly say there isn't enough content to analyze
- Return an empty or near-empty suggestions array

IMPORTANT — calibrate suggestion depth correctly:
- A diagram with even 2-3 meaningfully labeled and connected components (e.g. "User" → "App" → "Database") DOES have something worth analyzing. Give 2-4 genuinely useful, specific suggestions for it — don't under-respond just because it's small.
- Only return few or zero suggestions when the diagram is truly minimal — unlabeled shapes, a stray line, or no real structure at all.
- Larger, more complex diagrams (5+ components with multiple connections) can have up to 6 suggestions.
- Every suggestion must reference the actual component names from the diagram — never generic, textbook advice that could apply to any diagram.
- Do not pad with filler suggestions just to reach a count, but do not artificially shrink the response either. Match the response to what is genuinely useful for this specific diagram.

Return ONLY this JSON, nothing else:
{
  "diagram_type": "flowchart|architecture|er_diagram|mind_map|general|minimal",
  "summary": "1-2 sentences describing what this diagram represents",
  "suggestions": [
    {
      "type": "error|improvement|missing|algorithm|recommendation",
      "title": "short title",
      "message": "detailed actionable suggestion"
    }
  ]
}
`;
  const response = await groq.chat.completions.create({
    model: AI_MODELS["assist"],
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  if (!response) {
    throw new ApiError(500, "Groq Error");
  }
  const result = JSON.parse(response.choices[0].message.content);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Suggestions generated"));
});

const messCleanup = asyncHandler(async (req, res) => {
  const { shapes, arrows } = req.body;
  if (!shapes || shapes.length === 0) {
    throw new APIError(400, "Canvas is empty");
  }

  const prompt = `
You are a diagram analysis expert. Analyze these shapes and determine their 
logical relationships to help organize a messy diagram.

SHAPES (with full details):
${JSON.stringify(
  shapes.map((s) => ({
    id: s.id,
    label: s.text || s.type,
    type: s.type,
    position: { x: Math.round(s.x), y: Math.round(s.y) },
    size: s.width
      ? { width: s.width, height: s.height }
      : s.radius
        ? { radius: s.radius }
        : s.radiusX
          ? { radiusX: s.radiusX, radiusY: s.radiusY }
          : null,
  })),
  null,
  2,
)}

EXISTING CONNECTIONS:
${JSON.stringify(
  arrows.map((a) => {
    const from = shapes.find((s) => s.id === a.from);
    const to = shapes.find((s) => s.id === a.to);
    return {
      from: a.from,
      fromLabel: from?.text || from?.type,
      to: a.to,
      toLabel: to?.text || to?.type,
    };
  }),
  null,
  2,
)}

YOUR TASK:
1. Keep ALL existing connections (do not remove any)
2. Analyze shape labels and spatial positions
3. Add missing logical relationships between shapes
4. Shapes that are spatially close AND semantically related should be connected
5. Consider typical diagram patterns:
   - Flowcharts: sequential steps
   - Architecture: layers (frontend → backend → database)
   - ER diagrams: entities and their relationships

RULES:
- Only use IDs from the shapes list above
- Do NOT create connections to non-existent shapes
- Do NOT create duplicate connections
- If shapes have no logical relationship, do not force a connection
- Total nodes must be exactly ${shapes.length}

Return ONLY this JSON, nothing else:
{
  "nodes": [{ "id": "exact_shape_id", "label": "shape_label" }],
  "edges": [{ "from": "exact_id", "to": "exact_id" }]
}
`;

  const response = await groq.chat.completions.create({
    model: AI_MODELS["cleanup"],
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  if (!response) {
    throw new ApiError(500, "Groq error");
  }

  const result = JSON.parse(response.choices[0].message.content);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Logical relations identified"));
});

const textToDiagram = asyncHandler(async (req, res) => {
  const { description, startX = 100, startY = 100, selectedType } = req.body;
  if (!description || description.trim().length === 0) {
    throw new ApiError(400, "Description is required");
  }

  const prompt = `
You are an expert at converting natural language descriptions into structured diagrams.

USER DESCRIPTION:
"${description}"

DIAGRAM TYPE:
${getDiagramTypeInstructions(selectedType)}

CANVAS GUIDELINES:
Start the first shape at approximately x:${startX}, y:${startY} — this is the next
available empty area on the canvas. Assume a logical canvas area of approximately
1400 x 900 units extending from this starting point.
Distribute shapes within this area in a way that looks natural and readable —
do not place all shapes in a tiny cluster, and do not spread them so far apart
that the diagram looks sparse or disconnected. If there are many components
(more than 6-7), it is acceptable to use a more compact spacing or wrap into
multiple rows, but always stay reasonably close to this logical area.

STYLING (use color purposefully, not randomly):
- fill: use a light, muted color appropriate to the shape's role. Use HEX colors only.
  Examples: "#e0f2fe" (light blue, for systems/data), "#fef9c3" (light yellow, for decisions),
  "#dcfce7" (light green, for start/success), "#fee2e2" (light red, for errors/failure/end),
  "#f3f4f6" (light gray, for general/neutral steps)
- stroke: use a darker shade that complements the fill

Your task:
1. Identify all distinct components, entities, or steps mentioned
2. Identify the relationships or flow between them
3. Convert this into shapes and arrows following the DIAGRAM TYPE conventions above

RULES:
- Each shape's width should be based on text length (estimate: text length * 7 + 30, minimum 40, maximum 240)
- Use consistent height of 70 for rect/roundedRect; for diamond/ellipse/circle, use a radius/size of roughly 50-70
- Arrange shapes in a logical flow — left-to-right for processes, top-to-bottom for hierarchies
- Space shapes at least 180px apart horizontally and 140px apart vertically
- Use sequential numeric strings as ids: "1", "2", "3"...
- If the description implies a decision or branching, create multiple arrows from the diamond shape
- Keep shape labels short and clear — max 3-4 words
- Do not invent components that were not mentioned or clearly implied
`;

  const response = await groq.chat.completions.create({
    model: AI_MODELS["textToDiagram"],
    messages: [{ role: "user", content: prompt }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "diagram_generation",
        strict: true,
        schema: diagramSchema,
      },
    },
  });
  if (!response) {
    throw new ApiError(500, "Groq error");
  }
  const result = JSON.parse(response.choices[0].message.content);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Diagram generated successfully"));
});

export { architectureAssist, messCleanup, textToDiagram };
