/**
 * Hook that subscribes to operation lifecycle events and updates the active operations count in the store.
 * Should be mounted once in the CheckoutController.
 */
import { useEffect } from 'react';
import {
  CheckoutEvent,
  onCheckoutEvent,
} from '@src/modules/checkout/state/checkoutBus';
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';

/**
 * Tracks active operations by listening to operation/start and operation/end events.
 * Updates the activeOperationsCount in the checkout store.
 */
export function useOperationTracker() {
  useEffect(() => {
    const offStart = onCheckoutEvent(CheckoutEvent.OperationStart, () => {
      useCheckoutStore.getState().incrementActiveOperations();
    });

    const offEnd = onCheckoutEvent(CheckoutEvent.OperationEnd, () => {
      useCheckoutStore.getState().decrementActiveOperations();
    });

    return () => {
      offStart();
      offEnd();
      // Reset count on unmount to avoid stale state
      useCheckoutStore.setState({ activeOperationsCount: 0 });
    };
  }, []);
}
