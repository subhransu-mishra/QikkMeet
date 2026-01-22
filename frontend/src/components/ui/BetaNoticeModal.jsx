import React from "react";

export const BetaNoticeModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-white">
      {/* Background gradient + blur */}
      

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-black/50 border border-white/10 rounded-3xl shadow-xl p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-xl mb-4">
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-2">Beta Version</h3>
            <p className="text-white/70 text-sm leading-relaxed">
              This is a beta release. Many features and pages are still under
              development. You may encounter changes or occasional issues.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors cursor-pointer"
            >
              Okay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetaNoticeModal;
