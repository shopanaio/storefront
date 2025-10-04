'use client';

/**
 * CheckoutController: React bridge that instantiates CheckoutOrchestrator
 * with current checkoutId and repository from CheckoutApiContext.
 */
import { useEffect } from 'react';
import { useCheckoutApiContext } from '@src/modules/checkout/context/CheckoutApiContext';
import { CheckoutOrchestrator } from '@src/modules/checkout/core/orchestrator/CheckoutOrchestrator';

export function CheckoutController() {
  const { checkoutId, repository } = useCheckoutApiContext();

  useEffect(() => {
    if (!checkoutId) return;
    const orchestrator = new CheckoutOrchestrator({ checkoutId, repository });
    orchestrator.start();
    return () => orchestrator.stop();
  }, [checkoutId, repository]);

  return null;
}
