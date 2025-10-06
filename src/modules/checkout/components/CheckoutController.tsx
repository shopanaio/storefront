'use client';

/**
 * CheckoutController: Tracks checkout operations for UI indicators
 */
import { useOperationTracker } from '@src/modules/checkout/state/hooks/useOperationTracker';

export function CheckoutController() {
  // Track active operations for UI indicators
  useOperationTracker();

  return null;
}
