import type { Checkout } from '#checkout/types/entity';
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

  // One recipient for every group: the first group that has one stands for all of them, so
  // a group listed first without it (split off later) does not hide it.
  const groups = checkout.deliveryGroups;
  if (!groups.length) return null;
  const recipient = groups.find((group) => group.recipient)?.recipient ?? null;
  const deliveryGroupIds = groups.map((group) => group.id);
  const groupIdsWithoutRecipient = groups
    .filter((group) => !group.recipient)
    .map((group) => group.id);

  // No recipient in DB = recipient is the customer (self=true)
  if (!recipient) {
    return {
      self: true,
      deliveryGroupIds,
      groupIdsWithoutRecipient,
    };
  }

  // Recipient exists in DB = recipient is another person (self=false)
  // Even if fields are empty (newly created), map them as is
  return {
    self: false,
    deliveryGroupIds,
    groupIdsWithoutRecipient,
    firstName: recipient.firstName ?? '',
    lastName: recipient.lastName ?? '',
    middleName: recipient.middleName ?? '',
    phone: recipient.phone ?? '',
  };
}
