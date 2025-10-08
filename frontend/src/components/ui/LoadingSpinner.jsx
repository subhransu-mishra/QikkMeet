import React from "react";
import { Spinner } from "./spinner";

const LoadingSpinner = ({
  text = "Loading...",
  size = "md",
  className = "",
  showText = true,
}) => {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Spinner size={size} className="text-white" />
      {showText && (
        <span className="text-sm font-medium text-white">{text}</span>
      )}
    </div>
  );
};

export { LoadingSpinner };
