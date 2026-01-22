import { generateStreamToken, upsertStreamUser } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    if (!req.user?.id) return res.status(401).json({ message: "Unauthorized" });

    // Ensure user exists in Stream before generating token
    try {
      await upsertStreamUser({
        id: req.user._id.toString(),
        name: req.user.fullName,
        image: req.user.profilePic || "",
      });
    } catch (upsertError) {
      console.error("Error upserting user to Stream:", upsertError);
      // Continue even if upsert fails - user might already exist
    }

    const token = generateStreamToken(req.user.id);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
