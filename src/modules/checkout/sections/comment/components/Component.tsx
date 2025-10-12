'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CommentFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';
import { useSearchInput } from '@src/hooks/useSearchInput';
import { debounce } from 'lodash';

/**
 * View component for the checkout note section.
 *
 * Pure controlled UI component that renders the note form.
 * Receives generic form data and extracts needed fields (note).
 * Does not manage its own state - all state is controlled via props.
 */
export interface CommentSectionViewProps {
  /** Current form data */
  data: CommentFormData | null;
}

export const CommentSectionView = ({ data }: CommentSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const { updateCustomerNote } = useCheckoutApi();
  const debouncedUpdate = useMemo(() => {
    return debounce((nextNote: string) => {
      updateCustomerNote({ note: nextNote });
    }, 500);
  }, [updateCustomerNote]);

  const [note, setNote] = useState(data?.note ?? '');
  const [isOpen, setIsOpen] = useState(Boolean(data?.note));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextNote = e.target.value;
      setNote(nextNote);
      debouncedUpdate(nextNote);
    },
    [debouncedUpdate]
  );

  // Sync local state when data changes
  useEffect(() => {
    const newComment = data?.note ?? '';
    setNote(newComment);
    if (newComment) {
      setIsOpen(true);
    }
  }, [data?.note]);

  const onToggle = () => setIsOpen((prev) => !prev);

  return (
    <Flex vertical gap={8} className={styles.container}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Typography.Text className={styles.label} id="order-note-label">
            {t('order-note')}
          </Typography.Text>
          <Input.TextArea
            id="order-note"
            aria-labelledby="order-note-label"
            placeholder={t('order-note-placeholder')}
            value={note}
            rows={4}
            maxLength={255}
            onChange={handleChange}
          />
        </div>
      ) : (
        <Button
          variant="link"
          color="primary"
          className={styles.toggle}
          onClick={onToggle}
          aria-expanded={false}
          aria-label={t('add-note')}
        >
          {t('add-note')}
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
