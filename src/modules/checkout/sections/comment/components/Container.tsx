import { makeSection } from '@src/modules/checkout/components/section/makeSection';
import Component from './Component';

import type { CommentFormData } from '../types';
import { SectionId } from '@src/modules/checkout/state/interface';
import { mapCheckoutToCommentFormData } from '../mapper';

/**
 * Comment section component created with makeSection.
 * Handles optional order comment for checkout.
 */
export const CommentSection = makeSection<CommentFormData>({
  id: SectionId.Comment,
  required: false,
  Component,
  selector: mapCheckoutToCommentFormData,
  displayName: 'CommentSection',
});
