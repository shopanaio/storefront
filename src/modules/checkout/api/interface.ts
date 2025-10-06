import {
  DeliveryMethodUpdateDto,
  CheckoutSubmitDto,
  CustomerIdentityUpdateDto,
  CustomerNoteUpdateDto,
  DeliveryAddressesAddDto,
  DeliveryAddressesRemoveDto,
  DeliveryAddressesUpdateDto,
  PaymentMethodUpdateDto,
  PromoCodeAddDto,
  PromoCodeRemoveDto,
} from '@src/modules/checkout/api/dto';

export interface CheckoutApi {
  selectDeliveryMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  selectPaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  updatePaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  updateShippingMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  updateCustomerIdentity: (input: CustomerIdentityUpdateDto) => Promise<void>;
  addDeliveryAddresses: (input: DeliveryAddressesAddDto) => Promise<void>;
  updateDeliveryAddresses: (input: DeliveryAddressesUpdateDto) => Promise<void>;
  removeDeliveryAddresses: (input: DeliveryAddressesRemoveDto) => Promise<void>;
  updateCustomerNote: (input: CustomerNoteUpdateDto) => Promise<void>;
  addPromoCode: (input: PromoCodeAddDto) => Promise<void>;
  removePromoCode: (input: PromoCodeRemoveDto) => Promise<void>;
  submitCheckout: (input: CheckoutSubmitDto) => Promise<void>;
}
