// Optimized fraud detection with Sets for O(1) lookup and early exit for critical issues
// Keywords categorized by severity for faster detection

// CRITICAL severity - immediate block
const CRITICAL_KEYWORDS = new Set([
  // Financial scams
  "send money",
  "transfer money",
  "wire money",
  "send payment",
  "make payment",
  "pay now",
  "payment required",
  "payment needed",
  "urgent payment",
  "immediate payment",

  // Investment scams
  "double your money",
  "guaranteed returns",
  "risk-free investment",
  "crypto investment",
  "bitcoin investment",
  "forex trading",
  "binary options",
  "get rich quick",
  "make money fast",

  // Account compromise
  "verify your account",
  "account suspended",
  "account locked",
  "account closed",
  "click to verify",
  "verify now",
  "confirm your identity",
  "update your account",

  // Phishing
  "click this link",
  "open this link",
  "click here",
  "follow this link",
  "visit this link",
  "click the link",
  "open link",

  // Urgency tactics
  "act now",
  "limited time",
  "expires today",
  "expires soon",
  "urgent action",
  "immediate action",
  "do not ignore",
  "final notice",

  // Lottery/Prize scams
  "you have won",
  "you won",
  "congratulations you won",
  "claim your prize",
  "claim prize",
  "claim reward",
  "claim now",

  // Tech support scams
  "your computer is infected",
  "virus detected",
  "malware detected",
  "system error",
  "critical error",
  "call this number",
  "call immediately",

  // Identity theft
  "social security number",
  "ssn",
  "credit card number",
  "bank account number",
  "routing number",
  "pin number",
  "verify your ssn",
]);

// HIGH severity - suspicious but may need context
const HIGH_SEVERITY_KEYWORDS = new Set([
  // Financial terms
  "upi id",
  "upi",
  "bank details",
  "account number",
  "ifsc code",
  "swift code",
  "routing code",
  "wire transfer",
  "western union",
  "moneygram",
  "paypal",
  "venmo",
  "cashapp",

  // Free money/gifts
  "free gift",
  "free cash",
  "free money",
  "free prize",
  "free reward",
  "free offer",
  "free trial",
  "free bonus",

  // Lottery/Gambling
  "lottery",
  "lottery winner",
  "lottery prize",
  "jackpot",
  "winning ticket",
  "lucky winner",
  "scratch card",
  "win big",

  // Investment related
  "investment",
  "invest now",
  "investment opportunity",
  "trading opportunity",
  "crypto",
  "cryptocurrency",
  "bitcoin",
  "ethereum",
  "nft",
  "token",

  // Urgency
  "urgent",
  "asap",
  "as soon as possible",
  "immediately",
  "right now",
  "today only",
  "today",

  // Verification/OTP
  "otp",
  "one time password",
  "verification code",
  "security code",
  "access code",
  "confirmation code",
  "activation code",

  // Links and URLs
  "scan to win",
  "scan qr",
  "qr code",
  "download app",
  "install app",
  "update app",

  // Romance scams
  "i need your help",
  "i'm in trouble",
  "emergency",
  "help me",
  "i need money",
  "send me money",
  "can you help",

  // Job scams
  "work from home",
  "easy money",
  "no experience needed",
  "make $",
  "earn $",
  "get paid",
  "quick cash",

  // Prize/Contest
  "you are selected",
  "you have been selected",
  "you are eligible",
  "you qualify",
  "claim your",
  "redeem now",
]);

// Suspicious link patterns
const SUSPICIOUS_LINK_PATTERNS = new Set([
  ".xyz",
  ".tk",
  ".ml",
  ".ga",
  ".cf",
  "tinyurl",
  "bit.ly",
  "short.link",
  "t.co",
  "goo.gl",
  "ow.ly",
  "is.gd",
  "v.gd",
  "click-now",
  "clickhere",
  "verify-now",
  "update-now",
  "secure-link",
  "safe-link",
]);

// Pattern-based detection (for multi-word phrases)
const CRITICAL_PATTERNS = [
  /send\s+money/i,
  /transfer\s+money/i,
  /wire\s+money/i,
  /make\s+payment/i,
  /pay\s+now/i,
  /verify\s+your\s+account/i,
  /account\s+(suspended|locked|closed)/i,
  /click\s+(this\s+)?link/i,
  /open\s+(this\s+)?link/i,
  /you\s+have\s+won/i,
  /claim\s+your\s+(prize|reward)/i,
  /double\s+your\s+money/i,
  /guaranteed\s+returns/i,
  /risk-free\s+investment/i,
  /act\s+now/i,
  /limited\s+time/i,
  /expires\s+(today|soon)/i,
  /urgent\s+action/i,
  /immediate\s+action/i,
  /final\s+notice/i,
];

/**
 * Optimized fraud detection with early exit for critical issues
 * Uses Sets for O(1) lookup instead of O(n) array iteration
 * Returns immediately when critical issue is found for maximum speed
 */
const checkMessage = (message) => {
  try {
    if (!message || typeof message !== "string") {
      return {
        isSuspicious: false,
        issues: [],
        message: message,
      };
    }

    const lowerMessage = message.toLowerCase().trim();

    // Early exit for empty messages
    if (lowerMessage.length === 0) {
      return {
        isSuspicious: false,
        issues: [],
        message: message,
      };
    }

    const detectedIssues = [];
    let foundCritical = false;

    // Split message into words for efficient checking
    const words = lowerMessage.split(/\s+/);
    const messageLower = lowerMessage;

    // 1. Check CRITICAL keywords first (fastest path to detection)
    for (const word of words) {
      if (CRITICAL_KEYWORDS.has(word)) {
        detectedIssues.push({
          type: "fraud_keyword",
          matched: word,
          severity: "critical",
        });
        foundCritical = true;
        // Early exit for critical - no need to check further
        break;
      }
    }

    // If critical found, return immediately for speed
    if (foundCritical) {
      return {
        isSuspicious: true,
        issues: detectedIssues,
        message: message,
      };
    }

    // 2. Check critical patterns (multi-word phrases)
    for (const pattern of CRITICAL_PATTERNS) {
      if (pattern.test(messageLower)) {
        detectedIssues.push({
          type: "blacklisted_pattern",
          matched: pattern.source,
          severity: "critical",
        });
        foundCritical = true;
        break;
      }
    }

    // Early exit if critical pattern found
    if (foundCritical) {
      return {
        isSuspicious: true,
        issues: detectedIssues,
        message: message,
      };
    }

    // 3. Check HIGH severity keywords (only if no critical found)
    for (const word of words) {
      if (HIGH_SEVERITY_KEYWORDS.has(word)) {
        detectedIssues.push({
          type: "fraud_keyword",
          matched: word,
          severity: "high",
        });
        // Continue checking for multiple issues
      }
    }

    // 4. Check suspicious link patterns
    for (const linkPattern of SUSPICIOUS_LINK_PATTERNS) {
      if (messageLower.includes(linkPattern)) {
        detectedIssues.push({
          type: "suspicious_link",
          matched: linkPattern,
          severity: "high",
        });
      }
    }

    // 5. Check for multi-word high severity phrases
    const highSeverityPhrases = [
      "free gift",
      "free cash",
      "free money",
      "free prize",
      "upi id",
      "bank details",
      "account number",
      "verification code",
      "security code",
      "you have won",
      "claim your prize",
      "work from home",
      "easy money",
      "no experience needed",
    ];

    for (const phrase of highSeverityPhrases) {
      if (messageLower.includes(phrase)) {
        detectedIssues.push({
          type: "fraud_keyword",
          matched: phrase,
          severity: "high",
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
