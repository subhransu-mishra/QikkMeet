import fraudDetectionService from "../services/fraudDetection.service.js";

export const validateMessage = async (req, res) => {
  try {
    const { message } = req.body;

    // Fast validation checks
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required and must be a string",
      });
    }

    const trimmed = message.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty",
      });
    }

    // Quick length check - if message is too short, likely safe
    if (trimmed.length < 3) {
      return res.status(200).json({
        success: true,
        isSuspicious: false,
        message: "Message is safe to send",
      });
    }

    // Perform fraud detection
    const validationResult = fraudDetectionService.checkMessage(trimmed);

    if (validationResult.isSuspicious) {
      return res.status(200).json({
        success: true,
        isSuspicious: true,
        alert: "This message contains suspicious content",
        issues: validationResult.issues,
        message: "Please review your message before sending",
      });
    }

    return res.status(200).json({
      success: true,
      isSuspicious: false,
      message: "Message is safe to send",
    });
  } catch (error) {
    console.error("Error in fraud detection:", error);
    // If auth middleware passes but user context missing, return 401 for clarity
    if (error.name === "UnauthorizedError") {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
