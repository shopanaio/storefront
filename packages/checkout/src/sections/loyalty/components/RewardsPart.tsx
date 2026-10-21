'use client';

import { useMemo, useState } from 'react';
import { Button, Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import type { IconType } from 'react-icons';
import {
  TbCash,
  TbCoin,
  TbDiscount,
  TbGift,
  TbRosetteDiscount,
  TbTicket,
  TbTruckDelivery,
  TbWallet,
} from 'react-icons/tb';
import { useCheckoutApi } from '#checkout/context/CheckoutApiContext';
import type { Checkout } from '#checkout/types/entity';
import { formatShortDate } from '../format';

/** Rewards shown before "show more"; the applied one is always among them. */
const VISIBLE_REWARDS = 3;

const ICONS: Record<Checkout.LoyaltyRewardKind, IconType> = {
  POINTS: TbCoin,
  CASHBACK: TbCash,
  STORE_CREDIT: TbWallet,
  VOUCHER: TbTicket,
  FIXED_DISCOUNT: TbCash,
  PERCENTAGE_DISCOUNT: TbDiscount,
  FREE_SHIPPING: TbTruckDelivery,
  FREE_PRODUCT: TbGift,
  MEMBER_BENEFIT: TbRosetteDiscount,
};

interface RewardsPartProps {
  rewards: Checkout.LoyaltyReward[];
  appliedId: string | null;
  /** Why the applied reward does not work: no longer available, or not for this order. */
  appliedProblem: 'unavailable' | 'inactive' | null;
}

const byValidity = (a: Checkout.LoyaltyReward, b: Checkout.LoyaltyReward) =>
  (a.validUntil?.getTime() ?? Infinity) - (b.validUntil?.getTime() ?? Infinity);

/**
 * Rewards of the account, one per order: texts and amounts come from the server, the checkout
 * neither reads their kind beyond the icon nor computes their value. The nearest to expire come
 * first; the applied one is marked and its discount is in the totals.
 */
export const RewardsPart = ({ rewards, appliedId, appliedProblem }: RewardsPartProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const { setLoyaltyReward } = useCheckoutApi();
  const [expanded, setExpanded] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const sorted = useMemo(() => [...rewards].sort(byValidity), [rewards]);
  const applied = sorted.find((reward) => reward.id === appliedId) ?? null;
  const visible = useMemo(() => {
    if (expanded || sorted.length <= VISIBLE_REWARDS) return sorted;
    const first = sorted.slice(0, VISIBLE_REWARDS);
    return applied && !first.includes(applied)
      ? [...first.slice(0, VISIBLE_REWARDS - 1), applied]
      : first;
  }, [sorted, expanded, applied]);
  const hidden = sorted.length - visible.length;

  const change = async (reward: Checkout.LoyaltyReward | null, id: string) => {
    setPendingId(id);
    try {
      await setLoyaltyReward(
        reward ? { id: reward.id, voucherCode: reward.voucherCode } : null,
        applied ? { id: applied.id, voucherCode: applied.voucherCode } : null
      );
    } catch {
      // The banner reports the failure.
    } finally {
      setPendingId(null);
    }
  };

  if (sorted.length === 0) return null;

  return (
    <Flex vertical gap={8}>
      <Typography.Text strong type="secondary" className={styles.label}>
        {t('loyalty-rewards-title')}
      </Typography.Text>
      <Flex vertical gap={8} role="list" aria-label={t('loyalty-rewards-title')}>
        {visible.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            applied={reward.id === appliedId}
            problem={reward.id === appliedId ? appliedProblem : null}
            pending={pendingId === reward.id}
            disabled={pendingId !== null}
            onApply={() => void change(reward, reward.id)}
            onRemove={() => void change(null, reward.id)}
          />
        ))}
      </Flex>
      {sorted.length > VISIBLE_REWARDS ? (
        <button
          type="button"
          className={styles.link}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded
            ? t('loyalty-rewards-less')
            : t('loyalty-rewards-more', { count: hidden })}
        </button>
      ) : null}
    </Flex>
  );
};

const RewardCard = ({
  reward,
  applied,
  problem,
  pending,
  disabled,
  onApply,
  onRemove,
}: {
  reward: Checkout.LoyaltyReward;
  applied: boolean;
  problem: 'unavailable' | 'inactive' | null;
  pending: boolean;
  disabled: boolean;
  onApply: () => void;
  onRemove: () => void;
}) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles, cx } = useStyles();
  const Icon = ICONS[reward.kind] ?? TbGift;
  // Free shipping is never applied by hand: the server applies it and the shipping line names it.
  const automatic = reward.kind === 'FREE_SHIPPING';
  const validUntil = reward.validUntil
    ? t('loyalty-reward-valid-until', { date: formatShortDate(locale, reward.validUntil) })
    : null;
  const details = applied
    ? [t('loyalty-reward-applied'), validUntil]
    : automatic
      ? [t('loyalty-reward-automatic'), validUntil]
      : [reward.description, validUntil];

  return (
    <div
      role="listitem"
      className={cx(
        styles.card,
        applied && !problem ? styles.applied : undefined,
        problem ? styles.problem : undefined
      )}
    >
      <span className={cx(styles.icon, problem ? styles.iconMuted : undefined)} aria-hidden="true">
        <Icon size={18} />
      </span>
      <Flex vertical className={styles.text}>
        <span className={styles.headline}>{reward.headline}</span>
        {problem ? (
          <Typography.Text type="warning" className={styles.note}>
            {t(
              problem === 'inactive'
                ? 'loyalty-reward-inactive'
                : 'loyalty-reward-unavailable'
            )}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary" className={styles.note}>
            {details.filter(Boolean).join(' · ')}
          </Typography.Text>
        )}
      </Flex>
      {applied ? (
        <button
          type="button"
          className={styles.link}
          onClick={onRemove}
          disabled={disabled}
          aria-busy={pending || undefined}
        >
          {t('loyalty-reward-remove')}
        </button>
      ) : automatic ? null : (
        <Button loading={pending} disabled={disabled && !pending} onClick={onApply}>
          {t('apply')}
        </Button>
      )}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  label: css`
    font-size: ${token.fontSize}px;
  `,
  card: css`
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 64px;
    padding: ${token.paddingSM}px ${token.padding}px;
    box-sizing: border-box;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
  applied: css`
    border-color: ${token.colorPrimary};
    outline: 1px solid ${token.colorPrimary};
  `,
  problem: css`
    border-style: dashed;
    border-color: ${token.colorWarningBorder};
    background: ${token.colorWarningBg};
  `,
  icon: css`
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
  `,
  iconMuted: css`
    background: ${token.colorFillTertiary};
    color: ${token.colorTextSecondary};
  `,
  text: css`
    flex: 1;
    min-width: 0;
  `,
  headline: css`
    font-weight: 500;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
  `,
  link: css`
    align-self: flex-start;
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: ${token.colorPrimary};
    text-decoration: underline;
    text-underline-offset: 2px;
    white-space: nowrap;
    cursor: pointer;

    &:disabled {
      cursor: default;
      opacity: 0.65;
    }
  `,
}));
