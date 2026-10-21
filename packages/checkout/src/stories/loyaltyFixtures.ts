import type { Checkout } from '#checkout/types/entity';
import { uah } from './fixtures';

/** Points are worth 0.1 UAH: 1 240 points pay 124 UAH. */
export const pointsSource: Checkout.LoyaltySourceOption = {
  source: 'POINTS',
  availablePoints: '1240',
  availableAmount: uah(124),
  minimum: { points: '100', amount: uah(10) },
  maximumPerOrder: null,
};

export const storeCreditSource: Checkout.LoyaltySourceOption = {
  source: 'STORE_CREDIT',
  availablePoints: null,
  availableAmount: uah(150),
  minimum: { points: null, amount: uah(1) },
  maximumPerOrder: null,
};

export const rewards: Checkout.LoyaltyReward[] = [
  {
    id: 'reward-voucher',
    kind: 'VOUCHER',
    headline: '100 UAH off your order',
    description: 'For orders from 500 UAH',
    validUntil: new Date('2026-11-30T00:00:00Z'),
    voucherCode: 'GOLD100',
  },
  {
    id: 'reward-percent',
    kind: 'PERCENTAGE_DISCOUNT',
    headline: '10% off pizzas',
    description: null,
    validUntil: null,
    voucherCode: null,
  },
  {
    id: 'reward-shipping',
    kind: 'FREE_SHIPPING',
    headline: 'Free delivery',
    description: null,
    validUntil: new Date('2026-12-31T00:00:00Z'),
    voucherCode: null,
  },
  {
    id: 'reward-product',
    kind: 'FREE_PRODUCT',
    headline: 'Free cola 0.5 l',
    description: 'Added to the order as a gift',
    validUntil: null,
    voucherCode: null,
  },
];

/** Rewards worth money: a discount, cashback, store credit and bonus points. */
export const moneyRewards: Checkout.LoyaltyReward[] = [
  {
    id: 'reward-fixed',
    kind: 'FIXED_DISCOUNT',
    headline: '150 UAH off your order',
    description: 'Birthday gift',
    validUntil: new Date('2026-11-15T00:00:00Z'),
    voucherCode: null,
  },
  {
    id: 'reward-cashback',
    kind: 'CASHBACK',
    headline: '10% cashback to store credit',
    description: 'Up to 200 UAH, credited after delivery',
    validUntil: null,
    voucherCode: null,
  },
  {
    id: 'reward-store-credit',
    kind: 'STORE_CREDIT',
    headline: '+100 UAH store credit',
    description: 'Credited after delivery',
    validUntil: null,
    voucherCode: null,
  },
  {
    id: 'reward-points',
    kind: 'POINTS',
    headline: 'Double points on this order',
    description: null,
    validUntil: null,
    voucherCode: null,
  },
];

/**
 * What the calculation takes off the goods for a reward, in UAH. Cashback, store credit and
 * points are paid after the order, so they take nothing off it.
 */
const REWARD_DISCOUNTS: Record<string, number> = {
  'reward-voucher': 100,
  'reward-percent': 92.2,
  'reward-fixed': 150,
};

export const rewardDiscount = (rewardId: string | null): number =>
  (rewardId && REWARD_DISCOUNTS[rewardId]) || 0;

/** A Gold member with points, a reward or two and nothing expiring. */
export const pointsAccount: Checkout.LoyaltyAccount = {
  id: 'account-1',
  status: 'ACTIVE',
  availablePoints: '1240',
  pendingPoints: '0',
  tier: {
    name: 'Gold',
    earnMultiplierBps: 15_000,
    progress: '1 200 more points to Platinum',
  },
  nextExpiration: null,
  storeCredit: null,
  sources: [pointsSource],
  rewards: rewards.slice(0, 2),
};

/** A program of store credit only: no points and no tiers. */
export const storeCreditAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  availablePoints: '0',
  tier: null,
  storeCredit: {
    availableAmount: uah(150),
    pendingAmount: uah(35),
    nextExpiration: {
      amount: uah(20),
      expiresAt: new Date('2026-10-31T00:00:00Z'),
    },
  },
  sources: [storeCreditSource],
  rewards: [moneyRewards[0], moneyRewards[2]],
};

