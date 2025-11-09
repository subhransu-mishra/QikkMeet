import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
} from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { FaVideo } from "react-icons/fa";
import { getStreamVideoClient } from "../lib/streamVideo";

const CallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const callWithUserId = searchParams.get("with");
  const urlCallId = searchParams.get("callId");
  const { authUser } = useAuth();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [tokenError, setTokenError] = useState(null);

  // Use callId from URL or generate one
  const callId = useMemo(() => {
    if (urlCallId) return urlCallId;
    if (!authUser?.id || !callWithUserId) return null;
    const participants = [authUser.id, callWithUserId].sort();
    return `call-${participants.join("-")}`;
  }, [authUser?.id, callWithUserId, urlCallId]);

  // Get Stream video token
  const {
    data: streamTokenData,
    isLoading: tokenLoading,
    isError: tokenIsError,
    error: tokenErrObj,
    refetch: refetchToken,
  } = useQuery({
    queryKey: ["streamVideoToken", callId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/calls/${callId}/token`);
      return res.data;
    },
    enabled: !!authUser && !!callId,
  });

  // Early abort if token fetch failed
  useEffect(() => {
    if (tokenIsError) {
      setTokenError(
        tokenErrObj?.response?.data?.message ||
          "Failed to fetch call token. Try again."
      );
      setIsConnecting(false);
    }
  }, [tokenIsError, tokenErrObj]);

  useEffect(() => {
    let callInstance = null;
    let mounted = true;
    let participantCheckInterval = null;

    const initCall = async () => {
      if (!authUser || !callWithUserId || !streamTokenData?.token || !callId)
        return;
      if (tokenIsError) return; // don't proceed if token failed

      try {
        const videoClient = await getStreamVideoClient(
          {
            id: authUser.id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          streamTokenData.token
        );

        if (!mounted || !videoClient) return;
        setClient(videoClient);

        callInstance = videoClient.call("default", callId);

        const uniqueMembers = [...new Set([authUser.id, callWithUserId])];

        try {
          await callInstance.get();
          await callInstance.join();
        } catch {
          await callInstance.getOrCreate({
            data: {
              members: uniqueMembers.map((id) => ({ user_id: id })),
            },
          });
          await callInstance.join();
        }

        if (!mounted) return;
        setCall(callInstance);
        setIsConnecting(false);

        // Watch participants; if alone, leave and go back to chat
        participantCheckInterval = setInterval(() => {
          const participants = callInstance.state.participants;
          const count = Object.keys(participants).length;
          if (count === 1) {
            toast.info("Other participant left. Ending call...");
            clearInterval(participantCheckInterval);
            callInstance.leave().finally(() => {
              if (mounted) navigate(`/chat/${callWithUserId}`);
            });
          }
        }, 2000);

        // End/leave handlers -> redirect to chat
        callInstance.on("call.session_ended", async () => {
          if (!mounted) return;
          if (participantCheckInterval) clearInterval(participantCheckInterval);
          toast.info("Call ended");
          navigate(`/chat/${callWithUserId}`);
        });

        callInstance.on("call.ended", async () => {
          if (!mounted) return;
          if (participantCheckInterval) clearInterval(participantCheckInterval);
          toast.info("Call ended");
          navigate(`/chat/${callWithUserId}`);
        });

        callInstance.on("call.leave", async () => {
          if (!mounted) return;
          toast.info("Participant left the call");
        });
      } catch (error) {
        console.error("Error initializing call:", error);
        if (mounted) {
          toast.error("Failed to start call");
          setIsConnecting(false);
          navigate(`/chat/${callWithUserId}`);
        }
      }
    };

    initCall();

    return () => {
      mounted = false;
      if (participantCheckInterval) clearInterval(participantCheckInterval);
      const cleanup = async () => {
        try {
          if (callInstance) await callInstance.leave();
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [
    authUser,
    callWithUserId,
    callId,
    streamTokenData,
    navigate,
    tokenIsError,
  ]);

  // Retry on token error
  const handleRetry = () => {
    setTokenError(null);
    setIsConnecting(true);
    refetchToken();
  };

  if (tokenLoading || isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <LoadingSpinner text="Connecting..." size="lg" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="h-screen flex items-center justify-center bg-black px-6">
        <div className="max-w-md w-full text-center space-y-5">
          <p className="text-red-400 font-semibold">{tokenError}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition"
            >
              Retry
            </button>
            <button
              onClick={() =>
                callWithUserId
                  ? navigate(`/chat/${callWithUserId}`)
                  : navigate("/chat")
              }
              className="px-6 py-3 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition"
            >
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to connect to call</p>
          <button
            onClick={() =>
              callWithUserId
                ? navigate(`/chat/${callWithUserId}`)
                : navigate("/chat")
            }
            className="px-6 py-2 bg-white text-black rounded-full hover:bg-white/90 transition"
          >
            Return to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black">
      {/* Debug info */}
      <div className="absolute top-4 left-4 z-50 text-white text-xs bg-black/50 p-2 rounded">
        <div>Client: {client ? "Connected" : "Not connected"}</div>
        <div>Call: {call ? "Active" : "Not active"}</div>
        <div>Call ID: {callId}</div>
      </div>

      <StreamVideo client={client}>
        <StreamCall call={call}>
          <div className="h-full flex flex-col bg-black">
            <div className="flex-1 relative">
              <SpeakerLayout />
            </div>
            <div className="px-6 py-4 bg-black/60">
              <CallControls
                onLeave={() => {
                  // Always go back to chat when user leaves
                  navigate(`/chat/${callWithUserId}`);
                }}
              />
            </div>
          </div>
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default CallPage;
