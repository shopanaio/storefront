'use client';

import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useLocale, useTranslations } from 'next-intl';
import { TbClockHour4, TbCoin, TbCrown } from 'react-icons/tb';
import type { Checkout } from '#checkout/types/entity';
import { formatMultiplier, formatShortDate, usePointsLabel } from '../format';

interface LoyaltyHeaderProps {
  account: Checkout.LoyaltyAccount;
}

/**
 * Balance of the account with its tier: the multiplier of purchase points, the server's text
 * about the next tier, the nearest expiration and the points still pending.
 */
export const LoyaltyHeader = ({ account }: LoyaltyHeaderProps) => {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const { styles } = useStyles();
  const points = usePointsLabel();
  const { tier, nextExpiration } = account;
  const empty =
    BigInt(account.availablePoints) === 0n &&
    account.sources.length === 0 &&
    account.rewards.length === 0;
  const pending = BigInt(account.pendingPoints) > 0n;

  return (
    <Flex vertical gap={8} className={styles.root}>
      <Flex align="center" justify="space-between" gap={12} wrap>
        <Flex align="center" gap={8}>
          <TbCoin size={20} className={styles.icon} aria-hidden="true" />
          <span className={styles.balance}>{points(account.availablePoints)}</span>
        </Flex>
        {tier ? (
          <span className={styles.pill}>
            <TbCrown size={14} aria-hidden="true" />
            {t('loyalty-tier', {
              tier: tier.name,
              multiplier: formatMultiplier(locale, tier.earnMultiplierBps),
            })}
          </span>
        ) : null}
      </Flex>
      {tier?.progress ? (
        <Typography.Text type="secondary" className={styles.note}>
          {tier.progress}
        </Typography.Text>
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
      {pending ? (
        <Typography.Text type="secondary" className={styles.note}>
          {t('loyalty-pending', { points: points(account.pendingPoints) })}
        </Typography.Text>
      ) : null}
      {empty ? (
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
  icon: css`
    flex: none;
    color: ${token.colorPrimary};
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
  `,
  note: css`
    font-size: ${token.fontSizeSM}px;
    line-height: ${token.lineHeightSM};
  `,
  expiring: css`
    flex: none;
    color: ${token.colorWarning};
  `,
}));
