'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { useSectionController } from '@src/modules/checkout/state/hooks/useSectionController';
import { useCheckoutComment } from '@src/modules/checkout/hooks/useCheckoutComment';
import type { CommentFormData } from '../types';
import { CommentSectionView } from './CommentSectionView';

/**
 * Container for the checkout comment section.
 *
 * Orchestrates integration with the section controller.
 * Delegates UI rendering and local open/close state to CommentSectionView.
 */
export const CommentSectionContainer = () => {
  const t = useTranslations('Checkout');
  const checkoutComment = useCheckoutComment();

  const initialComment = useMemo(() => {
    return checkoutComment || '';
  }, [checkoutComment]);

  const { publishValid } = useSectionController<'comment'>('comment', {
    required: false,
  });

  const handleChange = useCallback(
    (next: string) => {
      // Publish current value on each change; section is optional
      const data: CommentFormData = { comment: next };
      publishValid(data);
    },
    [publishValid]
  );

  return (
    <CommentSectionView
      initialComment={initialComment}
      label={t('order-comment')}
      placeholder={t('order-comment-placeholder')}
      addCommentText={t('add-comment')}
      onChange={handleChange}
    />
  );
};

export default CommentSectionContainer;
