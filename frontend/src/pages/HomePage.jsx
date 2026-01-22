import React, { useState, useEffect } from "react";
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
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth"; // [ADD] import
import { Avatar } from "../components/ui/Avatar";
// Inline pop-up modals coded directly in HomePage (no separate UI files)

const HomePage = () => {
  const queryClient = useQueryClient();
  const [pendingConnectId, setPendingConnectId] = useState(null);
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const { authUser } = useAuth(); // [ADD] get current user

  // Show beta notice and cookie consent on first visit after auth
  useEffect(() => {
    // Beta notice
    const betaAck = localStorage.getItem("betaNoticeAcknowledged");
    if (!betaAck) setShowBetaModal(true);

    // Cookie consent
    const cookieAck = localStorage.getItem("cookieConsentAccepted");
    if (!cookieAck) setShowCookieConsent(true);
  }, []);

  const handleBetaOkay = () => {
    localStorage.setItem("betaNoticeAcknowledged", "true");
    setShowBetaModal(false);
  };

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsentAccepted", "true");
    setShowCookieConsent(false);
  };

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
      : [],
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
    <div className="space-y-10 text-white">
      {/* Friends Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Friends</h2>
          <span className="text-sm text-white/50">{friends.length} total</span>
        </div>

        {friends.length === 0 ? (
          <div className="bg-black border border-white/10 rounded-xl p-6 text-white/60">
            You don’t have any friends yet. Discover people below and connect.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((f, idx) => (
              <motion.div
                key={f._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-white/5 transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={f.profilePic}
                    alt={f.fullName}
                    fallbackText={f.fullName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-lg truncate">{f.fullName}</p>
                    {/* optional meta */}
                  </div>
                </div>
                <p className="text-sm text-white/60 mt-2">You are connected.</p>
                <div className="mt-4">
                  {f._id !== authUser?.id ? (
                    <Link
                      to={`/chat/${f._id}`}
                      className="inline-flex items-center justify-center gap-2 bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer"
                    >
                      <FaComments />
                      Chat
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center gap-2 bg-white/10 text-white/60 text-sm font-bold px-6 py-2.5 rounded-full cursor-not-allowed"
                    >
                      <FaComments />
                      That's You
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Recommended Users Section */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recommended Users</h2>
          <span className="text-sm text-white/50">
            {recommended.length} found
          </span>
        </div>

        {recommended.length === 0 ? (
          <div className="bg-black border border-white/10 rounded-xl p-6 text-white/60">
            No recommendations right now. Check back later.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommended.map((u, idx) => {
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
                  <span className="flex items-center gap-2 cursor-pointer">
                    <FaUserPlus />
                    Send Friend Request
                  </span>
                );
              }

              return (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.04 }}
                  className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-white/5 transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        u.profilePic ||
                        "https://avatar.iran.liara.run/public/avatars/2.svg"
                      }
                      alt={u.fullName}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-lg truncate">{u.fullName}</p>
                      {u.location && (
                        <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                          <FaMapMarkerAlt />
                          {u.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/60 flex-grow min-h-[40px] mt-2">
                    {u.bio || "No bio provided."}
                  </p>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && sendRequest(u._id)}
                    className={`mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold transition-colors
                            ${
                              disabled
                                ? "bg-white/10 text-white/50 cursor-not-allowed"
                                : "bg-white text-black hover:bg-white/90 cursor-pointer"
                            }`}
                  >
                    {buttonContent}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
      {/* Inline Global Modals */}
      {showBetaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Transparent blur backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
          {/* Dialog */}
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="bg-black/60 border border-white/10 rounded-3xl shadow-xl p-8 text-white">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Beta Version</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  This is a beta release. Many features and pages are still
                  under development. You may encounter changes or occasional
                  issues.
                </p>
                <button
                  onClick={handleBetaOkay}
                  className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCookieConsent && (
        <div className="fixed z-[60] bottom-4 inset-x-4 sm:inset-auto sm:right-6 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-auto max-w-sm">
          <div className="bg-black/60 border border-white/10 rounded-2xl shadow-xl p-3 sm:p-4 backdrop-blur-xl text-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg shrink-0">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3c.132 0 .263.006.392.017a4.001 4.001 0 004.591 4.591A9.003 9.003 0 013 12c0 4.97 4.03 9 9 9 4.63 0 8.44-3.5 8.94-8.005A3.5 3.5 0 0116.5 9.5a3.5 3.5 0 01-3.5-3.5C13 4.343 12.657 3 12 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-white/90">
                  We use cookies to improve your experience. By continuing, you
                  agree to our use of cookies.
                </p>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={handleAcceptCookies}
                    className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    Accept
                  </button>
                  <a
                    href="#"
                    className="text-xs sm:text-sm text-white/70 hover:text-white w-full sm:w-auto text-center sm:text-left"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
