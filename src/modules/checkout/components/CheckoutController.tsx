'use client';

/**
 * CheckoutController: Tracks checkout operations for UI indicators
 */
import { useOperationTracker } from '@src/modules/checkout/state/hooks/useOperationTracker';
import { useSubmitHandler } from '@src/modules/checkout/state/hooks/useSubmitHandler';

export function CheckoutController() {
  // Track active operations for UI indicators
  useOperationTracker();
  // Handle submit lifecycle
  useSubmitHandler();

  return null;
}
