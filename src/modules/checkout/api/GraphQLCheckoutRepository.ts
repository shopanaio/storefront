/**
 * GraphQLCheckoutRepository: GraphQL adapter implementing CheckoutRepository.
 * Internally delegates to useCheckoutApi() which wraps Relay mutations.
 */
import { useCheckoutApi } from '@src/modules/checkout/api/CheckoutApi';
import type {
  ApiCheckoutDeliveryAddressInput,
  ApiCheckoutDeliveryAddressUpdateInput,
} from '@codegen/schema-client';
// import type { SubmitCheckoutDto } from '@src/modules/checkout/core/contracts/dto';
import type { CheckoutRepository } from '@src/modules/checkout/core/contracts/CheckoutRepository';

export function useGraphQLCheckoutRepository(): CheckoutRepository {
  const api = useCheckoutApi();

  return {
    selectPaymentMethod: ({ checkoutId, method }) =>
      api.selectPaymentMethod({
        checkoutId,
        paymentMethodCode: method.code,
      }),

    updatePaymentMethod: ({ checkoutId, method }) =>
      api.updatePaymentMethod({
        checkoutId,
        methodCode: method.code,
        data: method.data,
      }),

    selectDeliveryMethod: ({ checkoutId, deliveryGroupId, method }) =>
      api.selectDeliveryMethod({
        checkoutId,
        deliveryGroupId,
        shippingMethodCode: method.code,
      }),

    updateShippingMethod: ({ checkoutId, deliveryGroupId, method }) =>
      api.updateShippingMethod({
        checkoutId,
        deliveryGroupId,
        methodCode: method.code,
        data: method.data,
      }),

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
      api.addDeliveryAddresses({
        checkoutId,
        addresses: addresses as ApiCheckoutDeliveryAddressInput[],
      }),

    updateDeliveryAddresses: ({ checkoutId, addresses }) =>
      api.updateDeliveryAddresses({
        checkoutId,
        updates: addresses as ApiCheckoutDeliveryAddressUpdateInput[],
      }),

    removeDeliveryAddresses: ({ checkoutId, addressIds }) =>
      api.removeDeliveryAddresses({ checkoutId, addressIds }),

    submitCheckout: () =>
      // Stub for now: you can wire to mutation when available
      Promise.resolve(),
  };
}
