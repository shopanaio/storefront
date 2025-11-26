import { useEffect, useRef, useState } from 'react';

/**
 * Generic viewport measurements and thresholding over a dynamic baseline.
 * This hook does NOT assume any particular cause (e.g., keyboard) for size changes.
 *
 * VisualViewport semantics (when available):
 * - `height` is the current visual viewport height in CSS pixels.
 * - `offsetTop` is the vertical offset of the visual viewport relative to the layout viewport's top.
 *   On iOS Safari, when the soft keyboard appears, the visual viewport may shift upward instead of
 *   simply shrinking, which increases `offsetTop` while `height` also often decreases.
 * - We define `effectiveHeight = height + offsetTop` to represent the visible vertical span measured
 *   from the top of the layout viewport. This normalizes cases where the viewport is shifted.
 *
 * Algorithm overview:
 * - Maintains a dynamic baseline as the maximum observed `effectiveHeight` (best-known fully-open height).
 * - Computes `delta = max(0, baselineEffectiveHeight - effectiveHeight)`.
 * - Sets `triggered = delta >= thresholdPx || delta >= baselineEffectiveHeight * thresholdRatio`.
 *
 * Falls back to `window.innerWidth/innerHeight` if VisualViewport is not available.
 */
export type ViewportMetrics = {
  /** True if the deficit from baseline passes the configured thresholds. */
  triggered: boolean;
  /** Raw deficit from the baseline effective height (px). */
  delta: number;

  /** Current visual viewport measurements. */
  viewport: {
    width: number;
    /** Current visual viewport height in CSS pixels. */
    height: number;
    /**
     * Vertical offset (in CSS pixels) of the visual viewport relative to the layout viewport's top.
     * On iOS, this increases when the viewport is shifted upward by UI overlays (e.g., soft keyboard),
     * even if part of the page is still visible. Combined with `height` as `height + offsetTop`
     * this forms the `effectiveHeight` used for baseline comparison.
     */
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

  /** Dynamic baseline used for thresholding: max observed effective height. */
  baseline: {
    /**
     * The maximum observed `effectiveHeight = viewport.height + viewport.offsetTop` since mount
     * (or since last orientation change). Acts as the reference "fully open" height for thresholding.
     */
    effectiveHeight: number;
  };

  /** Current orientation string. */
  orientation: string;
};

/** Options to control measurement and thresholding behavior. */
export type UseViewportMetricsOptions = {
  /** Absolute pixel threshold for the deficit from baseline to set `triggered`. Default: 200. */
  thresholdPx?: number;
  /** Ratio (0..1) of the baseline effective height to set `triggered`. Default: 0.2. */
  thresholdRatio?: number;
  /** Initial SSR value for `triggered` before any measurement occurs. Default: false. */
  defaultTriggered?: boolean;
  /** Whether the hook should attach listeners and measure. Default: true. */
  enabled?: boolean;
  /** Optional side-effect fired when metrics change. */
  onChange?: (metrics: ViewportMetrics) => void;
};

/**
 * Base hook for viewport measurement with dynamic baseline and thresholding.
 * Returns rich metrics suitable for any UI that needs to adapt to viewport changes.
 */
 export default function useViewportMetrics(
   options?: UseViewportMetricsOptions
 ): ViewportMetrics {
   const {
     thresholdPx = 200,
     thresholdRatio = 0.2,
     defaultTriggered = false,
     enabled = true,
     onChange,
   } = options ?? {};

   const baselineRef = useRef(0);
   const prevRef = useRef<ViewportMetrics | null>(null);

   const getInitial = (): ViewportMetrics => ({
     triggered: defaultTriggered,
     delta: 0,
     viewport: { width: 0, height: 0, offsetTop: 0, scale: undefined },
     window: { innerWidth: 0, innerHeight: 0 },
     screen: { width: 0, height: 0 },
     baseline: { effectiveHeight: 0 },
     orientation: 'unknown',
   });

   const [metrics, setMetrics] = useState<ViewportMetrics>(getInitial);

   useEffect(() => {
     if (!enabled || typeof window === 'undefined') return;

     const compute = (): ViewportMetrics => {
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
       if (baselineRef.current === 0) {
         baselineRef.current = effectiveHeight;
       }
       baselineRef.current = Math.max(baselineRef.current, effectiveHeight);

       const delta = Math.max(0, baselineRef.current - effectiveHeight);
       const meetsPx = thresholdPx > 0 ? delta >= thresholdPx : false;
       const meetsRatio = thresholdRatio > 0 ? delta >= baselineRef.current * thresholdRatio : false;
       const triggered = meetsPx || meetsRatio;

       const orientation = (() => {
         const type = (window.screen as any)?.orientation?.type as string | undefined;
         if (type) return type;
         return vpWidth >= vpHeight ? 'landscape' : 'portrait';
       })();

       return {
         triggered,
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
         next.triggered !== prev.triggered ||
         next.delta !== prev.delta ||
         next.viewport.width !== prev.viewport.width ||
         next.viewport.height !== prev.viewport.height ||
         next.viewport.offsetTop !== prev.viewport.offsetTop ||
         next.window.innerWidth !== prev.window.innerWidth ||
         next.window.innerHeight !== prev.window.innerHeight ||
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
