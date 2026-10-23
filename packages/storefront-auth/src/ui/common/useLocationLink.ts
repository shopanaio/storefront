'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};

/**
 * The query of the page: `search` when the host's router gives it, else `location.search`,
 * null while rendered on the server. Without `search` only a load or a history step (popstate)
 * is seen: a client-side navigation of the host router to the page is not.
 */
function useLocationSearch(search: string | undefined): string | null {
  const current = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => null
  );
  return search ?? current;
}

/**
 * A link IAM put into the address bar of this page (a reset token, a verification outcome),
 * read once and kept: `clear` then removes it from the address bar, so it stays out of the
 * history, the `Referer` of the next requests and analytics. `undefined` until the query is
 * known (on the server).
 */
export function useLocationLink<T>(
  read: (search: string) => T,
  clear: () => void,
  search?: string
): T | undefined {
  const query = useLocationSearch(search);
  const [kept, setKept] = useState<{ link: T } | null>(null);
  let current = kept;
  if (current === null && query !== null) {
    current = { link: read(query) };
    setKept(current);
  }

  useEffect(() => {
    if (kept) clear();
  }, [kept, clear]);

  return current?.link;
}
