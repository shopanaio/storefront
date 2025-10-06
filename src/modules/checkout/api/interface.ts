import {
  ApiCheckoutDeliveryMethodUpdateInput,
  ApiCheckoutPaymentMethodUpdateInput,
  ApiCheckoutCustomerIdentityUpdateInput,
  ApiCheckoutDeliveryAddressesAddInput,
  ApiCheckoutDeliveryAddressesUpdateInput,
  ApiCheckoutDeliveryAddressesRemoveInput,
  ApiCheckoutCustomerNoteUpdateInput,
  ApiCheckoutPromoCodeAddInput,
  ApiCheckoutPromoCodeRemoveInput,
  ApiCreateOrderInput,
} from '@codegen/schema-client';

export interface CheckoutApi {
  selectDeliveryMethod: (
    input: ApiCheckoutDeliveryMethodUpdateInput
  ) => Promise<void>;
  selectPaymentMethod: (
    input: ApiCheckoutPaymentMethodUpdateInput
  ) => Promise<void>;
  updatePaymentMethod: (
    input: ApiCheckoutPaymentMethodUpdateInput
  ) => Promise<void>;
  updateShippingMethod: (
    input: ApiCheckoutDeliveryMethodUpdateInput
  ) => Promise<void>;
  updateCustomerIdentity: (
    input: ApiCheckoutCustomerIdentityUpdateInput
  ) => Promise<void>;
  addDeliveryAddresses: (
    input: ApiCheckoutDeliveryAddressesAddInput
  ) => Promise<void>;
  updateDeliveryAddresses: (
    input: ApiCheckoutDeliveryAddressesUpdateInput
  ) => Promise<void>;
  removeDeliveryAddresses: (
    input: ApiCheckoutDeliveryAddressesRemoveInput
  ) => Promise<void>;
  updateCustomerNote: (
    input: ApiCheckoutCustomerNoteUpdateInput
  ) => Promise<void>;
  addPromoCode: (input: ApiCheckoutPromoCodeAddInput) => Promise<void>;
  removePromoCode: (input: ApiCheckoutPromoCodeRemoveInput) => Promise<void>;
  submitCheckout: (input: ApiCreateOrderInput) => Promise<void>;
}
