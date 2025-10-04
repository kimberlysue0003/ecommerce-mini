// Simple React portal that renders children into <body>.
// Avoids clipping from ancestors (sticky headers, transforms, etc).

import { createPortal } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

export default function Portal({
  children,
  containerId = "portal-root",
}: {
  children: ReactNode;
  containerId?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let el = document.getElementById(containerId);
    let created = false;
    if (!el) {
      el = document.createElement("div");
      el.id = containerId;
      document.body.appendChild(el);
      created = true;
    }
    setContainer(el);
    setMounted(true);
    return () => {
      if (created && el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, [containerId]);

  if (!mounted || !container) return null;
  return createPortal(children, container);
}
