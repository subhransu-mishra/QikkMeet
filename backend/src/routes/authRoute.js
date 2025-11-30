import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  onboarding,
} from "../controllers/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Protected routes
router.post("/logout", protectRoute, logout);
router.get("/me", protectRoute, getMe);
router.post("/onboarding", protectRoute, onboarding);

export default router;
