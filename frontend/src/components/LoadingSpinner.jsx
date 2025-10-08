import React from "react";

const LoadingSpinner = ({
  size = "md",
  color = "white",
  text = "",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-8 h-8 border-4",
    xl: "w-12 h-12 border-4",
  };

  const colorClasses = {
    white: "border-white border-t-transparent",
    primary: "border-primary border-t-transparent",
    secondary: "border-secondary border-t-transparent",
    gray: "border-gray-400 border-t-transparent",
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
