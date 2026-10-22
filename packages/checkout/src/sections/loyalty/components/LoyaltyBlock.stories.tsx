import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  defaultCheckout,
  guestCheckout,
  makeCheckout,
} from '#checkout/stories/fixtures';
import {
  allRewardsAccount,
  bothSourcesAccount,
  cashbackEarning,
  customPointsRedemption,
  earning,
  expiringPointsAccount,
  guestCashbackEarning,
  guestEarning,
  limitedPointsAccount,
  loyaltyIssue,
  maximumPointsRedemption,
  moneyRewardsAccount,
  pointsAccount,
  pointsAndCashbackEarning,
  pointsSelection,
  rewardSelection,
  rewardsOnlyAccount,
  storeCreditAccount,
  storeCreditRedemption,
  suspendedAccount,
} from '#checkout/stories/loyaltyFixtures';
import {
  mockCheckout,
  withRedemption,
  withReward,
} from '#checkout/stories/mockCheckout';
import type { CheckoutMockState } from '#checkout/stories/mockCheckout';
import { CheckoutFormPage } from '#checkout/stories/CheckoutFormPage';
import { withCheckout } from '#checkout/stories/withCheckout';
import { withDirectory } from '#checkout/stories/withDirectory';
import type { Checkout } from '#checkout/types/entity';

/**
 * The loyalty block on the checkout page, as the buyer sees it: in the order summary between
 * the lines and the totals, with the balance and tier, paying with points or store credit, the
 * rewards, the loyalty lines of the totals and what the order earns. Choices work: the mock API
 * applies them to the checkout.
 */
const meta = {
  title: 'Checkout/Loyalty',
  component: CheckoutFormPage,
  decorators: [withCheckout, withDirectory],
  parameters: { layout: 'fullscreen' },
  beforeEach: ({ parameters }) => {
    mockCheckout(parameters.checkout as Partial<CheckoutMockState>);
  },
} satisfies Meta<typeof CheckoutFormPage>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default checkout of a signed-in buyer with the scenario's loyalty fields. */
const scenario = (
  account: Checkout.LoyaltyAccount | null,
  overrides: Partial<Checkout.Checkout> = {}
): { checkout: Partial<CheckoutMockState> } => ({
  checkout: {
    checkout: makeCheckout({ loyaltyEarning: earning, ...overrides }),
    loyalty: { account, loading: false, failed: false },
  },
});

/** The checkout after the calculation applied a redemption of the saved selection. */
const redeemed = (
  redemption: Checkout.LoyaltyRedemption,
  selection: Checkout.LoyaltySelection,
  overrides: Partial<Checkout.Checkout> = {}
): Checkout.Checkout => ({
  ...withRedemption(makeCheckout(overrides), redemption),
  loyaltySelection: selection,
  loyaltyEarning: overrides.loyaltyEarning ?? earning,
});

/** The default checkout with a reward applied, its discount in the totals. */
const rewarded = (
  rewardId: string,
  overrides: Partial<Checkout.Checkout> = {}
): Checkout.Checkout =>
  withReward(makeCheckout({ loyaltyEarning: earning, ...overrides }), rewardId);

// Account

/** A Gold member, nothing chosen yet: balance, tier, the points switch and two rewards. */
export const Default: Story = { parameters: scenario(pointsAccount) };

/** The checkout knows of a program: the block holds its place while the account loads. */
export const AccountLoading: Story = {
  parameters: {
    checkout: {
      checkout: makeCheckout({ loyaltyEarning: earning }),
      loyalty: { account: null, loading: true, failed: false },
    },
  },
};

/** No sign of a program in the checkout: nothing is drawn while the account loads. */
export const AccountLoadingNoProgram: Story = {
  parameters: {
    checkout: {
      checkout: defaultCheckout,
      loyalty: { account: null, loading: true, failed: false },
    },
  },
};

/** The account could not be read: the checkout goes on, with a link to try again. */
export const AccountLoadFailed: Story = {
  parameters: {
    checkout: {
      checkout: defaultCheckout,
      loyalty: { account: null, loading: false, failed: true },
    },
  },
};

