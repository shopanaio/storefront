import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { CheckoutFormValues } from '../components/Checkout';

/**
 * Typed accessor for the selected shipping method inside Checkout form state.
 * Provides both the current value and a setter with correct typing.
 */
export function useSelectedShippingMethod() {
  const { watch, setValue } = useFormContext<CheckoutFormValues>();

  const selected = watch('selectedShippingMethod');

  const setSelected = useCallback(
    (method: CheckoutFormValues['selectedShippingMethod']) => {
      setValue('selectedShippingMethod', method, {
        shouldDirty: true,
        shouldTouch: true,
      });
    },
    [setValue]
  );

  return {
    selectedShippingMethod: selected,
    setSelectedShippingMethod: setSelected,
  } as const;
}
