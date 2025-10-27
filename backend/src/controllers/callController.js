import { StreamVideoServer } from "@stream-io/video-node-sdk";

const streamVideo = StreamVideoServer.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const getCallToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const callId = req.params.callId;

    // Generate a token valid for 24 hours
    const token = streamVideo.createToken(userId);

    res.status(200).json({
      token,
      userId,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic,
    });
  } catch (error) {
    console.error("Error generating call token:", error);
    res.status(500).json({ message: "Failed to generate call token" });
  }
};

export const endCall = async (req, res) => {
  try {
    const { callId } = req.params;
    await streamVideo.endCall(callId);
    res.status(200).json({ message: "Call ended successfully" });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ message: "Failed to end call" });
  }
};
