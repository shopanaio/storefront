'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { queries, type Breakpoint } from './breakpoints';
import { useStorefrontUI } from './StorefrontUIProvider';

const WIDTH_FEATURE = /^\((min|max)-width:\s*([\d.]+)px\)$/;

/**
 * Whether a viewport of `width` matches a query of `min-width` / `max-width` features in px
 * joined by `and`, as `queries` builds them; false for a query of anything else.
 */
export function matchesWidth(query: string, width: number): boolean {
  return query.split(/\s+and\s+/).every((feature) => {
    const match = WIDTH_FEATURE.exec(feature.trim());
    if (!match) return false;
    const bound = Number(match[2]);
    return match[1] === 'min' ? width >= bound : width <= bound;
  });
}

/**
 * Whether the window matches a media query without `@media`, such as one of `queries`. The
 * server and the hydration pass answer for the provider's assumed width, so the first render
 * in the browser matches the HTML; the window's answer applies once the host has hydrated (see
 * `viewport` of StorefrontUIProvider).
 */
export function useMediaQuery(query: string): boolean {
  const { viewport } = useStorefrontUI();
  const assumed = matchesWidth(query, viewport.assumedWidth);
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );
  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query]
  );
  const getAssumed = () => assumed;
  return useSyncExternalStore(
    subscribe,
    viewport.hydrated ? getSnapshot : getAssumed,
    getAssumed
  );
}

/** Whether the window is narrower than a breakpoint (`queries.below`). */
export function useBreakpointDown(breakpoint: Breakpoint): boolean {
  return useMediaQuery(queries.below(breakpoint));
}
