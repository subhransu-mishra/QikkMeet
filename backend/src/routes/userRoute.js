import express from "express";
import {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getPendingFriendRequests,
  getOutgoingFriendRequests,
  getAcceptedFriendRequests,
} from "../controllers/userController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All user routes require authentication
router.use(protectRoute);

// GET routes
router.get("/", getRecommendedUsers); // GET /api/users
router.get("/friends", getMyFriends); // GET /api/users/friends
router.get("/friend-requests", getPendingFriendRequests); // ✅ ADD THIS - matches frontend call
router.get("/outgoing-friend-requests", getOutgoingFriendRequests); // GET /api/users/outgoing-friend-requests
router.get("/pending-friend-requests", getPendingFriendRequests); // keep for backwards compatibility
router.get("/accepted-friend-requests", getAcceptedFriendRequests); // GET /api/users/accepted-friend-requests

// POST routes
router.post("/friend-request/:id", sendFriendRequest); // POST /api/users/friend-request/:id

// PUT routes
router.put("/friend-request/:id/accept", acceptFriendRequest); // ✅ ADD THIS - matches frontend call

// DELETE routes
router.delete("/friend-request/:id", rejectFriendRequest); // ✅ ADD THIS - matches frontend call

export default router;
