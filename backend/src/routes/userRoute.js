import express from 'express';
import {protectRoute} from '../middlewares/authMiddleware.js';
import { getRecommendedUsers, getMyFriends } from '../controllers/userController.js';
const router = express.Router();

//apply auth middleware to all routes after this line
router.use(protectRoute);

router.get('/', getRecommendedUsers);
router.get('/friends', getMyFriends);
router.post('/friend-request/:id', sendFriendRequest);
router.put('/friend-request/:id/accept', acceptFriendRequest);

export default router;