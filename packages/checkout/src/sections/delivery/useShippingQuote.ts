import { useMemo } from 'react';
import type { Checkout } from '#checkout/types/entity';
import { mapCheckoutToDeliveryFormData } from './mapper';
import { groupsShippingQuote, type ShippingQuote } from './shipments';
import { useDeliveryFormData } from './withCustomerInputs';

/**
 * Shipping quote of the whole order, from the same data the delivery section shows: the
 * price appears in the totals only when every shipment shows its own (R1, R9).
 */
export function useShippingQuote(checkout: Checkout.Checkout | null): ShippingQuote | null {
  const apiData = useMemo(() => mapCheckoutToDeliveryFormData(checkout), [checkout]);
  const data = useDeliveryFormData(apiData);
  return useMemo(() => groupsShippingQuote(Object.values(data ?? {})), [data]);
}
