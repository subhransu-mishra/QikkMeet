import { StreamChat } from "stream-chat";

const STREAM_API_KEY = process.env.STREAM_API_KEY;
const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

export const createStreamToken = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const serverClient = StreamChat.getInstance(
      STREAM_API_KEY,
      STREAM_API_SECRET
    );

    
    const token = serverClient.createToken(userId);

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error creating Stream token:", error);
    res.status(500).json({ message: "Failed to create Stream token" });
  }
};
