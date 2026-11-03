import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import groq from "../config/groq.js";

// ─────────────────────────────────────────────────────────────────────────────
// textToDiagram v6
//  1. A small classifier call picks the diagram type from what the user wants to SEE
//  2. The main call uses a type-specific prompt + schema
//  3. er_diagram is drawn as REAL TABLES (columns, types, PK / FK)
//  4. Title / subtitle / notes / legend are optional (model decides, user can override)
//
// Needs the SHAPE_CONFIG.text getProps from v5 (fontStyle, lineHeight, width, align,
// strokeEnabled:false). Table rows line up through lineHeight.
// ─────────────────────────────────────────────────────────────────────────────

const groqModel = "openai/gpt-oss-120b";
const classifierModel = "openai/gpt-oss-20b";
const ARROW_COLOR = "#94a3b8";

const DIAGRAM_TYPES = [
  "flowchart",
  "concept_map",
  "hierarchy",
  "cycle",
  "timeline",
  "mindmap",
  "architecture",
  "er_diagram",
];

const NODE_KINDS = [
  "start",
  "end",
  "process",
  "decision",
  "input",
  "result",
  "concept",
  "formula",
  "state",
  "entity",
  "service",
  "database",
  "external",
  "central",
  "branch",
  "detail",
];

// ── Step 1: classifier ───────────────────────────────────────────────────────
const classifierSchema = {
  type: "object",
  properties: { diagram_type: { type: "string", enum: DIAGRAM_TYPES } },
  required: ["diagram_type"],
  additionalProperties: false,
};

const buildClassifierPrompt = (description) => `
Pick the ONE diagram type that best fits what the user wants to SEE.
Think about the result they want, not just the words they used.

TYPES:
- er_diagram: database schema, DB design, tables, ERD, entities and their relations, SQL tables
- flowchart: a process with steps or decisions: algorithm, procedure, experiment, reaction pathway, login flow, "how X works step by step"
- cycle: something that repeats in a closed loop: water cycle, Krebs cycle, Carnot cycle, life cycle
- timeline: ordered events or stages over time: history, evolution, phases of mitosis
- hierarchy: a classification tree: types of X, taxonomy, organisation chart
- architecture: components of a system and how they connect: system design, tech stack, circuit blocks, a body system
- concept_map: how laws / ideas / quantities relate to each other: cause and effect, a theory
- mindmap: an overview of ONE topic, person, character, place, object, book or chapter with its sub-topics.
  Also use it for "draw X" / "make a diagram of X" when X is just a thing or topic and no process is implied.

EXAMPLES:
"db schema for an e-commerce website" -> er_diagram
"how photosynthesis works" -> flowchart
"types of chemical bonds" -> hierarchy
"relation between force, mass and acceleration" -> concept_map
"design a food delivery system" -> architecture
"draw a famous cartoon character" -> mindmap
"carbon cycle" -> cycle

USER REQUEST:
"""${description}"""
`;

const classifyDiagram = async (description) => {
  try {
    const r = await groq.chat.completions.create({
      model: classifierModel,
      messages: [{ role: "user", content: buildClassifierPrompt(description) }],
      reasoning_effort: "low",
      max_completion_tokens: 1024,
      response_format: {
        type: "json_schema",
        json_schema: { name: "diagram_type", strict: true, schema: classifierSchema },
      },
    });
    const t = JSON.parse(r.choices[0].message.content).diagram_type;
    return DIAGRAM_TYPES.includes(t) ? t : "concept_map";
  } catch {
    return "concept_map"; // never block the user because of the classifier
  }
};

// ── Step 2: type-specific schema ─────────────────────────────────────────────
const columnSchema = {
  type: "object",
  properties: {
    name: { type: "string", description: "snake_case column name" },
    type: { type: "string", description: "SQL type, e.g. INT, VARCHAR(255), DECIMAL(10,2), TIMESTAMP" },
    key: { type: "string", enum: ["PK", "FK", "UQ", ""] },
  },
  required: ["name", "type", "key"],
  additionalProperties: false,
};

const buildPlanSchema = (type) => {
  const table = type === "er_diagram";
  const nodeProps = {
    id: { type: "string", description: "Sequential numeric string: '1', '2', ..." },
    label: {
      type: "string",
      description: table ? "Table name, snake_case" : "Specific name, 1-5 words",
    },
    kind: { type: "string", enum: NODE_KINDS },
    group: {
      type: "string",
      description:
        "1-2 word category used for COLORING. Same category/branch/layer/phase = exactly the same string.",
    },
    ...(table
      ? { columns: { type: "array", items: columnSchema } }
      : {
          description: {
            type: "string",
            description: "One concise line of concrete detail shown under the shape. Empty string if not useful.",
          },
        }),
  };

  return {
    type: "object",
    properties: {
      title: { type: "string", description: "Short title (max 6 words) or empty string" },
      subtitle: { type: "string", description: "One short line or empty string" },
      nodes: {
        type: "array",
        items: {
          type: "object",
          properties: nodeProps,
          required: Object.keys(nodeProps),
          additionalProperties: false,
        },
      },
      edges: {
        type: "array",
        items: {
          type: "object",
          properties: {
            from: { type: "string" },
            to: { type: "string" },
            label: { type: "string", description: "Short edge label or empty string" },
          },
          required: ["from", "to", "label"],
          additionalProperties: false,
        },
      },
      notes: {
        type: "array",
        description: "Usually empty. At most 3 short takeaways.",
        items: { type: "string" },
      },
      show_legend: { type: "boolean" },
    },
    required: ["title", "subtitle", "nodes", "edges", "notes", "show_legend"],
    additionalProperties: false,
  };
};

