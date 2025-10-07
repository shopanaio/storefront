import type { Checkout } from '@src/modules/checkout/types/entity';
import type { RecipientFormData } from './types';

/**
 * Maps Checkout.Checkout entity to RecipientFormData
 * Extracts recipient information from the first delivery group
 */
export function mapCheckoutToRecipientFormData(
  checkout: Checkout.Checkout | null
): RecipientFormData | null {
  if (!checkout) {
    return null;
  }

  const firstDeliveryGroup = checkout.deliveryGroups[0];
  const recipient = firstDeliveryGroup?.recipient;

  // If no recipient is set, return self=true with empty fields
  if (!recipient) {
    return {
      self: true,
      deliveryGroupId: firstDeliveryGroup.id,
    };
  }

  return {
    self: false,
    deliveryGroupId: firstDeliveryGroup.id,
    firstName: recipient.firstName ?? '',
    lastName: recipient.lastName ?? '',
    middleName: recipient.middleName ?? '',
    phone: recipient.phone ?? '',
  };
}
