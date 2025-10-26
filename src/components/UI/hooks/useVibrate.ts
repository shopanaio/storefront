import { useCallback } from 'react';

export type VibratePattern = number | number[];

export function useVibrate() {
  return useCallback((_?: VibratePattern) => {
    if (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      'vibrate' in navigator
    ) {
      try {
        (navigator as any).vibrate(3);
      } catch {}
    }
  }, []);
}
