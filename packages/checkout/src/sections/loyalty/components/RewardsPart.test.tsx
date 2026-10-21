import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { Checkout } from '#checkout/types/entity';
import { RewardsPart } from './RewardsPart';

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ setLoyaltyReward: vi.fn() }),
}));

const reward = (overrides: Partial<Checkout.LoyaltyReward>): Checkout.LoyaltyReward => ({
  id: 'reward',
  kind: 'VOUCHER',
  headline: '100 UAH voucher',
  description: null,
  validUntil: null,
  voucherCode: null,
  ...overrides,
});

describe('RewardsPart', () => {
  it('SC-fz02: shows a free shipping reward without an apply button', () => {
    render(
      <NextIntlClientProvider
        locale="en"
        messages={{
          Checkout: {
            'loyalty-rewards-title': 'My rewards',
            'loyalty-reward-automatic': 'Applied to shipping automatically',
            apply: 'Apply',
          },
        }}
      >
        <RewardsPart
          rewards={[
            reward({ id: 'reward-ship', kind: 'FREE_SHIPPING', headline: 'Free delivery' }),
            reward({ id: 'reward-voucher' }),
          ]}
          appliedId={null}
          appliedProblem={null}
        />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Free delivery')).toBeInTheDocument();
    expect(screen.getByText('Applied to shipping automatically')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Apply' })).toHaveLength(1);
  });
});
