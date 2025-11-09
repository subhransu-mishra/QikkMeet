import { StreamVideoClient } from "@stream-io/video-react-sdk";

let videoClientInstance = null;
let currentUserId = null;

export const getStreamVideoClient = async (user, token) => {
  const apiKey = import.meta.env.VITE_STREAM_API_KEY;
  if (!apiKey) {
    console.error("Stream API key missing");
    return null;
  }
  if (!token) {
    console.error("Missing Stream video token");
    return null;
  }

  // Reuse same client if same user
  if (videoClientInstance && currentUserId === user.id) {
    return videoClientInstance;
  }

  // Disconnect if switching user
  if (videoClientInstance && currentUserId !== user.id) {
    try {
      await videoClientInstance.disconnectUser();
    } catch (e) {
      console.warn("Previous video client disconnect failed:", e);
    }
    videoClientInstance = null;
  }

  videoClientInstance = new StreamVideoClient({
    apiKey,
    user: {
      id: user.id,
      name: user.name,
      image: user.image,
    },
    token, // call token or user token; SDK accepts either in dev
  });

  currentUserId = user.id;
  return videoClientInstance;
};

export const disconnectVideoClient = async () => {
  if (videoClientInstance) {
    try {
      await videoClientInstance.disconnectUser();
    } catch (err) {
      console.error("Error disconnecting video client:", err);
    }
    videoClientInstance = null;
    currentUserId = null;
  }
};