// ── Prompt ───────────────────────────────────────────────────────────────────
const TYPE_GUIDANCE = {
  flowchart: `FLOWCHART: any step-by-step process, algorithm, procedure, experiment or reaction pathway.
- kinds: "start", "end", "process", "decision"; "input"/"result" for reactants/products or inputs/outputs.
- Show alternative branches and outcomes, not only the happy path.
- Label decision edges (Yes/No or the actual condition).`,

  concept_map: `CONCEPT MAP: ideas and how they relate (laws, definitions, cause and effect, theories).
- kinds: "concept" (ideas), "formula" (equations / laws), "input" (causes / givens), "result" (effects / outcomes).
- Edge label = the relationship as a short verb phrase ("causes", "is measured in", "increases with").
- Put formulas, units and typical values in descriptions.`,

  hierarchy: `HIERARCHY / CLASSIFICATION TREE: one top node splitting into categories and sub-categories.
- kinds: "concept" for every level, "detail" for leaf examples.
- Edges go from parent to child. Edge labels are empty strings.
- group = the top-level category the node belongs to (children share their parent's group).`,

  cycle: `CYCLE: a closed loop of stages (water cycle, carbon cycle, Krebs cycle, feedback loop).
- kind: "state" for every stage. Usually 5-9 nodes.
- Edges form ONE loop in order, and the last stage connects back to the first.
- description = what happens in that stage (with formula / energy / products if relevant).`,

  timeline: `TIMELINE / SEQUENCE: ordered stages or events (history of atomic models, stages of mitosis, project phases).
- kinds: "start" for the first, "process" for the middle ones, "end" for the last.
- Put the date / stage name in the label. Edges chain the events in order.
- description = what happened or what defines that stage.`,

  mindmap: `MIND MAP: one central topic with branches (a subject, person, character, place, object, chapter).
- kinds: exactly one "central", 4-7 main "branch" nodes, 2-4 "detail" nodes per branch.
- group: the central node has its own group; each branch has its own group; every "detail"
  node uses EXACTLY the same group as its parent branch.
- Leave node descriptions as empty strings. Edge labels are empty strings.`,

  architecture: `SYSTEM / STRUCTURE DIAGRAM: components of any system and how they connect.
- kinds: "service" (components), "database" (stores / buffers / reservoirs), "external" (outside actors / sources).
- group = the layer / subsystem (e.g. Client, Backend, Data, External).
- Edge label = what flows between them (data, current, heat, signal, REST...).
- description = the component's role or technology.`,

  er_diagram: `DATABASE SCHEMA, drawn as real tables.
- Every node is ONE table: label = table_name (snake_case, plural), kind = "entity".
- columns: 4-12 realistic columns per table, with SQL types
  (INT, BIGINT, VARCHAR(255), TEXT, DECIMAL(10,2), BOOLEAN, DATE, TIMESTAMP, UUID, JSON).
- First column is the primary key (key "PK"). Foreign-key columns have key "FK".
  Unique business keys (email, sku) have key "UQ". Every other column has key "".
- Add created_at / updated_at where normal.
- Include junction tables for many-to-many relations.
- A whole system (e-commerce, school, hospital...) is typically 8-14 tables.
- group = domain area of the table (e.g. Users, Catalog, Orders, Payments); tables of one area share a group.
- edges go from the PARENT (referenced) table to the CHILD table holding the FK.
  label = cardinality such as "1:N" or "1:1". Every FK column must have a matching edge.`,
};

const EDGE_RULES = `
EDGE RULES (avoid clutter):
- Include ONLY connections that carry real meaning. Fewer, cleaner arrows beat a tangled web.
- Aim for a tidy, mostly tree-like structure: about (nodes - 1) to (1.3 x nodes) edges in total.
- If A -> B -> C already shows the link, do NOT also add A -> C.
- Never add both A -> B and B -> A.
- Do not link every node to a central "hub" node. Connect each node only to its most direct neighbour(s).
- A node that is only an example or illustration attaches to exactly ONE related node.
- Every node needs at least one edge, but no more than it truly needs.
- Edge labels must be specific ("accelerates", "measured in"). Never vague ones like "relates to" or "includes";
  if there is no specific label, use "".
`;

