import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

const FraudDetectionModal = ({ isOpen, onClose, onConfirm, issues = [] }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "text-red-500";
      case "high":
        return "text-orange-500";
      default:
        return "text-yellow-500";
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 border-red-500/20";
      case "high":
        return "bg-orange-500/10 border-orange-500/20";
      default:
        return "bg-yellow-500/10 border-yellow-500/20";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0a0a0a] rounded-2xl p-6 max-w-lg w-full relative shadow-2xl border border-red-500/20"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition"
            >
              <FaTimes size={20} />
            </button>

            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <FaExclamationTriangle className="text-3xl text-red-500" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center mb-2 text-white">
              Suspicious Content Detected
            </h2>
            <p className="text-white/60 text-center mb-6">
              Your message contains potentially harmful or suspicious content
            </p>

            {/* Issues List */}
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getSeverityBg(
                    issue.severity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle
                      className={`mt-0.5 flex-shrink-0 ${getSeverityColor(
                        issue.severity
                      )}`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm mb-1">
                        {issue.type === "fraud_keyword" && "Fraud Keyword"}
                        {issue.type === "suspicious_link" && "Suspicious Link"}
                        {issue.type === "blacklisted_pattern" &&
                          "Blacklisted Pattern"}
                      </p>
                      <p className="text-white/70 text-sm">
                        Detected:{" "}
                        <span className="font-mono text-white/90">
                          "{issue.matched}"
                        </span>
                      </p>
                      <span
                        className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${getSeverityColor(
                          issue.severity
                        )}`}
                      >
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning Text */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <p className="text-yellow-500 text-sm text-center">
                ⚠️ Sending suspicious messages may violate our terms of service
                and could result in account restrictions
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="w-full cursor-pointer py-3 px-4 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition"
              >
                Cancel & Edit Message
              </button>

              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full py-3 px-4 cursor-pointer bg-red-500/20 text-red-500 rounded-full font-semibold hover:bg-red-500/30 transition border border-red-500/30"
              >
                I Understand, Send Anyway
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FraudDetectionModal;
