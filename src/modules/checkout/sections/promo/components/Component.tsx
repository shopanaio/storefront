'use client';

import { useState, useEffect, useCallback } from 'react';
import { App, Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { FloatingLabelInput } from '@src/components/UI/FloatingLabelInput';
import { TbTicket, TbX, TbDiscount, TbCircleCheckFilled } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import type { PromoFormData } from '../types';
import { useCheckoutApi } from '@src/modules/checkout/context/CheckoutApiContext';

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
  /** Called to invalidate the section */
  invalidate: () => void;
}

export const PromoSectionView = ({
  data,
  invalidate,
}: PromoSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { addPromoCode, removePromoCode } = useCheckoutApi();
  const { modal } = App.useApp();

  const [code, setCode] = useState(data?.code ?? '');
  const [isApplied, setIsApplied] = useState(Boolean(data?.code));

  // Sync local state when data changes
  useEffect(() => {
    const newCode = data?.code ?? '';
    setCode(newCode);
    setIsApplied(Boolean(newCode));
  }, [data?.code]);

  const handleApply = useCallback(() => {
    if (code.trim()) {
      addPromoCode({ code: code.trim() });
    }
  }, [code, addPromoCode]);

  const handleRemove = useCallback(() => {
    if (data?.code) {
      const promoCode = data.code;

      modal.confirm({
        icon: null,
        title: t('remove-promo-confirm-title'),
        content: (
          <Flex gap={8} align="center">
            <Typography.Text>
              {t.rich('remove-promo-confirm-content', {
                promoCode,
                strong: (chunks) => <strong>{chunks}</strong>,
              })}
            </Typography.Text>
          </Flex>
        ),
        okText: t('remove-promo-confirm-ok'),
        cancelText: t('remove-promo-confirm-cancel'),
        onOk: () => {
          removePromoCode({ code: promoCode });
        },
      });
    }
  }, [data?.code, removePromoCode, modal, t]);

  return (
    <Flex vertical gap={8} className={styles.container}>
      <Typography.Text strong type="secondary" className={styles.label}>
        {t('have-coupon-question')}
      </Typography.Text>
      {!isApplied ? (
        <FloatingLabelInput
          label={t('coupon-code')}
          value={code}
          prefix={<TbTicket size={20} />}
          onChange={(e) => setCode((e.target as HTMLInputElement).value)}
          onPressEnter={(e) => {
            e.preventDefault();
            if (code.trim()) {
              handleApply();
            }
          }}
          suffix={
            <Button
              disabled={!code.trim()}
              onClick={(e) => {
                e.preventDefault();
                handleApply();
              }}
            >
              {t('apply')}
            </Button>
          }
        />
      ) : null}
      {isApplied && code ? (
        <div className={styles.appliedPromoCard}>
          <Flex
            align="center"
            justify="space-between"
            gap={12}
            className={styles.promoContent}
          >
            <Typography.Text strong className={styles.promoCode}>
              {code}
            </Typography.Text>
            <Button
              variant="text"
              color="green"
              size="small"
              icon={<TbCircleCheckFilled size={18} />}
              onClick={handleRemove}
              className={styles.removeButton}
              aria-label={t('remove')}
            >
              {t('promo-applied')}
            </Button>
          </Flex>
        </div>
      ) : null}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css``,
  label: css`
    font-size: ${token.fontSize}px;
  `,
  appliedPromoCard: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadiusLG}px;
    padding: ${token.paddingSM}px ${token.padding}px;
    transition: all 0.3s ease;
    min-height: 50px;
  `,
  promoContent: css`
    width: 100%;
  `,
  promoCode: css`
    font-size: ${token.fontSize}px;
    color: ${token.colorText};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  removeButton: css`
    color: ${token.colorTextSecondary};
    flex-shrink: 0;
    &:hover {
      color: ${token.colorError};
      background: ${token.colorErrorBg};
    }
  `,
}));

export default PromoSectionView;
