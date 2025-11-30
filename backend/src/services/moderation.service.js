import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// Enhanced fraud rules
const fraudRules = {
  fraud_keywords: [
    "free gift",
    "lottery",
    "upi id",
    "urgent",
    "otp",
    "payment now",
    "win prize",
    "free cash",
    "scan to win",
    "claim now",
    "limited offer",
    "congratulations you won",
    "verify your account",
    "update payment",
  ],
  suspicious_links: [
    ".xyz",
    "tinyurl",
    "click-now",
    "bit.ly",
    "shorturl",
    "t.co",
    "rebrand.ly",
    "cutt.ly",
    "ow.ly",
  ],
  blacklisted_patterns: [
    "send money",
    "investment opportunity",
    "double your money",
    "click this link",
    "open this link",
    "guaranteed returns",
    "risk-free investment",
    "get rich quick",
    "work from home",
    "make money fast",
    "transfer funds",
    "bank details",
  ],
  harassment_keywords: [
    "kill yourself",
    "die",
    "suicide",
    "harm yourself",
    "worthless",
    "pathetic",
    "loser",
    "stupid idiot",
  ],
};

/**
 * Rule-based detection (synchronous, fast)
 */
const checkRules = (message) => {
  const lowerMessage = message.toLowerCase();
  const detectedIssues = [];
  let riskScore = 0;

  // Check fraud keywords
  for (const keyword of fraudRules.fraud_keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      detectedIssues.push({
        type: "fraud_keyword",
        matched: keyword,
        severity: "high",
      });
      riskScore += 30;
    }
  }

  // Check suspicious links
  for (const link of fraudRules.suspicious_links) {
    if (lowerMessage.includes(link.toLowerCase())) {
      detectedIssues.push({
        type: "suspicious_link",
        matched: link,
        severity: "high",
      });
      riskScore += 40;
    }
  }

  // Check blacklisted patterns
  for (const pattern of fraudRules.blacklisted_patterns) {
    if (lowerMessage.includes(pattern.toLowerCase())) {
      detectedIssues.push({
        type: "blacklisted_pattern",
        matched: pattern,
        severity: "critical",
      });
      riskScore += 50;
    }
  }

  // Check harassment
  for (const keyword of fraudRules.harassment_keywords) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      detectedIssues.push({
        type: "harassment",
        matched: keyword,
        severity: "critical",
      });
      riskScore += 60;
    }
  }

  return {
    issues: detectedIssues,
    riskScore: Math.min(riskScore, 100),
  };
};

/**
 * AI-based detection (asynchronous, optional)
 */
const checkWithAI = async (message) => {
  if (!openai) {
    return {
      aiRiskScore: 0,
      aiClassification: "safe",
      aiReason: "AI disabled",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast, cheap model
      messages: [
        {
          role: "system",
          content: `You are a content moderation AI. Classify messages as:
- SAFE: Normal conversation
- SUSPICIOUS: Potentially problematic but unclear
- FRAUD: Scams, phishing, UPI fraud, OTP scams
- HARASSMENT: Threats, abuse, hate speech
- SPAM: Unwanted promotional content

Respond in JSON: {"classification": "SAFE|SUSPICIOUS|FRAUD|HARASSMENT|SPAM", "confidence": 0-100, "reason": "brief explanation"}`,
        },
        {
          role: "user",
          content: `Classify this message: "${message}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    const scoreMap = {
      SAFE: 0,
      SUSPICIOUS: 40,
      SPAM: 50,
      FRAUD: 90,
      HARASSMENT: 95,
    };

    return {
      aiRiskScore: scoreMap[result.classification] || 0,
      aiClassification: result.classification,
      aiReason: result.reason,
      aiConfidence: result.confidence,
    };
  } catch (error) {
    console.error("AI moderation error:", error);
    return {
      aiRiskScore: 0,
      aiClassification: "error",
      aiReason: error.message,
    };
  }
};

/**
 * Combined moderation check
 */
export const moderateMessage = async (message) => {
  // Step 1: Fast rule-based check
  const ruleResult = checkRules(message);

  // Step 2: AI check (only if rules found issues OR randomly sample 5% for training)
  let aiResult = { aiRiskScore: 0, aiClassification: "safe" };

  if (ruleResult.riskScore > 20 || Math.random() < 0.05) {
    aiResult = await checkWithAI(message);
  }

  // Step 3: Combine scores
  const finalRiskScore = Math.max(ruleResult.riskScore, aiResult.aiRiskScore);

  // Step 4: Classification
  let classification = "SAFE";
  if (finalRiskScore >= 80) classification = "FRAUD";
  else if (finalRiskScore >= 50) classification = "SUSPICIOUS";

  return {
    classification,
    riskScore: finalRiskScore,
    ruleIssues: ruleResult.issues,
    aiClassification: aiResult.aiClassification,
    aiReason: aiResult.aiReason,
    aiConfidence: aiResult.aiConfidence,
  };
};

export default {
  moderateMessage,
  checkRules,
  checkWithAI,
};
