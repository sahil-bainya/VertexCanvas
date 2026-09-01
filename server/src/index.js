import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import http from "http"; // ← naya-import
import { Server } from "socket.io"; // ← naya-import
import app from "./app.js";
import connectDB from "./db/index.js";

const PORT = process.env.PORT;

const httpServer = http.createServer(app); // ← naya — Express-ko-HTTP-server-mein-wrap-kiya

const io = new Server(httpServer, {
  // ← naya — Socket.io-attach-kiya
  cors: {
    origin: "http://localhost:5173", // frontend-ka-URL, jaisa-Express-CORS-mein-hai
    credentials: true,
  },
});

// Basic-connection-test — yeh-abhi-ke-liye
io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);

  socket.on("join-board", (boardId) => {
    socket.join(boardId);
    // console.log(`Socket ${socket.id} joined board ${boardId}`);
  });

  socket.on("shape-moved", ({ boardId, shapeId, x, y, rotation }) => {
    socket.to(boardId).emit("shape-moved", { shapeId, x, y, rotation });
  });

  socket.on("shape-added", ({ boardId, shapeId, x, y, type }) => {
    socket.to(boardId).emit("shape-added", { shapeId, x, y, type });
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected:", socket.id);
  });
});

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      // ← app.listen-ki-jagah-httpServer.listen
      console.log("Server is running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed ", err);
  });
