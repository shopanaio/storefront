import { useEffect, useState } from 'react';
import { CheckoutEvent, OperationKey, onCheckoutEvent } from '#checkout/state/checkoutBus';

const ADDRESS_OPERATIONS = new Set<OperationKey>([
  OperationKey.AddDeliveryAddresses,
  OperationKey.UpdateDeliveryAddresses,
]);

/**
 * True while the delivery address (city) is being applied. How long its skeleton stays up is
 * the `LoadingBoundary`'s.
 */
export function useAddressLoading(): boolean {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let inflight = 0;
    const offStart = onCheckoutEvent(CheckoutEvent.OperationStart, ({ key }) => {
      if (!ADDRESS_OPERATIONS.has(key)) return;
      inflight += 1;
      setLoading(true);
    });
    const offEnd = onCheckoutEvent(CheckoutEvent.OperationEnd, ({ key }) => {
      if (!ADDRESS_OPERATIONS.has(key)) return;
      inflight = Math.max(0, inflight - 1);
      if (inflight === 0) setLoading(false);
    });
    return () => {
      offStart();
      offEnd();
    };
  }, []);

  return loading;
}
