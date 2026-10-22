'use client';

import { useEffect, useState } from 'react';

/**
 * Seconds left of `seconds`, counting down to 0. A new `key` (another error, another step)
 * starts it again.
 */
export function useCountdown(seconds: number | undefined, key: unknown): number {
  const [left, setLeft] = useState(seconds ?? 0);
  const [counted, setCounted] = useState(key);
  if (counted !== key) {
    setCounted(key);
    setLeft(seconds ?? 0);
  }

  useEffect(() => {
    if (!left) return;
    const timer = setTimeout(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  return seconds ? left : 0;
}
