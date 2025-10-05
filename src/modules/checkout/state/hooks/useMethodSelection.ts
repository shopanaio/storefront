/**
 * Method selection hook for shipping (per group) and payment (global).
 */
import { useCheckoutStore } from '@src/modules/checkout/state/checkoutStore';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

type Scope = 'shipping' | 'payment';

export function useMethodSelection(scope: 'payment'): {
  selected: CheckoutState['selectedPaymentMethod'];
  select: (selection: { code: string; vendor: string } | null) => void;
} {
  const selected = useCheckoutStore((s) => s.selectedPaymentMethod);
  const selectPaymentMethod = useCheckoutStore((s) => s.selectPaymentMethod);
  return {
    selected,
    select: (selection) => selectPaymentMethod(selection),
  } as const;
}

export function useMethodSelectionShipping(groupId: string): {
  selected:
    | CheckoutState['selectedDeliveryMethodByGroup'][string]
    | null
    | undefined;
  select: (selection: { code: string; vendor: string } | null) => void;
} {
  const selected = useCheckoutStore(
    (s) => s.selectedDeliveryMethodByGroup[groupId]
  );
  const selectShippingMethod = useCheckoutStore((s) => s.selectShippingMethod);
  return {
    selected,
    select: (selection) => selectShippingMethod(groupId, selection),
  } as const;
}
