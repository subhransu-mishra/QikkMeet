import moderationQueue from "../lib/queue.js";
import fraudDetectionService from "../services/fraudDetection.service.js";

/**
 * In-memory worker - no separate process needed
 */
moderationQueue.process("moderate", async (job) => {
  const { messageId, messageText, userId, channelId } = job.data;

  console.log(`🔍 Moderating message ${messageId}: "${messageText}"`);

  try {
    // Check the message
    const result = fraudDetectionService.checkMessage(messageText);

    console.log(`📊 Result: ${result.isSuspicious ? "SUSPICIOUS" : "SAFE"}`);

    if (result.isSuspicious) {
      console.log(`⚠️ Suspicious content detected:`, result.issues);

      // TODO: Add your moderation actions here:
      // - Delete message from Stream
      // - Add strike to user
      // - Send alerts
      // - Log to database
    }

    return { success: true, result };
  } catch (error) {
    console.error(`❌ Moderation failed:`, error);
    throw error;
  }
});

console.log("✅ In-memory moderation worker started");
