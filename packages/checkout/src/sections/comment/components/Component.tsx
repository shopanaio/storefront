'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button, Flex, Input, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { LuMessageSquarePlus } from 'react-icons/lu';
import { useTranslations } from 'next-intl';
import type { CommentFormData } from '../types';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { debounce } from 'lodash';
import { registerPendingInput } from '#checkout/state/pendingInputs';

/** Retries of a failed save: 2 s, 4 s, 8 s … up to 30 s. */
const RETRY_BASE_MS = 2_000;
const RETRY_MAX_MS = 30_000;

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
  /** Failed saves of the typed note in a row, for the retry delay. */
  const failures = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The latest API: a retry after the checkout was renewed goes to the new checkout. */
  const latestUpdate = useRef(updateCustomerNote);
  useEffect(() => {
    latestUpdate.current = updateCustomerNote;
  });

  const inFlight = useRef<{ note: string; save: Promise<void> } | null>(null);
  const debouncedUpdate = useMemo(() => {
    /** The save on the way, so that flushing does not send the same note twice. */
    const save = (nextNote: string): Promise<void> => {
      const request = latestUpdate.current({ note: nextNote }).then(
        () => {
          failures.current = 0;
          // Saved and nothing typed since: the API value is shown again.
          if (typedRef.current === nextNote) {
            typedRef.current = null;
          }
        },
        (error: unknown) => {
          // The failure is shown by the checkout API. The typed note stays on screen and is
          // saved again until it gets through, or until the buyer types on (BR-yanp).
          if (typedRef.current === nextNote) {
            failures.current += 1;
            const delay = Math.min(
              RETRY_BASE_MS * 2 ** (failures.current - 1),
              RETRY_MAX_MS
            );
            retryTimer.current = setTimeout(() => {
              retryTimer.current = null;
              if (typedRef.current === nextNote) debounced(nextNote);
            }, delay);
          }
          throw error;
        }
      );
      inFlight.current = { note: nextNote, save: request };
      const clear = () => {
        if (inFlight.current?.save === request) inFlight.current = null;
      };
      request.then(clear, clear);
      return request;
    };
    // debounce сохраняет обработчик и вызывает его позже, вне render.
    // eslint-disable-next-line react-hooks/refs
    const debounced = debounce((nextNote: string) => {
      save(nextNote).catch(() => undefined);
    }, 500);
    /**
     * Sends the typed note now: the one waiting for a pause in typing or for the retry of a
     * failed save. Returns the save, or nothing when the note is saved already.
     */
    const flushNow = (): Promise<void> | undefined => {
      debounced.cancel();
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      const typed = typedRef.current;
      if (typed === null) return undefined;
      return inFlight.current?.note === typed
        ? inFlight.current.save
        : save(typed);
    };
    /** Drops the save waiting for a pause in typing or for a retry. */
    const cancel = () => {
      debounced.cancel();
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
    return { schedule: debounced, flushNow, cancel, save };
  }, []);

  // A note typed right before leaving the page is still saved.
  useEffect(
    () => () => {
      debouncedUpdate.flushNow()?.catch(() => undefined);
    },
    [debouncedUpdate]
  );
  // Placing the order sends the typed note at once and waits for its save.
  useEffect(
    () => registerPendingInput(() => debouncedUpdate.flushNow()),
    [debouncedUpdate]
  );

  const [note, setNote] = useState(data?.note ?? '');
  const [isOpen, setIsOpen] = useState(Boolean(data?.note));

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const nextNote = e.target.value;
      typedRef.current = nextNote;
      failures.current = 0;
      if (retryTimer.current) {
        clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
      setNote(nextNote);
      debouncedUpdate.schedule(nextNote);
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

  /** The buyer changed their mind: the field closes and the saved note is removed. */
  const onCancel = () => {
    setIsOpen(false);
    setNote('');
    failures.current = 0;
    debouncedUpdate.cancel();
    // Nothing saved and nothing typed: there is nothing to remove.
    if (!data?.note && !typedRef.current) {
      typedRef.current = null;
      return;
    }
    typedRef.current = '';
    debouncedUpdate.save('').catch(() => undefined);
  };

  return (
    <Flex vertical gap={8}>
      {isOpen ? (
        <div className={styles.fieldWrap}>
          <Flex align="center" justify="space-between">
            <Typography.Text
              strong
              type="secondary"
              className={styles.label}
              id="order-note-label"
            >
              {t('order-note')}
            </Typography.Text>
            <Button
              variant="link"
              color="default"
              className={styles.cancel}
              onClick={onCancel}
            >
              {t('remove-note')}
            </Button>
          </Flex>
          <Input.TextArea
            id="order-note"
            aria-labelledby="order-note-label"
            placeholder={t('order-note-placeholder')}
            value={note}
            rows={4}
            maxLength={255}
            onChange={handleChange}
            // Leaving the field (e.g. to press "place order") saves the note at once.
            onBlur={() => {
              debouncedUpdate.flushNow()?.catch(() => undefined);
            }}
          />
        </div>
      ) : (
        <Button
          variant="link"
          color="primary"
          className={styles.toggle}
          icon={
            <LuMessageSquarePlus
              size={18}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          }
          onClick={onToggle}
          aria-expanded={false}
        >
          {t('add-note')}
        </Button>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  toggle: css`
    align-self: flex-start;
    height: auto;
    min-height: 44px;
    padding: 0;
  `,
  fieldWrap: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,
  // As the labels of the summary blocks (promo codes, rewards).
  label: css`
    font-size: ${token.fontSize}px;
  `,
  // A link on the line of the label, as tall as its text.
  cancel: css`
    height: auto;
    padding: 0;
  `,
}));

export default CommentSectionView;
