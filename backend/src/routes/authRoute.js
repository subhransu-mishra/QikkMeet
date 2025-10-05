import express from "express";
import {
  signup,
  login,
  logout,
  onboard,
} from "../controllers/authController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);
router.post("/logout", logout);
router.post("/onboarding", protectRoute, onboard);

router.get("/me", protectRoute, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        fullName: req.user.fullName,
        profilePic: req.user.profilePic,
        bio: req.user.bio,
        location: req.user.location,
        isOnboarded: req.user.isOnboarded,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
