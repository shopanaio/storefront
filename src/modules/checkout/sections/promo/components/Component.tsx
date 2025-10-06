'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, Flex } from 'antd';
import { createStyles } from 'antd-style';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { TbTicket } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import type { PromoFormData } from '../types';
import type { AnySchema } from 'yup';
import { extractYupErrors } from '@src/modules/checkout/utils/validation';

/**
 * View component for the checkout promo section.
 *
 * Pure controlled UI component that renders the promo form.
 * Receives generic form data and extracts needed fields (code).
 * Does not manage its own state - all state is controlled via props.
 */
export interface PromoSectionViewProps {
  /** Current form data */
  data: PromoFormData | null;
  /** Called when form data is valid */
  onValid: () => void;
  /** Called when form data is invalid */
  onInvalid: (errors?: Record<string, string>) => void;
  /** Validation schema */
  schema: AnySchema;
}

export const PromoSectionView = ({
  data,
  onValid,
  onInvalid,
  schema,
}: PromoSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');

  const [code, setCode] = useState(data?.code ?? '');
  const [isApplied, setIsApplied] = useState(Boolean(data?.code));

  // Sync local state when data changes
  useEffect(() => {
    const newCode = data?.code ?? '';
    setCode(newCode);
    setIsApplied(Boolean(newCode));
  }, [data?.code]);

  const handleApply = useCallback(async () => {
    const trimmedCode = code.trim();
    const formData: PromoFormData = { code: trimmedCode, provider: '' };

    try {
      await schema.validate(formData, { abortEarly: false });
      onValid();
      setIsApplied(true);
    } catch (error: unknown) {
      const errors = extractYupErrors(error);
      onInvalid(errors || { code: 'Promo code is required' });
    }
  }, [code, onValid, onInvalid, schema]);

  const handleRemove = useCallback(() => {
    setCode('');
    setIsApplied(false);
    // Promo is optional, so call onValid when removed
    onValid();
  }, [onValid]);

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
