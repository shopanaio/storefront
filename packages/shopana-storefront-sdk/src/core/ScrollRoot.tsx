'use client';

import { createContext, useContext } from 'react';

/**
 * The element a page scrolls in: an app screen's own container, or null for the window. What
 * follows the page's scroll (a header, a scroll to the top) listens to this one.
 */
export const ScrollRootContext = createContext<Element | null>(null);

export function useScrollRoot(): Element | null {
  return useContext(ScrollRootContext);
}
