import { StreamClient } from "@stream-io/node-sdk";
import User from "../models/userModel.js";

const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const getCallToken = async (req, res) => {
  try {
    if (!req.user?.id) {
      console.error("Unauthorized call token request - no user");
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { callId } = req.params;
    if (!callId) {
      console.error("Missing callId in token request");
      return res.status(400).json({ message: "Missing callId" });
    }

    console.log(
      `Generating call token for user ${req.user.id} and call ${callId}`
    );

    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error("Stream API credentials missing in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const participantId = callId.split("-").find((id) => id !== req.user.id);

    let participantDetails = null;
    if (participantId) {
      try {
        const participant = await User.findById(participantId).select(
          "fullName profilePic"
        );
        if (participant) {
          participantDetails = {
            id: participantId,
            fullName: participant.fullName,
            profilePic: participant.profilePic,
          };
        }
      } catch (err) {
        console.warn("Failed to fetch participant details:", err);
      }
    }

    const token = streamClient.generateCallToken({
      user_id: req.user.id,
      call_cids: [`default:${callId}`],
    });

    console.log(`Successfully generated call token for user ${req.user.id}`);

    return res.status(200).json({
      token,
      userId: req.user.id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic,
      callId,
      participant: participantDetails,
    });
  } catch (error) {
    console.error("Error generating call token:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Failed to generate call token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    if (!callId) {
      return res.status(400).json({ message: "Missing callId" });
    }
    const streamVideo = streamClient.video();
    const call = streamVideo.call("default", callId);
    await call.end();
    res.status(200).json({ message: "Call ended successfully" });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ message: "Failed to end call" });
  }
};
