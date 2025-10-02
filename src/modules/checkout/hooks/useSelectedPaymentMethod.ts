import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { CheckoutFormValues } from '../components/Checkout';

/**
 * Typed accessor for the selected payment method inside Checkout form state.
 * Provides both the current value and a setter with correct typing.
 */
export function useSelectedPaymentMethod() {
  const { watch, setValue } = useFormContext<CheckoutFormValues>();

  const selected = watch('selectedPaymentMethod');

  const setSelected = useCallback(
    (method: CheckoutFormValues['selectedPaymentMethod']) => {
      setValue('selectedPaymentMethod', method, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [setValue]
  );

  return {
    selectedPaymentMethod: selected,
    setSelectedPaymentMethod: setSelected,
  } as const;
}
