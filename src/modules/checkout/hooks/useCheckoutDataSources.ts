import { useMemo } from 'react';
import { useCheckoutData } from '@src/modules/checkout/context/CheckoutDataContext';
import {
  ApiCheckoutDeliveryMethod,
  ApiCheckoutPaymentMethod,
} from '@codegen/schema-client';

type DeliveryGroupLite = {
  id: string;
  deliveryMethods: ApiCheckoutDeliveryMethod[];
};

export function useCheckoutDeliveryGroups(): DeliveryGroupLite[] {
  const checkoutData = useCheckoutData();

  return useMemo(() => {
    const groups = (
      checkoutData.cart as unknown as {
        deliveryGroups?: DeliveryGroupLite[];
      } | null
    )?.deliveryGroups;
    return Array.isArray(groups) ? groups : [];
  }, [checkoutData.cart]);
}

export function useCheckoutPaymentMethods(): ApiCheckoutPaymentMethod[] {
  const checkoutData = useCheckoutData();

  return useMemo(() => {
    const methods = (
      checkoutData.cart as unknown as {
        payment?: { paymentMethods?: ApiCheckoutPaymentMethod[] };
      } | null
    )?.payment?.paymentMethods;
    return Array.isArray(methods) ? methods : [];
  }, [checkoutData.cart]);
}
