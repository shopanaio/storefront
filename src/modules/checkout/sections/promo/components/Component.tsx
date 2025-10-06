'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { TbTicket } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import type { PromoFormData } from '../types';

/**
 * View component for the checkout promo section.
 *
 * Pure controlled UI component that renders the promo form.
 * Receives generic form data and extracts needed fields (code).
 * Does not manage its own state - all state is controlled via props.
 *
 * @template TFormData - The form data type containing all form fields
 */
export interface PromoSectionViewProps<TFormData = PromoFormData> {
  /** Current form data */
  value: TFormData | null;
  /** Called when form data is valid */
  onValid: (data: TFormData) => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
}

export const PromoSectionView = ({
  value,
  onValid,
  onInvalid,
}: PromoSectionViewProps<PromoFormData>) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [code, setCode] = useState(value?.code ?? '');
  const [isApplied, setIsApplied] = useState(Boolean(value?.code));

  // Sync local state when value changes
  useEffect(() => {
    const newCode = value?.code ?? '';
    setCode(newCode);
    setIsApplied(Boolean(newCode));
  }, [value?.code]);

  const handleApply = useCallback(() => {
    const trimmedCode = code.trim();
    if (trimmedCode) {
      onValid({ code: trimmedCode });
      setIsApplied(true);
    } else {
      onInvalid({ code: 'required' });
    }
  }, [code, onValid, onInvalid]);

  const handleRemove = useCallback(() => {
    setCode('');
    setIsApplied(false);
    onInvalid(undefined);
  }, [onInvalid]);

  return (
    <Flex vertical gap={8} className={styles.container}>
      <FloatingLabelInput
        label={t('coupon-code')}
        value={code}
        prefix={<TbTicket size={20} />}
        onChange={(e) => setCode((e.target as HTMLInputElement).value)}
        disabled={isApplied}
        suffix={
          <Button
            disabled={!code.trim() || isApplied}
            onClick={(e) => {
              e.preventDefault();
              handleApply();
            }}
          >
            {t('apply')}
          </Button>
        }
      />
      {isApplied && code ? (
        <div>
          <Button type="link" onClick={handleRemove}>
            {t('remove')}
          </Button>
        </div>
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  container: css``,
}));

export default PromoSectionView;