const buildPlanPrompt = (description, type) => {
  const table = type === "er_diagram";
  return `
You are an expert educator and diagram designer who works across ALL subjects:
physics, chemistry, biology, maths, history, geography, economics, software, everyday topics.
Turn the user's request into a DETAILED, DESCRIPTIVE, ACCURATE diagram structure.
A separate program handles layout, sizes and colors, so you only design the CONTENT.

USER REQUEST:
"""${description}"""
If it is phrased like "draw X" or "make a diagram of X", show the key information about X in the chosen diagram type.

DIAGRAM TYPE (already chosen, follow it exactly):
${TYPE_GUIDANCE[type]}

QUALITY RULES:
- Be factually correct. Use real terms, laws, formulas, units, values and conditions of the topic.
  Never invent facts to fill space.
- Expand a short request into a complete diagram a student could learn from, like a good textbook figure.
- Size: ${table ? "8-14 tables" : "typically 8-16 nodes. Cycles 5-9. Mind maps 15-25 including details"}. Maximum 28.
  Do not pad with filler and do not oversimplify.
- Every node must be specific to this topic. No placeholders like "Step 1", "Process" or "Item A".
${table ? "" : EDGE_RULES}
OPTIONAL EXTRAS (be sparing; a good diagram often needs none of these):
- title: only when the diagram has 8+ nodes or the user asked for one. Otherwise "".
- subtitle: only when it adds information the title lacks. Usually "".
- notes: only for important rules, exceptions or formulas that cannot be shown as nodes. Usually [] (max 3).
- show_legend: true only when colors carry non-obvious categories AND there are 3+ groups. Usually false.
- If the user explicitly asks for (or against) a title, notes, a legend, colors or a level of detail, follow the user.

FIELDS:
- nodes[].id: sequential numeric strings "1", "2", "3"...
- nodes[].group: 1-2 word category used to COLOR the node. Same category / branch / layer = exactly the same
  string. Use 3-6 distinct groups in total.
${table ? "- nodes[].columns: see the schema rules above." : "- nodes[].description: one concrete line (max ~12 words) shown under the shape, with formulas / units / examples where useful. Unicode symbols are fine (H₂O, v², →, Δ, λ, π)."}
- edges: reference node ids.
- Write everything in English unless the user explicitly asks for another language.
`;
};

// ── Canvas shape converter ───────────────────────────────────────────────────
// Input x,y = top-left. rect/roundedRect keep top-left; circle/ellipse/diamond become center.
const toCanvasShape = (s) => {
  const base = { id: String(s.id), text: s.text, fill: s.fill, stroke: s.stroke };
  const w = Math.max(40, s.w);
  const h = Math.max(40, s.h);

  switch (s.type) {
    case "circle": {
      const radius = Math.round(Math.min(w, h) / 2);
      return { ...base, type: "circle", x: s.x + radius, y: s.y + radius, radius };
    }
    case "ellipse":
      return {
        ...base,
        type: "ellipse",
        x: s.x + w / 2,
        y: s.y + h / 2,
        radiusX: Math.round(w / 2),
        radiusY: Math.round(h / 2),
      };
    case "diamond":
      return {
        ...base,
        type: "diamond",
        x: s.x + w / 2,
        y: s.y + h / 2,
        points: [0, -h / 2, w / 2, 0, 0, h / 2, -w / 2, 0],
        closed: true,
        strokeWidth: 2,
      };
    case "roundedRect":
      return { ...base, type: "roundedRect", x: s.x, y: s.y, width: w, height: h, cornerRadius: 16 };
    default:
      return { ...base, type: "rect", x: s.x, y: s.y, width: w, height: h };
  }
};

// ── Colors ───────────────────────────────────────────────────────────────────
const GROUP_PALETTE = [
  { fill: "#dbeafe", stroke: "#1d4ed8" }, // blue
  { fill: "#ffedd5", stroke: "#c2410c" }, // orange
  { fill: "#ede9fe", stroke: "#6d28d9" }, // violet
  { fill: "#ccfbf1", stroke: "#0f766e" }, // teal
  { fill: "#fce7f3", stroke: "#be185d" }, // pink
  { fill: "#ecfccb", stroke: "#4d7c0f" }, // lime
  { fill: "#e0e7ff", stroke: "#4338ca" }, // indigo
  { fill: "#fef3c7", stroke: "#b45309" }, // amber
  { fill: "#e0f2fe", stroke: "#0369a1" }, // sky
  { fill: "#ffe4e6", stroke: "#be123c" }, // rose
  { fill: "#dcfce7", stroke: "#15803d" }, // green
  { fill: "#f1f5f9", stroke: "#475569" }, // slate
];

