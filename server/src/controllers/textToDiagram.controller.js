import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import groq from "../config/groq.js";
import { APIError } from "groq-sdk";
const groqModel = "openai/gpt-oss-120b";
// ─────────────────────────────────────────────────────────────────────────────
// textToDiagram v5  —  any subject · group-based colors · styled text
//
// REPLACES textToDiagram.v4.js completely (same apply steps).
//
// ALSO REQUIRED (frontend, SHAPE_CONFIG.text) — otherwise text stays bold/blurry:
//   text: {
//     ...
//     defaults: { text: "", fontSize: 24, fill: "", fontStyle: "normal", lineHeight: 1.3, strokeWidth: 0 },
//     getProps: (el) => ({
//       text: el.text,
//       fontSize: el.fontSize,
//       fontStyle: el.fontStyle || "normal",
//       lineHeight: el.lineHeight || 1.3,
//       fontFamily: el.fontFamily || "Inter, Arial, sans-serif",
//       width: el.width,
//       align: el.align,
//       strokeEnabled: false,        // no outline on text → fixes the bold look
//       perfectDrawEnabled: false,
//     }),
//   },
// ─────────────────────────────────────────────────────────────────────────────

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

// ── LLM schema: content only (no geometry, no colors) ────────────────────────
const planSchema = {
  type: "object",
  properties: {
    diagram_type: { type: "string", enum: DIAGRAM_TYPES },
    title: { type: "string", description: "Diagram title, max 6 words" },
    subtitle: {
      type: "string",
      description: "One line (max 14 words) saying what the diagram shows",
    },
    nodes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Sequential numeric string: '1', '2', ...",
          },
          label: { type: "string", description: "Specific name, 1-5 words" },
          kind: { type: "string", enum: NODE_KINDS },
          group: {
            type: "string",
            description:
              "1-2 word category used for COLORING. Same category/branch/layer/phase = exactly the same string.",
          },
          description: {
            type: "string",
            description:
              "One concise line of concrete detail shown under the shape. Empty string if not useful.",
          },
        },
        required: ["id", "label", "kind", "group", "description"],
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
          label: {
            type: "string",
            description:
              "Short edge label (Yes/No, 'causes', 'heat', 1:N, ...). Empty string if none.",
          },
        },
        required: ["from", "to", "label"],
        additionalProperties: false,
      },
    },
    notes: {
      type: "array",
      description: "2-4 short key takeaways. Empty array if not useful.",
      items: { type: "string" },
    },
  },
  required: ["diagram_type", "title", "subtitle", "nodes", "edges", "notes"],
  additionalProperties: false,
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

  hierarchy: `HIERARCHY / CLASSIFICATION TREE: one top node splitting into categories and sub-categories
(taxonomy, classification of matter, types of forces, organisation structure).
- kinds: "concept" for every level, "detail" for leaf examples.
- Edges go from parent to child. Edge labels are empty strings.
- group = the top-level category the node belongs to (children share their parent's group).`,

  cycle: `CYCLE: a closed loop of stages (water cycle, carbon cycle, Krebs cycle, Carnot cycle, feedback loop).
- kind: "state" for every stage. Usually 5-9 nodes.
- Edges form ONE loop in order, and the last stage connects back to the first.
- description = what happens in that stage (with formula / energy / products if relevant).`,

  timeline: `TIMELINE / SEQUENCE: ordered stages or events (history of atomic models, stages of mitosis,
life of a star, project phases).
- kinds: "start" for the first, "process" for the middle ones, "end" for the last.
- Put the date / stage name in the label. Edges chain the events in order.
- description = what happened or what defines that stage.`,

  mindmap: `MIND MAP: one central topic with branches (any subject, e.g. "Newton's Laws", "Organic Chemistry").
- kinds: exactly one "central", 4-7 main "branch" nodes, 2-4 "detail" nodes per branch.
- group: the central node has its own group; each branch has its own group; every "detail"
  node uses EXACTLY the same group as its parent branch.
- Leave node descriptions as empty strings. Edge labels are empty strings.`,

  architecture: `SYSTEM / STRUCTURE DIAGRAM: components of any system and how they connect
(software stack, engine, circuit blocks, human nervous system, power grid).
- kinds: "service" (components), "database" (stores / buffers / reservoirs), "external" (outside actors / sources).
- group = the layer / subsystem (e.g. Client, Backend, Data, External).
- Edge label = what flows between them (data, current, heat, signal, REST...).
- description = the component's role or technology.`,

  er_diagram: `ER DIAGRAM (database entities).
- kind: "entity" for every node, label = entity name.
- group = the domain area the entity belongs to (e.g. Users, Orders, Catalog).
- description = attribute list with keys, e.g. "id (PK), name, email, role_id (FK)".
- Include join entities for many-to-many relations.
- Edge label = cardinality plus verb, e.g. "1:N places".`,

  auto: `AUTO-DETECT the best type for the topic and set "diagram_type" accordingly:
- steps / procedure / reaction pathway / experiment / algorithm  → flowchart
- closed loop that repeats                                        → cycle
- classification, types, categories, taxonomy                     → hierarchy
- how laws / ideas / quantities relate (cause and effect)         → concept_map
- ordered stages, history, phases                                 → timeline
- a topic with its sub-topics / summary of a chapter              → mindmap
- parts of a system and how they connect                          → architecture
- database tables                                                 → er_diagram
Then follow the conventions of the detected type:
- flowchart: kinds start/end/process/decision (+input/result), label decision edges
- concept_map: kinds concept/formula/input/result, edge label = relationship
- hierarchy: kinds concept/detail, parent → child edges, children share parent's group
- cycle: kind state, 5-9 nodes, edges form one closed loop
- timeline: kinds start/process/end, edges chain in order
- mindmap: one central, 4-7 branch, 2-4 detail each (detail shares its branch's group), empty descriptions
- architecture: kinds service/database/external, group = layer, edge label = what flows
- er_diagram: kind entity, group = domain area, description = attributes, edge label = cardinality`,
};

