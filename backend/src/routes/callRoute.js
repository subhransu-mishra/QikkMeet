import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { getCallToken, endCall } from "../controllers/callController.js";

const router = express.Router();

router.get("/:callId/token", protectRoute, getCallToken);
router.post("/:callId/end", protectRoute, endCall);

export default router;
