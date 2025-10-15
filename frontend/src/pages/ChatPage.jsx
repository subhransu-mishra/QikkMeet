import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  Window,
  ChannelHeader,
  MessageList,
  MessageInput,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

const ChatPage = () => {
  const { id: chatWithUserId } = useParams();
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
    if (streamTokenData?.token && authUser) {
      console.log("Connecting with token:", streamTokenData.token);

      try {
        const client = StreamChat.getInstance("gwqhppjps3wk");

        client
          .connectUser(
            {
              id: authUser.id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            streamTokenData.token
          )
          .then(() => {
            console.log("Successfully connected user:", authUser.id);
            setChatClient(client);
          })
          .catch((err) => {
            console.error("Failed to connect user:", err);
            console.error("Error details:", JSON.stringify(err));
          });

        return () => {
          if (client && client.userID) {
            console.log("Disconnecting user");
            client.disconnectUser();
            setChatClient(null);
          }
        };
      } catch (e) {
        console.error("Error instantiating StreamChat:", e);
      }
    }
  }, [streamTokenData, authUser]);

  useEffect(() => {
    if (chatClient && chatWithUserId && authUser) {
      const newChannel = chatClient.channel("messaging", {
        members: [authUser.id, chatWithUserId],
      });

      newChannel
        .watch()
        .then(() => {
          setChannel(newChannel);
        })
        .catch((err) => {
          console.error("Error watching channel:", err);
        });

      return () => {
        if (newChannel) {
          newChannel.stopWatching();
        }
      };
    }
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
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
