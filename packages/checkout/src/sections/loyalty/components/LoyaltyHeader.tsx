'use client';

import { Flex, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import { TbArrowDown, TbArrowUp, TbCrown, TbInfoCircle } from 'react-icons/tb';
import type { Checkout } from '#checkout/types/entity';
import { formatMoney } from '#checkout/ui/Money';
import { formatMultiplier, formatShortDate, usePointsLabel } from '../format';
import { LoyaltyIcon } from './LoyaltyIcon';

interface LoyaltyHeaderProps {
  account: Checkout.LoyaltyAccount;
}

/**
 * Whether the account works with points: it has or expects some, can pay with them, or has no
 * store credit either (a new account of a points program).
 */
export function showsPoints(account: Checkout.LoyaltyAccount): boolean {
  return (
    account.storeCredit === null ||
    BigInt(account.availablePoints) > 0n ||
    BigInt(account.pendingPoints) > 0n ||
    account.nextExpiration !== null ||
    account.sources.some((option) => option.source === 'POINTS')
  );
}

/**
 * Balance of the account with its tier: points and store credit, each when the account works
 * with it, the multiplier of purchase points, the server's text about the next tier, the nearest
 * expirations and what is still pending.
 */
export const LoyaltyHeader = ({ account }: LoyaltyHeaderProps) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles } = useStyles();
  const points = usePointsLabel();
  const { tier, nextExpiration, storeCredit } = account;
  const withPoints = showsPoints(account);
  const money = (amount: Checkout.LoyaltyStoreCredit['availableAmount']) =>
    formatMoney(locale, amount);
  const balances = [
    withPoints ? points(account.availablePoints) : null,
    storeCredit
      ? t('loyalty-store-credit-balance', { amount: money(storeCredit.availableAmount) })
      : null,
  ].filter((part): part is string => part !== null);
  const empty =
    BigInt(account.availablePoints) === 0n &&
    (storeCredit?.availableAmount.amount ?? 0) === 0 &&
    account.sources.length === 0 &&
    account.rewards.length === 0;
  const pending = BigInt(account.pendingPoints) > 0n;
  const pendingCredit = (storeCredit?.pendingAmount.amount ?? 0) > 0;
  // What expires and what is still coming, points first, each with its explanation.
  const changes: StatusPillProps[] = [];
  if (nextExpiration) {
    const amount = points(nextExpiration.points);
    const date = formatShortDate(locale, nextExpiration.expiresAt);
    changes.push({
      id: 'points-expiring',
      tone: 'expiring',
      amount,
      text: t('loyalty-expiring', { date }),
      hint: t('loyalty-expiring-hint', { amount, date }),
    });
  }
  if (storeCredit?.nextExpiration) {
    const amount = money(storeCredit.nextExpiration.amount);
    const date = formatShortDate(locale, storeCredit.nextExpiration.expiresAt);
    changes.push({
      id: 'credit-expiring',
      tone: 'expiring',
      amount,
      text: t('loyalty-expiring', { date }),
      hint: t('loyalty-expiring-hint', { amount, date }),
    });
  }
  if (pending) {
    const amount = points(account.pendingPoints);
    changes.push({
      id: 'points-pending',
      tone: 'pending',
      amount,
      text: t('loyalty-pending'),
      hint: t('loyalty-pending-hint', { amount }),
    });
  }
  if (pendingCredit && storeCredit) {
    const amount = money(storeCredit.pendingAmount);
    changes.push({
      id: 'credit-pending',
      tone: 'pending',
      amount,
      text: t('loyalty-pending'),
      hint: t('loyalty-pending-hint', { amount }),
    });
  }

  return (
    <Flex vertical gap={4} className={styles.root}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={8}>
          <LoyaltyIcon size={20} />
          <span className={styles.balance}>{balances.join(' · ')}</span>
        </Flex>
        {tier ? (
          <Tooltip
            title={t('loyalty-tier-hint', {
              tier: tier.name,
              multiplier: formatMultiplier(locale, tier.earnMultiplierBps),
            })}
          >
            <span className={styles.pill} tabIndex={0}>
              <TbCrown size={14} aria-hidden="true" />
              {t('loyalty-tier', {
                tier: tier.name,
                multiplier: formatMultiplier(locale, tier.earnMultiplierBps),
              })}
            </span>
          </Tooltip>
        ) : null}
      </Flex>
      {tier?.progress ? (
        <Flex align="center" gap={4}>
          <Typography.Text type="secondary" className={styles.note}>
            {tier.progress}
          </Typography.Text>
          <Tooltip title={t('loyalty-progress-hint')}>
            <button type="button" className={styles.info} aria-label={t('loyalty-progress-hint')}>
              <TbInfoCircle size={14} aria-hidden="true" />
            </button>
          </Tooltip>
        </Flex>
      ) : null}
      {changes.length > 0 ? (
        <Flex wrap gap={8} className={styles.changes}>
          {changes.map(({ id, ...change }) => (
            <StatusPill key={id} {...change} />
          ))}
        </Flex>
      ) : null}
      {empty && withPoints ? (
        <Typography.Text type="secondary" className={styles.note}>
          {t('loyalty-empty-hint')}
        </Typography.Text>
      ) : null}
    </Flex>
  );
};

interface StatusPillProps {
  id: string;
  tone: 'expiring' | 'pending';
  amount: string;
  text: string;
  /** What the change means, in a tooltip. */
  hint: string;
}

/**
 * A change of the balance ahead, as a pill: what expires (a warning) and what is still coming
 * (a gain). The amount leads; the tooltip says what it means.
 */
const StatusPill = ({ tone, amount, text, hint }: Omit<StatusPillProps, 'id'>) => {
  const { styles, cx } = useStyles();
  // Down for what the balance loses, up for what it gains.
  const Icon = tone === 'expiring' ? TbArrowDown : TbArrowUp;
  return (
    <Tooltip title={hint}>
      <span className={cx(styles.statusPill, styles[tone])} tabIndex={0} aria-label={hint}>
        <Icon size={14} className={styles.statusIcon} aria-hidden="true" />
        <strong>{amount}</strong>
        <span>{text}</span>
      </span>
    </Tooltip>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  balance: css`
    font-size: ${token.fontSizeLG}px;
    line-height: ${token.lineHeightLG};
    font-weight: 500;
  `,
  pill: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    background: ${token.colorPrimaryBg};
    color: ${token.colorPrimary};
    font-size: ${token.fontSizeSM}px;
    font-weight: 500;
    white-space: nowrap;
    cursor: help;
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
  `,
  info: css`
    display: inline-flex;
    padding: 0;
    border: 0;
    background: none;
    color: ${token.colorTextTertiary};
    cursor: help;
  `,
  changes: css`
    padding-top: 4px;
  `,
  statusPill: css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border: 1px solid currentColor;
    border-radius: 12px;
    font-size: ${token.fontSizeSM}px;
    white-space: nowrap;
    cursor: help;
  `,
  statusIcon: css`
    flex: none;
  `,
  // The tones of the checkout banners: a warning for what expires, a gain for what is coming.
  expiring: css`
    color: var(--banner-warning-accent, ${token.colorWarningText});
  `,
  pending: css`
    color: var(--banner-success-accent, ${token.colorSuccessText});
  `,
}));
