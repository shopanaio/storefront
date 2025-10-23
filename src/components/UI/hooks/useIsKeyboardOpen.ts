import { useEffect, useRef, useState } from 'react';

/**
 * Options for `useIsKeyboardOpen`.
 *
 * Detection is based on comparing the current visual viewport height (+ offsetTop on iOS)
 * against a dynamic baseline captured from the maximum observed viewport height.
 */
type UseIsKeyboardOpenOptions = {
  /** Absolute pixel threshold to consider the keyboard open. Default: 200. */
  thresholdPx?: number;
  /** Ratio (0..1) of baseline height to consider the keyboard open. Default: 0.2. */
  thresholdRatio?: number;
  /** SSR/initial value before any measurement occurs. Default: false. */
  defaultValue?: boolean;
  /** Whether the hook should attach listeners and measure. Default: true. */
  enabled?: boolean;
  /** Optional side-effect fired when the open state changes. Receives (isOpen, estimatedKeyboardHeight). */
  onChange?: (isOpen: boolean, height: number) => void;
};

/**
 * Internal snapshot shape used by the store.
 */
/**
 * React hook that detects if the on-screen keyboard is open on mobile browsers.
 *
 * It compares the current visual viewport height (+ iOS top offset) to a dynamic baseline
 * to infer keyboard presence. Works with and without `window.visualViewport`.
 *
 * @param options - Configuration for thresholds and behavior.
 * @returns boolean — whether the on-screen keyboard is considered open.
 */
function useIsKeyboardOpen(options?: UseIsKeyboardOpenOptions): boolean {
  const {
    thresholdPx = 200,
    thresholdRatio = 0.2,
    defaultValue = false,
    enabled = true,
    onChange,
  } = options ?? {};

  const baselineRef = useRef(0);
  const isOpenRef = useRef<boolean>(defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(defaultValue);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);
  const keyboardHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const readViewport = () => {
      const vv = window.visualViewport;
      const height = vv?.height ?? window.innerHeight ?? 0;
      const offsetTop = vv?.offsetTop ?? 0;
      return { height, offsetTop };
    };

    const notify = () => {
      const { height, offsetTop } = readViewport();
      if (baselineRef.current === 0) baselineRef.current = height + offsetTop;
      const effectiveHeight = height + offsetTop;
      baselineRef.current = Math.max(baselineRef.current, effectiveHeight);
      const delta = Math.max(0, baselineRef.current - effectiveHeight);
      const meetsPx = thresholdPx > 0 ? delta >= thresholdPx : false;
      const meetsRatio = thresholdRatio > 0 ? delta >= baselineRef.current * thresholdRatio : false;
      const nextOpen = meetsPx || meetsRatio;

      if (nextOpen !== isOpenRef.current || (nextOpen && delta !== keyboardHeightRef.current)) {
        isOpenRef.current = nextOpen;
        setIsOpen(nextOpen);
        const nextHeight = nextOpen ? delta : 0;
        keyboardHeightRef.current = nextHeight;
        setKeyboardHeight(nextHeight);
      }
    };

    const handleOrientation = () => {
      baselineRef.current = 0;
      notify();
    };

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener('resize', notify, { passive: true });
      vv.addEventListener('scroll', notify, { passive: true });
    }
    window.addEventListener('resize', notify, { passive: true });
    window.addEventListener('orientationchange', handleOrientation);

    notify();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', notify);
        vv.removeEventListener('scroll', notify);
      }
      window.removeEventListener('resize', notify);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, [enabled, thresholdPx, thresholdRatio]);

  useEffect(() => {
    if (onChange) onChange(isOpen, keyboardHeight);
  }, [onChange, isOpen, keyboardHeight]);

  return isOpen;
}

export default useIsKeyboardOpen;
