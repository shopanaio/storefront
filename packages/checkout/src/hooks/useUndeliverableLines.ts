'use client';

import { useCallback, useMemo, useState } from 'react';
import useRemoveItemFromCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useRemoveItemFromCart';
import { useCartSetters } from '@shopana/storefront-sdk/modules/cart/react/context/CartContext';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { undeliverableLines } from '#checkout/sections/delivery/shipments';
import type { Checkout } from '#checkout/types/entity';

/**
 * Cart lines that cannot be delivered to the address (R7). While there are any, the order
 * cannot be placed.
 */
export function useUndeliverableLines(): Checkout.Line[] {
  const { checkout } = useCheckoutData();
  return useMemo(
    () => (checkout ? undeliverableLines(checkout) : []),
    [checkout]
  );
}

/**
 * Removes lines from the cart. The removal goes through the cart, so the cart drawer and
 * counters follow it; the checkout reads itself again after every cart change (see
 * `CheckoutDataContextProvider`), and the removal ends once that read is done.
 */
export function useRemoveCartLines() {
  const { removeFromCart } = useRemoveItemFromCart();
  const { waitForMutations } = useCartSetters();
  const [removing, setRemoving] = useState(false);

  const remove = useCallback(
    async (lines: Checkout.Line[]) => {
      setRemoving(true);
      try {
        for (const line of lines) {
          await removeFromCart({ lineId: line.id });
        }
      } finally {
        await waitForMutations().catch(() => {});
        setRemoving(false);
      }
    },
    [removeFromCart, waitForMutations]
  );

  return { remove, removing };
}
