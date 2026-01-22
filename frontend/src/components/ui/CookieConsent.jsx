import React from "react";

export const CookieConsent = ({ visible, onAccept }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm">
      <div className="bg-black/60 border border-white/10 rounded-2xl shadow-xl p-4 backdrop-blur-xl text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-lg">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3c.132 0 .263.006.392.017a4.001 4.001 0 004.591 4.591A9.003 9.003 0 013 12c0 4.97 4.03 9 9 9 4.63 0 8.44-3.5 8.94-8.005A3.5 3.5 0 0116.5 9.5a3.5 3.5 0 01-3.5-3.5C13 4.343 12.657 3 12 3z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/90">
              We use cookies to improve your experience. By continuing, you
              agree to our use of cookies.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={onAccept}
                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer"
              >
                Accept
              </button>
              <a href="#" className="text-sm text-white/70 hover:text-white">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