const buildPlanPrompt = (description, selectedType) => `
You are an expert educator and diagram designer who works across ALL subjects:
physics, chemistry, biology, maths, history, geography, economics, software, everyday topics.
Turn the user's description into a DETAILED, DESCRIPTIVE, ACCURATE diagram structure.
A separate program handles layout, sizes and colors, so you only design the CONTENT.

USER DESCRIPTION:
"""${description}"""

DIAGRAM TYPE:
${TYPE_GUIDANCE[selectedType] || TYPE_GUIDANCE.auto}
(If a specific type is given above, set "diagram_type" to it; otherwise set the type you detected.)

QUALITY RULES:
- Be factually correct. Use real terms, laws, formulas, units, values and conditions of the topic.
  Never invent facts to fill space.
- The description is usually short. EXPAND it into a complete diagram that a student could learn
  from, like a good textbook figure. Do not just echo the user's words.
- Size: typically 8-16 nodes. Cycles 5-9 nodes. Mind maps 15-25 nodes including details.
  Maximum 28. Do not pad with filler and do not oversimplify.
- Every node must be specific to this topic. No placeholders like "Step 1", "Process" or "Item A".
- Include conditions, exceptions and alternative outcomes where they exist in the real topic
  (for example catalysts and temperature in a reaction, or air resistance in a motion diagram).

EDGE RULES (very important, avoid clutter):
- Include ONLY connections that carry real meaning. Fewer, cleaner arrows beat a tangled web.
- Aim for a tidy, mostly tree-like structure: about (nodes - 1) to (1.3 x nodes) edges in total.
- If A -> B -> C already shows the link, do NOT also add A -> C.
- Never add both A -> B and B -> A.
- Do not link every node to a central "hub" node. Connect each node only to its most direct neighbour(s).
- A node that is only an example or illustration attaches to exactly ONE related node.
- Every node needs at least one edge, but no more than it truly needs.
- Edge labels must be specific ("accelerates", "measured in"). Never use vague labels like
  "relates to" or "includes": if there is no specific label, use "" or drop the edge.

FIELDS:
- title: short diagram title (max 6 words).
- subtitle: one line (max 14 words) saying what the diagram shows.
- nodes[].id: sequential numeric strings "1", "2", "3"...
- nodes[].label: 1-5 words, specific.
- nodes[].group: 1-2 word category used to COLOR the node. Nodes of the same category / branch /
  layer / phase must use exactly the same string. Use 3-6 distinct groups in total
  (e.g. "Reactants", "Products", "Catalyst"  or  "Client", "Backend", "Data").
- nodes[].description: one concrete line (max ~12 words) shown under the shape, with formulas /
  units / examples where useful. Unicode symbols are fine (H₂O, v², →, Δ, λ, π).
- edges: reference node ids. Add "label" wherever it adds meaning, otherwise "".
- notes: 2-4 short takeaways (key formulas to remember, conditions, common mistakes). [] if not useful.
- Write everything in English unless the user explicitly asks for another language.
`;

