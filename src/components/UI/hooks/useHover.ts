// Creates useHover hook that returns boolean state and
// handler object onMouseEnter/onMouseLeave for binding to element.
import { useCallback, useState } from "react";

export interface HoverHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * Reusable hook for tracking cursor hover state.
 * Returns a tuple of:
 * 1. `isHovered` – current hover state.
 * 2. `hoverHandlers` – object with handlers that can be simply
 *    spread on the target element: `<div {...hoverHandlers} />`.
 */
export function useHover(): [boolean, HoverHandlers] {
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback(() => setIsHovered(true), []);
  const onMouseLeave = useCallback(() => setIsHovered(false), []);

  return [isHovered, { onMouseEnter, onMouseLeave }];
}
