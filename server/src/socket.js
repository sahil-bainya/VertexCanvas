import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", // same origin jo app.js mein hai
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Har board apna alag "room" hoga — isse ek board ke updates
    // dusre board ke users tak nahi jaayenge
    socket.on("join-board", (boardId) => {
      socket.join(boardId);
      console.log(`${socket.id} joined board ${boardId}`);
    });

    // Shape add hua
    socket.on("shape:add", ({ boardId, shape }) => {
      socket.to(boardId).emit("shape:add", shape);
    });

    // Shape move/drag hua
    socket.on("shape:move", ({ boardId, shape }) => {
      socket.to(boardId).emit("shape:move", shape);
    });

    // Shape delete hua
    socket.on("shape:delete", ({ boardId, shapeId }) => {
      socket.to(boardId).emit("shape:delete", shapeId);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized yet");
  return io;
};