'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { queries, type Breakpoint } from './breakpoints';

export interface MediaQueryOptions {
  /**
   * What the hook returns on the server and during hydration, before the window can be asked;
   * `false` by default. A host that knows the device (from the user agent) passes it, so a
   * phone renders its bottom sheet from the first paint.
   */
  defaultValue?: boolean;
}

/** Whether the window matches a media query without `@media`, such as one of `queries`. */
export function useMediaQuery(
  query: string,
  { defaultValue = false }: MediaQueryOptions = {}
): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => defaultValue
  );
}

/** Whether the window is narrower than a breakpoint (`queries.below`). */
export function useBreakpointDown(
  breakpoint: Breakpoint,
  options?: MediaQueryOptions
): boolean {
  return useMediaQuery(queries.below(breakpoint), options);
}
