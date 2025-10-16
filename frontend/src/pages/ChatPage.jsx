import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
  LoadingIndicator,
} from "stream-chat-react";
import { FaVideo } from "react-icons/fa";
import "stream-chat-react/dist/css/v2/index.css";

const ChatPage = () => {
  const { id: chatWithUserId } = useParams();
  const navigate = useNavigate();
  const { authUser, isLoading: authLoading } = useAuth();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);

  // Fetch the Stream token for the authenticated user
  const { data: streamTokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data; // { token: '...' }
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 55, // Keep token fresh for 55 minutes
    refetchOnWindowFocus: false,
  });

  // Add this before the useEffect to debug
  console.log(
    "ENV Check - VITE_STREAM_API_KEY defined:",
    !!import.meta.env.VITE_STREAM_API_KEY
  );

  useEffect(() => {
    if (!authUser || !streamTokenData?.token) return;

    const apiKey = import.meta.env.VITE_STREAM_API_KEY;
    if (!apiKey) {
      console.error(
        "Stream API key is missing. Check VITE_STREAM_API_KEY env."
      );
      return;
    }
    const sc = StreamChat.getInstance(apiKey);

    let mounted = true;

    (async () => {
      try {
        // Connect only if not already connected as this user
        if (sc.userID !== authUser.id) {
          await sc.connectUser(
            {
              id: authUser.id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            streamTokenData.token
          );
        }
        if (!mounted) return;
        setChatClient(sc);
      } catch (err) {
        console.error("Stream connect error:", err);
      }
    })();

    // Do NOT disconnect here; shared singleton is used across pages
    return () => {
      mounted = false;
    };
  }, [authUser, streamTokenData]);

  useEffect(() => {
    if (!chatClient || !chatWithUserId || !authUser) return;

    const channel = chatClient.channel("messaging", {
      members: [authUser.id, chatWithUserId],
    });

    let active = true;
    channel
      .watch()
      .then(() => {
        if (active) setChannel(channel);
      })
      .catch((err) => {
        console.error("Error watching channel:", err);
      });

    return () => {
      active = false;
      channel.stopWatching().catch(() => {});
    };
  }, [chatClient, chatWithUserId, authUser]);

  if (authLoading || tokenLoading) {
    return <LoadingIndicator />;
  }

  if (!chatWithUserId) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-card rounded-lg">
        <p className="text-lg text-gray-400">
          Select a friend to start a conversation.
        </p>
      </div>
    );
  }

  if (!chatClient || !channel) {
    return <LoadingIndicator />;
  }

  const otherMember =
    channel?.state?.members &&
    Object.values(channel.state.members)
      .map((m) => m.user)
      .find((u) => u?.id !== authUser?.id);

  const handleStartCall = () => {
    navigate(`/call?with=${chatWithUserId}`);
  };

  // This is the only return statement for the normal flow
  return (
    <div className="h-full bg-primary">
      <Chat
        client={chatClient}
        theme="str-chat__theme-dark"
        className="bg-primary"
      >
        <Channel channel={channel}>
          <Window>
            {/* Custom header with name + video icon */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-dark-card">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    otherMember?.image ||
                    "https://avatar.iran.liara.run/public/avatars/5.svg"
                  }
                  alt={otherMember?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {otherMember?.name || "Conversation"}
                  </p>
                  {/* Optional: presence/status in future */}
                </div>
              </div>
              <button
                onClick={handleStartCall}
                title="Start video call"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-white transition"
              >
                <FaVideo />
                <span className="hidden sm:inline">Call</span>
              </button>
            </div>

            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
