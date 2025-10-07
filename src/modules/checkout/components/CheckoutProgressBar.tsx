'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { useHasActiveOperations } from '@src/modules/checkout/state/selectors';

// Configure nprogress
NProgress.configure({
  showSpinner: false,
  trickle: false,
  trickleSpeed: 100,
  minimum: 0.2,
});

/**
 * Progress bar that appears at the top of checkout when there are active operations.
 * Shows an indeterminate progress indicator to inform users that mutations are in-flight.
 * Uses nprogress for a smooth loading animation.
 */
export const CheckoutProgressBar = () => {
  const hasActiveOperations = useHasActiveOperations();

  useEffect(() => {
    if (hasActiveOperations) {
      NProgress.start();
    } else {
      NProgress.done();
    }

    // Cleanup on unmount
    return () => {
      NProgress.done();
    };
  }, [hasActiveOperations]);

  return null;
};

export default CheckoutProgressBar;
