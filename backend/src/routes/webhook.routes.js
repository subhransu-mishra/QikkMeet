import express from "express";
import { handleStreamWebhook } from "../controllers/webhook.controller.js";

const router = express.Router();

// Stream Chat webhook endpoint
router.post("/stream", handleStreamWebhook);

export default router;
