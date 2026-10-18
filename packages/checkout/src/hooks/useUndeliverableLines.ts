'use client';

import { useCallback, useMemo, useState } from 'react';
import useRemoveItemFromCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useRemoveItemFromCart';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { undeliverableLines } from '#checkout/sections/delivery/shipments';
import type { Checkout } from '#checkout/types/entity';

/**
 * Cart lines that cannot be delivered to the address (R7). While there are any, the order
 * cannot be placed.
 */
export function useUndeliverableLines(): Checkout.Line[] {
  const { checkout } = useCheckoutData();
  return useMemo(() => (checkout ? undeliverableLines(checkout) : []), [checkout]);
}

/**
 * Removes lines from the cart. The removal goes through the cart, so the cart drawer and
 * counters follow it; the checkout is read again afterwards, as the delivery groups are
 * recalculated without the lines.
 */
export function useRemoveCartLines() {
  const { removeFromCart } = useRemoveItemFromCart();
  const { refetch } = useCheckoutData();
  const [removing, setRemoving] = useState(false);

  const remove = useCallback(
    async (lines: Checkout.Line[]) => {
      setRemoving(true);
      try {
        for (const line of lines) {
          await removeFromCart({ lineId: line.id });
        }
      } finally {
        await refetch().catch(() => {});
        setRemoving(false);
      }
    },
    [removeFromCart, refetch]
  );

  return { remove, removing };
}
