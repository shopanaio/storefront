import { useState } from 'react';
import { useCheckoutStore } from '#checkout/state/checkoutStore';
import { SectionId } from '#checkout/state/interface';
import type { CheckoutState } from '#checkout/state/interface';

/** The sections of the delivery block of the form. */
const DELIVERY_SECTIONS = [SectionId.Address, SectionId.Delivery];

/**
 * Whether the delivery block is valid as it stands now: `null` while a section of it is being
 * saved or validated again after a save (an operation leaves the section invalid without
 * errors until it is validated).
 */
const settledReady = (state: CheckoutState): boolean | null => {
  let pending = false;
  for (const id of DELIVERY_SECTIONS) {
    const entry = state.sections[id];
    if (!entry || entry.busy || entry.status === 'idle') {
      pending = true;
    } else if (entry.status === 'invalid') {
      if (entry.errors !== undefined) return false;
      pending = true;
    }
  }
  return pending ? null : true;
};

/**
 * Whether the delivery block (address and delivery method) is valid as the server answered it.
 * While a save of it is on the way, the last settled answer stays, so the blocks that wait for
 * the delivery do not blink on every save. Before the delivery is first validated the answer is
 * `false`.
 */
export function useDeliveryReady(): boolean {
  const settled = useCheckoutStore(settledReady);
  const [ready, setReady] = useState(false);
  if (settled !== null && settled !== ready) {
    setReady(settled);
  }
  return settled ?? ready;
}
