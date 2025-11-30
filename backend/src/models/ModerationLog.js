import mongoose from "mongoose";

const moderationLogSchema = new mongoose.Schema({
  messageId: { type: String, required: true, index: true },
  messageText: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  channelId: { type: String, required: true },
  classification: {
    type: String,
    enum: ["SAFE", "SUSPICIOUS", "FRAUD", "HARASSMENT", "SPAM"],
    required: true,
    index: true,
  },
  riskScore: { type: Number, required: true },
  ruleIssues: [
    {
      type: { type: String },
      matched: String,
      severity: String,
    },
  ],
  aiClassification: String,
  aiReason: String,
  action: {
    type: String,
    enum: ["none", "flagged", "deleted", "user_banned"],
    default: "none",
  },
  timestamp: { type: Date, default: Date.now, index: true },
});

export default mongoose.model("ModerationLog", moderationLogSchema);