const FIXED_STYLE = {
  start: { fill: "#dcfce7", stroke: "#15803d" },
  end: { fill: "#fee2e2", stroke: "#b91c1c" },
  decision: { fill: "#fef9c3", stroke: "#a16207" },
};

const THEME = { title: "#0f172a", subtitle: "#64748b", heading: "#0f172a" };
const KEY_COLOR = { PK: "#b45309", FK: "#1d4ed8", UQ: "#15803d" };

const pickShapeType = (kind) => {
  switch (kind) {
    case "decision":
      return "diamond";
    case "start":
    case "end":
    case "database":
    case "input":
    case "result":
    case "concept":
      return "roundedRect";
    case "external":
    case "central":
    case "branch":
    case "state":
      return "ellipse";
    default:
      return "rect";
  }
};

// ── Sizing helpers ───────────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const wrapLines = (text, maxChars) => {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  for (const word of words) {
    if (cur && (cur + " " + word).length > maxChars) {
      lines.push(cur);
      cur = word;
    } else {
      cur = cur ? cur + " " + word : word;
    }
  }
  if (cur) lines.push(cur);
  return lines;
};

const sizeFor = (shapeType, lines, kind) => {
  const longest = Math.max(4, ...lines.map((l) => l.length));
  const extra = (lines.length - 1) * 24;
  let w = clamp(longest * 11 + 60, 160, 300);
  let h = 84 + extra;
  if (shapeType === "diamond") {
    w = clamp(longest * 13 + 90, 220, 340);
    h = 150 + extra;
  } else if (shapeType === "ellipse") {
    w = clamp(longest * 11 + 90, 190, 320);
    h = 100 + extra;
  }
  if (kind === "central") {
    w *= 1.25;
    h *= 1.25;
  }
  return { w: Math.round(w), h: Math.round(h) };
};

// Table geometry (er_diagram)
const TABLE_FONT = 14;
const HEADER_H = 44;
const ROW_H = 26;
const CHAR_W = 8;

const cleanColumns = (cols) => {
  const out = (Array.isArray(cols) ? cols : [])
    .slice(0, 14)
    .map((c) => ({
      name: String(c?.name || "").trim().slice(0, 32),
      type: String(c?.type || "").trim().slice(0, 22),
      key: ["PK", "FK", "UQ"].includes(c?.key) ? c.key : "",
    }))
    .filter((c) => c.name);
  return out.length ? out : [{ name: "id", type: "INT", key: "PK" }];
};

// ── Layout 1: layered ────────────────────────────────────────────────────────
const buildLayers = (nodes, edges) => {
  const ids = nodes.map((n) => n.id);
  const out = new Map(ids.map((id) => [id, []]));
  const hasIn = new Set();
  edges.forEach((e) => {
    out.get(e.from).push(e.to);
    hasIn.add(e.to);
  });

  // 1) break cycles (drop back edges)
  const state = new Map();
  const dag = new Map(ids.map((id) => [id, []]));
  const dfs = (u) => {
    state.set(u, 1);
    for (const v of out.get(u)) {
      if (state.get(v) === 1) continue;
      dag.get(u).push(v);
      if (!state.has(v)) dfs(v);
    }
    state.set(u, 2);
  };
  ids.filter((id) => !hasIn.has(id)).forEach((id) => !state.has(id) && dfs(id));
  ids.forEach((id) => !state.has(id) && dfs(id));

  // 2) longest-path layering
  const indeg = new Map(ids.map((id) => [id, 0]));
  dag.forEach((vs) => vs.forEach((v) => indeg.set(v, indeg.get(v) + 1)));
  const layerOf = new Map(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => indeg.get(id) === 0);
  while (queue.length) {
    const u = queue.shift();
    for (const v of dag.get(u)) {
      layerOf.set(v, Math.max(layerOf.get(v), layerOf.get(u) + 1));
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }
  const layers = [];
  ids.forEach((id) => {
    const l = layerOf.get(id);
    (layers[l] ||= []).push(id);
  });

  // 3) reduce edge crossings (barycenter sweeps)
  const nbrs = new Map(ids.map((id) => [id, []]));
  edges.forEach((e) => {
    nbrs.get(e.from).push(e.to);
    nbrs.get(e.to).push(e.from);
  });
  const sortBy = (layer, ref) => {
    const pos = new Map(ref.map((id, i) => [id, i]));
    const scored = layer.map((id, i) => {
      const p = nbrs.get(id).filter((n) => pos.has(n)).map((n) => pos.get(n));
      return { id, s: p.length ? p.reduce((a, b) => a + b, 0) / p.length : i };
    });
    scored.sort((a, b) => a.s - b.s);
    scored.forEach((x, i) => (layer[i] = x.id));
  };
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < layers.length; i++) sortBy(layers[i], layers[i - 1]);
    for (let i = layers.length - 2; i >= 0; i--) sortBy(layers[i], layers[i + 1]);
  }
  return layers;
};

