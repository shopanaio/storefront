import { useEffect, useState } from 'react';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';

/** How many times the buyer has pressed "place order" on this page. */
export function useSubmitCount(): number {
  const [count, setCount] = useState(0);
  useEffect(
    () =>
      onCheckoutEvent(CheckoutEvent.SubmitRequested, () =>
        setCount((value) => value + 1)
      ),
    []
  );
  return count;
}

/**
 * Whether the buyer has pressed "place order" on this page. Blocking issues are shown only
 * after that, so an unfinished form does not open with errors.
 */
export function useSubmitAttempted(): boolean {
  return useSubmitCount() > 0;
}
