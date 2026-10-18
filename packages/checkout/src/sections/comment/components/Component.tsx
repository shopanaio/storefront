'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import type { CommentFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
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
  /** The note typed but not yet returned by the API; `null` when nothing is pending. */
  const typedRef = useRef<string | null>(null);
  const debouncedUpdate = useMemo(() => {
    return debounce((nextNote: string) => {
      updateCustomerNote({ note: nextNote })
        .catch(() => {
          // The checkout API already showed the failure; the typed note stays on screen.
        })
        .finally(() => {
          // Saved (or failed) and nothing typed since: the API value is shown again.
          if (typedRef.current === nextNote) {
            typedRef.current = null;
          }
        });
    }, 500);
  }, [updateCustomerNote]);

  // A note typed right before leaving the page is still saved.
  useEffect(() => () => void debouncedUpdate.flush(), [debouncedUpdate]);

  const [note, setNote] = useState(data?.note ?? '');
  const [isOpen, setIsOpen] = useState(Boolean(data?.note));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextNote = e.target.value;
      typedRef.current = nextNote;
      setNote(nextNote);
      debouncedUpdate(nextNote);
    },
    [debouncedUpdate]
  );

  // Sync local state when data changes. The answer to an earlier save must not overwrite
  // what the buyer is typing now: while a typed note is pending, only its own value clears it.
  useEffect(() => {
    const newComment = data?.note ?? '';
    if (typedRef.current !== null) {
      if (typedRef.current === newComment) {
        typedRef.current = null;
      }
      return;
    }
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
            // Leaving the field (e.g. to press "place order") saves the note at once.
            onBlur={() => debouncedUpdate.flush()}
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
