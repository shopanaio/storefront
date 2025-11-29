'use client';

import { useEffect, useRef } from 'react';
import NProgress from 'nprogress';
import { useHasActiveOperations } from '@src/modules/checkout/state/selectors';
import { createGlobalStyle } from 'antd-style';
import { useToken } from 'antd/es/theme/internal';

// Configure nprogress
NProgress.configure({
  showSpinner: false,
  trickle: true,
  trickleSpeed: 200,
  minimum: 0.25,
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

  useEffect(() => {
    let forceResetTimeout: NodeJS.Timeout | null = null;

    if (hasActiveOperations) {
      NProgress.start();
      // Force reset after 5 seconds to prevent stuck progress bar
      forceResetTimeout = setTimeout(() => {
        NProgress.done();
      }, 5000);
    } else {
      NProgress.done();
    }

    // Cleanup on unmount or when hasActiveOperations changes
    return () => {
      if (forceResetTimeout) {
        clearTimeout(forceResetTimeout);
      }
      NProgress.done();
    };
  }, [hasActiveOperations]);

  return <Style />;
};

export default CheckoutProgressBar;
