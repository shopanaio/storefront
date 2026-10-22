'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether the window matches a media query, such as one of `mq` without its `@media`. Unlike
 * antd's breakpoints (lg = 992px), it follows the same widths as the checkout's own CSS.
 */
export function useMediaQuery(query: string): boolean {
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
    () => false
  );
}
