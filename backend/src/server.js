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
import callRoutes from "./routes/callRoute.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fraudDetectionRoutes from "./routes/fraudDetection.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import "./workers/moderation.worker.js";

const PORT = process.env.PORT || 5001;
dotenv.config();

const app = express();

// Lightweight security headers (replacement for helmet)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

// Trust proxy (needed if behind reverse proxy)
app.set("trust proxy", 1);

// Compression
app.use(compression());

// CORS with environment-aware origins
const isProd = process.env.NODE_ENV === "production";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: isProd ? true : [FRONTEND_URL, "http://localhost:5173"],
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ This now handles all user endpoints
app.use("/api/chats", chatRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/fraud-detection", fraudDetectionRoutes);
app.use(
  "/api/webhooks",
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  }),
  webhookRoutes
);

// Favicon (avoid 404 noise)
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// ----- Serve frontend build and SPA fallback -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, "../../frontend/dist");

// Serve static assets
app.use(express.static(clientDist));

// SPA fallback: serve index.html for non-API routes
app.get("*", (req, res) => {
  // Only handle non-API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API endpoint not found" });
  }
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) {
      res.status(500).send("Error loading application");
    }
  });
});

// Centralized error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

const startServer = async () => {
  try {
    const dbStatus = await connectDB();
    if (!dbStatus?.connected) {
      console.warn(
        "⚠️ DB not connected. API will run with limited functionality."
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("💀 Failed to start server:", error.message);
    // Do NOT exit here due to transient DNS errors; keep nodemon running
  }
};

startServer();

// Process-level error guards
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});
