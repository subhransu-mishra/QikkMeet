import React, { useState, useCallback } from "react";
import { MessageInput, useChatContext } from "stream-chat-react";
import { axiosInstance } from "../../lib/axios";
import { FraudWarningModal } from "./FraudWarningModal";

export const SafeMessageInput = (props) => {
  const { channel } = useChatContext();
  const [isValidating, setIsValidating] = useState(false);
  const [fraudWarning, setFraudWarning] = useState(null);
  const [pendingMessageData, setPendingMessageData] = useState(null);

  const handleSend = useCallback(
    (messageData) => {
      // Extract text from messageData
      const messageText = messageData?.text?.trim() || "";
      
      // Skip validation for empty or very short messages (send immediately)
      if (!messageText || messageText.length < 3) {
        // Allow short messages to pass through normally
        return messageData;
      }

      // Show loading state
      setIsValidating(true);

      // Perform async validation
      (async () => {
        try {
          console.log("[FRAUD DETECTION] Validating message:", messageText);
          
          // Validate message BEFORE sending
          const response = await axiosInstance.post(
            "/api/fraud-detection/validate-message",
            { message: messageText },
            { timeout: 5000 }
          );

          console.log("[FRAUD DETECTION] Validation response:", response.data);
          setIsValidating(false);

          // Check if message is suspicious
          if (response.data?.isSuspicious) {
            console.log("[FRAUD DETECTION] ⚠️ Suspicious content detected:", response.data.issues);
            
            // Store the pending message and show warning modal
            setPendingMessageData(messageData);
            const warningData = {
              alert: response.data.alert || "This message contains suspicious content",
              issues: response.data.issues || [],
            };
            console.log("[FRAUD DETECTION] Setting warning modal with data:", warningData);
            setFraudWarning(warningData);

            // Don't send the message - it will be blocked
            return;
          }

          // Message is safe, send it manually
          console.log("[FRAUD DETECTION] ✅ Message is safe, sending...");
          if (channel) {
            await channel.sendMessage(messageData);
          }
        } catch (error) {
          console.error("[FRAUD DETECTION ERROR]", error);
          console.error("[FRAUD DETECTION ERROR] Response:", error.response?.data);
          console.error("[FRAUD DETECTION ERROR] Status:", error.response?.status);
          setIsValidating(false);
          
          // On error, try to send the message anyway (fail-open for better UX)
          if (channel) {
            try {
              await channel.sendMessage(messageData);
            } catch (sendError) {
              console.error("[FRAUD DETECTION] Error sending message:", sendError);
            }
          }
        }
      })();

      // Return null to prevent Stream's default send behavior
      // We handle sending manually after validation (or immediately for short messages)
      return null;
    },
    [channel]
  );

  const handleConfirmSend = useCallback(async () => {
    if (pendingMessageData && channel) {
      try {
        // User confirmed, send the message anyway
        await channel.sendMessage(pendingMessageData);
        console.log("[FRAUD DETECTION] Message sent after user confirmation");
      } catch (err) {
        console.error("[FRAUD DETECTION] Error sending message:", err);
      }
    }
    // Clear the warning state
    setFraudWarning(null);
    setPendingMessageData(null);
  }, [pendingMessageData, channel]);

  const handleCancelSend = useCallback(() => {
    // User cancelled, just clear the warning
    setFraudWarning(null);
    setPendingMessageData(null);
  }, []);

  return (
    <>
      <MessageInput
        {...props}
        overrideSubmitHandler={handleSend}
        disabled={isValidating}
      />
      {isValidating && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
          Validating message...
        </div>
      )}
      <FraudWarningModal
        isOpen={!!fraudWarning}
        onClose={handleCancelSend}
        onConfirm={handleConfirmSend}
        warning={fraudWarning}
      />
    </>
  );
};
