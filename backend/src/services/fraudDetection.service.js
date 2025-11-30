const fraudRules = {
  fraud_keywords: [
    "free gift",
    "lottery",
    "upi id",
    "urgent",
    "otp",
    "payment now",
    "win",
    "free cash",
    "scan to win",
  ],
  suspicious_links: [".xyz", "tinyurl", "click-now", "bit.ly"],
  blacklisted_patterns: [
    "send money",
    "investment",
    "double your money",
    "click this link",
    "open this link",
  ],
};

const checkMessage = (message) => {
  try {
    const lowerMessage = message.toLowerCase();
    const detectedIssues = [];

    // Check for fraud keywords
    for (const keyword of fraudRules.fraud_keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        detectedIssues.push({
          type: "fraud_keyword",
          matched: keyword,
          severity: "high",
        });
      }
    }

    // Check for suspicious links
    for (const link of fraudRules.suspicious_links) {
      if (lowerMessage.includes(link.toLowerCase())) {
        detectedIssues.push({
          type: "suspicious_link",
          matched: link,
          severity: "high",
        });
      }
    }

    // Check for blacklisted patterns
    for (const pattern of fraudRules.blacklisted_patterns) {
      if (lowerMessage.includes(pattern.toLowerCase())) {
        detectedIssues.push({
          type: "blacklisted_pattern",
          matched: pattern,
          severity: "critical",
        });
      }
    }

    return {
      isSuspicious: detectedIssues.length > 0,
      issues: detectedIssues,
      message: message,
    };
  } catch (error) {
    console.error("Error in checkMessage:", error);
    throw new Error("Failed to check message");
  }
};

export default {
  checkMessage,
};
