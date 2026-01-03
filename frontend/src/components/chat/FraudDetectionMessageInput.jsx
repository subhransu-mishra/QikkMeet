import React, { useState, useCallback, useEffect, useRef } from "react";
import { MessageInput, useMessageInputContext } from "stream-chat-react";
import { axiosInstance } from "../../lib/axios";
import { FraudWarningModal } from "./FraudWarningModal";


export const FraudDetectionMessageInput = (props) => {
  let contextData = null;
  try {
    contextData = useMessageInputContext();
  } catch (error) {
    
    console.warn("MessageInputContext not available, using basic MessageInput");
    return <MessageInput {...props} />;
  }

  const { text, handleSubmit, attachments, mentioned_users, parent, channel } =
    contextData;

  const [isValidating, setIsValidating] = useState(false);
  const [fraudWarning, setFraudWarning] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);

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
      return { isSafe: true, error: true };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleSend = useCallback(
    async (e) => {
      e?.preventDefault?.();

      const messageText = text?.trim() || "";

      if (!messageText && (!attachments || attachments.length === 0)) {
        handleSubmit(e);
        return;
      }

      const validation = await validateMessage(messageText);

      if (!validation.isSafe) {
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
        return; 
      }

      
      handleSubmit(e);
    },
    [text, attachments, mentioned_users, parent, handleSubmit, validateMessage]
  );

  
  const handleConfirmSend = useCallback(async () => {
    if (pendingMessage && channel) {
      try {
        
        await channel.sendMessage(pendingMessage);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
    setFraudWarning(null);
    setPendingMessage(null);
  }, [channel, pendingMessage]);

 
  const handleCancelSend = useCallback(() => {
    setFraudWarning(null);
    setPendingMessage(null);
  }, []);

  return (
    <>
      <MessageInput
        {...props}
        overrideSubmitHandler={handleSend}
        disabled={isValidating}
      />
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
