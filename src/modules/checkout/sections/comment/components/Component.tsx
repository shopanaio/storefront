'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CommentFormData } from '../types';

/**
 * View component for the checkout comment section.
 *
 * Pure controlled UI component that renders the comment form.
 * Receives generic form data and extracts needed fields (comment).
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface CommentSectionViewProps<TFormData = CommentFormData> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const CommentSectionView = ({
  value,
  onValid,
}: CommentSectionViewProps<CommentFormData>) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [comment, setComment] = useState(value?.comment ?? '');
  const [isOpen, setIsOpen] = useState(Boolean(value?.comment));

  // Sync local state when value changes
  useEffect(() => {
    const newComment = value?.comment ?? '';
    setComment(newComment);
    if (newComment) {
      setIsOpen(true);
    }
  }, [value?.comment]);

  const onToggle = () => setIsOpen((prev) => !prev);

  const handleChange = useCallback(
    (newComment: string) => {
      setComment(newComment);
      // Update only the comment field in form data
      onValid({ comment: newComment });
    },
    [onValid]
  );

  return (
    <Flex vertical gap={8} className={styles.container}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Typography.Text className={styles.label} id="order-comment-label">
            {t('order-comment')}
          </Typography.Text>
          <Input.TextArea
            id="order-comment"
            aria-labelledby="order-comment-label"
            placeholder={t('order-comment-placeholder')}
            value={comment}
            rows={4}
            maxLength={255}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>
      ) : (
        <Button
          type="link"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={false}
          aria-label={t('add-comment')}
        >
          {t('add-comment')}
        </Button>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    margin-top: ${token.marginXS}px;
  `,
  toggle: css`
    padding: 0;
    align-self: flex-start;
  `,
  fieldWrap: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  label: css`
    color: ${token.colorTextSecondary};
  `,
}));

export default CommentSectionView;
