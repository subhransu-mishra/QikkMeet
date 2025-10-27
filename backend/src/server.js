import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoute.js";
import { connectDB } from "./lib/db.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";

const PORT = process.env.PORT || 5001;
dotenv.config();

const app = express();

// Lightweight security headers (replacement for helmet)
app.use((req, res, next) => {
  // Similar to helmet defaults
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  // Match your previous helmet config
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Trust proxy (needed if behind reverse proxy)
app.set("trust proxy", 1);

// Compression
app.use(compression());

// CORS with env-based origins
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

// Basic health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

// Rate limiting (auth endpoints)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/auth", authLimiter);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// Process-level error guards
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
