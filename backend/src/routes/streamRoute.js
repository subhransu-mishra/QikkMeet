import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { createStreamToken } from "../controllers/streamController.js";

const router = express.Router();

// This route is protected, ensuring only authenticated users can get a token.
router.post("/token", protectRoute, createStreamToken);

export default router;
