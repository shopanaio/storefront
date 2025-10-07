import type { Checkout } from '@src/modules/checkout/types/entity';
import type { CommentFormData } from './types';

/**
 * Maps Checkout.Checkout entity to CommentFormData
 * Extracts customer note from checkout
 */
export function mapCheckoutToCommentFormData(
  checkout: Checkout.Checkout | null
): CommentFormData | null {
  if (!checkout) {
    return null;
  }

  return {
    note: checkout.customerNote ?? '',
  };
}
