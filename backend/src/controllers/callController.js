import { StreamClient } from "@stream-io/node-sdk";

// Initialize Stream Client for generating tokens
const streamClient = new StreamClient(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const getCallToken = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { callId } = req.params;
    if (!callId) {
      return res.status(400).json({ message: "Missing callId" });
    }

    // Generate a call-scoped token (video SDK can also use user token; here we keep call token path)
    const token = streamClient.generateCallToken({
      user_id: req.user.id,
      call_cids: [`default:${callId}`],
    });

    return res.status(200).json({
      token,
      userId: req.user.id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic,
      callId,
    });
  } catch (error) {
    console.error("Error generating call token:", error);
    res.status(500).json({ message: "Failed to generate call token" });
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
