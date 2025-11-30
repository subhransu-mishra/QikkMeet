import express from "express";
import { validateMessage } from "../controllers/fraudDetection.controller.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect the fraud detection endpoint - only authenticated users can validate messages
router.post("/validate-message", protectRoute, validateMessage);

export default router;
