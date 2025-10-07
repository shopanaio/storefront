/* eslint-disable @typescript-eslint/no-empty-object-type */

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

export interface DeliveryMethodUpdateDto
  extends Omit<ApiCheckoutDeliveryMethodUpdateInput, 'checkoutId'> {}
export interface PaymentMethodUpdateDto
  extends Omit<ApiCheckoutPaymentMethodUpdateInput, 'checkoutId'> {}
export interface CustomerIdentityUpdateDto
  extends Omit<ApiCheckoutCustomerIdentityUpdateInput, 'checkoutId'> {}
export interface DeliveryAddressesAddDto
  extends Omit<ApiCheckoutDeliveryAddressesAddInput, 'checkoutId'> {}
export interface DeliveryAddressesUpdateDto
  extends Omit<ApiCheckoutDeliveryAddressesUpdateInput, 'checkoutId'> {}
export interface DeliveryAddressesRemoveDto
  extends Omit<ApiCheckoutDeliveryAddressesRemoveInput, 'checkoutId'> {}
export interface CustomerNoteUpdateDto
  extends Omit<ApiCheckoutCustomerNoteUpdateInput, 'checkoutId'> {}
export interface PromoCodeAddDto
  extends Omit<ApiCheckoutPromoCodeAddInput, 'checkoutId'> {}
export interface PromoCodeRemoveDto
  extends Omit<ApiCheckoutPromoCodeRemoveInput, 'checkoutId'> {}
export interface CheckoutSubmitDto
  extends Omit<ApiCreateOrderInput, 'checkoutId'> {}
