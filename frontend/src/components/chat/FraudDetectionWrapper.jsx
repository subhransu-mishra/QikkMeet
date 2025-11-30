import React, { useState, useCallback } from "react";
import { useMessageInputContext } from "stream-chat-react";
import { axiosInstance } from "../../lib/axios";
import { FraudWarningModal } from "./FraudWarningModal";

/**
 * Wrapper component that intercepts message submission for fraud detection
 * Must wrap MessageInput to access the context
 */
export const FraudDetectionWrapper = ({ children, channel }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [fraudWarning, setFraudWarning] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);

  // Access MessageInput context
  const {
    text,
    handleSubmit,
    attachments,
    mentioned_users,
    parent,
  } = useMessageInputContext();

  // Validate message with fraud detection API
  const validateMessage = useCallback(async (messageText) => {
    if (!messageText || !messageText.trim()) {
      return { isSafe: true };
    }

    try {
      setIsValidating(true);
      
      const response = await axiosInstance.post(
        "/fraud-detection/validate-message",
        { message: messageText },
        {
          timeout: 2000, // 2 second timeout for fast response
        }
      );

      const { isSuspicious, issues, alert } = response.data;

      if (isSuspicious) {
        return {
          isSafe: false,
          issues: issues || [],
          alert: alert || "This message contains suspicious content",
        };
      }

      return { isSafe: true };
    } catch (error) {
      console.error("Fraud detection error:", error);
      // On error, allow message to send (fail open for better UX)
      return { isSafe: true, error: true };
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Intercept handler
  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault?.();
      
      const messageText = text?.trim() || "";
      
      // Skip validation for empty messages or attachments only
      if (!messageText && (!attachments || attachments.length === 0)) {
        handleSubmit(e);
        return;
      }

      // Validate message
      const validation = await validateMessage(messageText);

      if (!validation.isSafe) {
        // Store the pending message and show warning
        const messageData = {
          text: messageText,
          attachments,
          mentioned_users,
          parent,
        };
        setPendingMessage(messageData);
        setFraudWarning({
          issues: validation.issues || [],
          alert: validation.alert || "This message contains suspicious content",
        });
        return; // Prevent sending
      }

      // Message is safe, proceed with normal send
      handleSubmit(e);
    },
    [text, attachments, mentioned_users, parent, handleSubmit, validateMessage]
  );

  // Handle user confirming to send despite warning
  const handleConfirmSend = useCallback(async () => {
    if (pendingMessage && channel) {
      try {
        // Send the message directly via channel
        await channel.sendMessage(pendingMessage);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
    setFraudWarning(null);
    setPendingMessage(null);
  }, [channel, pendingMessage]);

  // Handle user canceling
  const handleCancelSend = useCallback(() => {
    setFraudWarning(null);
    setPendingMessage(null);
  }, []);

  // Clone MessageInput and add overrideSubmitHandler
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        overrideSubmitHandler: handleSend,
        disabled: isValidating,
      });
    }
    return child;
  });

  return (
    <>
      {childrenWithProps}
      {isValidating && (
        <div className="px-4 py-2 bg-black/50 border-t border-white/10">
          <span className="text-xs text-white/60 flex items-center gap-2">
            <span className="animate-spin">⏳</span>
            Checking message for suspicious content...
          </span>
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

