import React, { useState, useEffect } from "react";
import { FraudWarningModal } from "./FraudWarningModal";

/**
 * Modal component that listens for fraud detection warnings
 */
export const FraudDetectionModal = ({ channel }) => {
  const [fraudWarning, setFraudWarning] = useState(null);
  const [pendingMessage, setPendingMessage] = useState(null);

  useEffect(() => {
    const handleShowWarning = () => {
      const pending = window.__pendingFraudMessage;
      if (pending) {
        setPendingMessage(pending.messageData);
        setFraudWarning(pending.warning);
        window.__pendingFraudMessage = null;
      }
    };

    window.addEventListener('showFraudWarning', handleShowWarning);
    return () => {
      window.removeEventListener('showFraudWarning', handleShowWarning);
    };
  }, []);

  const handleConfirmSend = async () => {
    if (pendingMessage && channel) {
      try {
        await channel.sendMessage(pendingMessage);
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
    setFraudWarning(null);
    setPendingMessage(null);
  };

  const handleCancelSend = () => {
    setFraudWarning(null);
    setPendingMessage(null);
  };

  return (
    <FraudWarningModal
      isOpen={!!fraudWarning}
      onClose={handleCancelSend}
      onConfirm={handleConfirmSend}
      warning={fraudWarning}
    />
  );
};

