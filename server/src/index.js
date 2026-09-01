import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import http from "http";
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT;

const httpServer = http.createServer(app); // Express ko HTTP server mein wrap kiya
initSocket(httpServer); // Socket.io usi server pe attach kiya

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      // ab httpServer listen karega
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed ", err);
  });
