import {
  DeliveryMethodUpdateDto,
  CheckoutSubmitDto,
  CustomerIdentityUpdateDto,
  CustomerNoteUpdateDto,
  DeliveryAddressesRemoveDto,
  PaymentMethodUpdateDto,
  PromoCodeAddDto,
  PromoCodeRemoveDto,
} from '#checkout/api/dto';
import type { PlacementResult } from '#checkout/state/placement/types';
import type {
  CheckoutDeliveryAddressInput,
  CheckoutRecipientInput,
} from '#checkout/graphql/operations';

export interface CheckoutApi {
  selectDeliveryMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  selectPaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  updatePaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  /** Saves the customer input of a delivery option; reports failures only by rejecting. */
  updateShippingMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  updateCustomerIdentity: (input: CustomerIdentityUpdateDto) => Promise<void>;
  /**
   * Saves the address of every delivery group: updated where saved, added where not, by the
   * checkout as it is when the save starts. A waiting address save is replaced by this one.
   */
  saveDeliveryAddress: (address: CheckoutDeliveryAddressInput) => Promise<void>;
  removeDeliveryAddresses: (input: DeliveryAddressesRemoveDto) => Promise<void>;
  /**
   * Gives every delivery group the recipient (`null`: removes it), by the checkout as it is
   * when the save starts. A waiting recipient save is replaced by this one.
   */
  saveDeliveryRecipient: (recipient: CheckoutRecipientInput | null) => Promise<void>;
  updateCustomerNote: (input: CustomerNoteUpdateDto) => Promise<void>;
  /**
   * Adds a promo code. The checkout keeps the code whether it applies or not and reports its
   * state in `promoCodes`; only a code the API refuses rejects.
   */
  addPromoCode: (input: PromoCodeAddDto) => Promise<void>;
  removePromoCode: (input: PromoCodeRemoveDto) => Promise<void>;
  /**
   * Places the order after the held-back input and every queued write. Resolves with the placement result, including user errors and GraphQL
   * errors; rejects only when the request failed or its answer was lost.
   */
  submitCheckout: (input: CheckoutSubmitDto) => Promise<PlacementResult>;
}
