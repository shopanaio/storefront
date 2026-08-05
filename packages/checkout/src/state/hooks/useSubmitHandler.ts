import { useEffect } from 'react';
import {
  CheckoutEvent,
  emitCheckoutEvent,
  onCheckoutEvent,
} from '#checkout/state/checkoutBus';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import type { CheckoutSubmitDto } from '#checkout/api/dto';

/**
 * Subscribes to SubmitReady and triggers submitCheckout API, then emits SubmitCompleted.
 */
export function useSubmitHandler() {
  const { submitCheckout } = useCheckoutApi();

  useEffect(() => {
    const off = onCheckoutEvent(CheckoutEvent.SubmitReady, async () => {
      // For now we have no extra input fields; pass empty dto
      const dto = {} as CheckoutSubmitDto;
      await submitCheckout(dto);
      await emitCheckoutEvent(CheckoutEvent.SubmitCompleted, {});
    });

    return () => off();
  }, [submitCheckout]);
}
