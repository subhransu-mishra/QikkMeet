import React, { useEffect, useState } from "react";
import { MessageInput, useChatContext } from "stream-chat-react";
import { axiosInstance } from "../../lib/axios";
import FraudDetectionModal from "../FraudDetectionModal"; // Re-using your existing modal
import toast from "react-hot-toast";

/**
 * A wrapper around MessageInput that performs post-send fraud detection.
 */
export const SafeMessageInput = (props) => {
  const { channel } = useChatContext();
  const [detectionAlert, setDetectionAlert] = useState(null);
  const [checkedMessageIds, setCheckedMessageIds] = useState(() => new Set());

  useEffect(() => {
    // Guard clause: Do nothing if the channel is not ready.
    if (!channel) {
      console.log("SafeMessageInput: Waiting for channel...");
      return;
    }

    console.log("SafeMessageInput: Channel is ready. Attaching listener.");

    const handleNewMessage = async (event) => {
      const message = event.message;
      const currentUserId = channel.getClient().userID;

      // 1. Only check messages sent by the current user.
      if (message.user?.id !== currentUserId) return;

      // 2. Avoid re-checking the same message.
      if (checkedMessageIds.has(message.id)) return;

      // 3. Skip empty messages.
      if (!message.text || message.text.trim().length === 0) return;

      console.log(`[POST-SEND CHECK] Checking: "${message.text}"`);
      setCheckedMessageIds((prev) => new Set(prev).add(message.id));

      try {
        const response = await axiosInstance.post(
          "/api/fraud-detection/validate-message",
          { message: message.text }
        );

        if (response.data.isSuspicious) {
          console.log(`[DETECTION] ⚠️ Misleading message detected!`);
          setDetectionAlert({
            message: message.text,
            issues: response.data.issues || [],
          });
          toast.error("Suspicious content detected!", { icon: "⚠️" });
        } else {
          console.log("[DETECTION] ✅ Message is safe.");
        }
      } catch (error) {
        console.error("[API ERROR]", error.response?.data || error.message);
      }
    };

    channel.on("message.new", handleNewMessage);

    // Cleanup function to remove the listener when the component unmounts or channel changes.
    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel]); // Re-run this effect only when the channel object itself changes.

  return (
    <>
      <MessageInput {...props} />
      <FraudDetectionModal
        isOpen={!!detectionAlert}
        onClose={() => setDetectionAlert(null)}
        onConfirm={() => setDetectionAlert(null)} // Confirm just closes the info modal.
        issues={detectionAlert?.issues || []}
      />
    </>
  );
};
