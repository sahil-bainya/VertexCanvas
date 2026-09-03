import { Server } from "socket.io";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join-board", (boardId) => {
      socket.join(boardId);
      console.log(`Socket ${socket.id} joined board ${boardId}`);
    });

    socket.on("shape-moved", ({ boardId, shapeId, x, y, rotation }) => {
      socket.to(boardId).emit("shape-moved", { shapeId, x, y, rotation });
    });

    socket.on("shape-added", ({ boardId, shapeId, x, y, type }) => {
      socket.to(boardId).emit("shape-added", { shapeId, x, y, type });
    });

    socket.on("shape-deleted", ({ boardId, shapeId }) => {
      socket.to(boardId).emit("shape-deleted", { shapeId });
    });

    socket.on("shape-transformed", (data) => {
      const { boardId, shapeId, ...rest } = data;
      socket.to(boardId).emit("shape-transformed", { shapeId, ...rest });
    });

    socket.on("arrow-connected", (data) => {
      const { boardId, arrowId, fromId, toId, points, stroke, fill } = data;

      socket.to(boardId).emit("arrow-connected", {
        arrowId,
        fromId,
        toId,
        points,
        stroke,
        fill,
      });
    });

    socket.on("label-updated", ({ boardId, shapeId, updatedText }) => {
      socket.to(boardId).emit("label-updated", { shapeId, updatedText });
    });

    socket.on("color-updated", ({ boardId, shapeId, key, value }) => {
      socket.to(boardId).emit("color-updated", { shapeId, key, value });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
