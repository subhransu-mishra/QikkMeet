import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { FaCheck, FaTimes } from "react-icons/fa";

const NotificationPage = () => {
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: async () => {
      const res = await axiosInstance.get("/users/friend-requests");
      return res.data; // { pendingRequests, acceptedRequest }
    },
  });

  const pending = Array.isArray(data?.pendingRequests)
    ? data.pendingRequests
    : [];

  const { mutate: acceptReq } = useMutation({
    mutationFn: async (requestId) => {
      const res = await axiosInstance.put(
        `/users/friend-request/${requestId}/accept`
      );
      return res.data;
    },
    onMutate: (requestId) => setAcceptingId(requestId),
    onSuccess: () => {
      toast.success("Request accepted");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to accept");
    },
    onSettled: () => setAcceptingId(null),
  });

  const { mutate: rejectReq } = useMutation({
    mutationFn: async (requestId) => {
      const res = await axiosInstance.delete(
        `/users/friend-request/${requestId}`
      );
      return res.data;
    },
    onMutate: (requestId) => setRejectingId(requestId),
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to reject");
    },
    onSettled: () => setRejectingId(null),
  });

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <LoadingSpinner text="Loading requests..." size="lg" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="w-full flex items-center justify-center py-16 text-red-400">
        Failed to load notifications
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">Notifications</h1>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-center">Friend Requests</h2>

        {pending.length === 0 ? (
          <div className="bg-dark-card border border-gray-800 rounded-xl p-6 text-gray-400 text-center">
            No new friend requests.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => {
              const isAccepting = acceptingId === req._id;
              const isRejecting = rejectingId === req._id;

              return (
                <div
                  key={req._id}
                  className="bg-dark-card border border-gray-800 rounded-xl p-4 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        req.sender?.profilePic ||
                        "https://avatar.iran.liara.run/public/avatars/3.svg"
                      }
                      alt={req.sender?.fullName || "User"}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {req.sender?.fullName || "Unknown"} wants to connect.
                      </p>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {req.sender?.bio || "No bio provided."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      disabled={isAccepting || isRejecting}
                      onClick={() => acceptReq(req._id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all
                            ${
                              isAccepting
                                ? "bg-gray-600 text-white/70 cursor-not-allowed"
                                : "bg-secondary hover:bg-white text-secondary-foreground"
                            }`}
                    >
                      {isAccepting ? (
                        <LoadingSpinner size="sm" showText={false} />
                      ) : (
                        <FaCheck />
                      )}
                      Accept
                    </button>
                    <button
                      disabled={isRejecting || isAccepting}
                      onClick={() => rejectReq(req._id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all
                            ${
                              isRejecting
                                ? "bg-gray-600 text-white/70 cursor-not-allowed"
                                : "bg-gray-700 hover:bg-gray-600 text-white"
                            }`}
                    >
                      {isRejecting ? (
                        <LoadingSpinner size="sm" showText={false} />
                      ) : (
                        <FaTimes />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default NotificationPage;
