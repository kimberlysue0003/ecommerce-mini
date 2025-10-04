// src/components/SmartImage.tsx
// Minimal multi-source <img>: on error, try the next source to guarantee a render.

import { useState, useCallback } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  sources: string[];
};

export default function SmartImage({ sources, alt = "", ...rest }: Props) {
  const [idx, setIdx] = useState(0);
  const safeIdx = Math.min(idx, sources.length - 1);
  const src = sources[safeIdx];

  const handleError = useCallback(() => {
    setIdx((n) => Math.min(n + 1, sources.length - 1));
  }, [sources.length]);

  return <img src={src} alt={alt} onError={handleError} {...rest} />;
}
