import User from "../models/User.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;

    const recommendedUser = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        { _id: { $nin: currentUser.friends } }, // Exclude current user's friends
        { isOnboarded: true }, // Only include onboarded users
      ],
    });

    res.status(200).json(recommendedUser);
  } catch (error) {
    console.error("Error fetching recommended users:", error);
  }
}
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'fullName profilePic');
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching user's friends:", error);
    res.status(500).json({ message: error.message });
  }
}
export async function getMyFriends(req, res) {}
