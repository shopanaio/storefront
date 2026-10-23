'use client';

import { useEffect, useRef } from 'react';
import {
  CART_CLAIMED_EVENT,
  type CartClaimedEventDetail,
} from '../providers/AccountCartSync';

/**
 * Calls `onClaimed` each time the account cart replaced or absorbed the guest cart after a
 * sign-in (`CART_CLAIMED_EVENT`), e.g. to say the account details are added to the order.
 * The latest callback is called; it need not be stable.
 */
export function useCartClaimed(
  onClaimed: (detail: CartClaimedEventDetail) => void
): void {
  const latest = useRef(onClaimed);
  useEffect(() => {
    latest.current = onClaimed;
  });
  useEffect(() => {
    const listener = (event: Event) =>
      latest.current((event as CustomEvent<CartClaimedEventDetail>).detail);
    window.addEventListener(CART_CLAIMED_EVENT, listener);
    return () => window.removeEventListener(CART_CLAIMED_EVENT, listener);
  }, []);
}
