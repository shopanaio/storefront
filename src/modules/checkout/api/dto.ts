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
  extends ApiCheckoutDeliveryMethodUpdateInput {}
export interface PaymentMethodUpdateDto
  extends ApiCheckoutPaymentMethodUpdateInput {}
export interface CustomerIdentityUpdateDto
  extends ApiCheckoutCustomerIdentityUpdateInput {}
export interface DeliveryAddressesAddDto
  extends ApiCheckoutDeliveryAddressesAddInput {}
export interface DeliveryAddressesUpdateDto
  extends ApiCheckoutDeliveryAddressesUpdateInput {}
export interface DeliveryAddressesRemoveDto
  extends ApiCheckoutDeliveryAddressesRemoveInput {}
export interface CustomerNoteUpdateDto
  extends ApiCheckoutCustomerNoteUpdateInput {}
export interface PromoCodeAddDto extends ApiCheckoutPromoCodeAddInput {}
export interface PromoCodeRemoveDto extends ApiCheckoutPromoCodeRemoveInput {}
export interface CheckoutSubmitDto extends ApiCreateOrderInput {}
