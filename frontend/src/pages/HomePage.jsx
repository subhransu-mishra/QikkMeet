import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  FaUserPlus,
  FaClock,
  FaCheck,
  FaComments,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const HomePage = () => {
  const queryClient = useQueryClient();
  const [pendingConnectId, setPendingConnectId] = useState(null);

  // Fetch friends
  const {
    data: friendsData,
    isLoading: friendsLoading,
    isError: friendsError,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friends");
      return res.data; // array of friends: [{ _id, fullName, profilePic }]
    },
  });

  // Fetch recommended users
  const {
    data: recommendedData,
    isLoading: recLoading,
    isError: recError,
  } = useQuery({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users");
      return res.data; // array of users: [{ _id, fullName, profilePic, ... }]
    },
  });

  // Fetch outgoing friend requests to disable "Connect" on already requested
  const { data: outgoingData } = useQuery({
    queryKey: ["outgoingFriendRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/outgoing-friend-requests");
      return res.data; // [{ _id, recipient: { _id, fullName, profilePic } }]
    },
  });

  const outgoingRecipientIds = new Set(
    Array.isArray(outgoingData)
      ? outgoingData.map((req) => req.recipient?._id || req.recipient)
      : []
  );
  const friends = Array.isArray(friendsData) ? friendsData : [];
  const friendIds = new Set(friends.map((f) => f._id));
  const recommended = Array.isArray(recommendedData) ? recommendedData : [];

  // Send friend request mutation
  const { mutate: sendRequest, isLoading: sending } = useMutation({
    mutationFn: async (userId) => {
      const res = await axiosInstance.post(`/users/friend-request/${userId}`);
      return res.data;
    },
    onMutate: (userId) => {
      setPendingConnectId(userId);
    },
    onSuccess: () => {
      toast.success("Request sent");
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to send request");
    },
    onSettled: () => {
      setPendingConnectId(null);
    },
  });

  const isLoading = friendsLoading || recLoading;
  const hasError = friendsError || recError;

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <LoadingSpinner text="Loading your feed..." size="lg" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full flex items-center justify-center py-16 text-red-400">
        Something went wrong loading your feed.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Friends Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Friends</h2>
          <span className="text-sm text-gray-400">{friends.length} total</span>
        </div>

        {friends.length === 0 ? (
          <div className="bg-dark-card border border-gray-800 rounded-xl p-6 text-gray-400">
            You don’t have any friends yet. Discover people below and connect.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((f) => (
              <div
                key={f._id}
                className="bg-dark-card rounded-2xl p-5 shadow-lg flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      f.profilePic ||
                      "https://avatar.iran.liara.run/public/avatars/1.svg"
                    }
                    alt={f.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-lg truncate">{f.fullName}</p>
                    {/* Friend location can be added here if available */}
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-1">You are connected.</p>
                <div className="mt-3">
                  <Link
                    to={`/chat/${f._id}`}
                    className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-white transition-colors text-secondary-foreground text-sm font-bold px-6 py-2.5 rounded-full shadow"
                  >
                    <FaComments />
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Users Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended Users</h2>
          <span className="text-sm text-gray-400">
            {recommended.length} found
          </span>
        </div>

        {recommended.length === 0 ? (
          <div className="bg-dark-card border border-gray-800 rounded-xl p-6 text-gray-400">
            No recommendations right now. Check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((u) => {
              const alreadyFriend = friendIds.has(u._id);
              const alreadyRequested = outgoingRecipientIds.has(u._id);
              const isPendingThis = pendingConnectId === u._id && sending;
              const disabled =
                alreadyFriend || alreadyRequested || isPendingThis;

              let buttonContent;
              if (alreadyFriend) {
                buttonContent = (
                  <span className="flex items-center gap-2">
                    <FaCheck />
                    Friends
                  </span>
                );
              } else if (alreadyRequested) {
                buttonContent = (
                  <span className="flex items-center gap-2">
                    <FaClock />
                    Requested
                  </span>
                );
              } else if (isPendingThis) {
                buttonContent = (
                  <span className="flex items-center gap-2">
                    <LoadingSpinner size="sm" showText={false} />
                    Sending
                  </span>
                );
              } else {
                buttonContent = (
                  <span className="flex items-center gap-2 ">
                    <FaUserPlus />
                    Send Friend Request
                  </span>
                );
              }

              return (
                <div
                  key={u._id}
                  className="bg-dark-card rounded-2xl p-5 shadow-lg flex flex-col gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        u.profilePic ||
                        "https://avatar.iran.liara.run/public/avatars/2.svg"
                      }
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-lg truncate">{u.fullName}</p>
                      {u.location && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
                          <FaMapMarkerAlt />
                          {u.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 flex-grow min-h-[40px]">
                    {u.bio || "No bio provided."}
                  </p>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && sendRequest(u._id)}
                    className={`mt-auto w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold transition-all
                            ${
                              disabled
                                ? "bg-gray-600 text-white/70 cursor-not-allowed"
                                : "bg-secondary hover:bg-white text-secondary-foreground"
                            }`}
                  >
                    {buttonContent}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
