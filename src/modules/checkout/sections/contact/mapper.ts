import type { Checkout } from '@src/modules/checkout/types/entity';
import type { ContactFormData } from './types';

/**
 * Maps Checkout.Checkout entity to ContactFormData
 * Extracts customer identity information from checkout
 */
export function mapCheckoutToContactFormData(
  checkout: Checkout.Checkout | null
): ContactFormData | null {
  if (!checkout) {
    return null;
  }

  const { customerIdentity } = checkout;

  return {
    userFirstName: customerIdentity.firstName ?? '',
    userLastName: customerIdentity.lastName ?? '',
    userMiddleName: customerIdentity.middleName ?? '',
    userPhone: customerIdentity.phone ?? '',
  };
}
