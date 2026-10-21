'use client';

import { Flex, Tooltip, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import { TbClockHour4, TbCrown, TbInfoCircle } from 'react-icons/tb';
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
      {nextExpiration ? (
        <Typography.Text type="secondary" className={styles.note}>
          <Flex align="center" gap={6}>
            <TbClockHour4 size={14} className={styles.expiring} aria-hidden="true" />
            {t('loyalty-expiring', {
              points: points(nextExpiration.points),
              date: formatShortDate(locale, nextExpiration.expiresAt),
            })}
          </Flex>
        </Typography.Text>
      ) : null}
      {storeCredit?.nextExpiration ? (
        <Typography.Text type="secondary" className={styles.note}>
          <Flex align="center" gap={6}>
            <TbClockHour4 size={14} className={styles.expiring} aria-hidden="true" />
            {t('loyalty-store-credit-expiring', {
              amount: money(storeCredit.nextExpiration.amount),
              date: formatShortDate(locale, storeCredit.nextExpiration.expiresAt),
            })}
          </Flex>
        </Typography.Text>
      ) : null}
      {pendingCredit && storeCredit ? (
        <Typography.Text type="secondary" className={styles.note}>
          {t('loyalty-store-credit-pending', { amount: money(storeCredit.pendingAmount) })}
        </Typography.Text>
      ) : null}
      {pending ? (
        <Typography.Text type="secondary" className={styles.note}>
          {t('loyalty-pending', { points: points(account.pendingPoints) })}
        </Typography.Text>
      ) : null}
      {empty && withPoints ? (
        <Typography.Text type="secondary" className={styles.note}>
          {t('loyalty-empty-hint')}
        </Typography.Text>
      ) : null}
    </Flex>
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
  expiring: css`
    flex: none;
    color: ${token.colorWarning};
  `,
}));
