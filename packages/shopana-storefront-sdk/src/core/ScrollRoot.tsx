'use client';

import { createContext, useContext } from 'react';

/**
 * The element a page scrolls in: an app screen's own container, or null for the window. What
 * watches the visibility of a part of the page (AwayBoundary) measures it against this one.
 */
export const ScrollRootContext = createContext<Element | null>(null);

export function useScrollRoot(): Element | null {
  return useContext(ScrollRootContext);
}
