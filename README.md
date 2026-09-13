# VertexCanvas

> **A Space to Think, Create & Collaborate.**

A real-time collaborative whiteboard built with a custom canvas engine and AI-powered diagram intelligence — analyze, organize, and generate diagrams directly on the canvas.

[![Live Demo](https://img.shields.io/badge/Live-vertexcanvas.vercel.app-6B21A8?style=for-the-badge&logo=vercel&logoColor=white)](https://vertexcanvas-teal.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](./LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-VertexCanvas-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sahil-bainya/VertexCanvas)
> **Note:** The backend is hosted on Render's free tier and is kept awake via UptimeRobot. If you experience a brief delay on the very first request, the server may be warming up — subsequent requests will be instant.

---
## Table of Contents

- [Overview](#overview)
- [Why VertexCanvas](#why-vertexcanvas)
- [Live Demo](#live-demo)
- [Features](#features)
  - [Canvas Engine](#-canvas-engine-custom-built)
  - [AI Features](#-ai-features-groq--llama-33)
  - [Real-Time Collaboration](#-real-time-collaboration-socketio)
  - [Board Access Control](#-board-access-control)
  - [Context Layer](#-context-layer)
  - [Board-Level Notes](#-board-level-notes)
  - [UX & Platform](#-ux--platform)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Engineering Highlights](#engineering-highlights)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Socket Events](#socket-events)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgments](#acknowledgments)
---
## Overview

VertexCanvas is a full-stack real-time collaborative whiteboard engineered around a **custom-built canvas engine** (Konva.js) and an **AI-powered diagram assistant** (Groq / LLaMA). It is designed for software engineers, architects, and product teams who need more than a drawing tool — they need an intelligent workspace that understands diagrams, suggests improvements, and generates working code from a sketch.

The entire product is **built from scratch** — shape rendering, arrow routing, undo/redo, real-time sync, access control, and AI integration — without relying on a diagramming library or a collaborative framework.

---

## Why VertexCanvas

| Capability | Excalidraw | Eraser.io | VertexCanvas |
|---|---|---|---|
| Real-time multi-user sync | ✅ | ✅ | ✅ |
| Custom canvas engine | ✅ | ❌ | ✅ |
| AI diagram analysis | ❌ | ✅ | ✅ |
| AI code generation from diagram | ❌ | ❌ | ✅ |
| Text-to-diagram generation | ❌ | ✅ | ✅ |
| Invite-based access control | ❌ | ✅ | ✅ |
| Binary-encoded freehand sync | ❌ | ❌ | ✅ |
| Live multi-user cursors | ✅ | ✅ | ✅ |
| Context layer (notes/links/code per shape) | ❌ | ❌ | ✅ |
| Export to PNG/PDF | ✅ | ✅ | ✅ |
| Open source (MIT) | ✅ | ❌ | ✅ |

---

## Live Demo

| Service | URL |
|---|---|
| **Frontend** | https://vertexcanvas-teal.vercel.app |
| **Backend API** | https://vertexcanvas.onrender.com |

> **Note:** Backend is hosted on Render's free tier. First request may take 30–60 seconds to wake up.

---

## Features

### 🎨 Canvas Engine (Custom Built)

- **10+ shape types** — rectangle, rounded rectangle, circle, ellipse, diamond, triangle, parallelogram, text, arrow, line, freehand
- **Full manipulation** — drag, resize, rotate with rotation-aware geometry
- **Smart arrow connections** — trigonometric edge-detection algorithm that computes the exact connection point on any shape, accounting for rotation
- **Ray-casting polygon intersection** for precise arrow anchoring on triangles, diamonds, and parallelograms
- **Inline text labels** with per-shape auto font sizing and bounding-box-aware positioning
- **Freehand pencil tool** with configurable color and stroke width
- **Eraser tool** — click-to-delete shapes with auto-cleanup of connected arrows
- **Infinite canvas** — zoom (0.1×–5×), pan, and grid toggle
- **Theme-aware rendering** — shapes auto-recolor on theme switch, manual colors preserved via `isDefaultColor` flag

### 🤖 AI Features (Groq / LLaMA 3.3)

- **Analyze** — Detects diagram type (flowchart, architecture, ER, mind map) and returns calibrated suggestions, error detection, and improvement recommendations
- **Organize** — AI extracts logical relationships, ELK.js computes deterministic pixel positions for a clean layout
- **Generate** — Natural language → structured diagram with type-specific conventions (flowchart, ER, architecture, mind map)
- **Generate Code** — Converts diagrams into runnable code:
  - Flowcharts → Python, JavaScript, C++, Java
  - ER diagrams → SQL schema or Mongoose models
  - Architecture → Express, FastAPI, or NestJS boilerplate

### 👥 Real-Time Collaboration (Socket.io)

- **Single global socket connection** — persists across Dashboard ↔ Board navigation, no reconnect flicker
- **Personal rooms** (`user-{userId}`) for cross-app notifications
- **Board rooms** (`boardId`) for canvas-scoped events
- **Live cursor tracking** with throttled binary encoding
- **Freehand drawing sync** using **delta-encoded Int16Array binary payloads** with 50ms throttled batching — ~90% bandwidth reduction vs JSON
- **12+ synchronized events** — shape add/move/transform/delete, arrow connect/delete, label update, color update, cursor move, user-left

### 🔐 Board Access Control

- **Invite-based collaboration** via shareable board URL
- **Request-to-join flow** — non-collaborators see a Request Access screen
- **Real-time owner notifications** via personal rooms
- **Accept / Reject** with instant requester feedback and auto-redirect
- **Role-based permissions** — Owner (full) / Collaborator (limited) / No-access
- **Collaborator management** — view and remove collaborators from the board

### 📝 Context Layer

- Attach **notes, links, and code snippets** to any individual shape
- Tabbed panel with syntax-highlighted code editor
- Debounced auto-save (800ms) + immediate save on tab switch/close

### 📒 Board-Level Notes

- Manual notes and AI-generated notes (one-click "Add to Notes")
- Edit and delete notes inline
- Optional code attachment from generated outputs

### ⚡ UX & Platform

- **Undo / Redo** — snapshot-based history with `Ctrl+Z` / `Ctrl+Y`
- **Export** — PNG and PDF via Konva `toDataURL()` + jsPDF
- **Theme system** — Redux-managed, synced to DaisyUI `data-theme`, persisted to localStorage
- **Drag-and-drop panels** — AI suggestion panel, context panel, notes drawer
- **Full-screen canvas mode**
- **Toast notification system** — unified feedback across the app

---

## Screenshots

### Dashboard
![Dashboard](https://github.com/user-attachments/assets/983f1283-c798-4285-b08b-3bdcbff4931d)

### Canvas & Toolbar
![Canvas & Toolbar](https://github.com/user-attachments/assets/25d86c35-59b4-4641-adf4-7ba514552a92)

### AI Suggestions Panel
![AI Suggestions Panel](https://github.com/user-attachments/assets/d6957338-5a4e-494a-ad79-a18b96b8f364)

### Code Generation
![Code Generation](https://github.com/user-attachments/assets/f0617f10-395f-4fdd-b404-9e927756a862)

### Real-Time Collaboration
![Real-Time Collaboration](https://github.com/user-attachments/assets/3f785987-8d41-44e2-8832-7026d9425804)

### Board Access Request
![Board Access Request](https://github.com/user-attachments/assets/0b912ee3-6049-4cb6-a868-3d374efd39cb)


---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19 + Vite** | UI framework & build tool |
| **Redux Toolkit** | Global state (auth, theme, board) |
| **React Router v7** | Routing |
| **Konva.js + react-konva** | Canvas engine |
| **Tailwind CSS + DaisyUI** | Styling & theming |
| **Socket.io-client** | Real-time communication |
| **Axios** | HTTP client |
| **jsPDF** | PDF export |
| **ELK.js** | Deterministic graph layout |
| **react-hot-toast** | Notifications |
| **@uiw/react-textarea-code-editor** | Code editor with syntax highlighting |
| **lucide-react / react-icons** | Iconography |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | REST API server |
| **MongoDB + Mongoose** | Database |
| **Socket.io** | WebSocket server |
| **JWT (httpOnly cookies)** | Authentication |
| **bcrypt** | Password hashing |
| **Multer + Cloudinary** | File & avatar uploads |
| **Groq SDK** | AI integration |

### AI / Infrastructure
| Service | Purpose |
|---|---|
| **Groq API** (LLaMA 3.3 70B) | Diagram analysis, cleanup, generation, code gen |
| **ELK.js** | Hybrid AI + algorithm layout engine |
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Cloud database |
| **Cloudinary** | Media storage |

---

## Architecture

<img width="1536" height="1024" alt="ChatGPT Image Sep 13, 2026, 07_53_29 PM" src="https://github.com/user-attachments/assets/7963d738-29f2-4841-9d3e-704ef49ddf05" />
---

## Engineering Highlights

A few non-trivial problems solved during development:

### 1. Binary-Encoded Freehand Sync
Naive freehand sync over WebSockets saturates the network — every mousemove event fires JSON payloads. VertexCanvas solves this with:
- **Delta encoding** — only send the change in coordinates, not absolute positions
- **Int16Array binary payloads** — 2 bytes per coordinate vs ~15 bytes for JSON
- **50ms throttled batching** — 20 updates/second instead of 60

Result: **~90% bandwidth reduction** without perceptible lag.

### 2. Rotation-Aware Arrow Geometry
Arrows stay anchored to shape edges even when shapes rotate. Implemented via:
- Local ↔ global coordinate transformation using the shape's rotation matrix
- Ray-casting edge intersection for polygon shapes (diamond, triangle, parallelogram)
- Parametric rectangle intersection for rect / roundedRect

### 3. Global Socket Architecture
Initial implementation created a socket per page. Refactored to a **single app-level socket** using React Context with:
- Named-function listeners + `socket.off()` cleanup to prevent duplicate listeners
- Personal rooms for cross-page notifications
- Board rooms for canvas-scoped events

### 4. Stale-Closure-Free Remote Handlers
Socket callbacks captured stale state. Fixed with a **`shapesRef` mirror** (a `useRef` that always points to the latest state) so remote handlers compute on current data.

### 5. Hybrid AI + Algorithmic Layout
Pure LLM layout produced overlaps. Pure algorithmic layout lacked semantic grouping. Solution:
- **AI extracts nodes + edges** (semantic layer)
- **ELK.js computes positions** (deterministic geometry layer)
- Coordinate normalization re-centers output around canvas origin

### 6. Cross-Domain Cookie Authentication
Handled `SameSite=None; Secure` cookies for Vercel ↔ Render cross-origin auth, plus CORS configuration for both REST and WebSocket traffic.

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Groq API key

### 1. Clone the repository
```bash
git clone https://github.com/sahil-bainya/VertexCanvas.git
cd VertexCanvas
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `server/.env`:
```env
NODE_ENV=development
PORT=3000

ATLAS_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GROQ_API_KEY=your_groq_api_key
```

Run:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` — backend on `http://localhost:3000`.

---

## Project Structure

```
VertexCanvas/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── Auth/           # Sign in / Sign up
│       │   ├── BoardPage/      # Canvas, toolbar, panels, AI
│       │   ├── DashBoard/      # Board list
│       │   ├── Header/         # Nav + profile menu
│       │   └── Settings/       # Profile, appearance
│       ├── globalSocket/       # Socket context
│       ├── pages/              # Route pages
│       ├── services/           # Axios & API services
│       ├── store/              # Redux slices
│       └── utils/              # Helpers, toast
│
└── server/                     # Backend (Node + Express)
    └── src/
        ├── controllers/        # Board, User, AI
        ├── models/             # Mongoose schemas
        ├── routes/             # REST routes
        ├── middlewares/        # Auth, multer, error
        ├── utils/              # Cloudinary, error classes
        ├── constants.js
        ├── socket.js           # Socket.io server
        └── index.js
```

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/user/register` | Register a new user |
| `POST` | `/api/user/login` | Login (sets httpOnly cookies) |
| `POST` | `/api/user/logout` | Logout |
| `POST` | `/api/user/refresh-token` | Rotate access token |
| `GET` | `/api/user/current-user` | Get authenticated user |
| `POST` | `/api/user/update-avatar` | Upload avatar (Cloudinary) |
| `POST` | `/api/boards` | Create a board |
| `GET` | `/api/boards` | List user's boards |
| `GET` | `/api/boards/:id` | Fetch a board with access info |
| `PATCH` | `/api/boards/:id/canvas` | Save canvas state |
| `PATCH` | `/api/boards/:id/notes` | Save board notes |
| `POST` | `/api/boards/:id/join-request` | Request access |
| `POST` | `/api/boards/:id/accept-request` | Accept a request (owner) |
| `POST` | `/api/boards/:id/reject-request` | Reject a request (owner) |
| `GET` | `/api/boards/:id/collaborators` | List collaborators |
| `POST` | `/api/boards/:id/remove-collaborator` | Remove a collaborator |
| `POST` | `/api/ai/assist` | Analyze diagram |
| `POST` | `/api/ai/cleanup` | Reorganize diagram |
| `POST` | `/api/ai/text-to-diagram` | Generate diagram from text |
| `POST` | `/api/ai/generate-code` | Generate code from diagram |

---

## Socket Events

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `register-user` | `userId` |
| Client → Server | `join-board` | `boardId` |
| Client ↔ Server | `shape-added` | `{ boardId, shapeId, x, y, type }` |
| Client ↔ Server | `shape-moved` | `{ boardId, shapeId, x, y, rotation }` |
| Client ↔ Server | `shape-transformed` | `{ boardId, shapeId, ...fields }` |
| Client ↔ Server | `shape-deleted` | `{ boardId, shapeId }` |
| Client ↔ Server | `arrow-connected` | `{ boardId, arrowId, fromId, toId, points }` |
| Client ↔ Server | `arrow-deleted` | `{ boardId, arrowId }` |
| Client ↔ Server | `label-updated` | `{ boardId, shapeId, updatedText }` |
| Client ↔ Server | `color-updated` | `{ boardId, shapeId, key, value }` |
| Client ↔ Server | `freehand-start` | `{ boardId, shapeId, point }` |
| Client ↔ Server | `freehand-points-binary` | `{ boardId, shapeId, data: ArrayBuffer }` |
| Client ↔ Server | `cursor-move-binary` | `{ boardId, cursorData: ArrayBuffer, name }` |
| Server → Client | `access-requested` | `{ boardId, requesterId, requesterName }` |
| Server → Client | `request-approved` | `{ boardId }` |
| Server → Client | `request-rejected` | `{ boardId }` |
| Server → Client | `removed-from-board` | `{ boardId }` |
| Server → Client | `user-left` | `{ userId }` |

---

## Roadmap

- [ ] **Improve auto-layout engine** — more robust cleanup for complex diagrams
- [ ] **In-app AI chatbot** — contextual assistant with full board awareness
- [ ] **Markdown export** — export full canvas + notes as a `.md` file
- [ ] **Diagram templates** — pre-built starters for common architectures
- [ ] **Comment threads** — shape-anchored discussion threads
- [ ] **Version history** — timeline view of board changes
- [ ] **Mobile gestures** — pinch-to-zoom, touch-friendly toolbar
- [ ] **Team workspaces** — multi-board organization and sharing

---

## Contributing

Contributions, issues, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## Contact

**Sahil Bainya**

- Email: [sahilbainya2005@gmail.com](mailto:sahilbainya2005@gmail.com)
- LinkedIn: [linkedin.com/in/sahil-bainya-097575327](https://www.linkedin.com/in/sahil-bainya-097575327/)
- GitHub: [github.com/sahil-bainya](https://github.com/sahil-bainya)

---

## Acknowledgments

- Visual design and interaction patterns loosely inspired by [Excalidraw](https://excalidraw.com) and [Eraser.io](https://eraser.io) — VertexCanvas has its own architecture, canvas engine, and feature set built independently.
- Built with [Konva.js](https://konvajs.org), [Socket.io](https://socket.io), [Groq](https://groq.com), and [ELK.js](https://github.com/kieler/elkjs).

---

<p align="center">
  <strong>VertexCanvas</strong> — A Space to Think, Create & Collaborate.
</p>

















