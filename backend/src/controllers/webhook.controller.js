import moderationQueue from "../lib/queue.js";

/**
 * Handle Stream Chat webhooks
 */
export const handleStreamWebhook = async (req, res) => {
  try {
    const { type, message, user, channel_id, channel_type } = req.body;

    // Only process new messages
    if (type !== "message.new") {
      return res.status(200).json({ received: true });
    }

    // Ignore system messages
    if (!message?.text || message.type === "system") {
      return res.status(200).json({ received: true });
    }

    console.log(`📨 New message from ${user?.id}: "${message.text}"`);

    // Enqueue moderation job (async, non-blocking)
    await moderationQueue.add("moderate", {
      messageId: message.id,
      messageText: message.text,
      userId: user?.id,
      userName: user?.name,
      channelId: channel_id,
      channelType: channel_type,
      timestamp: new Date().toISOString(),
    });

    // Respond immediately
    return res.status(200).json({ received: true, queued: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
