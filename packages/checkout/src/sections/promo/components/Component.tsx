'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { FloatingLabelInput } from '@shopana/storefront-ui';
import {
  TbCheck,
  TbClockHour4,
  TbExclamationMark,
  TbTicket,
  TbX,
} from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import type { PromoFormData } from '../types';
import { usePromoDraft } from '../draft';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import { useConfirm } from '#checkout/ui/useConfirm';
import { SectionIssues } from '#checkout/components/notices/SectionIssues';
import { SectionId } from '#checkout/state/interface';
import {
  isPromoEntered,
  promoErrorCode,
  promoErrorMessageKey,
} from '../promoErrors';

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
 * delivery) is shown as pending. The code of a loyalty voucher is marked as a reward.
 */
export const PromoSectionView = ({ data }: PromoSectionViewProps) => {
  const { styles } = useStyles();
  const t = useTranslations('Checkout');
  const { addPromoCode, removePromoCode, setLoyaltyReward } = useCheckoutApi();
  const { checkout } = useCheckoutData();
  const { account } = useLoyaltyAccount();
  const rewardId = checkout?.loyaltySelection?.rewardId ?? null;
  const rewardCode =
    account?.rewards.find((reward) => reward.id === rewardId)?.voucherCode ??
    null;
  const confirm = useConfirm();
  const codes = useMemo(() => data?.codes ?? [], [data?.codes]);

  const code = usePromoDraft((state) => state.code);
  const setCode = usePromoDraft((state) => state.setCode);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApply = useCallback(async () => {
    const value = code.trim();
    if (!value || applying) return;
    if (
      isPromoEntered(
        codes.map((item) => item.code),
        value
      )
    ) {
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
        if (rewardId && rewardCode && isPromoEntered([rewardCode], promoCode)) {
          // The code of the chosen reward goes with the reward: both are given up together.
          await setLoyaltyReward(null, {
            id: rewardId,
            voucherCode: rewardCode,
          });
        } else {
          await removePromoCode({ code: promoCode });
        }
      } catch (failure) {
        setError(t(promoErrorMessageKey(promoErrorCode(failure))));
      }
    },
    [removePromoCode, setLoyaltyReward, rewardId, rewardCode, t, confirm]
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
        <Flex wrap gap={8} role="list" aria-label={t('promo-entered-codes')}>
          {codes.map(({ code: entered, status }) => (
            <Flex
              key={entered}
              role="listitem"
              align="center"
              gap={8}
              className={clsx(
                styles.tag,
                status !== 'APPLIED' && styles.notApplied
              )}
            >
              <span
                className={clsx(
                  styles.statusIcon,
                  status === 'APPLIED'
                    ? styles.appliedIcon
                    : status === 'PENDING'
                      ? styles.pendingIcon
                      : styles.rejectedIcon
                )}
                aria-hidden="true"
              >
                {status === 'APPLIED' ? (
                  <TbCheck size={14} strokeWidth={3} />
                ) : status === 'PENDING' ? (
                  <TbClockHour4 size={14} strokeWidth={2.5} />
                ) : (
                  <TbExclamationMark size={14} strokeWidth={3} />
                )}
              </span>
              <Typography.Text strong className={styles.code}>
                {entered}
              </Typography.Text>
              {rewardCode && isPromoEntered([rewardCode], entered) ? (
                <span className={styles.rewardPill}>
                  {t('loyalty-reward-code')}
                </span>
              ) : null}
              <Button
                type="text"
                size="small"
                icon={<TbX size={16} />}
                onClick={() => void handleRemove(entered)}
                aria-label={t('remove-promo', { promoCode: entered })}
                className={styles.removeButton}
              />
            </Flex>
          ))}
        </Flex>
      ) : null}
      {/* Why a code is not applied, under all the codes, each reason named by its code. */}
      {codes.some(({ status }) => status !== 'APPLIED') ? (
        <Flex vertical gap={2}>
          {codes
            .filter(({ status }) => status !== 'APPLIED')
            .map(({ code: entered, status, message }) => (
              <Typography.Text
                key={entered}
                type={status === 'REJECTED' ? 'warning' : 'secondary'}
              >
                <span className={styles.reasonCode}>{entered}</span>{' '}
                <span>
                  {message ??
                    t(
                      status === 'PENDING' ? 'promo-pending' : 'promo-rejected'
                    )}
                </span>
              </Typography.Text>
            ))}
        </Flex>
      ) : null}
      <SectionIssues sections={[SectionId.Promo]} />
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  label: css`
    font-size: ${token.fontSize}px;
  `,
  tag: css`
    background: ${token.colorBgContainer};
    border: 1px solid ${token.colorBorder};
    border-radius: 999px;
    padding: ${token.paddingXXS}px;
  `,
  statusIcon: css`
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: ${token.controlHeightSM}px;
    height: ${token.controlHeightSM}px;
    border-radius: 50%;
    color: ${token.colorTextLightSolid};
  `,
  appliedIcon: css`
    background: ${token.colorSuccess};
  `,
  pendingIcon: css`
    background: ${token.colorTextTertiary};
  `,
  rejectedIcon: css`
    background: ${token.colorWarning};
  `,
  reasonCode: css`
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  notApplied: css`
    border-style: dashed;
  `,
  code: css`
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  rewardPill: css`
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
  `,
  removeButton: css`
    width: ${token.controlHeightSM}px;
    height: ${token.controlHeightSM}px;
    border-radius: 50%;
    color: ${token.colorTextSecondary};
    &:hover {
      color: ${token.colorError};
    }
  `,
}));

export default PromoSectionView;
