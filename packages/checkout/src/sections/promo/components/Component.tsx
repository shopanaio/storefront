'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { FloatingLabelInput } from '#checkout/ui/FloatingLabelInput';
import { TbTicket, TbX } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import type { PromoFormData } from '../types';
import { usePromoDraft } from '../draft';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutTheme } from '#checkout/theme';
import { useConfirm } from '#checkout/ui/useConfirm';
import { SectionIssues } from '#checkout/components/notices/SectionIssues';
import { SectionId } from '#checkout/state/interface';
import { isPromoEntered, promoErrorCode, promoErrorMessageKey } from '../promoErrors';

export interface PromoSectionViewProps {
  /** Current form data */
  data: PromoFormData | null;
  /** Called to invalidate the section */
  invalidate: () => void;
}

/**
 * Promo codes (stage 6): the field to add one more code and the list of entered codes, each
 * removable on its own. Only the buyer removes a code (BR-tvyl): a code the checkout does not
 * apply stays listed with the reason from the API, and one waiting for a condition (a chosen
 * delivery) is shown as pending. Loyalty gets its place right after the codes through the
 * theme (`LoyaltySlot`); it is not implemented here (6.2).
 */
export const PromoSectionView = ({ data }: PromoSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { addPromoCode, removePromoCode } = useCheckoutApi();
  const { LoyaltySlot } = useCheckoutTheme();
  const confirm = useConfirm();
  const codes = useMemo(() => data?.codes ?? [], [data?.codes]);

  const code = usePromoDraft((state) => state.code);
  const setCode = usePromoDraft((state) => state.setCode);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(async () => {
    const value = code.trim();
    if (!value || applying) return;
    if (isPromoEntered(codes.map((item) => item.code), value)) {
      setCode('');
      return;
    }
    setApplying(true);
    setError(null);
    try {
      // The code is listed with its state, applied or not; the field is free for the next one.
      await addPromoCode({ code: value });
      setCode('');
    } catch (failure) {
      setError(t(promoErrorMessageKey(promoErrorCode(failure))));
    } finally {
      setApplying(false);
    }
  }, [code, codes, applying, addPromoCode, setCode, t]);

  const handleRemove = useCallback(
    async (promoCode: string) => {
      const ok = await confirm({
        icon: null,
        title: t('remove-promo-confirm-title'),
        content: (
          <Typography.Text>
            {t.rich('remove-promo-confirm-content', {
              promoCode,
              strong: (chunks) => <strong>{chunks}</strong>,
            })}
          </Typography.Text>
        ),
        okText: t('remove-promo-confirm-ok'),
        cancelText: t('remove-promo-confirm-cancel'),
      });
      if (!ok) return;
      setError(null);
      try {
        await removePromoCode({ code: promoCode });
      } catch (failure) {
        setError(t(promoErrorMessageKey(promoErrorCode(failure))));
      }
    },
    [removePromoCode, t, confirm]
  );

  return (
    <Flex vertical gap={8}>
      <Typography.Text strong type="secondary" className={styles.label}>
        {t('have-coupon-question')}
      </Typography.Text>
      <FloatingLabelInput
        label={t('coupon-code')}
        value={code}
        error={error ?? undefined}
        prefix={<TbTicket size={20} />}
        onChange={(e) => {
          setCode((e.target as HTMLInputElement).value);
          setError(null);
        }}
        onPressEnter={(e) => {
          e.preventDefault();
          void handleApply();
        }}
        suffix={
          <Button
            disabled={!code.trim()}
            loading={applying}
            onClick={(e) => {
              e.preventDefault();
              void handleApply();
            }}
          >
            {t('apply')}
          </Button>
        }
      />
      {codes.length > 0 ? (
        <Flex vertical gap={8} role="list" aria-label={t('promo-entered-codes')}>
          {codes.map(({ code: entered, status, message }) => (
            <Flex key={entered} role="listitem" vertical gap={2}>
              <Flex
                align="center"
                gap={4}
                className={clsx(styles.tag, status !== 'APPLIED' && styles.notApplied)}
              >
                <Typography.Text strong className={styles.code}>
                  {entered}
                </Typography.Text>
                <Button
                  type="text"
                  size="small"
                  icon={<TbX size={16} />}
                  onClick={() => void handleRemove(entered)}
                  aria-label={t('remove-promo', { promoCode: entered })}
                  className={styles.removeButton}
                />
              </Flex>
              {status !== 'APPLIED' && (
                <Typography.Text type={status === 'REJECTED' ? 'warning' : 'secondary'}>
                  {message ?? t(status === 'PENDING' ? 'promo-pending' : 'promo-rejected')}
                </Typography.Text>
              )}
            </Flex>
          ))}
        </Flex>
      ) : null}
      <SectionIssues sections={[SectionId.Promo]} />
      {LoyaltySlot ? <LoyaltySlot /> : null}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  label: css`
    font-size: ${token.fontSize}px;
  `,
  tag: css`
    align-self: flex-start;
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    padding: ${token.paddingXXS}px ${token.paddingXXS}px ${token.paddingXXS}px ${token.paddingSM}px;
  `,
  notApplied: css`
    border-style: dashed;
  `,
  code: css`
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  removeButton: css`
    color: ${token.colorTextSecondary};
    &:hover {
      color: ${token.colorError};
    }
  `,
}));

export default PromoSectionView;
