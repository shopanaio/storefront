import { useEffect, useState } from 'react';

/** Longest delay `setTimeout` takes; a later moment is re-checked after it. */
const MAX_DELAY_MS = 2 ** 31 - 1;

/** Current time, refreshed when `until` comes, so that a deadline takes effect on screen. */
export function useNow(until: Date | null | undefined): number {
  const [now, setNow] = useState(() => Date.now());
  const target = until?.getTime() ?? null;

  useEffect(() => {
    if (target === null || now >= target) return;
    const delay = Math.max(0, Math.min(target - Date.now(), MAX_DELAY_MS));
    const timer = setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [target, now]);

  return now;
}
