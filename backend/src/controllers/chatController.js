import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    const token = generateStreamToken(req.user.id);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
