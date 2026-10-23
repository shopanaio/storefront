import { useEffect, useState } from 'react';
import { CheckoutEvent, onCheckoutEvent } from '#checkout/state/checkoutBus';

/**
 * Whether the buyer has pressed "place order" on this page. Blocking issues are shown only
 * after that, so an unfinished form does not open with errors.
 */
export function useSubmitAttempted(): boolean {
  const [attempted, setAttempted] = useState(false);
  useEffect(
    () =>
      onCheckoutEvent(CheckoutEvent.SubmitRequested, () => setAttempted(true)),
    []
  );
  return attempted;
}