// ── Canvas shape converter (flat shape → your canvas format) ────────────────
// Input x,y = top-left of bounding box.
// rect/roundedRect keep top-left; circle/ellipse/diamond are converted to center.
const toCanvasShape = (s) => {
  const base = {
    id: String(s.id),
    text: s.text,
    fill: s.fill,
    stroke: s.stroke,
  };
  const w = Math.max(40, s.w);
  const h = Math.max(40, s.h);

  switch (s.type) {
    case "circle": {
      const radius = Math.round(Math.min(w, h) / 2);
      return {
        ...base,
        type: "circle",
        x: s.x + radius,
        y: s.y + radius,
        radius,
      };
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
      return {
        ...base,
        type: "roundedRect",
        x: s.x,
        y: s.y,
        width: w,
        height: h,
        cornerRadius: 16,
      };
    default: // rect
      return { ...base, type: "rect", x: s.x, y: s.y, width: w, height: h };
  }
};

// ── Colors ───────────────────────────────────────────────────────────────────
// Group palette: ordered so that consecutive groups get clearly different hues.
// stroke is also used as the text color for that group (dark enough to read on white).
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

// These kinds keep a fixed, meaningful color in every diagram.
const FIXED_STYLE = {
  start: { fill: "#dcfce7", stroke: "#15803d" },
  end: { fill: "#fee2e2", stroke: "#b91c1c" },
  decision: { fill: "#fef9c3", stroke: "#a16207" },
};

// Text colors (non-node text)
const THEME = {
  title: "#0f172a",
  subtitle: "#64748b",
  heading: "#0f172a",
};

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
      return "rect"; // process, formula, entity, service, detail
  }
};

// ── Sizing helpers ───────────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// Greedy word-wrap → array of lines
const wrapLines = (text, maxChars) => {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
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

// ── Layout 1: layered (flowchart / concept map / hierarchy / timeline / ER / architecture)
const buildLayers = (nodes, edges) => {
  const ids = nodes.map((n) => n.id);
  const out = new Map(ids.map((id) => [id, []]));
  const hasIn = new Set();
  edges.forEach((e) => {
    out.get(e.from).push(e.to);
    hasIn.add(e.to);
  });

  // 1) break cycles (drop back edges) so layering always terminates
  const state = new Map();
  const dag = new Map(ids.map((id) => [id, []]));
  const dfs = (u) => {
    state.set(u, 1);
    for (const v of out.get(u)) {
      if (state.get(v) === 1) continue; // back edge
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
      const p = nbrs
        .get(id)
        .filter((n) => pos.has(n))
        .map((n) => pos.get(n));
      return { id, s: p.length ? p.reduce((a, b) => a + b, 0) / p.length : i };
    });
    scored.sort((a, b) => a.s - b.s);
    scored.forEach((x, i) => (layer[i] = x.id));
  };
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 1; i < layers.length; i++) sortBy(layers[i], layers[i - 1]);
    for (let i = layers.length - 2; i >= 0; i--)
      sortBy(layers[i], layers[i + 1]);
  }
  return layers;
};

