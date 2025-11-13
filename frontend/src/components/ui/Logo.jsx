import React from "react";

export const Logo = ({ className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Icon Circle */}
      <div className="flex-shrink-0 w-9 h-9 bg-white rounded-full flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 8.5L19 12L15.5 15.5M8.5 15.5L5 12L8.5 8.5M19 12H5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="currentColor"
            className="text-black"
          />
        </svg>
      </div>

      {/* Text - using styled spans instead of SVG text */}
      <span
        className="font-black text-xl sm:text-2xl tracking-tight select-none"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        QIKMEET
      </span>
    </div>
  );
};
