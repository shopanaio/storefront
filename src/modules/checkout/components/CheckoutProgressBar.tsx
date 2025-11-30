'use client';

import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import { useHasActiveOperations } from '@src/modules/checkout/state/selectors';
import { createGlobalStyle } from 'antd-style';
import { useToken } from 'antd/es/theme/internal';

// Configure nprogress
NProgress.configure({
  minimum: 1,
  showSpinner: false,
  speed: 500,
  easing: 'ease-in',
});

/**
 * Progress bar that appears at the top of checkout when there are active operations.
 * Shows an indeterminate progress indicator to inform users that mutations are in-flight.
 * Uses nprogress for a smooth loading animation.
 */
export const CheckoutProgressBar = () => {
  const hasActiveOperations = useHasActiveOperations();
  const [, token] = useToken();

  const { current: Style } = useRef(createGlobalStyle`
    #nprogress .bar {
      background: ${token.colorPrimary} !important;
    }
    #nprogress .peg {
      box-shadow: 0 0 10px ${token.colorPrimary}, 0 0 5px ${token.colorPrimary} !important;
    }
  `);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const DURATION = 500;

    if (hasActiveOperations) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      NProgress.start();
      // Always complete after fixed duration
      timeoutRef.current = setTimeout(() => {
        NProgress.done();
        timeoutRef.current = null;
      }, DURATION);
    }
    // Ignore when hasActiveOperations becomes false - let the timeout handle it
  }, [hasActiveOperations]);

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      NProgress.done();
    };
  }, []);

  return <Style />;
};

export default CheckoutProgressBar;
