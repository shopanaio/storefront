import { useEffect, useRef, useState } from 'react';

/**
 * A set of measurements for on-screen keyboard and viewport that supports
 * dynamic UI that adapts to keyboard height in real time.
 */
export type KeyboardMetrics = {
  /** True when the keyboard is considered open by threshold rules. */
  isOpen: boolean;
  /** Estimated keyboard overlap with content in pixels. 0 when closed. */
  keyboardHeight: number;
  /** Raw height deficit from the dynamic baseline (same as keyboardHeight when open). */
  delta: number;

  /** Current viewport measurements. Uses VisualViewport when available. */
  viewport: {
    width: number;
    height: number;
    /** iOS top inset shift when the keyboard shows. */
    offsetTop: number;
    /** Visual viewport scale when available (undefined otherwise). */
    scale?: number;
  };

  /** Window-level inner size (layout viewport). */
  window: {
    innerWidth: number;
    innerHeight: number;
  };

  /** Physical screen dimensions. */
  screen: {
    width: number;
    height: number;
  };

  /** Dynamic baseline used for detection (max observed effective height). */
  baseline: {
    effectiveHeight: number;
  };

  /** Current orientation string. */
  orientation: string;
};

/**
 * Options controlling detection and subscription behavior.
 */
export type UseKeyboardMetricsOptions = {
  /** Absolute pixel threshold to consider the keyboard open. Default: 200. */
  thresholdPx?: number;
  /** Ratio (0..1) of baseline height to consider the keyboard open. Default: 0.2. */
  thresholdRatio?: number;
  /** SSR/initial value before any measurement occurs. Default: false. */
  defaultOpen?: boolean;
  /** Whether the hook should attach listeners and measure. Default: true. */
  enabled?: boolean;
  /** Optional side-effect fired when metrics change. */
  onChange?: (metrics: KeyboardMetrics) => void;
};

// Removed unused helper: orientation is computed inline where needed.

 // External-store version removed. Hook now manages its own state internally.

/**
 * React hook that returns comprehensive keyboard/viewport measurements and a boolean open state.
 *
 * It uses VisualViewport when available and falls back to window inner sizes otherwise. A dynamic
 * baseline based on the maximum observed effective viewport height is used to infer keyboard presence
 * and estimate keyboard overlap in pixels.
 */
 export default function useKeyboardMetrics(
   options?: UseKeyboardMetricsOptions
 ): KeyboardMetrics {
   const {
     thresholdPx = 200,
     thresholdRatio = 0.2,
     defaultOpen = false,
     enabled = true,
     onChange,
   } = options ?? {};

   const baselineRef = useRef(0);
   const prevRef = useRef<KeyboardMetrics | null>(null);

   const getInitial = (): KeyboardMetrics => ({
     isOpen: defaultOpen,
     keyboardHeight: 0,
     delta: 0,
     viewport: { width: 0, height: 0, offsetTop: 0, scale: undefined },
     window: { innerWidth: 0, innerHeight: 0 },
     screen: { width: 0, height: 0 },
     baseline: { effectiveHeight: 0 },
     orientation: 'unknown',
   });

   const [metrics, setMetrics] = useState<KeyboardMetrics>(getInitial);

   useEffect(() => {
     if (!enabled || typeof window === 'undefined') return;

     const compute = (): KeyboardMetrics => {
       const vv = window.visualViewport;
       const vpWidth = vv?.width ?? window.innerWidth ?? 0;
       const vpHeight = vv?.height ?? window.innerHeight ?? 0;
       const offsetTop = vv?.offsetTop ?? 0;
       const scale = vv?.scale;

       const innerWidth = window.innerWidth ?? vpWidth;
       const innerHeight = window.innerHeight ?? vpHeight;

       const screenWidth = window.screen?.width ?? innerWidth;
       const screenHeight = window.screen?.height ?? innerHeight;

       const effectiveHeight = vpHeight + offsetTop;
       if (baselineRef.current === 0) baselineRef.current = effectiveHeight;
       baselineRef.current = Math.max(baselineRef.current, effectiveHeight);

       const delta = Math.max(0, baselineRef.current - effectiveHeight);
       const meetsPx = thresholdPx > 0 ? delta >= thresholdPx : false;
       const meetsRatio =
         thresholdRatio > 0 ? delta >= baselineRef.current * thresholdRatio : false;
       const isOpen = meetsPx || meetsRatio;

       const orientation = (() => {
         const so = (window.screen as any)?.orientation?.type as string | undefined;
         if (so) return so;
         return vpWidth >= vpHeight ? 'landscape' : 'portrait';
       })();

       return {
         isOpen,
         keyboardHeight: isOpen ? delta : 0,
         delta,
         viewport: { width: vpWidth, height: vpHeight, offsetTop, scale },
         window: { innerWidth, innerHeight },
         screen: { width: screenWidth, height: screenHeight },
         baseline: { effectiveHeight: baselineRef.current },
         orientation,
       };
     };

     const notify = () => {
       const next = compute();
       const prev = prevRef.current;
       if (
         !prev ||
         next.isOpen !== prev.isOpen ||
         next.keyboardHeight !== prev.keyboardHeight ||
         next.viewport.width !== prev.viewport.width ||
         next.viewport.height !== prev.viewport.height ||
         next.viewport.offsetTop !== prev.viewport.offsetTop ||
         next.window.innerHeight !== prev.window.innerHeight ||
         next.window.innerWidth !== prev.window.innerWidth ||
         next.orientation !== prev.orientation
       ) {
         prevRef.current = next;
         setMetrics(next);
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
     if (onChange) onChange(metrics);
   }, [onChange, metrics]);

   return metrics;
 }
