import type { Checkout } from '@src/modules/checkout/types/entity';
import type { RecipientFormData } from './types';

/**
 * Maps Checkout.Checkout entity to RecipientFormData
 *
 * Logic:
 * - If recipient is NULL in DB -> self=true (recipient is the customer)
 * - If recipient exists in DB -> self=false (recipient is another person)
 *
 * The 'self' field is a derived UI state, not stored in the database.
 * It's determined by the presence/absence of the recipient object.
 *
 * When user switches to "another person", an empty recipient is created
 * in DB to invalidate the section until form is filled.
 */
export function mapCheckoutToRecipientFormData(
  checkout: Checkout.Checkout | null
): RecipientFormData | null {
  if (!checkout) {
    return null;
  }

  const firstDeliveryGroup = checkout.deliveryGroups[0];
  const recipient = firstDeliveryGroup?.recipient;

  // No recipient in DB = recipient is the customer (self=true)
  if (!recipient) {
    return {
      self: true,
      deliveryGroupId: firstDeliveryGroup.id,
    };
  }

  // Recipient exists in DB = recipient is another person (self=false)
  // Even if fields are empty (newly created), map them as is
  return {
    self: false,
    deliveryGroupId: firstDeliveryGroup.id,
    firstName: recipient.firstName ?? '',
    lastName: recipient.lastName ?? '',
    middleName: recipient.middleName ?? '',
    phone: recipient.phone ?? '',
  };
}
