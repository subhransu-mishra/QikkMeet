import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // Debug logging
    console.log("Generating token for user:", req.user.id);
    console.log("Stream API Key:", process.env.STREAM_API_KEY);
    console.log("Stream API Secret defined:", !!process.env.STREAM_API_SECRET);

    const token = generateStreamToken(req.user.id);
    console.log("Generated token:", token);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
}
