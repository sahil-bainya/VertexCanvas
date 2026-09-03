import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import http from "http"; 
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT;

const httpServer = http.createServer(app);

initSocket(httpServer);

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
