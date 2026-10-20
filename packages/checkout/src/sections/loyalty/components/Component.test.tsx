import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { Checkout } from '#checkout/types/entity';
import { LoyaltySectionView } from './Component';

const uah = (amount: number) => ({ amount, currencyCode: 'UAH' });

const state = vi.hoisted(() => ({
  checkout: null as unknown,
  account: null as unknown,
}));
const api = vi.hoisted(() => ({
  setLoyaltyRedemption: vi.fn(),
  setLoyaltyReward: vi.fn(),
}));

vi.mock('#checkout/context/CheckoutApiContext', () => ({ useCheckoutApi: () => api }));
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ checkout: state.checkout }),
}));
vi.mock('#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount', () => ({
  useLoyaltyAccount: () => ({
    account: state.account,
    loading: false,
    failed: false,
    refetch: vi.fn(),
  }),
}));

const account: Checkout.LoyaltyAccount = {
  id: 'account-1',
  status: 'ACTIVE',
  availablePoints: '1240',
  pendingPoints: '0',
  tier: { name: 'Gold', earnMultiplierBps: 15_000, progress: '1 200 more to Platinum' },
  nextExpiration: null,
  sources: [
    {
      source: 'POINTS',
      availablePoints: '1240',
      availableAmount: uah(124),
      minimum: { points: '100', amount: uah(10) },
      maximumPerOrder: null,
    },
  ],
  rewards: [
    {
      id: 'reward-ship',
      kind: 'FREE_SHIPPING',
      headline: 'Free delivery',
      description: null,
      validUntil: null,
      voucherCode: null,
    },
  ],
};

const checkout = (overrides: Partial<Checkout.Checkout> = {}) =>
  ({
    id: 'checkout-1',
    currencyCode: 'UAH',
    issues: [],
    customerIdentity: { customer: { id: 'customer-1' } },
    loyaltyRedemption: null,
    loyaltyRewardId: null,
    ...overrides,
  }) as unknown as Checkout.Checkout;

const view = (data: Parameters<typeof LoyaltySectionView>[0]['data']) => (
  <NextIntlClientProvider
    locale="en"
    messages={{
      Checkout: {
        'loyalty-title': 'Rewards',
        'loyalty-points': '{count, plural, one {{points} point} other {{points} points}}',
        'loyalty-tier': '{tier} · {multiplier}',
        'loyalty-redeem-points': 'Redeem points',
        'loyalty-available': 'Balance: {balance}',
        'loyalty-redeemed-points': 'Redeemed {points} · −{amount}',
        'loyalty-redeemed-maximum': "That's the most.",
        'loyalty-change-amount': 'Change amount',
        'loyalty-rewards-title': 'My rewards',
        'loyalty-reward-remove': 'Remove',
        apply: 'Apply',
      },
    }}
    onError={() => {}}
  >
    <LoyaltySectionView data={data} invalidate={() => {}} />
  </NextIntlClientProvider>
);

describe('LoyaltySectionView', () => {
  beforeEach(() => {
    api.setLoyaltyRedemption.mockReset().mockResolvedValue(undefined);
    api.setLoyaltyReward.mockReset().mockResolvedValue(undefined);
    state.account = account;
  });

  it('shows nothing to a guest', () => {
    state.checkout = checkout();
    const { container } = render(
      view({ signedIn: false, redemption: null, rewardId: null })
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the balance and tier, and applies the maximum when switched on', () => {
    state.checkout = checkout();
    render(view({ signedIn: true, redemption: null, rewardId: null }));

    expect(screen.getByText('1,240 points')).toBeInTheDocument();
    expect(screen.getByText('Gold · ×1.5')).toBeInTheDocument();
    expect(screen.getByText('Balance: 1,240 points')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Redeem points' }));
    expect(api.setLoyaltyRedemption).toHaveBeenCalledWith({ source: 'POINTS', points: null });
  });

  it('shows the applied redemption and replaces nothing when a reward is applied', () => {
    const applied: Checkout.LoyaltyRedemption = {
      source: 'POINTS',
      requestedPoints: null,
      requestedAmount: null,
      points: '500',
      availablePoints: '1240',
      availableAmount: uah(124),
      discount: uah(50),
      expiresAt: null,
    };
    state.checkout = checkout({ loyaltyRedemption: applied });
    render(view({ signedIn: true, redemption: applied, rewardId: null }));

    expect(screen.getByText(/Redeemed 500 points/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(api.setLoyaltyReward).toHaveBeenCalledWith(
      { id: 'reward-ship', voucherCode: null },
      null
    );
  });
});
