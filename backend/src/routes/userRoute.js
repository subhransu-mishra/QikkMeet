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
router.get("/outgoing-friend-requests", getOutgoingFriendRequests); // GET /api/users/outgoing-friend-requests
router.get("/pending-friend-requests", getPendingFriendRequests); // GET /api/users/pending-friend-requests
router.get("/accepted-friend-requests", getAcceptedFriendRequests); // GET /api/users/accepted-friend-requests

// POST routes
router.post("/friend-request/:id", sendFriendRequest); // POST /api/users/friend-request/:id

// PUT routes
router.put("/accept-friend-request/:id", acceptFriendRequest); // PUT /api/users/accept-friend-request/:id
router.put("/reject-friend-request/:id", rejectFriendRequest); // PUT /api/users/reject-friend-request/:id

export default router;
