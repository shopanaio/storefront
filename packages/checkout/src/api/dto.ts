/* eslint-disable @typescript-eslint/no-empty-object-type */
import type {
  CheckoutCustomerIdentityUpdateInput,
  CheckoutCustomerNoteUpdateInput,
  CheckoutDeliveryAddressesAddInput,
  CheckoutDeliveryAddressesRemoveInput,
  CheckoutDeliveryAddressesUpdateInput,
  CheckoutDeliveryMethodUpdateInput,
  CheckoutDeliveryRecipientsAddInput,
  CheckoutDeliveryRecipientsRemoveInput,
  CheckoutDeliveryRecipientsUpdateInput,
  CheckoutPaymentMethodUpdateInput,
  CheckoutPromoCodeAddInput,
  CheckoutPromoCodeRemoveInput,
  PlaceOrderInput,
} from '#checkout/graphql/operations';
type MutationContextFields =
  | 'checkoutId'
  | 'expectedCheckoutVersion'
  | 'idempotencyKey';
export interface DeliveryMethodUpdateDto extends Omit<
  CheckoutDeliveryMethodUpdateInput,
  MutationContextFields
> {}
export interface PaymentMethodUpdateDto extends Omit<
  CheckoutPaymentMethodUpdateInput,
  MutationContextFields
> {}
export interface CustomerIdentityUpdateDto extends Omit<
  CheckoutCustomerIdentityUpdateInput,
  MutationContextFields
> {}
export interface DeliveryAddressesAddDto extends Omit<
  CheckoutDeliveryAddressesAddInput,
  MutationContextFields
> {}
export interface DeliveryAddressesUpdateDto extends Omit<
  CheckoutDeliveryAddressesUpdateInput,
  MutationContextFields
> {}
export interface DeliveryAddressesRemoveDto extends Omit<
  CheckoutDeliveryAddressesRemoveInput,
  MutationContextFields
> {}
export interface CustomerNoteUpdateDto extends Omit<
  CheckoutCustomerNoteUpdateInput,
  MutationContextFields
> {}
export interface PromoCodeAddDto extends Omit<
  CheckoutPromoCodeAddInput,
  MutationContextFields
> {}
export interface PromoCodeRemoveDto extends Omit<
  CheckoutPromoCodeRemoveInput,
  MutationContextFields
> {}
export interface DeliveryRecipientsAddDto extends Omit<
  CheckoutDeliveryRecipientsAddInput,
  MutationContextFields
> {}
export interface DeliveryRecipientsUpdateDto extends Omit<
  CheckoutDeliveryRecipientsUpdateInput,
  MutationContextFields
> {}
export interface DeliveryRecipientsRemoveDto extends Omit<
  CheckoutDeliveryRecipientsRemoveInput,
  MutationContextFields
> {}
export interface CheckoutSubmitDto extends Omit<
  PlaceOrderInput,
  MutationContextFields | 'expectedResultRevision'
> {}
