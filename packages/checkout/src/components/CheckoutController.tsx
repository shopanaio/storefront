'use client';

/**
 * CheckoutController: Tracks checkout operations for UI indicators
 */
import { useEffect } from 'react';
import { useOperationTracker } from '#checkout/state/hooks/useOperationTracker';
import { useSubmitHandler } from '#checkout/state/hooks/useSubmitHandler';
import { onCheckoutEvent, CheckoutEvent } from '#checkout/state/checkoutBus';

export function CheckoutController({ onConfirm }: { onConfirm: () => void }) {
  // Track active operations for UI indicators
  useOperationTracker();
  // Handle submit lifecycle
  useSubmitHandler();

  // Call onConfirm when checkout completed
  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.SubmitCompleted, () => {
      onConfirm();
    });
    return () => off();
  }, [onConfirm]);

  return null;
}
