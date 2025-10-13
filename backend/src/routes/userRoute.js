import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import {
  getRecommendedUsers,
  getMyFriends,
  acceptFriendRequest,
  sendFriendRequest,
  getPendingFriendRequests,
  getOutgoingFriendRequests,
  getAcceptedFriendRequests,
  rejectFriendRequest,
} from "../controllers/userController.js";
const router = express.Router();

//apply auth middleware to all routes after this line
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend-request/:id", rejectFriendRequest);

router.get("/friend-requests", getPendingFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);
router.get("/friend-requests/accepted", getAcceptedFriendRequests);

export default router;
