import React from "react";
import { MessageInput } from "stream-chat-react";

// Simple wrapper - just use Stream's default MessageInput
// This ensures messages work properly
export const SafeMessageInput = (props) => {
  return <MessageInput {...props} />;
};
