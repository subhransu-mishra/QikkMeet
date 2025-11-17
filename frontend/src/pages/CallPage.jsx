import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
  ParticipantView,
} from "@stream-io/video-react-sdk";
import { getStreamVideoClient } from "../lib/streamVideo";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import { FaVideo, FaClock, FaTrash } from "react-icons/fa";

const CallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const callWithUserId = searchParams.get("with");
  const urlCallId = searchParams.get("callId");

  // When params exist we run active call mode; otherwise show history
  const activeCallMode = Boolean(callWithUserId && urlCallId);

  const callId = useMemo(() => {
    if (urlCallId) return urlCallId;
    if (!authUser?.id || !callWithUserId) return null;
    const pair = [authUser.id, callWithUserId].sort();
    return `call-${pair.join("-")}`;
  }, [authUser?.id, callWithUserId, urlCallId]);

  // ----- History state -----
  const [callHistory, setCallHistory] = useState([]);

  useEffect(() => {
    if (!authUser?.id) return;
    const stored = localStorage.getItem(`callHistory_${authUser.id}`);
    try {
      setCallHistory(stored ? JSON.parse(stored) : []);
    } catch {
      setCallHistory([]);
    }
  }, [authUser?.id]);

  const pushCallHistory = useCallback(
    (entry) => {
      if (!authUser?.id) return;
      const key = `callHistory_${authUser.id}`;
      const stored = localStorage.getItem(key);
      let list = stored ? JSON.parse(stored) : [];
      list.unshift(entry);
      list = list.slice(0, 25);
      localStorage.setItem(key, JSON.stringify(list));
      setCallHistory(list);
    },
    [authUser?.id]
  );

  const formatDuration = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return "0s";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }, []);

  const formatDate = useCallback((date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  }, []);

  const handleClearHistory = useCallback(() => {
    if (!authUser?.id) return;
    localStorage.removeItem(`callHistory_${authUser.id}`);
    setCallHistory([]);
  }, [authUser?.id]);

  // ----- Active call state -----
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [participantInfo, setParticipantInfo] = useState(null);

  // Fetch call token only in active call mode
  const {
    data: callTokenData,
    isLoading: tokenLoading,
    isError: tokenIsError,
    error: tokenErrObj,
    refetch: refetchToken,
  } = useQuery({
    queryKey: ["videoCallToken", callId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/calls/${callId}/token`);
      return res.data; // { token, userId, ... }
    },
    enabled: activeCallMode && !!authUser && !!callId,
  });

  useEffect(() => {
    if (tokenIsError) {
      setTokenError(
        tokenErrObj?.response?.data?.message ||
          "Failed to fetch call token. Please retry."
      );
      setConnecting(false);
    }
  }, [tokenIsError, tokenErrObj]);

  // Initialize call when in active call mode
  useEffect(() => {
    if (!activeCallMode) return;
    if (!authUser || !callWithUserId || !callId) return;
    if (!callTokenData?.token || tokenIsError) return;

    let mounted = true;
    let interval = null;
    let localCall = null;
    let callStartTime = null;
    setConnecting(true);

    // Store participant info
    if (callTokenData.participant) {
      setParticipantInfo(callTokenData.participant);
    }

    (async () => {
      try {
        // Request camera and microphone permissions
        console.log("Requesting media permissions...");
        try {
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          console.log("Media permissions granted");
        } catch (permErr) {
          console.error("Media permission denied:", permErr);
          toast.error(
            "Camera/microphone access denied. Please allow permissions."
          );
          setConnecting(false);
          return;
        }

        console.log("Initializing Stream video client...");
        const videoClient = await getStreamVideoClient(
          {
            id: authUser.id,
            name: authUser.fullName,
            image:
              authUser.profilePic ||
              `https://avatar.iran.liara.run/public/${authUser.id}`,
          },
          callTokenData.token
        );

        if (!mounted || !videoClient) {
          console.log("Component unmounted or client failed");
          return;
        }

        console.log("Video client initialized successfully");
        setClient(videoClient);

        const streamCall = videoClient.call("default", callId);
        localCall = streamCall;

        console.log("Attempting to join/create call:", callId);

        // Join or create - use getOrCreate for simplicity
        console.log("Creating/joining call with members:", [
          authUser.id,
          callWithUserId,
        ]);
        await streamCall.getOrCreate({
          data: {
            members: [authUser.id, callWithUserId]
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((id) => ({ user_id: id })),
          },
        });

        console.log("Call created/retrieved, now joining...");
        await streamCall.join();

        console.log("Successfully joined call");

        if (!mounted) return;

        callStartTime = new Date();
        setCall(streamCall);
        setStartTime(callStartTime);
        setConnecting(false);

        // Participant monitor - use proper state subscription
        const checkParticipants = () => {
          const participants = streamCall.state.participants;
          const participantCount = participants ? participants.length : 0;
          console.log("Participant count:", participantCount);

          if (participantCount === 1) {
            console.log("Only one participant, ending call...");
            toast("Other participant left. Ending call...", {
              icon: "ℹ️",
            });
            clearInterval(interval);
            streamCall.leave().finally(() => {
              if (mounted) {
                const duration = callStartTime
                  ? Math.floor((Date.now() - callStartTime.getTime()) / 1000)
                  : 0;
                pushCallHistory({
                  id: callId,
                  userId: callWithUserId,
                  userName:
                    participantInfo?.fullName ||
                    callTokenData?.participant?.fullName ||
                    "Participant",
                  userProfilePic:
                    participantInfo?.profilePic ||
                    callTokenData?.participant?.profilePic ||
                    `https://avatar.iran.liara.run/public/${callWithUserId}`,
                  startTime: callStartTime,
                  endTime: new Date(),
                  duration,
                });
                navigate(`/chat/${callWithUserId}`);
              }
            });
          }
        };

        interval = setInterval(checkParticipants, 2500);

        // End events
        const finish = async () => {
          if (!mounted) return;
          console.log("Call ended event received");
          const duration = callStartTime
            ? Math.floor((Date.now() - callStartTime.getTime()) / 1000)
            : 0;
          pushCallHistory({
            id: callId,
            userId: callWithUserId,
            userName:
              participantInfo?.fullName ||
              callTokenData?.participant?.fullName ||
              "Participant",
            userProfilePic:
              participantInfo?.profilePic ||
              callTokenData?.participant?.profilePic ||
              `https://avatar.iran.liara.run/public/${callWithUserId}`,
            startTime: callStartTime,
            endTime: new Date(),
            duration,
          });
          navigate(`/chat/${callWithUserId}`);
        };

        streamCall.on("call.ended", finish);
        streamCall.on("call.session_ended", finish);

        // Log when participants join/leave
        streamCall.on("call.session_participant_joined", (event) => {
          console.log("Participant joined:", event.participant?.user?.id);
        });

        streamCall.on("call.session_participant_left", (event) => {
          console.log("Participant left:", event.participant?.user?.id);
        });
      } catch (err) {
        console.error("Call init failed:", err);
        console.error("Error details:", err.message, err.stack);

        let errorMessage = "Failed to start call";
        if (err.message?.includes("permission")) {
          errorMessage = "Camera/microphone permission denied";
        } else if (err.message?.includes("token")) {
          errorMessage = "Invalid call token. Please try again.";
        } else if (err.message?.includes("network")) {
          errorMessage = "Network error. Check your connection.";
        }

        toast.error(errorMessage);
        setConnecting(false);

        // Don't navigate away immediately on error, let user retry
        setTimeout(() => {
          if (mounted) {
            navigate(`/chat/${callWithUserId}`);
          }
        }, 2000);
      }
    })();

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      (async () => {
        try {
          if (localCall) {
            console.log("Leaving call on cleanup");
            await localCall.leave();
          }
        } catch (err) {
          console.error("Error leaving call:", err);
        }
      })();
    };
  }, [
    activeCallMode,
    authUser,
    callWithUserId,
    callId,
    callTokenData?.token,
    callTokenData?.participant,
    tokenIsError,
    navigate,
    pushCallHistory,
    participantInfo,
  ]);

  const retryToken = () => {
    setTokenError(null);
    setConnecting(true);
    refetchToken();
  };

  // Active call UI
  if (activeCallMode) {
    if (tokenLoading || connecting) {
      return (
        <div className="h-screen flex items-center justify-center bg-black">
          <LoadingSpinner text="Connecting to call..." size="lg" />
        </div>
      );
    }
    if (tokenError) {
      return (
        <div className="h-screen flex items-center justify-center bg-black px-6 text-center space-y-5">
          <p className="text-red-400 font-semibold">{tokenError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retryToken}
              className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition"
            >
              Retry
            </button>
            <button
              onClick={() =>
                navigate(callWithUserId ? `/chat/${callWithUserId}` : "/chat")
              }
              className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition"
            >
              Back to Chat
            </button>
          </div>
        </div>
      );
    }
    if (!client || !call) {
      return (
        <div className="h-screen flex items-center justify-center bg-black text-center">
          <p className="text-red-400 mb-4">Failed to create call</p>
          <button
            onClick={() =>
              navigate(callWithUserId ? `/chat/${callWithUserId}` : "/chat")
            }
            className="px-6 py-2 rounded-full bg-white text-black hover:bg-white/90 transition"
          >
            Return to Chat
          </button>
        </div>
      );
    }
    return (
      <div className="h-screen bg-black">
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <div className="h-full flex flex-col bg-black">
              <div className="flex-1 relative">
                <SpeakerLayout participantViewUI={ParticipantView} />
              </div>
              <div className="px-6 py-4 bg-black/60">
                <CallControls
                  onLeave={async () => {
                    try {
                      await call.leave();
                    } catch {}
                    const duration = startTime
                      ? Math.floor((Date.now() - startTime.getTime()) / 1000)
                      : 0;
                    pushCallHistory({
                      id: callId,
                      userId: callWithUserId,
                      userName:
                        participantInfo?.fullName ||
                        callTokenData?.participant?.fullName ||
                        "Participant",
                      userProfilePic:
                        participantInfo?.profilePic ||
                        callTokenData?.participant?.profilePic ||
                        `https://avatar.iran.liara.run/public/${callWithUserId}`,
                      startTime,
                      endTime: new Date(),
                      duration,
                    });
                    navigate(`/chat/${callWithUserId}`);
                  }}
                />
              </div>
            </div>
          </StreamCall>
        </StreamVideo>
      </div>
    );
  }

  // History-only mode
  return (
    <div className="h-screen bg-black overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Call History</h1>
          {callHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
            >
              <FaTrash />
              Clear all
            </button>
          )}
        </div>
        {callHistory.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-8 text-center text-white/60">
            <FaVideo className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No previous calls yet.</p>
            <p className="text-xs mt-2 text-white/40">
              Start a call from a chat. Finished calls will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {callHistory.map((item) => (
              <div
                key={`${item.id}-${item.endTime}-${item.userId}`}
                className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      item.userProfilePic ||
                      `https://avatar.iran.liara.run/public/${
                        item.userId || "10"
                      }`
                    }
                    alt={item.userName || "User"}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white/10"
                    onError={(e) => {
                      e.target.src = `https://avatar.iran.liara.run/public/${
                        item.userId || Math.floor(Math.random() * 100)
                      }`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white truncate max-w-[60%]">
                        {item.userName || "Participant"}
                      </h3>
                      <span className="text-xs text-white/50 flex-shrink-0 ml-2">
                        {formatDate(item.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="inline-flex items-center gap-1">
                        <FaVideo /> Video
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FaClock /> {formatDuration(item.duration)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() =>
                          navigate(
                            item.userId ? `/chat/${item.userId}` : "/chat"
                          )
                        }
                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition"
                      >
                        Message
                      </button>
                    </div>
                  </div>
                </div>
                {item.note && (
                  <p className="mt-3 text-xs text-white/40">{item.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallPage;
