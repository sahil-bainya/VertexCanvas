import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import groq from "../config/groq.js";
import { APIError } from "groq-sdk";
const aiModel="openai/gpt-oss-20b"

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
    model: aiModel,
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
You are a diagram analysis expert.
Analyze these shapes and return their logical relationships.

SHAPES:
${JSON.stringify(shapes.map((s) => ({ id: s.id, label: s.text || s.type })))}

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
)}

Rules:
- Keep ALL existing connections
- Add missing logical relationships if any
- Only use ids from the shapes list above
- Do not create connections to non-existent shapes

Return ONLY this JSON, nothing else:
{
  "nodes": [{ "id": "exact_shape_id", "label": "shape_label" }],
  "edges": [{ "from": "exact_id", "to": "exact_id" }]
}
Total nodes must be exactly ${shapes.length}.
`;

  const response = await groq.chat.completions.create({
    model: aiModel,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  if (!response) {
    throw new ApiError(500, "Groq error");
  }
  const result = JSON.parse(response.choices[0].message.content);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Logical relations indentified"));
});

const textToDiagram = asyncHandler(async (req, res) => {
  const { description, startX = 100, startY = 100 } = req.body;
  if (!description || description.trim().length === 0) {
    throw new ApiError(400, "Description is required");
  }
  const prompt = `
You are an expert at converting natural language descriptions into structured diagrams.

CRITICAL RULE — READ FIRST: Every numeric value (x, y, width, height, radius, points) 
in your final JSON output must be a single computed number. NEVER write expressions 
like "100 + 180" or "360 + 200". If you need to calculate a position, do the math 
in your head and write only the final integer result.
WRONG: "x": 100 + 180 + 180
RIGHT: "x": 460

USER DESCRIPTION:
"${description}"

CANVAS GUIDELINES:
Start the first shape at approximately x:${startX}, y:${startY} — this is the next 
available empty area on the canvas. Assume a logical canvas area of approximately 
1400 x 900 units extending from this starting point.
Distribute shapes within this area in a way that looks natural and readable — 
do not place all shapes in a tiny cluster, and do not spread them so far apart 
that the diagram looks sparse or disconnected. If there are many components 
(more than 6-7), it is acceptable to use a more compact spacing or wrap into 
multiple rows, but always stay reasonably close to this logical area.

SHAPE SELECTION (use the most semantically appropriate shape type):
- "rect" — general process, action, or step (default choice)
- "roundedRect" — start/end points, or softer process steps
- "diamond" — decision points, conditionals (if/else, yes/no branches)
- "ellipse" — entities, actors, or external systems (e.g. "User", "Third-party API")
- "circle" — small standalone nodes or simple states
Only use "diamond" when there is a genuine decision/branch in the description.
Default to "rect" when unsure.

STYLING (use color purposefully, not randomly):
- fill: use a light, muted color appropriate to the shape's role. Use HEX colors only.
  Examples: "#e0f2fe" (light blue, for systems/data), "#fef9c3" (light yellow, for decisions), 
  "#dcfce7" (light green, for start/success), "#fee2e2" (light red, for errors/failure/end), 
  "#f3f4f6" (light gray, for general/neutral steps)
- stroke: use a darker shade that complements the fill (e.g. fill "#e0f2fe" pairs with stroke "#0369a1")
- Do NOT use pure white, pure black, or fully transparent fills unless the step is neutral/default
- Keep strokeWidth at exactly 2 for all shapes — do not vary this
- Never set opacity below 0.85 — text must remain clearly readable against the fill

Your task:
1. Identify all distinct components, entities, or steps mentioned
2. Identify the relationships or flow between them
3. Convert this into shapes and arrows that can be rendered on a canvas

RULES:
- Each shape's width should be based on text length (estimate: text length * 7 + 30, minimum 40, maximum 240)
- Use consistent height of 70 for rect/roundedRect shapes; for diamond/ellipse/circle, 
  use a radius or equivalent sizing of roughly 50-70 so the label fits comfortably
- Arrange shapes in a logical flow — left-to-right for processes, top-to-bottom for hierarchies
- Space shapes at least 180px apart horizontally and 140px apart vertically
- Start first shape at x:100, y:100, and keep the overall diagram within the 1400 x 900 logical area
- Every relationship mentioned becomes an arrow connecting two shapes by their ids
- Use sequential numeric strings as ids: "1", "2", "3"...
- If the description implies a decision or branching (if/else, success/failure), 
  create multiple arrows from the diamond shape representing that decision
- Keep shape labels short and clear — max 3-4 words, extracted from the description, not verbatim copied
- Do not invent components that were not mentioned or clearly implied
- If the description is ambiguous, make the most reasonable interpretation a software engineer would make

SHAPE-SPECIFIC JSON FORMATS:
- For "rect", "roundedRect": use "x", "y", "width", "height"
- For "circle": use "x", "y", "radius" (no width/height)
- For "ellipse": use "x", "y", "radiusX", "radiusY"
- For "diamond": use "x", "y", and "points" as an array of 8 numbers representing 
  4 relative vertices, e.g. "points": [0, -40, 40, 0, 0, 40, -40, 0]
Do not mix formats — only include the properties relevant to the chosen shape type.

FINAL REMINDER BEFORE YOU OUTPUT: Every x, y, width, height, radius, and point value 
below must be a plain number with no arithmetic operators (+, -, *, /) anywhere in 
the JSON. Double-check your output before finalizing.

Return ONLY this JSON, nothing else:
{
  "shapes": [
    {
      "id": "1",
      "type": "rect",
      "x": number,
      "y": number,
      "width": number,
      "height": 70,
      "text": "short label",
      "fill": "#hexcolor",
      "stroke": "#hexcolor"
    }
  ],
  "arrows": [
    {
      "id": "a1",
      "from": "1",
      "to": "2"
    }
  ]
}
`;

  const response = await groq.chat.completions.create({
    model: aiModel,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
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
