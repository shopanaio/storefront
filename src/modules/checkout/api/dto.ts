/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { CheckoutDeliveryMethodUpdateInput } from './mutations/__generated__/selectDeliveryMethodMutation.graphql';
import type { CheckoutPaymentMethodUpdateInput } from './mutations/__generated__/selectPaymentMethodMutation.graphql';
import type { CheckoutCustomerIdentityUpdateInput } from './mutations/__generated__/updateCustomerIdentityMutation.graphql';
import type { CheckoutDeliveryAddressesAddInput } from './mutations/__generated__/addDeliveryAddressesMutation.graphql';
import type { CheckoutDeliveryAddressesUpdateInput } from './mutations/__generated__/updateDeliveryAddressesMutation.graphql';
import type { CheckoutDeliveryAddressesRemoveInput } from './mutations/__generated__/removeDeliveryAddressesMutation.graphql';
import type { CheckoutDeliveryRecipientsAddInput } from './mutations/__generated__/addDeliveryRecipientsMutation.graphql';
import type { CheckoutDeliveryRecipientsUpdateInput } from './mutations/__generated__/updateDeliveryRecipientsMutation.graphql';
import type { CheckoutDeliveryRecipientsRemoveInput } from './mutations/__generated__/removeDeliveryRecipientsMutation.graphql';
import type { CheckoutCustomerNoteUpdateInput } from './mutations/__generated__/updateCustomerNoteMutation.graphql';
import type { CheckoutPromoCodeAddInput } from './mutations/__generated__/addPromoCodeMutation.graphql';
import type { CheckoutPromoCodeRemoveInput } from './mutations/__generated__/removePromoCodeMutation.graphql';
import type { PlaceOrderInput } from './mutations/__generated__/submitCheckoutMutation.graphql';

type MutationContextFields =
  | 'checkoutId'
  | 'expectedCheckoutVersion'
  | 'idempotencyKey';

export interface DeliveryMethodUpdateDto
  extends Omit<CheckoutDeliveryMethodUpdateInput, MutationContextFields> {}
export interface PaymentMethodUpdateDto
  extends Omit<CheckoutPaymentMethodUpdateInput, MutationContextFields> {}
export interface CustomerIdentityUpdateDto
  extends Omit<CheckoutCustomerIdentityUpdateInput, MutationContextFields> {}
export interface DeliveryAddressesAddDto
  extends Omit<CheckoutDeliveryAddressesAddInput, MutationContextFields> {}
export interface DeliveryAddressesUpdateDto
  extends Omit<CheckoutDeliveryAddressesUpdateInput, MutationContextFields> {}
export interface DeliveryAddressesRemoveDto
  extends Omit<CheckoutDeliveryAddressesRemoveInput, MutationContextFields> {}
export interface CustomerNoteUpdateDto
  extends Omit<CheckoutCustomerNoteUpdateInput, MutationContextFields> {}
export interface PromoCodeAddDto
  extends Omit<CheckoutPromoCodeAddInput, MutationContextFields> {}
export interface PromoCodeRemoveDto
  extends Omit<CheckoutPromoCodeRemoveInput, MutationContextFields> {}
export interface DeliveryRecipientsAddDto
  extends Omit<CheckoutDeliveryRecipientsAddInput, MutationContextFields> {}
export interface DeliveryRecipientsUpdateDto
  extends Omit<CheckoutDeliveryRecipientsUpdateInput, MutationContextFields> {}
export interface DeliveryRecipientsRemoveDto
  extends Omit<CheckoutDeliveryRecipientsRemoveInput, MutationContextFields> {}
export interface CheckoutSubmitDto
  extends Omit<
    PlaceOrderInput,
    MutationContextFields | 'expectedResultRevision'
  > {}
