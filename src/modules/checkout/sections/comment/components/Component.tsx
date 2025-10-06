'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CommentFormData } from '../types';
import type { AnySchema } from 'yup';
import { extractYupErrors } from '@src/modules/checkout/utils/validation';

/**
 * View component for the checkout comment section.
 *
 * Pure controlled UI component that renders the comment form.
 * Receives generic form data and extracts needed fields (comment).
 * Does not manage its own state - all state is controlled via props.
 */
export interface CommentSectionViewProps {
  /** Current form data */
  data: CommentFormData | null;
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Validation schema */
  schema: AnySchema;
}

export const CommentSectionView = ({
  data,
  onValid,
  onInvalid,
  schema,
}: CommentSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [comment, setComment] = useState(data?.comment ?? '');
  const [isOpen, setIsOpen] = useState(Boolean(data?.comment));

  // Sync local state when data changes
  useEffect(() => {
    const newComment = data?.comment ?? '';
    setComment(newComment);
    if (newComment) {
      setIsOpen(true);
    }
  }, [data?.comment]);

  const onToggle = () => setIsOpen((prev) => !prev);

  const handleChange = useCallback(
    async (newComment: string) => {
      setComment(newComment);
      const formData: CommentFormData = { comment: newComment };

      try {
        await schema.validate(formData, { abortEarly: false });
        onValid();
      } catch (error: unknown) {
        const errors = extractYupErrors(error);
        onInvalid(errors);
      }
    },
    [onValid, onInvalid, schema]
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
