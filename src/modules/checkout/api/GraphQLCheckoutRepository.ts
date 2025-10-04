/**
 * GraphQLCheckoutRepository: GraphQL adapter implementing CheckoutRepository.
 * Internally delegates to useCheckoutApi() which wraps Relay mutations.
 */
import { useCheckoutApi } from '@src/modules/checkout/api/CheckoutApi';
import type { SubmitCheckoutDto } from '@src/modules/checkout/core/contracts/dto';
import type { CheckoutRepository } from '@src/modules/checkout/core/contracts/CheckoutRepository';

export function useGraphQLCheckoutRepository(): CheckoutRepository {
  const api = useCheckoutApi();

  return {
    selectPaymentMethod: ({ checkoutId, paymentMethodCode }) =>
      api.selectPaymentMethod({ checkoutId, paymentMethodCode }),

    selectDeliveryMethod: ({ checkoutId, deliveryGroupId, shippingMethodCode }) =>
      api.selectDeliveryMethod({ checkoutId, deliveryGroupId, shippingMethodCode }),

    updateCustomerIdentity: ({ checkoutId, phone }) =>
      api.updateCustomerIdentity({ checkoutId, phone }),

    updateCustomerNote: ({ checkoutId, note }) =>
      api.updateCustomerNote({ checkoutId, note }),

    addPromoCode: ({ checkoutId, code }) =>
      api.addPromoCode({ checkoutId, code }),

    removePromoCode: ({ checkoutId, code }) =>
      api.removePromoCode({ checkoutId, code }),

    // Optional parity methods
    addDeliveryAddresses: ({ checkoutId, addresses }) =>
      api.addDeliveryAddresses({ checkoutId, addresses } as any),

    updateDeliveryAddresses: ({ checkoutId, addresses }) =>
      api.updateDeliveryAddresses({ checkoutId, addresses } as any),

    removeDeliveryAddresses: ({ checkoutId, addressIds }) =>
      api.removeDeliveryAddresses({ checkoutId, addressIds } as any),

    submitCheckout: ({ checkoutId, payload }: { checkoutId: string; payload: SubmitCheckoutDto }) =>
      // Stub for now: you can wire to mutation when available
      Promise.resolve(),
  };
}
