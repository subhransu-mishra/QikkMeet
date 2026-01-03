import React, { useState } from "react";

const Avatar = ({ src, alt, className = "", fallbackText }) => {
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    alt || fallbackText || "User"
  )}&background=random&size=200`;

  return (
    <div className={`relative ${className}`}>
      <img
        src={imgError ? fallbackAvatar : src}
        alt={alt}
        className={`${className} ${
          isLoading ? "opacity-0" : "opacity-100"
        } transition-opacity duration-200`}
        onError={() => {
          console.warn(`Avatar failed to load: ${src}`);
          setImgError(true);
          setIsLoading(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div
          className={`absolute inset-0 ${className} bg-gray-700 animate-pulse rounded-full`}
        />
      )}
    </div>
  );
};

export { Avatar };