/** A guest sees no block, only the invitation to sign in and earn under the total. */
export const Guest: Story = {
  parameters: {
    checkout: {
      checkout: { ...guestCheckout, loyaltyEarning: guestEarning },
      loyalty: { account: null, loading: false, failed: false },
    },
  },
};

/** A buyer without an account in the program: nothing to show, nothing earned. */
export const NoAccount: Story = {
  parameters: scenario(null, { loyaltyEarning: null }),
};

/** The account was suspended after points were applied: the redemption stays visible. */
export const SuspendedWithRedemption: Story = {
  parameters: {
    checkout: {
      checkout: redeemed(maximumPointsRedemption, pointsSelection()),
      loyalty: { account: suspendedAccount, loading: false, failed: false },
    },
  },
};

/** The top tier: no progress, pending points and points that expire soon. */
export const TopTierExpiringPoints: Story = {
  parameters: scenario(expiringPointsAccount),
};

// Points

export const PointsMaximumApplied: Story = {
  parameters: scenario(
    pointsAccount,
    redeemed(maximumPointsRedemption, pointsSelection())
  ),
};

export const PointsCustomAmount: Story = {
  parameters: scenario(
    pointsAccount,
    redeemed(customPointsRedemption, pointsSelection('500'))
  ),
};

/** The program allows 2 000 points per order of a 5 000 balance. */
export const PointsLimitPerOrder: Story = {
  parameters: scenario(
    limitedPointsAccount,
    redeemed(
      {
        ...maximumPointsRedemption,
        points: '2000',
        availablePoints: '5000',
        availableAmount: { amount: 500, currencyCode: 'UAH' },
        discount: { amount: 200, currencyCode: 'UAH' },
      },
      pointsSelection()
    )
  ),
};

/** The order shrank: the amount was lowered to the most it allows now. */
export const PointsReduced: Story = {
  parameters: scenario(
    pointsAccount,
    redeemed(
      {
        ...customPointsRedemption,
        requestedPoints: '1240',
        points: '900',
        discount: { amount: 90, currencyCode: 'UAH' },
      },
      pointsSelection('1240'),
      {
        issues: [
          loyaltyIssue('LOYALTY_REDEMPTION_REDUCED', [
            'loyaltyRedemption',
            'points',
          ]),
        ],
      }
    )
  ),
};

/** The order is below the program minimum: the switch is off and disabled, the choice kept. */
export const PointsOrderTooSmall: Story = {
  parameters: scenario(pointsAccount, {
    loyaltySelection: pointsSelection(),
    issues: [
      loyaltyIssue('LOYALTY_REDEMPTION_REDUCED', [
        'loyaltyRedemption',
        'points',
      ]),
    ],
  }),
};

/** The loyalty service did not answer: the saved choice shows as not applied. */
export const PointsNotApplied: Story = {
  parameters: scenario(pointsAccount, {
    loyaltySelection: pointsSelection('300'),
    issues: [
      loyaltyIssue(
        'LOYALTY_SERVICE_UNAVAILABLE',
        ['loyaltyRedemption', 'points'],
        {
          retryable: true,
        }
      ),
    ],
  }),
};

/** The balance is too low for the chosen points; the order cannot be placed. */
export const PointsInsufficient: Story = {
  parameters: scenario(pointsAccount, {
    loyaltySelection: pointsSelection('2000'),
    valid: false,
    issues: [
      loyaltyIssue(
        'REQUEST_EXCEEDS_AVAILABLE_POINTS',
        ['loyaltyRedemption', 'points'],
        {
          severity: 'ERROR',
          effect: 'STOP',
        }
      ),
    ],
  }),
};

// Store credit

/**
 * A program of store credit: balance, pending credit and credit that expires soon. The order
 * earns cashback in money, not points.
 */
export const StoreCredit: Story = {
  parameters: scenario(storeCreditAccount, { loyaltyEarning: cashbackEarning }),
};

export const StoreCreditApplied: Story = {
  parameters: scenario(
    storeCreditAccount,
    redeemed(
      storeCreditRedemption,
      { source: 'STORE_CREDIT', points: null, amount: null, rewardId: null },
      { loyaltyEarning: cashbackEarning }
    )
  ),
};