const positionLayers = (layers, byId, dir) => {
  const horizontal = dir === "LR";
  const mainGap = horizontal ? 150 : 100;
  const crossGap = horizontal ? 60 : 70;
  const main = (n) => (horizontal ? n.fw : n.fh);
  const cross = (n) => (horizontal ? n.fh : n.fw);

  const layerCross = layers.map(
    (l) => l.reduce((s, id) => s + cross(byId.get(id)), 0) + crossGap * (l.length - 1),
  );
  const maxCross = Math.max(...layerCross);

  const pos = new Map();
  let mainCursor = 0;
  layers.forEach((l, i) => {
    const layerMain = Math.max(...l.map((id) => main(byId.get(id))));
    let c = (maxCross - layerCross[i]) / 2;
    l.forEach((id) => {
      const n = byId.get(id);
      const m = mainCursor + (layerMain - main(n)) / 2;
      pos.set(id, horizontal ? { fx: m, fy: c } : { fx: c, fy: m });
      c += cross(n) + crossGap;
    });
    mainCursor += layerMain + mainGap;
  });
  return pos;
};

// ── Layout 2: radial (mind map) ──────────────────────────────────────────────
const positionRadial = (nodes, edges) => {
  const root = nodes.find((n) => n.kind === "central") || nodes[0];
  const adj = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => {
    adj.get(e.from).push(e.to);
    adj.get(e.to).push(e.from);
  });

  const children = new Map(nodes.map((n) => [n.id, []]));
  const depth = new Map([[root.id, 0]]);
  const queue = [root.id];
  while (queue.length) {
    const u = queue.shift();
    for (const v of adj.get(u)) {
      if (!depth.has(v)) {
        depth.set(v, depth.get(u) + 1);
        children.get(u).push(v);
        queue.push(v);
      }
    }
  }
  nodes.forEach((n) => {
    if (!depth.has(n.id)) {
      depth.set(n.id, 1);
      children.get(root.id).push(n.id);
    }
  });

  const leaves = new Map();
  const countLeaves = (id) => {
    const ch = children.get(id);
    const c = ch.length ? ch.reduce((s, x) => s + countLeaves(x), 0) : 1;
    leaves.set(id, c);
    return c;
  };
  countLeaves(root.id);

  const perDepth = new Map();
  depth.forEach((d) => perDepth.set(d, (perDepth.get(d) || 0) + 1));
  const maxDepth = Math.max(...depth.values());
  const radius = [0];
  for (let d = 1; d <= maxDepth; d++) {
    const need = (perDepth.get(d) * 260) / (2 * Math.PI);
    radius[d] = Math.max(radius[d - 1] + 340, need);
  }

  const centers = new Map();
  const place = (id, a0, a1) => {
    const a = (a0 + a1) / 2;
    const r = radius[depth.get(id)];
    centers.set(id, { cx: r * Math.cos(a), cy: r * Math.sin(a) });
    const total = leaves.get(id);
    let cur = a0;
    children.get(id).forEach((ch) => {
      const span = ((a1 - a0) * leaves.get(ch)) / total;
      place(ch, cur, cur + span);
      cur += span;
    });
  };
  place(root.id, -Math.PI / 2, 1.5 * Math.PI);
  return centers;
};

// ── Layout 3: circular (cycles) ──────────────────────────────────────────────
const positionCycle = (nodes, edges, byId) => {
  const out = new Map(nodes.map((n) => [n.id, []]));
  edges.forEach((e) => out.get(e.from).push(e.to));

  const order = [];
  const seen = new Set();
  let cur = nodes[0].id;
  while (cur && !seen.has(cur)) {
    seen.add(cur);
    order.push(cur);
    cur = out.get(cur).find((v) => !seen.has(v));
  }
  nodes.forEach((n) => !seen.has(n.id) && order.push(n.id));

  const perimeter = order.reduce((s, id) => {
    const n = byId.get(id);
    return s + Math.max(n.fw, n.fh) + 80;
  }, 0);
  const R = Math.max(260, perimeter / (2 * Math.PI));
  const Rx = R * 1.3;
  const Ry = R;

  const centers = new Map();
  order.forEach((id, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / order.length;
    centers.set(id, { cx: Rx * Math.cos(a), cy: Ry * Math.sin(a) });
  });
  return centers;
};

// ── Edge pruning ─────────────────────────────────────────────────────────────
const countComponents = (ids, list, skip) => {
  const parent = new Map(ids.map((id) => [id, id]));
  const find = (x) => {
    while (parent.get(x) !== x) {
      parent.set(x, parent.get(parent.get(x)));
      x = parent.get(x);
    }
    return x;
  };
  list.forEach((e, i) => {
    if (!skip.has(i)) parent.set(find(e.from), find(e.to));
  });
  return new Set(ids.map(find)).size;
};

