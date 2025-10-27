import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import {
  StreamVideo,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { FaPhone, FaPhoneSlash, FaVideo } from "react-icons/fa";

const CallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const callWithUserId = searchParams.get("with");
  const urlCallId = searchParams.get("callId");
  const { authUser } = useAuth();

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);

  // Get Stream token
  const { data: streamTokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: async () => {
      const res = await axiosInstance.get("/chats/token");
      return res.data;
    },
    enabled: !!authUser,
  });

  // Use callId from URL or generate one
  const callId = useMemo(() => {
    if (urlCallId) return urlCallId;
    if (!authUser?.id || !callWithUserId) return null;
    const participants = [authUser.id, callWithUserId].sort();
    return `call-${participants.join("-")}`;
  }, [authUser?.id, callWithUserId, urlCallId]);

  useEffect(() => {
    let videoClient = null;
    let callInstance = null;
    let mounted = true;
    let participantCheckInterval = null;

    const initCall = async () => {
      if (!authUser || !callWithUserId || !streamTokenData?.token || !callId)
        return;

      try {
        // Create Stream Video Client
        videoClient = new StreamVideoClient({
          apiKey: import.meta.env.VITE_STREAM_API_KEY,
          user: {
            id: authUser.id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          token: streamTokenData.token,
        });

        if (!mounted) return;
        setClient(videoClient);

        // Create call instance
        callInstance = videoClient.call("default", callId);

        // Get unique members
        const uniqueMembers = [...new Set([authUser.id, callWithUserId])];

        // First try to get existing call
        try {
          await callInstance.get();
          // Call exists, just join it
          await callInstance.join();
        } catch (error) {
          // Call doesn't exist, create it
          await callInstance.getOrCreate({
            data: {
              members: uniqueMembers.map((id) => ({ user_id: id })),
            },
          });
          await callInstance.join();
        }

        if (!mounted) return;
        setCall(callInstance);
        setIsCallActive(true);
        setIsConnecting(false);

        // Check participant count periodically
        participantCheckInterval = setInterval(() => {
          const participants = callInstance.state.participants;
          const participantCount = Object.keys(participants).length;

          // If only 1 participant (current user), end the call
          if (participantCount === 1) {
            toast.info("Other participant left. Ending call...");
            clearInterval(participantCheckInterval);
            callInstance.leave().then(() => {
              if (mounted) {
                navigate(`/chat/${callWithUserId}`);
              }
            });
          }
        }, 2000); // Check every 2 seconds

        // Event listeners - redirect to specific chat after call
        callInstance.on("call.session_ended", async () => {
          if (!mounted) return;
          clearInterval(participantCheckInterval);
          toast.info("Call ended");
          setIsCallActive(false);
          navigate(`/chat/${callWithUserId}`);
        });

        callInstance.on("call.ended", async () => {
          if (!mounted) return;
          clearInterval(participantCheckInterval);
          toast.info("Call ended");
          navigate(`/chat/${callWithUserId}`);
        });

        callInstance.on("call.leave", async () => {
          if (!mounted) return;
          toast.info("Participant left the call");
        });

        // Add device error listener
        callInstance.on("call.permission_request", (event) => {
          if (event.type === "camera" && event.denied) {
            toast.error("Camera access denied or device in use");
          }
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
      if (participantCheckInterval) {
        clearInterval(participantCheckInterval);
      }
      const cleanup = async () => {
        try {
          if (callInstance) {
            await callInstance.leave();
          }
        } catch (err) {
          console.error("Cleanup error:", err);
        }
      };
      cleanup();
    };
  }, [authUser, callWithUserId, callId, streamTokenData, navigate]);

  if (tokenLoading || isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <LoadingSpinner text="Connecting..." size="lg" />
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to connect to call</p>
          <button
            onClick={() => navigate("/chat")}
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
      {/* Local style overrides for Stream Video controls */}
      <style>{`
        .str-video__call-controls {
          background: rgba(0,0,0,0.85) !important;
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 18px !important;
        }
        .str-video__call-controls__button,
        .str-video__composite-button,
        button[data-testid*="button"] {
          background: #ffffff !important;
          color: #000000 !important;
          width: 48px !important;
          height: 48px !important;
          border-radius: 9999px !important;
          border: none !important;
        }
        .str-video__call-controls__button:hover,
        .str-video__composite-button:hover { background: #ffffffcc !important; }
        .str-video__call-controls__button[data-testid="hangup-button"] {
          background: rgba(239, 68, 68, 0.95) !important;
          color: #ffffff !important;
        }
        .str-video__speaker-layout { background: #000000 !important; }
        .str-video__participant-view {
          border-radius: 12px !important;
          border: 2px solid rgba(255,255,255,0.08) !important;
          overflow: hidden !important;
        }
      `}</style>

      <StreamVideo client={client}>
        <StreamCall call={call}>
          <div className="h-full flex flex-col bg-black">
            <div className="flex-1 relative">
              <SpeakerLayout />
            </div>
            <div className="px-6 py-4 bg-black/60">
              <CallControls
                onLeave={() => {
                  toast.info("Leaving call...");
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
