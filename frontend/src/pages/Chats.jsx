import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { StreamChat } from "stream-chat";
import { FaComments } from "react-icons/fa";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const formatTime = (dateLike) => {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString();
};

const Chats = () => {
  const { authUser, isLoading: authLoading } = useAuth();
  const [client, setClient] = useState(null);
  const [channelMetaByFriend, setChannelMetaByFriend] = useState({}); // { friendId: { lastMessageAt, lastMessageText } }

  // Fetch friends from backend
  const {
    data: friendsData,
    isLoading: friendsLoading,
    isError: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friends");
      return res.data; // [{ _id, fullName, profilePic }]
    },
    enabled: !!authUser,
  });

  // Get Stream token for current user
  const {
    data: tokenData,
    isLoading: tokenLoading,
    isError: tokenError,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data; // { token }
    },
    enabled: !!authUser,
    staleTime: 1000 * 60 * 55,
    refetchOnWindowFocus: false,
  });

  // Connect Stream client (singleton) and query channels
  useEffect(() => {
    let isActive = true;

    const connectAndQuery = async () => {
      if (!authUser || !tokenData?.token) return;

      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      if (!apiKey) {
        console.error(
          "Stream API key is missing. Check VITE_STREAM_API_KEY env."
        );
        return;
      }
      const sc = StreamChat.getInstance(apiKey);

      // Connect only if not already connected as this user
      const myUserId = String(authUser.id);
      if (sc.userID !== myUserId) {
        await sc.connectUser(
          {
            id: myUserId,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );
      }

      if (!isActive) return;
      setClient(sc);

      const filters = { type: "messaging", members: { $in: [myUserId] } };
      const sort = { last_message_at: -1 };
      const channels = await sc.queryChannels(filters, sort, {
        watch: false,
        state: true,
        limit: 50,
      });

      const meta = {};
      channels.forEach((ch) => {
        const memberIds = Object.values(ch.state.members || {}).map(
          (m) => m.user_id
        );
        const otherId = memberIds.find((m) => m !== myUserId);

        // Skip if no other member found
        if (!otherId) return;

        const lastMsg =
          ch.state.messages && ch.state.messages.length
            ? ch.state.messages[ch.state.messages.length - 1]
            : null;

        // limit preview to ~60 chars, single line safe
        const rawText = lastMsg?.text || "";
        const previewText =
          rawText.length > 60 ? `${rawText.slice(0, 60)}…` : rawText;

        meta[otherId] = {
          lastMessageAt:
            ch.state.last_message_at ||
            lastMsg?.created_at ||
            ch.state.updated_at ||
            null,
          lastMessageText: previewText,
        };
      });

      if (!isActive) return;
      setChannelMetaByFriend(meta);
    };

    connectAndQuery();

    // Do NOT disconnect on unmount to avoid dropping connection for ChatPage
    return () => {
      isActive = false;
    };
  }, [authUser, tokenData]);

  const friends = Array.isArray(friendsData) ? friendsData : [];

  // Merge friends with last message meta and sort
  const sortedFriends = useMemo(() => {
    const merged = friends.map((f) => {
      const meta = channelMetaByFriend[f._id] || {};
      return {
        ...f,
        lastMessageAt: meta.lastMessageAt
          ? new Date(meta.lastMessageAt).getTime()
          : 0,
        lastMessageText: meta.lastMessageText || "",
      };
    });
    // Sort by lastMessageAt desc (latest first)
    merged.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
    return merged;
  }, [friends, channelMetaByFriend]);

  if (authLoading || friendsLoading || tokenLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <LoadingSpinner text="Loading chats..." size="lg" />
      </div>
    );
  }

  if (friendsError || tokenError) {
    return (
      <div className="w-full flex items-center justify-center py-16 text-red-400">
        Failed to load chats
      </div>
    );
  }

  return (
    // Full-bleed on small; center only on md+
    <div className="w-full md:max-w-3xl md:mx-auto space-y-3 sm:space-y-4 px-0 sm:px-2 md:px-0">
      <h1 className="text-2xl font-bold px-3 sm:px-0">Chats</h1>

      {sortedFriends.length === 0 ? (
        <div className="bg-black border border-white/10 rounded-xl p-4 sm:p-6 text-gray-400 mx-0 sm:mx-0">
          No friends yet. Connect with people to start chatting.
        </div>
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {sortedFriends.map((f) => (
            <li key={f._id} className="px-0 sm:px-0">
              <Link
                to={`/chat/${f._id}`}
                className="flex items-center gap-3 sm:gap-4 bg-black border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:border-white/30 transition-colors"
              >
                <img
                  src={
                    f.profilePic ||
                    "https://avatar.iran.liara.run/public/avatars/10.svg"
                  }
                  alt={f.fullName}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold truncate">{f.fullName}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {f.lastMessageAt ? formatTime(f.lastMessageAt) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {f.lastMessageText || "Start the conversation"}
                  </p>
                </div>
                <span className="ml-2 hidden sm:inline-flex items-center justify-center rounded-full bg-white text-black px-3 py-2 text-[12px] font-bold">
                  <FaComments />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chats;
