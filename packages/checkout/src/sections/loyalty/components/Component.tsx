'use client';

import { useId } from 'react';
import { Flex, Skeleton, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import { SectionId } from '#checkout/state/interface';
import { sectionAnchor } from '#checkout/ui/focusAnchor';
import type { Checkout } from '#checkout/types/entity';
import type { LoyaltyFormData } from '../types';
import { issueSource, loyaltyIssues } from '../issues';
import { useLoyaltyIntent } from '../selection';
import { LoyaltyHeader } from './LoyaltyHeader';
import { RedemptionPart } from './RedemptionPart';
import { RewardsPart } from './RewardsPart';

export interface LoyaltySectionViewProps {
  data: LoyaltyFormData | null;
  invalidate: () => void;
}

/** Sources to offer: the account's, and the selected one even when its balance is spent. */
function sourceOptions(
  account: Checkout.LoyaltyAccount | null,
  redemption: Checkout.LoyaltyRedemption | null
): Checkout.LoyaltySourceOption[] {
  const options = [...(account?.sources ?? [])];
  if (redemption && !options.some((option) => option.source === redemption.source)) {
    options.push({
      source: redemption.source,
      availablePoints: redemption.availablePoints,
      availableAmount: redemption.availableAmount,
      minimum: {
        points: redemption.source === 'POINTS' ? '1' : null,
        amount: { amount: 0, currencyCode: redemption.availableAmount.currencyCode },
      },
      maximumPerOrder: null,
    });
  }
  return options;
}

/**
 * The "Бонуси" block of the order summary, under the promo codes: the account balance and tier,
 * paying with points or store credit, and the rewards. Each part shows only with data. Problems
 * are said in the checkout banner; the block shows only the state, so the summary does not jump.
 * Guests see nothing here: what they could earn is under the total.
 */
export const LoyaltySectionView = ({ data }: LoyaltySectionViewProps) => {
  const t = useTranslations('Checkout');
  const { styles } = useStyles();
  const headingId = useId();
  const { checkout } = useCheckoutData();
  const { account, loading, failed, refetch } = useLoyaltyAccount();
  const intent = useLoyaltyIntent((state) =>
    checkout ? (state.sources[checkout.id] ?? null) : null
  );
  if (!checkout || !data?.signedIn) return null;

  const issues = loyaltyIssues(checkout);
  const redemptionIssue = issues.find((item) => item.kind === 'redemption') ?? null;
  const rewardIssue =
    issues.find((item) => item.kind === 'reward' || item.kind === 'rewardInactive') ?? null;
  const failedSource =
    !data.redemption && redemptionIssue ? issueSource(redemptionIssue.issue, intent) : null;
  const active = account?.status === 'ACTIVE' ? account : null;
  const options = sourceOptions(active, data.redemption);
  const showRedemption = options.length > 0 || failedSource !== null;
  if (failedSource && !options.some((option) => option.source === failedSource)) {
    const known = account?.sources.find((option) => option.source === failedSource);
    if (known) options.push(known);
  }

  let body;
  if (loading) {
    body = (
      <div className={styles.card} aria-busy="true" aria-label={t('loyalty-loading')}>
        <Flex vertical gap={10} className={styles.padded}>
          <Skeleton.Input active size="small" />
          <Skeleton active title={false} paragraph={{ rows: 1, width: '60%' }} />
        </Flex>
      </div>
    );
  } else if (failed) {
    body = (
      <Flex align="center" justify="space-between" gap={12} className={styles.quiet}>
        <Typography.Text type="secondary">{t('loyalty-load-failed')}</Typography.Text>
        <button type="button" className={styles.link} onClick={refetch}>
          {t('loyalty-reload')}
        </button>
      </Flex>
    );
  } else if (!active && !data.redemption && !data.rewardId) {
    return null;
  } else {
    body = (
      <>
        <div className={styles.card}>
          {active ? <LoyaltyHeader account={active} /> : null}
          {showRedemption && options.length > 0 ? (
            <RedemptionPart
              options={options}
              redemption={data.redemption}
              failedSource={failedSource}
              orderTooSmall={issues.some((item) => item.kind === 'dropped')}
              currencyCode={checkout.currencyCode}
            />
          ) : null}
        </div>
        {active ? (
          <RewardsPart
            rewards={active.rewards}
            appliedId={data.rewardId}
            appliedProblem={
              rewardIssue
                ? rewardIssue.kind === 'rewardInactive'
                  ? 'inactive'
                  : 'unavailable'
                : null
            }
          />
        ) : null}
      </>
    );
  }

  return (
    <section
      id={sectionAnchor(SectionId.Loyalty)}
      aria-labelledby={headingId}
      className={styles.root}
    >
      <Typography.Text id={headingId} strong type="secondary" className={styles.label}>
        {t('loyalty-title')}
      </Typography.Text>
      {body}
    </section>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  root: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  label: css`
    font-size: ${token.fontSize}px;
  `,
  card: css`
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
    overflow: hidden;
  `,
  padded: css`
    padding: ${token.paddingSM}px ${token.padding}px;
  `,
  quiet: css`
    padding: ${token.paddingSM}px ${token.padding}px;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;
    background: ${token.colorBgContainer};
  `,
  link: css`
    padding: 0;
    border: 0;
    background: none;
    font: inherit;
    color: ${token.colorPrimary};
    text-decoration: underline;
    text-underline-offset: 2px;
    cursor: pointer;
  `,
}));

export default LoyaltySectionView;
