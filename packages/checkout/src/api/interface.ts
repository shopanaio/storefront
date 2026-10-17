import {
  DeliveryMethodUpdateDto,
  CheckoutSubmitDto,
  CustomerIdentityUpdateDto,
  CustomerNoteUpdateDto,
  DeliveryAddressesAddDto,
  DeliveryAddressesRemoveDto,
  DeliveryAddressesUpdateDto,
  DeliveryRecipientsAddDto,
  DeliveryRecipientsUpdateDto,
  DeliveryRecipientsRemoveDto,
  PaymentMethodUpdateDto,
  PromoCodeAddDto,
  PromoCodeRemoveDto,
} from '#checkout/api/dto';
import type { PlacementResult } from '#checkout/state/placement/types';

export interface CheckoutApi {
  selectDeliveryMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  selectPaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  updatePaymentMethod: (input: PaymentMethodUpdateDto) => Promise<void>;
  updateShippingMethod: (input: DeliveryMethodUpdateDto) => Promise<void>;
  updateCustomerIdentity: (input: CustomerIdentityUpdateDto) => Promise<void>;
  addDeliveryAddresses: (input: DeliveryAddressesAddDto) => Promise<void>;
  updateDeliveryAddresses: (input: DeliveryAddressesUpdateDto) => Promise<void>;
  removeDeliveryAddresses: (input: DeliveryAddressesRemoveDto) => Promise<void>;
  addDeliveryRecipients: (input: DeliveryRecipientsAddDto) => Promise<void>;
  updateDeliveryRecipients: (input: DeliveryRecipientsUpdateDto) => Promise<void>;
  removeDeliveryRecipients: (input: DeliveryRecipientsRemoveDto) => Promise<void>;
  updateCustomerNote: (input: CustomerNoteUpdateDto) => Promise<void>;
  addPromoCode: (input: PromoCodeAddDto) => Promise<void>;
  removePromoCode: (input: PromoCodeRemoveDto) => Promise<void>;
  /**
   * Places the order. Resolves with the placement result, including user errors and GraphQL
   * errors; rejects only when the request failed or its answer was lost.
   */
  submitCheckout: (input: CheckoutSubmitDto) => Promise<PlacementResult>;
}
