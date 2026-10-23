'use client';

import { useEffect, useReducer } from 'react';

/** Whole seconds from now until `deadline` (epoch ms); 0 once it has passed. */
export function secondsUntil(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

/**
 * Seconds left until `deadline` (epoch ms), counting down to 0 against the clock: a tab that
 * slept or a late timer never drifts from the deadline. None (`null`) is 0.
 */
export function useSecondsUntil(deadline: number | null): number {
  const [ticks, tick] = useReducer((count: number) => count + 1, 0);
  const left = deadline === null ? 0 : secondsUntil(deadline);

  useEffect(() => {
    if (deadline === null || left === 0) return;
    // The next whole second, a little after it so the ceiling has moved.
    const timer = setTimeout(
      tick,
      ((deadline - Date.now()) % 1000 || 1000) + 5
    );
    return () => clearTimeout(timer);
  }, [deadline, left, ticks]);

  return left;
}
