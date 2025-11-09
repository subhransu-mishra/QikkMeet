import express from "express";
import { protectRoute } from "../middlewares/authMiddleware.js";
import { getCallToken, endCall } from "../controllers/callController.js";

const router = express.Router();

// All call routes require auth
router.use(protectRoute);

// GET user-scoped token for a call
router.get("/:callId/token", getCallToken);

// POST end a call explicitly (optional client use)
router.post("/:callId/end", endCall);

export default router;
