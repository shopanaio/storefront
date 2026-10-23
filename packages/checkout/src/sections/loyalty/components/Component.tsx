'use client';

import { useId } from 'react';
import { Flex, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useCheckoutData } from '#checkout/context/CheckoutDataContext';
import { useLoyaltyAccount } from '#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount';
import { SectionId } from '#checkout/state/interface';
import { sectionAnchor } from '#checkout/ui/focusAnchor';
import { SUMMARY_BLOCK_GAP } from '#checkout/ui/summaryBlocks';
import type { Checkout } from '#checkout/types/entity';
import type { LoyaltyFormData } from '../types';
import { loyaltyIssues } from '../issues';
import { LoyaltyHeader } from './LoyaltyHeader';
import { useHeldPending } from '#checkout/ui/LoadingBoundary';
import { LoyaltySkeleton } from './LoyaltySkeleton';
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
  if (
    redemption &&
    !options.some((option) => option.source === redemption.source)
  ) {
    options.push({
      source: redemption.source,
      availablePoints: redemption.availablePoints,
      availableAmount: redemption.availableAmount,
      minimum: {
        points: redemption.source === 'POINTS' ? '1' : null,
        amount: {
          amount: 0,
          currencyCode: redemption.availableAmount.currencyCode,
        },
      },
      maximumPerOrder: null,
    });
  }
  return options;
}

/**
 * The "Points" block of the order summary, under the promo codes: the account balance and tier,
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
  const skeleton = useHeldPending(loading);
  if (!checkout || !data?.signedIn) return null;

  const issues = loyaltyIssues(checkout);
  const rewardIssue =
    issues.find(
      (item) => item.kind === 'reward' || item.kind === 'rewardInactive'
    ) ?? null;
  // The order fell below the minimum: the source is kept and applies again once the order grows.
  const orderTooSmall = issues.some((item) => item.kind === 'dropped');
  // A saved source the calculation did not apply; the checkout issue says why, in the banner.
  const selectedSource = data.selection?.source ?? null;
  const failedSource =
    !data.redemption && !orderTooSmall ? selectedSource : null;
  const rewardId = data.selection?.rewardId ?? null;
  const active = account?.status === 'ACTIVE' ? account : null;
  const options = sourceOptions(active, data.redemption);
  const showRedemption = options.length > 0 || failedSource !== null;
  if (
    failedSource &&
    !options.some((option) => option.source === failedSource)
  ) {
    const known = account?.sources.find(
      (option) => option.source === failedSource
    );
    if (known) options.push(known);
  }

  const label = (
    <Typography.Text
      id={headingId}
      strong
      type="secondary"
      className={styles.label}
    >
      {t('loyalty-title')}
    </Typography.Text>
  );
  let body;
  // Loading shows the skeleton only when the checkout already says there is a program: it loads
  // before the account, and a skeleton that then vanishes would make the summary jump.
  const programKnown = Boolean(
    checkout.loyaltyEarning || data.redemption || data.selection
  );
  if (skeleton) {
    if (!programKnown) return null;
    body = (
      <Flex vertical gap={8}>
        {label}
        <div
          className={styles.card}
          aria-busy="true"
          aria-label={t('loyalty-loading')}
        >
          <LoyaltySkeleton />
        </div>
      </Flex>
    );
  } else if (failed) {
    body = (
      <Flex vertical gap={8}>
        {label}
        <Flex
          align="center"
          justify="space-between"
          gap={12}
          className={styles.quiet}
        >
          <Typography.Text type="secondary">
            {t('loyalty-load-failed')}
          </Typography.Text>
          <button type="button" className={styles.link} onClick={refetch}>
            {t('loyalty-reload')}
          </button>
        </Flex>
      </Flex>
    );
  } else if (!active && !data.redemption && !data.selection) {
    return null;
  } else {
    body = (
      <>
        <Flex vertical gap={8}>
          {label}
          <div className={styles.card}>
            {active ? <LoyaltyHeader account={active} /> : null}
            {showRedemption && options.length > 0 ? (
              <RedemptionPart
                options={options}
                redemption={data.redemption}
                failedSource={failedSource}
                orderTooSmall={orderTooSmall}
                currencyCode={checkout.currencyCode}
                balanceShown={active !== null}
              />
            ) : null}
          </div>
        </Flex>
        {active ? (
          <RewardsPart
            rewards={active.rewards}
            appliedId={rewardId}
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
      {body}
    </section>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  // The balance and "My rewards" are two blocks of the summary: the label of each is as far
  // from the block above as any other.
  root: css`
    display: flex;
    flex-direction: column;
    gap: ${SUMMARY_BLOCK_GAP}px;
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
