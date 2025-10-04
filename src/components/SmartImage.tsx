// src/components/SmartImage.tsx
// Optimized multi-source <img> with loading states and performance optimizations.

import { useState, useCallback } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  sources: string[];
};

export default function SmartImage({ sources, alt = "", className = "", ...rest }: Props) {
  const [idx, setIdx] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const safeIdx = Math.min(idx, sources.length - 1);
  const src = sources[safeIdx];

  const handleError = useCallback(() => {
    setIdx((n) => Math.min(n + 1, sources.length - 1));
  }, [sources.length]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg" />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading="lazy"
        decoding="async"
        {...rest}
      />
    </div>
  );
}
