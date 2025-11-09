import { StreamChat } from "stream-chat";

let chatClientInstance = null;
let currentUserId = null;

export const getStreamChatClient = () => {
  const apiKey = import.meta.env.VITE_STREAM_API_KEY;
  if (!apiKey) {
    console.error("Stream API key missing");
    return null;
  }

  if (!chatClientInstance) {
    chatClientInstance = StreamChat.getInstance(apiKey);
  }

  return chatClientInstance;
};

export const connectStreamUser = async (user, token) => {
  const client = getStreamChatClient();
  if (!client) return null;

  // If already connected as the same user, return existing client
  if (client.userID === user.id && currentUserId === user.id) {
    return client;
  }

  // Disconnect previous user if different
  if (client.userID && client.userID !== user.id) {
    await client.disconnectUser();
  }

  // Connect new user
  await client.connectUser(
    {
      id: user.id,
      name: user.name,
      image: user.image,
    },
    token
  );

  currentUserId = user.id;
  return client;
};

export const disconnectStreamUser = async () => {
  if (chatClientInstance && chatClientInstance.userID) {
    await chatClientInstance.disconnectUser();
    currentUserId = null;
  }
};
