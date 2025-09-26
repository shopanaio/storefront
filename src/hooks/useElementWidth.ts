import { useEffect, useState } from "react";

/**
 * Hook returns current width of the passed element and
 * automatically updates the value when it changes.
 *
 * Uses native ResizeObserver. For older browsers
 * provides graceful-fallback to window.resize event.
 */
export function useElementWidth<T extends HTMLElement>(
  ref: React.RefObject<T | null>
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Initialize current width
    const updateWidth = () => setWidth(element.offsetWidth);
    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const newWidth = entry.contentRect.width;
          setWidth((prev) => (prev !== newWidth ? newWidth : prev));
        }
      });
      observer.observe(element);

      return () => observer.disconnect();
    }

    // Fallback for environments without ResizeObserver
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [ref]);

  return width;
}
