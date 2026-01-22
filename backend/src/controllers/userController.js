import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { upsertStreamUser } from "../lib/stream.js";

export async function getRecommendedUsers(req, res) {
  try {
    const currentUserId = req.user.id;
    const currentUser = req.user;
    const userLocation = (currentUser.location || "").trim().toLowerCase();

    const candidates = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    }).select("fullName profilePic location bio");

    const sorted = candidates.sort((a, b) => {
      const aLoc = (a.location || "").trim().toLowerCase();
      const bLoc = (b.location || "").trim().toLowerCase();
      const aMatch = aLoc && userLocation && aLoc === userLocation;
      const bMatch = bLoc && userLocation && bLoc === userLocation;
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

    res.status(200).json(sorted);
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    res.status(500).json({ message: "Failed to fetch recommended users" });
  }
}
export async function getMyFriends(req, res) {
  try {
    const user = await User.findById(req.user.id).populate(
      "friends",
      "fullName profilePic"
    );
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching user's friends:", error);
    res.status(500).json({ message: error.message });
  }
}
export async function sendFriendRequest(req, res) {
  try {
    const myId = req.user.id;
    const { id: recipientId } = req.params;

    if (myId === recipientId) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }
    //check if the friendId is valid
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    //check if they are already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends" });
    }
    //check if a friend request has already been sent
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({
        message:
          "A friend request is already pending between you and this user",
      });
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: error.message });
  }
}
export async function acceptFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId).populate(
      "sender",
      "fullName profilePic"
    );

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    //Verify that the logged-in user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to accept this request" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add each user to the other's friends list

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { friends: friendRequest.sender._id },
    });
    await User.findByIdAndUpdate(friendRequest.sender._id, {
      $addToSet: { friends: friendRequest.recipient },
    });

    // Sync both users to Stream Chat so they can message each other
    try {
      // Sync the sender (the person who sent the request)
      await upsertStreamUser({
        id: friendRequest.sender._id.toString(),
        name: friendRequest.sender.fullName,
        image: friendRequest.sender.profilePic || "",
      });

      // Sync the recipient (current user who is accepting)
      await upsertStreamUser({
        id: req.user._id.toString(),
        name: req.user.fullName,
        image: req.user.profilePic || "",
      });

      console.log("Both users synced to Stream after friend request accepted");
    } catch (streamError) {
      console.error("Error syncing users to Stream:", streamError);
      // Don't block the friend request acceptance if Stream sync fails
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function rejectFriendRequest(req, res) {
  try {
    const { id: requestId } = req.params;
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    // Only recipient can reject
    if (friendRequest.recipient.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to reject this request" });
    }

    // DELETE the request instead of updating status
    await FriendRequest.findByIdAndDelete(requestId);

    return res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error rejecting friend request:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getPendingFriendRequests(req, res) {
  try {
    const pendingRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic bio location");

    const acceptedRequest = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted",
    }).populate("sender", "fullName profilePic");

    res.status(200).json({ pendingRequests, acceptedRequest });
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getOutgoingFriendRequests(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error fetching outgoing friend requests:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getAcceptedFriendRequests(req, res) {
  try {
    const acceptedRequests = await FriendRequest.find({
      recipient: req.user.id,
      status: "accepted",
    }).populate("sender", "fullName profilePic");

    res.status(200).json(acceptedRequests);
  } catch (error) {
    console.error("Error fetching accepted friend requests:", error);
    res.status(500).json({ message: error.message });
  }
}
