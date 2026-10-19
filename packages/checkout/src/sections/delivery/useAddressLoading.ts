import { useEffect, useState } from 'react';
import { CheckoutEvent, OperationKey, onCheckoutEvent } from '#checkout/state/checkoutBus';

/** Shortest time the delivery skeleton stays up, so a fast response does not flash. */
export const MIN_ADDRESS_LOADING_MS = 300;

const ADDRESS_OPERATIONS = new Set<OperationKey>([
  OperationKey.AddDeliveryAddresses,
  OperationKey.UpdateDeliveryAddresses,
]);

/**
 * True while the delivery address (city) is being applied, and for at least
 * MIN_ADDRESS_LOADING_MS after it started.
 */
export function useAddressLoading(): boolean {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let inflight = 0;
    let startedAt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const clearTimer = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const offStart = onCheckoutEvent(CheckoutEvent.OperationStart, ({ key }) => {
      if (!ADDRESS_OPERATIONS.has(key)) return;
      if (inflight === 0 && !timer) startedAt = Date.now();
      inflight += 1;
      clearTimer();
      setLoading(true);
    });

    const offEnd = onCheckoutEvent(CheckoutEvent.OperationEnd, ({ key }) => {
      if (!ADDRESS_OPERATIONS.has(key)) return;
      inflight = Math.max(0, inflight - 1);
      if (inflight > 0) return;
      const left = MIN_ADDRESS_LOADING_MS - (Date.now() - startedAt);
      clearTimer();
      if (left <= 0) {
        setLoading(false);
        return;
      }
      timer = setTimeout(() => {
        timer = null;
        setLoading(false);
      }, left);
    });

    return () => {
      offStart();
      offEnd();
      clearTimer();
    };
  }, []);

  return loading;
}