// returns Map id → footprint top-left {fx, fy}
const positionLayers = (layers, byId, dir) => {
  const horizontal = dir === "LR";
  const mainGap = horizontal ? 150 : 100;
  const crossGap = horizontal ? 60 : 70;
  const main = (n) => (horizontal ? n.fw : n.fh);
  const cross = (n) => (horizontal ? n.fh : n.fw);

  const layerCross = layers.map(
    (l) =>
      l.reduce((s, id) => s + cross(byId.get(id)), 0) +
      crossGap * (l.length - 1),
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

// ── Layout 2: radial (mind map) → Map id → {cx, cy} ─────────────────────────
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
  // disconnected nodes → hang them off the root
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

// ── Layout 3: circular (cycles) → Map id → {cx, cy} ─────────────────────────
// Follows the edge chain from node "1" so stages sit in order, clockwise.
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
  const Rx = R * 1.3; // shapes are wider than tall → stretch horizontally
  const Ry = R;

  const centers = new Map();
  order.forEach((id, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / order.length;
    centers.set(id, { cx: Rx * Math.cos(a), cy: Ry * Math.sin(a) });
  });
  return centers;
};

// ── Edge pruning: keep only the connections that are really needed ──────────
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
  if (type === "cycle") return edges; // a cycle needs every link
  const ids = nodes.map((n) => n.id);
  const kindOf = new Map(nodes.map((n) => [n.id, n.kind]));

  // 1) drop reverse duplicates (A→B and B→A). Decision branches are always kept.
  const pairs = new Set();
  let list = edges.filter((e) => {
    const key = [e.from, e.to].sort().join("|");
    if (pairs.has(key) && kindOf.get(e.from) !== "decision") return false;
    pairs.add(key);
    return true;
  });

  // layer of every node (used to find shortcut edges and long cross-links)
  const layerOf = new Map();
  buildLayers(nodes, list).forEach((l, i) =>
    l.forEach((id) => layerOf.set(id, i)),
  );

  // 2) transitive reduction: drop A→C when a forward path A→…→C already exists
  const outs = new Map(ids.map((id) => [id, []]));
  list.forEach((e) => outs.get(e.from).push(e.to));
  const reachable = (from, target) => {
    const stack = [from];
    const seen = new Set([from]);
    while (stack.length) {
      const u = stack.pop();
      for (const v of outs.get(u)) {
        if (layerOf.get(v) <= layerOf.get(u)) continue; // forward only
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
    // temporarily remove this edge, see if the target is still reachable
    outs.set(
      e.from,
      outs.get(e.from).filter((v) => v !== e.to),
    );
    if (reachable(e.from, e.to)) return false;
    outs.get(e.from).push(e.to);
    return true;
  });

  // 3) hard cap per diagram type; drop the longest / unlabeled links first, never disconnect
  const decisions = nodes.filter((n) => n.kind === "decision").length;
  const extra = {
    flowchart: decisions + 1,
    concept_map: Math.ceil(nodes.length * 0.3),
    architecture: Math.ceil(nodes.length * 0.3),
    er_diagram: Math.ceil(nodes.length * 0.25),
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

  // 1) ONE LLM call: content only
  const response = await groq.chat.completions.create({
    model: groqModel,
    messages: [
      { role: "user", content: buildPlanPrompt(description, selectedType) },
    ],
    reasoning_effort: "medium",
    max_completion_tokens: 8192,
    response_format: {
      type: "json_schema",
      json_schema: { name: "diagram_plan", strict: true, schema: planSchema },
    },
  });
  if (!response) {
    throw new ApiError(500, "Groq error");
  }
  const plan = JSON.parse(response.choices[0].message.content);

  // 2) sanitize: unique ids → re-number 1..n, drop invalid / duplicate / self edges
  const idMap = new Map();
  const nodes = [];
  for (const n of plan.nodes || []) {
    if (!n.id || idMap.has(n.id) || nodes.length >= 30) continue;
    const newId = String(nodes.length + 1);
    idMap.set(n.id, newId);
    nodes.push({ ...n, id: newId });
  }
  if (nodes.length === 0) {
    throw new ApiError(
      422,
      "Could not extract any elements from the description",
    );
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

  const resolvedType = DIAGRAM_TYPES.includes(selectedType)
    ? selectedType
    : plan.diagram_type;

  // keep only the connections that are really needed
  const edges = pruneEdges(nodes, rawEdges, resolvedType);

  // 3) colors: fixed style for start/end/decision, group palette for everything else
  const groupIndex = new Map(); // normalized group → palette index
  const groupLabel = new Map(); // normalized group → display label
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

  // 4) measure every node
  nodes.forEach((n) => {
    n.style = styleFor(n);
    n.shapeType = pickShapeType(n.kind);
    n.labelLines = wrapLines(n.label, 22);
    const { w, h } = sizeFor(n.shapeType, n.labelLines, n.kind);
    n.w = w;
    n.h = h;
    n.descLines =
      resolvedType === "mindmap" ? [] : wrapLines(n.description, 34);
    n.descH = n.descLines.length
      ? Math.round(n.descLines.length * 14 * TEXT_LINE_HEIGHT) + 14
      : 0;
    n.descW = n.descLines.length
      ? Math.max(...n.descLines.map((l) => l.length)) * 7.2
      : 0;
    n.fw = Math.round(Math.max(n.w, n.descW + 24));
    n.fh = n.h + n.descH;
  });
  const byId = new Map(nodes.map((n) => [n.id, n]));

  // 5) compute box positions (top-left of each shape, relative to 0,0)
  const boxes = new Map();
  let centers = null;
  if (resolvedType === "mindmap") centers = positionRadial(nodes, edges);
  else if (resolvedType === "cycle")
    centers = positionCycle(nodes, edges, byId);

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
    const dir = LR_TYPES.includes(resolvedType) ? "LR" : "TB";
    const layers = buildLayers(nodes, edges);
    const pos = positionLayers(layers, byId, dir);
    pos.forEach((p, id) => {
      const n = byId.get(id);
      boxes.set(id, { x: p.fx + (n.fw - n.w) / 2, y: p.fy });
    });
  }

  // 6) build canvas elements
  const hasTitle = Boolean(plan.title);
  const hasSubtitle = Boolean(plan.subtitle);
  const titleH = hasTitle ? (hasSubtitle ? 130 : 90) : 0;
  const ox = startX;
  const oy = startY + titleH;

  let nextId = nodes.length + 1;
  // Every text element: no outline, normal weight unless told otherwise, comfortable line height.
  const textShape = (x, y, text, fontSize, fill, opts = {}) => ({
    id: String(nextId++),
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

  if (hasTitle) {
    shapes.push(
      textShape(startX, startY, plan.title, 34, THEME.title, {
        fontStyle: "bold",
      }),
    );
  }
  if (hasSubtitle) {
    shapes.push(
      textShape(startX, startY + 48, plan.subtitle, 16, THEME.subtitle),
    );
  }

  let maxY = oy;
  let minX = Infinity;

  nodes.forEach((n) => {
    const b = boxes.get(n.id);
    const x = ox + b.x;
    const y = oy + b.y;

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

    // description under the shape: centered via width + align, colored like its group
    if (n.descLines.length) {
      const dw = Math.max(n.w, Math.round(n.descW) + 24);
      extraTexts.push(
        textShape(
          x + n.w / 2 - dw / 2,
          y + n.h + 8,
          n.descLines.join("\n"),
          14,
          n.style.stroke,
          {
            width: dw,
            align: "center",
          },
        ),
      );
    }

    minX = Math.min(minX, x);
    maxY = Math.max(maxY, y + n.h + n.descH);
  });

  // edge labels: placed past the source node's description zone, colored like the source group
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
    extraTexts.push(
      textShape(lx, ly, e.label, 14, src.style.stroke, { fontStyle: "bold" }),
    );
  });

  shapes.push(...extraTexts);

  // notes: heading + one colored text per point
  const baseX = minX === Infinity ? startX : minX;
  const notes = (plan.notes || []).filter((x) => x && x.trim());
  const blockY = maxY + 70;
  if (notes.length) {
    shapes.push(
      textShape(baseX, blockY, "Key Notes", 20, THEME.heading, {
        fontStyle: "bold",
      }),
    );
    let cursorY = blockY + 36;
    notes.forEach((note, i) => {
      const lines = wrapLines(note, 70);
      const color = GROUP_PALETTE[i % GROUP_PALETTE.length].stroke;
      shapes.push(
        textShape(baseX, cursorY, "• " + lines.join("\n   "), 16, color),
      );
      cursorY += Math.round(lines.length * 16 * TEXT_LINE_HEIGHT) + 14;
    });
  }

  // legend: group name → color (only when there are at least 2 groups)
  if (groupLabel.size >= 2) {
    const legendX = notes.length ? baseX + 700 : baseX;
    shapes.push(
      textShape(legendX, blockY, "Legend", 20, THEME.heading, {
        fontStyle: "bold",
      }),
    );
    let ly = blockY + 36;
    groupLabel.forEach((label, key) => {
      const color =
        GROUP_PALETTE[groupIndex.get(key) % GROUP_PALETTE.length].stroke;
      shapes.push(textShape(legendX, ly, "■  " + label, 16, color));
      ly += 28;
    });
  }

  const arrows = edges.map((e, i) => ({
    id: `a${i + 1}`,
    from: e.from,
    to: e.to,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { shapes, arrows },
        "Diagram generated successfully",
      ),
    );
});

export default textToDiagram;
