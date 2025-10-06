import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { CommentFormData } from '../types';
import type { CheckoutState } from '@src/modules/checkout/state/checkoutStore';

/**
 * Comment section component created with makeSection.
 * Handles optional order comment for checkout.
 */
export const CommentSection = makeSection<
  'comment',
  CommentFormData,
  CommentFormData
>({
  id: 'comment',
  required: false,
  Component,
  selector: (state: CheckoutState) =>
    (state.sections.comment?.data ?? null) as CommentFormData | null,
  displayName: 'CommentSection',
});
