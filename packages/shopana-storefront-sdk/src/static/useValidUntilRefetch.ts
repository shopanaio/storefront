'use client';

import { useEffect, useRef } from 'react';

/** The longest delay `setTimeout` keeps: a later one fires at once. */
const MAX_DELAY_MS = 2_147_483_647;

/**
 * Runs `refetch` when `validUntil` comes: data that changes by itself at a moment (a promotion
 * that starts or ends), carried by a page rendered earlier, a static one in particular. A
 * moment already past refetches at once, after hydration; a moment further than `setTimeout`
 * reaches is waited for in steps. Only a new moment starts a new timer, not a new `refetch`.
 */
export function useValidUntilRefetch(
  validUntil: Date | string | null | undefined,
  refetch: () => unknown
): void {
  const time =
    validUntil instanceof Date
      ? validUntil.getTime()
      : validUntil
        ? Date.parse(validUntil)
        : Number.NaN;
  const latestRefetch = useRef(refetch);
  useEffect(() => {
    latestRefetch.current = refetch;
  });
  useEffect(() => {
    if (!Number.isFinite(time)) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = time - Date.now();
      if (delay > MAX_DELAY_MS) {
        timer = setTimeout(schedule, MAX_DELAY_MS);
        return;
      }
      timer = setTimeout(
        () => {
          void Promise.resolve()
            .then(() => latestRefetch.current())
            .catch(() => {});
        },
        Math.max(delay, 0)
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [time]);
}