const pruneEdges = (nodes, edges, type) => {
  if (type === "cycle" || type === "er_diagram") return edges; // every link is meaningful
  const ids = nodes.map((n) => n.id);
  const kindOf = new Map(nodes.map((n) => [n.id, n.kind]));

  // 1) drop reverse duplicates (decision branches are always kept)
  const pairs = new Set();
  let list = edges.filter((e) => {
    const key = [e.from, e.to].sort().join("|");
    if (pairs.has(key) && kindOf.get(e.from) !== "decision") return false;
    pairs.add(key);
    return true;
  });

  const layerOf = new Map();
  buildLayers(nodes, list).forEach((l, i) => l.forEach((id) => layerOf.set(id, i)));

  // 2) transitive reduction
  const outs = new Map(ids.map((id) => [id, []]));
  list.forEach((e) => outs.get(e.from).push(e.to));
  const reachable = (from, target) => {
    const stack = [from];
    const seen = new Set([from]);
    while (stack.length) {
      const u = stack.pop();
      for (const v of outs.get(u)) {
        if (layerOf.get(v) <= layerOf.get(u)) continue;
        if (v === target) return true;
        if (!seen.has(v)) {
          seen.add(v);
          stack.push(v);
        }
      }
    }
    return false;
  };
  list = list.filter((e) => {
    const span = layerOf.get(e.to) - layerOf.get(e.from);
    if (span < 2 || kindOf.get(e.from) === "decision") return true;
    outs.set(e.from, outs.get(e.from).filter((v) => v !== e.to));
    if (reachable(e.from, e.to)) return false;
    outs.get(e.from).push(e.to);
    return true;
  });

  // 3) cap per diagram type, never disconnect
  const decisions = nodes.filter((n) => n.kind === "decision").length;
  const extra = {
    flowchart: decisions + 1,
    concept_map: Math.ceil(nodes.length * 0.3),
    architecture: Math.ceil(nodes.length * 0.3),
    hierarchy: 0,
    mindmap: 0,
    timeline: 0,
  };
  const cap = nodes.length - 1 + (extra[type] ?? 2);

  if (list.length > cap) {
    const baseline = countComponents(ids, list, new Set());
    const candidates = list
      .map((e, i) => ({
        i,
        span: Math.abs(layerOf.get(e.to) - layerOf.get(e.from)),
        labeled: e.label ? 1 : 0,
        protectedEdge: kindOf.get(e.from) === "decision",
      }))
      .filter((c) => !c.protectedEdge)
      .sort((a, b) => b.span - a.span || a.labeled - b.labeled || b.i - a.i);

    const removed = new Set();
    for (const c of candidates) {
      if (list.length - removed.size <= cap) break;
      removed.add(c.i);
      if (countComponents(ids, list, removed) > baseline) removed.delete(c.i);
    }
    list = list.filter((_, i) => !removed.has(i));
  }
  return list;
};

// ── Handler ──────────────────────────────────────────────────────────────────
const LR_TYPES = ["architecture", "timeline"];
const TEXT_LINE_HEIGHT = 1.3;

