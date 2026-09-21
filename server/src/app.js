import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true, 
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import userRoutes from "./routes/user.route.js";
import boardRoutes from "./routes/board.route.js";
import aiRouter from "./routes/ai.routes.js";
import adminRouter from "./routes/admin.routes.js";

app.use("/api/user", userRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/ai", aiRouter);
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: Date.now() });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).json({
    statusCode,
    message,
    success: false,
  });
});

export default app;
