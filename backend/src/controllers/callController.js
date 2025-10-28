import { StreamClient } from "@stream-io/node-sdk";

// Initialize Stream Client for generating tokens
const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const getCallToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const callId = req.params.callId;

    // Generate a video call token
    const token = streamClient.generateCallToken({
      user_id: userId,
      call_cids: [`default:${callId}`],
    });

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
    const streamVideo = streamClient.video();
    const call = streamVideo.call("default", callId);
    await call.end();
    res.status(200).json({ message: "Call ended successfully" });
  } catch (error) {
    console.error("Error ending call:", error);
    res.status(500).json({ message: "Failed to end call" });
  }
};
