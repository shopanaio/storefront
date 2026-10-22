'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

/** The query of the page; null while rendered on the server. */
export function useLocationSearch(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null
  );
}
