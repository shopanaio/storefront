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
  const { setState, getState } = useCheckoutStore;
  const { incrementActiveOperations, decrementActiveOperations } = getState();

  useEffect(() => {
    const offStart = onCheckoutEvent(CheckoutEvent.OperationStart, () => {
      incrementActiveOperations();
    });

    const offEnd = onCheckoutEvent(CheckoutEvent.OperationEnd, () => {
      decrementActiveOperations();
    });

    return () => {
      offStart();
      offEnd();
      setState({ activeOperationsCount: 0 });
    };
  }, [incrementActiveOperations, decrementActiveOperations, setState]);
}
