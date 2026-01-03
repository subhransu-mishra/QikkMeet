import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaTimes, FaShieldAlt } from "react-icons/fa";

export const FraudWarningModal = ({
  isOpen,
  onClose,
  onConfirm,
  warning,
}) => {
  // Don't render if not open or no warning data
  if (!isOpen || !warning) return null;

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      default:
        return "text-yellow-400";
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case "critical":
        return "Critical";
      case "high":
        return "High";
      default:
        return "Warning";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-orange-500/30"
          >
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition"
            >
              <FaTimes size={20} />
            </button>

            
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                <FaExclamationTriangle className="text-3xl text-orange-400" />
              </div>
            </div>

           
            <h2 className="text-2xl font-bold text-center mb-2 text-white">
              Suspicious Content Detected
            </h2>
            <p className="text-white/60 text-center mb-6">
              {warning.alert ||
                "This message may contain misleading or suspicious content."}
            </p>

            
            {warning.issues && warning.issues.length > 0 && (
              <div className="bg-black/50 rounded-lg p-4 mb-6 border border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <FaShieldAlt className="text-orange-400" />
                  <span className="text-sm font-semibold text-white">
                    Detected Issues:
                  </span>
                </div>
                <ul className="space-y-2">
                  {warning.issues.map((issue, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-white/80"
                    >
                      <span className="text-orange-400 mt-1">•</span>
                      <div className="flex-1">
                        <span className="font-medium">
                          {issue.type === "fraud_keyword" && "Fraud Keyword"}
                          {issue.type === "suspicious_link" && "Suspicious Link"}
                          {issue.type === "blacklisted_pattern" &&
                            "Blacklisted Pattern"}
                        </span>
                        {issue.matched && (
                          <span
                            className={`ml-2 ${getSeverityColor(
                              issue.severity
                            )}`}
                          >
                            ({issue.matched})
                          </span>
                        )}
                        {issue.severity && (
                          <span
                            className={`ml-2 text-xs ${getSeverityColor(
                              issue.severity
                            )}`}
                          >
                            [{getSeverityLabel(issue.severity)}]
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

           
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-orange-200 text-center">
                ⚠️ Please review your message carefully. Sending suspicious
                content may violate our terms of service.
              </p>
            </div>

            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition"
              >
                Cancel & Edit Message
              </button>
              <button
                onClick={onConfirm}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500/20 text-orange-400 rounded-full font-semibold hover:bg-orange-500/30 transition border border-orange-500/30"
              >
                Send Anyway (Not Recommended)
              </button>
            </div>

            <p className="text-xs text-white/40 text-center mt-4">
              We recommend editing your message to remove suspicious content
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

