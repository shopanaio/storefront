import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { Checkout } from '#checkout/types/entity';
import { CheckoutResult, loyaltySpent } from './CheckoutResult';

const placed = vi.hoisted(() => ({
  value: { number: '1001', loyalty: null as unknown, loading: false },
}));

vi.mock('@shopana/storefront/next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock('#checkout/theme', () => ({
  useCheckoutTheme: () => ({ useHomePath: () => '/' }),
}));
vi.mock('#checkout/hooks/usePlacedOrderNumber', () => ({
  usePlacedOrderNumber: () => placed.value,
}));
vi.mock('#checkout/components/result/PlacementScreen', () => ({
  PlacementScreen: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const estimate: Checkout.LoyaltyEarning = {
  state: 'AVAILABLE',
  points: '150',
  amount: null,
  headline: 'We will add +150 points',
  description: null,
};

const view = () => (
  <NextIntlClientProvider
    locale="en"
    messages={{
      Checkout: {
        'order-placed-title': 'Order placed',
        'order-number': 'Order {number}',
        'payment-status-paid': 'Paid',
        'go-home': 'Home',
        'loyalty-points': '{count, plural, one {{points} point} other {{points} points}}',
        'result-loyalty-earned-points': 'Earned +{points}',
      },
    }}
    onError={() => {}}
  >
    <CheckoutResult orderId="order-1" orderNumber="1001" status="PAID" earningEstimate={estimate} />
  </NextIntlClientProvider>
);

describe('CheckoutResult', () => {
  it('V2: shows the checkout estimate until the order earning is recorded', () => {
    placed.value = { number: '1001', loyalty: null, loading: false };
    const { rerender } = render(view());
    expect(screen.getByText('We will add +150 points')).toBeInTheDocument();

    placed.value = {
      number: '1001',
      loyalty: {
        redemption: null,
        earning: { points: '150', amount: null, status: 'PENDING' },
      },
      loading: false,
    };
    rerender(view());
    expect(screen.queryByText('We will add +150 points')).not.toBeInTheDocument();
    expect(screen.getByText('Earned +150 points')).toBeInTheDocument();
  });

  it('S8: treats the tender as spent once placement commits it', () => {
    expect(loyaltySpent('PAID', 'ONLINE')).toBe(true);
    expect(loyaltySpent('AUTHORIZED', 'ONLINE')).toBe(true);
    expect(loyaltySpent('PAYMENT_NOT_REQUIRED', null)).toBe(true);
    expect(loyaltySpent('PAYMENT_PENDING', 'ON_DELIVERY')).toBe(true);
    expect(loyaltySpent('PAYMENT_PENDING', 'OFFLINE')).toBe(false);
    expect(loyaltySpent('REQUIRES_ACTION', 'OFFLINE')).toBe(false);
  });
});