/** A guest of a store credit program is invited to sign in for the cashback. */
export const GuestCashback: Story = {
  parameters: {
    checkout: {
      checkout: { ...guestCheckout, loyaltyEarning: guestCashbackEarning },
      loyalty: { account: null, loading: false, failed: false },
    },
  },
};

// Both sources

/** Points and store credit: the buyer chooses one of them or none. */
export const BothSources: Story = {
  parameters: scenario(bothSourcesAccount, {
    loyaltyEarning: pointsAndCashbackEarning,
  }),
};

export const BothSourcesPointsChosen: Story = {
  parameters: scenario(
    bothSourcesAccount,
    redeemed(maximumPointsRedemption, pointsSelection(), {
      loyaltyEarning: pointsAndCashbackEarning,
    })
  ),
};

// Rewards

/** Every kind of reward; free shipping applies by itself and has no button. */
export const RewardsAllKinds: Story = {
  parameters: scenario(allRewardsAccount),
};

/** A percentage discount applied: the discount line of the totals. */
export const RewardApplied: Story = {
  parameters: scenario(allRewardsAccount, rewarded('reward-percent')),
};

/**
 * Rewards worth money: a fixed discount, cashback, store credit and bonus points. Only the
 * discount takes money off this order; the others are paid after it.
 */
export const RewardsInMoney: Story = {
  parameters: scenario(moneyRewardsAccount, {
    loyaltyEarning: pointsAndCashbackEarning,
  }),
};

/** A fixed discount applied: −150 UAH in the totals. */
export const RewardFixedDiscountApplied: Story = {
  parameters: scenario(moneyRewardsAccount, rewarded('reward-fixed')),
};

/** Cashback applied: nothing off the order, the cashback is in what the order earns. */
export const RewardCashbackApplied: Story = {
  parameters: scenario(
    moneyRewardsAccount,
    rewarded('reward-cashback', { loyaltyEarning: pointsAndCashbackEarning })
  ),
};

/** Points and a reward together. */
export const PointsAndReward: Story = {
  parameters: scenario(allRewardsAccount, {
    ...withReward(
      redeemed(maximumPointsRedemption, pointsSelection()),
      'reward-voucher'
    ),
    loyaltySelection: { ...pointsSelection(), rewardId: 'reward-voucher' },
  }),
};

/** The loyalty reward made shipping free: the totals say why. */
export const RewardFreeShipping: Story = {
  parameters: scenario(allRewardsAccount, {
    loyaltyRewardId: 'reward-shipping',
    loyaltySelection: rewardSelection('reward-shipping'),
    cost: {
      ...defaultCheckout.cost,
      totalShippingAmount: { amount: 0, currencyCode: 'UAH' },
      totalAmount: defaultCheckout.cost.subtotalAmount,
    },
    deliveryGroups: defaultCheckout.deliveryGroups.map((group) => ({
      ...group,
      shipping: group.shipping && {
        ...group.shipping,
        total: { amount: 0, currencyCode: 'UAH' },
        freeShipping: {
          source: 'LOYALTY_REWARD',
          title: 'Free delivery',
          code: null,
        },
      },
    })),
  }),
};

/** The chosen reward was used elsewhere or expired. */
export const RewardUnavailable: Story = {
  parameters: scenario(allRewardsAccount, {
    loyaltySelection: rewardSelection('reward-voucher'),
    issues: [loyaltyIssue('REWARD_NOT_AVAILABLE', ['loyaltyReward', 'id'])],
  }),
};

/** The store switched off the reward's discount for this order. */
export const RewardDiscountNotApplied: Story = {
  parameters: scenario(allRewardsAccount, {
    loyaltyRewardId: 'reward-percent',
    loyaltySelection: rewardSelection('reward-percent'),
    issues: [
      loyaltyIssue('REWARD_DISCOUNT_NOT_APPLIED', ['loyaltyReward', 'id']),
    ],
  }),
};

/** Too few points to pay with: only the rewards. */
export const RewardsOnly: Story = { parameters: scenario(rewardsOnlyAccount) };