/** Points and store credit together: the buyer chooses one. */
export const bothSourcesAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  storeCredit: {
    availableAmount: uah(150),
    pendingAmount: uah(0),
    nextExpiration: null,
  },
  sources: [pointsSource, storeCreditSource],
};

/** The top tier, with pending points and points that expire soon. */
export const expiringPointsAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  pendingPoints: '236',
  nextExpiration: {
    points: '300',
    expiresAt: new Date('2026-10-31T00:00:00Z'),
  },
  tier: { name: 'Platinum', earnMultiplierBps: 20_000, progress: null },
};

/** The program limits a redemption per order. */
export const limitedPointsAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  availablePoints: '5000',
  sources: [
    {
      ...pointsSource,
      availablePoints: '5000',
      availableAmount: uah(500),
      maximumPerOrder: { points: '2000', amount: uah(200) },
    },
  ],
};

/** Rewards worth money only. */
export const moneyRewardsAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  rewards: moneyRewards,
};

/** No balance to pay with, rewards only. */
export const rewardsOnlyAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  availablePoints: '40',
  sources: [],
  rewards,
};

/** Every kind of reward the checkout shows. */
export const allRewardsAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  rewards,
};

export const suspendedAccount: Checkout.LoyaltyAccount = {
  ...pointsAccount,
  status: 'SUSPENDED',
};

/** The most points the order allows, as the service applied them. */
export const maximumPointsRedemption: Checkout.LoyaltyRedemption = {
  source: 'POINTS',
  requestedPoints: null,
  requestedAmount: null,
  points: '1240',
  availablePoints: '1240',
  availableAmount: uah(124),
  discount: uah(124),
  expiresAt: null,
};

export const customPointsRedemption: Checkout.LoyaltyRedemption = {
  ...maximumPointsRedemption,
  requestedPoints: '500',
  points: '500',
  discount: uah(50),
};

export const storeCreditRedemption: Checkout.LoyaltyRedemption = {
  source: 'STORE_CREDIT',
  requestedPoints: null,
  requestedAmount: null,
  points: null,
  availablePoints: null,
  availableAmount: uah(150),
  discount: uah(150),
  expiresAt: null,
};

export const pointsSelection = (
  points: string | null = null
): Checkout.LoyaltySelection => ({
  source: 'POINTS',
  points,
  amount: null,
  rewardId: null,
});

export const rewardSelection = (
  rewardId: string
): Checkout.LoyaltySelection => ({
  source: null,
  points: null,
  amount: null,
  rewardId,
});

/** An issue of the loyalty selection, as the checkout calculation returns it. */
export const loyaltyIssue = (
  code: string,
  field: string[],
  overrides: Partial<Checkout.Issue> = {}
): Checkout.Issue => ({
  code,
  message: '',
  severity: 'WARNING',
  effect: 'CONTINUE',
  field,
  lineId: null,
  retryable: false,
  ...overrides,
});

export const earning: Checkout.LoyaltyEarning = {
  state: 'AVAILABLE',
  points: '236',
  amount: null,
  headline: 'You will earn +236 points',
  description: null,
};

export const guestEarning: Checkout.LoyaltyEarning = {
  state: 'AUTHENTICATION_REQUIRED',
  points: '236',
  amount: null,
  headline: 'Sign in to earn +236 points',
  description: 'Points arrive after the order is delivered.',
};

/** Cashback of a store credit program: money, not points. */
export const cashbackEarning: Checkout.LoyaltyEarning = {
  state: 'AVAILABLE',
  points: '0',
  amount: uah(49),
  headline: 'You will get UAH 49 cashback',
  description: null,
};

/** Points and cashback together. */
export const pointsAndCashbackEarning: Checkout.LoyaltyEarning = {
  state: 'AVAILABLE',
  points: '236',
  amount: uah(49),
  headline: 'You will earn +236 points and UAH 49 cashback',
  description: null,
};

export const guestCashbackEarning: Checkout.LoyaltyEarning = {
  state: 'AUTHENTICATION_REQUIRED',
  points: '0',
  amount: uah(49),
  headline: 'Sign in to get UAH 49 cashback',
  description: 'Cashback is credited to your store credit after delivery.',
};
