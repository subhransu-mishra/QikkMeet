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
import { FaVideo, FaCopy, FaTimes } from "react-icons/fa";
import "stream-chat-react/dist/css/v2/index.css";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { connectStreamUser } from "../lib/streamChat";

const ChatPage = () => {
  const { id: chatWithUserId } = useParams();
  const navigate = useNavigate();
  const { authUser, isLoading: authLoading } = useAuth();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callLink, setCallLink] = useState("");

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

  useEffect(() => {
    if (!authUser || !streamTokenData?.token) return;

    let mounted = true;

    (async () => {
      try {
        const client = await connectStreamUser(
          {
            id: authUser.id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          streamTokenData.token
        );

        if (!mounted) return;
        setChatClient(client);
      } catch (err) {
        console.error("Stream connect error:", err);
      }
    })();

    return () => {
      mounted = false;
      // Don't disconnect here - keep connection alive across page navigation
    };
  }, [authUser, streamTokenData]);

  useEffect(() => {
    if (!chatClient || !chatWithUserId || !authUser) return;

    // Prevent chatting with yourself only if explicitly navigating to /chat/:selfId
    if (chatWithUserId === authUser.id) {
      toast.error("You cannot open a conversation with yourself");
      navigate("/chat", { replace: true });
      return;
    }

    // Ensure unique members only
    const members = [authUser.id, chatWithUserId];
    const uniqueMembers = [...new Set(members)];

    // Double check we have at least 2 members
    if (uniqueMembers.length < 2) {
      console.error("Not enough members for channel");
      return;
    }

    const channel = chatClient.channel("messaging", {
      members: uniqueMembers,
    });

    let active = true;
    channel
      .watch()
      .then(() => {
        if (active) setChannel(channel);
      })
      .catch((err) => {
        console.error("Error watching channel:", err);
        toast.error("Failed to load chat");
      });

    return () => {
      active = false;
      channel.stopWatching().catch(() => {});
    };
  }, [chatClient, chatWithUserId, authUser, navigate]);

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
    const callId = `call-${[authUser.id, chatWithUserId].sort().join("-")}`;
    const link = `${window.location.origin}/call?with=${chatWithUserId}&callId=${callId}`;
    setCallLink(link);
    setShowCallModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(callLink);
    toast.success("Call link copied! Share it with your friend.");
  };

  const handleJoinCall = () => {
    const callIdParam = callLink.split("callId=")[1];
    navigate(`/call?with=${chatWithUserId}&callId=${callIdParam}`);
    setShowCallModal(false);
  };

  // This is the only return statement for the normal flow
  return (
    <div className="h-full bg-black">
      <Chat
        client={chatClient}
        theme="str-chat__theme-dark"
        className="bg-black"
      >
        <Channel channel={channel}>
          <Window>
            {/* Premium Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/60 backdrop-blur">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    otherMember?.image ||
                    "https://avatar.iran.liara.run/public/avatars/5.svg"
                  }
                  alt={otherMember?.name || "User"}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10"
                />
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {otherMember?.name || "Conversation"}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    Direct Message
                  </p>
                </div>
              </div>
              <button
                onClick={handleStartCall}
                title="Start video call"
                className="inline-flex cursor-pointer items-center justify-center gap-2 px-4 py-2 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/90 transition"
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

      {/* Call Link Modal */}
      <AnimatePresence>
        {showCallModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-black rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-white/10"
            >
              {/* Close button */}
              <button
                onClick={() => setShowCallModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center">
                  <FaVideo className="text-3xl text-white" />
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-center mb-2">
                Start Video Call
              </h2>
              <p className="text-white/60 text-center mb-6">
                Share this link with {otherMember?.name || "your friend"} to
                start the call
              </p>

              {/* Call Link */}
              <div className="bg-black rounded-lg p-3 mb-4 break-all text-sm text-white/80 border border-white/10">
                {callLink}
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition"
                >
                  <FaCopy />
                  Copy Link
                </button>

                <button
                  onClick={handleJoinCall}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition"
                >
                  <FaVideo />
                  Join Call Now
                </button>
              </div>

              <p className="text-xs text-white/40 text-center mt-4">
                Both participants need to click the link to join
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