const textToDiagram = asyncHandler(async (req, res) => {
  const { description, startX = 100, startY = 100, selectedType } = req.body;
  if (!description || description.trim().length === 0) {
    throw new ApiError(400, "Description is required");
  }

  // 1) decide the type (user's choice wins, otherwise classify)
  const type = DIAGRAM_TYPES.includes(selectedType)
    ? selectedType
    : await classifyDiagram(description);
  const isTable = type === "er_diagram";

  // 2) ONE content call with a type-specific prompt + schema
  const response = await groq.chat.completions.create({
    model: groqModel,
    messages: [{ role: "user", content: buildPlanPrompt(description, type) }],
    reasoning_effort: "medium",
    max_completion_tokens: 8192,
    response_format: {
      type: "json_schema",
      json_schema: { name: "diagram_plan", strict: true, schema: buildPlanSchema(type) },
    },
  });
  if (!response) {
    throw new ApiError(500, "Groq error");
  }
  const plan = JSON.parse(response.choices[0].message.content);

  // 3) sanitize ids and edges
  const idMap = new Map();
  const nodes = [];
  for (const n of plan.nodes || []) {
    if (!n.id || idMap.has(n.id) || nodes.length >= 30) continue;
    const newId = String(nodes.length + 1);
    idMap.set(n.id, newId);
    nodes.push({ ...n, id: newId });
  }
  if (nodes.length === 0) {
    throw new ApiError(422, "Could not extract any elements from the description");
  }

  const edgeKeys = new Set();
  const rawEdges = [];
  for (const e of plan.edges || []) {
    const from = idMap.get(e.from);
    const to = idMap.get(e.to);
    const key = `${from}->${to}`;
    if (!from || !to || from === to || edgeKeys.has(key)) continue;
    edgeKeys.add(key);
    rawEdges.push({ from, to, label: (e.label || "").trim() });
  }
  const edges = pruneEdges(nodes, rawEdges, type);

  // 4) colors
  const groupIndex = new Map();
  const groupLabel = new Map();
  const styleFor = (n) => {
    if (FIXED_STYLE[n.kind]) return FIXED_STYLE[n.kind];
    const raw = (n.group || n.kind || "").trim();
    const key = raw.toLowerCase();
    if (!groupIndex.has(key)) {
      groupIndex.set(key, groupIndex.size);
      groupLabel.set(key, raw);
    }
    return GROUP_PALETTE[groupIndex.get(key) % GROUP_PALETTE.length];
  };

  // 5) measure every node
  nodes.forEach((n) => {
    n.style = styleFor(n);

    if (isTable) {
      n.columns = cleanColumns(n.columns);
      n.nameW = Math.max(...n.columns.map((c) => c.name.length)) * CHAR_W;
      n.typeW = Math.max(...n.columns.map((c) => c.type.length)) * CHAR_W;
      n.w = clamp(
        Math.max(14 + n.nameW + 20 + n.typeW + 16 + 28 + 10, n.label.length * 10 + 40),
        230,
        460,
      );
      n.h = HEADER_H + n.columns.length * ROW_H + 14;
      n.descLines = [];
      n.descH = 0;
      n.descW = 0;
      n.fw = n.w;
      n.fh = n.h;
      return;
    }

    n.shapeType = pickShapeType(n.kind);
    n.labelLines = wrapLines(n.label, 22);
    const { w, h } = sizeFor(n.shapeType, n.labelLines, n.kind);
    n.w = w;
    n.h = h;
    n.descLines = type === "mindmap" ? [] : wrapLines(n.description, 34);
    n.descH = n.descLines.length
      ? Math.round(n.descLines.length * 14 * TEXT_LINE_HEIGHT) + 14
      : 0;
    n.descW = n.descLines.length ? Math.max(...n.descLines.map((l) => l.length)) * 7.2 : 0;
    n.fw = Math.round(Math.max(n.w, n.descW + 24));
    n.fh = n.h + n.descH;
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // 6) positions (top-left of each node, relative to 0,0)
  const boxes = new Map();
  let centers = null;
  if (type === "mindmap") centers = positionRadial(nodes, edges);
  else if (type === "cycle") centers = positionCycle(nodes, edges, byId);

  if (centers) {
    let minX = Infinity;
    let minY = Infinity;
    centers.forEach((c, id) => {
      const n = byId.get(id);
      minX = Math.min(minX, c.cx - n.w / 2);
      minY = Math.min(minY, c.cy - n.h / 2);
    });
    centers.forEach((c, id) => {
      const n = byId.get(id);
      boxes.set(id, { x: c.cx - n.w / 2 - minX, y: c.cy - n.h / 2 - minY });
    });
  } else {
    const dir = LR_TYPES.includes(type) ? "LR" : "TB";
    const pos = positionLayers(buildLayers(nodes, edges), byId, dir);
    pos.forEach((p, id) => {
      const n = byId.get(id);
      boxes.set(id, { x: p.fx + (n.fw - n.w) / 2, y: p.fy });
    });
  }

  // 7) canvas elements. Title / subtitle / notes / legend are all optional.
  const title = (plan.title || "").trim();
  const subtitle = (plan.subtitle || "").trim();
  const titleH = title ? (subtitle ? 130 : 90) : subtitle ? 60 : 0;
  const ox = startX;
  const oy = startY + titleH;

  let nextId = nodes.length + 1;
  const newId = () => String(nextId++);
  const textShape = (x, y, text, fontSize, fill, opts = {}) => ({
    id: newId(),
    type: "text",
    x: Math.round(x),
    y: Math.round(y),
    text,
    fontSize,
    fill,
    fontStyle: "normal",
    lineHeight: TEXT_LINE_HEIGHT,
    strokeWidth: 0,
    ...opts,
  });

  const shapes = [];
  const extraTexts = [];

  if (title) {
    shapes.push(textShape(startX, startY, title, 34, THEME.title, { fontStyle: "bold" }));
  }
  if (subtitle) {
    shapes.push(textShape(startX, startY + (title ? 48 : 0), subtitle, 16, THEME.subtitle));
  }

  // A table = body rect (carries the node id, so arrows attach to it) + colored header
  // + three aligned text columns (names / types / keys).
  const emitTable = (n, x, y) => {
    x = Math.round(x);
    y = Math.round(y);
    shapes.push({
      id: n.id,
      type: "rect",
      x,
      y,
      width: n.w,
      height: n.h,
      fill: "#ffffff",
      stroke: n.style.stroke,
      text: "",
    });
    shapes.push({
      id: newId(),
      type: "rect",
      x,
      y,
      width: n.w,
      height: HEADER_H,
      fill: n.style.fill,
      stroke: n.style.stroke,
      text: n.label,
    });

    const rowsY = y + HEADER_H + 7;
    const rowOpts = { lineHeight: ROW_H / TABLE_FONT };
    shapes.push(
      textShape(x + 14, rowsY, n.columns.map((c) => c.name).join("\n"), TABLE_FONT, "#0f172a", rowOpts),
    );
    shapes.push(
      textShape(
        x + 14 + n.nameW + 20,
        rowsY,
        n.columns.map((c) => c.type).join("\n"),
        TABLE_FONT,
        "#64748b",
        rowOpts,
      ),
    );
    ["PK", "FK", "UQ"].forEach((k) => {
      if (!n.columns.some((c) => c.key === k)) return;
      shapes.push(
        textShape(
          x + n.w - 38,
          rowsY,
          n.columns.map((c) => (c.key === k ? k : "")).join("\n"),
          13,
          KEY_COLOR[k],
          { ...rowOpts, fontStyle: "bold" },
        ),
      );
    });
  };

  let maxY = oy;
  let minX = Infinity;

  nodes.forEach((n) => {
    const b = boxes.get(n.id);
    const x = ox + b.x;
    const y = oy + b.y;

    if (isTable) {
      emitTable(n, x, y);
    } else {
      shapes.push(
        toCanvasShape({
          id: n.id,
          type: n.shapeType,
          x,
          y,
          w: n.w,
          h: n.h,
          text: n.labelLines.join("\n"),
          fill: n.style.fill,
          stroke: n.style.stroke,
        }),
      );

      if (n.descLines.length) {
        const dw = Math.max(n.w, Math.round(n.descW) + 24);
        extraTexts.push(
          textShape(x + n.w / 2 - dw / 2, y + n.h + 8, n.descLines.join("\n"), 14, n.style.stroke, {
            width: dw,
            align: "center",
          }),
        );
      }
    }

    minX = Math.min(minX, x);
    maxY = Math.max(maxY, y + n.h + n.descH);
  });

  // edge labels, colored like the source group
  const centerOf = (id) => {
    const n = byId.get(id);
    const b = boxes.get(id);
    return { x: ox + b.x + n.w / 2, y: oy + b.y + n.h / 2 };
  };
  edges.forEach((e) => {
    if (!e.label) return;
    const src = byId.get(e.from);
    const c1 = centerOf(e.from);
    const c2 = centerOf(e.to);
    const dx = c2.x - c1.x;
    const dy = c2.y - c1.y;
    const len = Math.hypot(dx, dy) || 1;
    const horizontal = Math.abs(dx) > Math.abs(dy);
    const lead = horizontal ? src.w / 2 + 40 : src.h / 2 + src.descH + 30;
    const t = clamp(lead / len, 0.3, 0.7);
    const px = c1.x + dx * t;
    const py = c1.y + dy * t;
    const lx = horizontal ? px - e.label.length * 4 : px + 10;
    const ly = horizontal ? py - 26 : py - 10;
    extraTexts.push(textShape(lx, ly, e.label, 14, src.style.stroke, { fontStyle: "bold" }));
  });
  shapes.push(...extraTexts);

  // notes (optional)
  const baseX = minX === Infinity ? startX : minX;
  const notes = (plan.notes || []).filter((x) => x && x.trim()).slice(0, 3);
  const showLegend = Boolean(plan.show_legend) && groupLabel.size >= 2;
  const blockY = maxY + 70;

  if (notes.length) {
    shapes.push(textShape(baseX, blockY, "Notes", 20, THEME.heading, { fontStyle: "bold" }));
    let cursorY = blockY + 36;
    notes.forEach((note, i) => {
      const lines = wrapLines(note, 70);
      const color = GROUP_PALETTE[i % GROUP_PALETTE.length].stroke;
      shapes.push(textShape(baseX, cursorY, "• " + lines.join("\n   "), 16, color));
      cursorY += Math.round(lines.length * 16 * TEXT_LINE_HEIGHT) + 14;
    });
  }

  // legend (optional)
  if (showLegend) {
    const legendX = notes.length ? baseX + 700 : baseX;
    shapes.push(textShape(legendX, blockY, "Legend", 20, THEME.heading, { fontStyle: "bold" }));
    let ly = blockY + 36;
    groupLabel.forEach((label, key) => {
      const color = GROUP_PALETTE[groupIndex.get(key) % GROUP_PALETTE.length].stroke;
      shapes.push(textShape(legendX, ly, "■  " + label, 16, color));
      ly += 28;
    });
  }

  const arrows = edges.map((e, i) => ({
    id: `a${i + 1}`,
    from: e.from,
    to: e.to,
    stroke: ARROW_COLOR,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { shapes, arrows, diagram_type: type },
        "Diagram generated successfully",
      ),
    );
});

export default textToDiagram;