import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { CheckoutThemeProvider } from '#checkout/theme';
import type { CheckoutThemeAdapter } from '#checkout/theme';
import { CheckoutResult } from './CheckoutResult';
import { PaymentPendingScreen } from './PaymentPendingScreen';

const navigation = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('@shopana/storefront/navigation', () => ({
  useRouter: () => navigation,
}));
vi.mock('#checkout/hooks/usePlacedOrderNumber', () => ({
  usePlacedOrderNumber: () => ({
    number: '1001',
    loyalty: null,
    loading: false,
  }),
}));

const theme: CheckoutThemeAdapter = {
  useHomePath: () => '/uk',
  useOrderPath: (id) => `/orders/${id}`,
  OrderPlaced: ({ orderNumber, statusText, paid, onViewOrder, details }) => (
    <section aria-label="Themed order">
      {orderNumber} {statusText} {paid ? 'settled' : 'unsettled'}
      {details}
      <button onClick={() => onViewOrder?.()}>Open order</button>
    </section>
  ),
  PaymentPending: ({ redirecting, title, description, onGoHome }) => (
    <section aria-label="Themed payment">
      {redirecting ? 'redirect' : 'wait'} {title} {description}
      <button onClick={onGoHome}>Home</button>
    </section>
  ),
};

function wrap(children: React.ReactNode) {
  return (
    <NextIntlClientProvider
      locale="en"
      messages={{
        Checkout: {
          'payment-status-paid': 'Paid',
          'view-order': 'View order',
          'go-home': 'Home',
          'awaiting-payment-title': 'Awaiting payment',
          'awaiting-payment-description': 'We will update the status',
          'redirecting-to-payment': 'Going to payment',
        },
      }}
    >
      <CheckoutThemeProvider theme={theme}>{children}</CheckoutThemeProvider>
    </NextIntlClientProvider>
  );
}

it('uses the themed order view with the order status and navigation', () => {
  render(
    wrap(<CheckoutResult orderId="order-1" orderNumber={null} status="PAID" />)
  );
  expect(
    screen.getByRole('region', { name: 'Themed order' })
  ).toHaveTextContent('1001 Paid settled');
  fireEvent.click(screen.getByText('Open order'));
  expect(navigation.push).toHaveBeenCalledWith('/orders/order-1');
});

it('uses the themed waiting view for both waiting and provider redirects', () => {
  const view = render(wrap(<PaymentPendingScreen />));
  expect(
    screen.getByRole('region', { name: 'Themed payment' })
  ).toHaveTextContent('wait Awaiting payment We will update the status');
  fireEvent.click(screen.getByText('Home'));
  expect(navigation.push).toHaveBeenCalledWith('/uk');
  view.rerender(wrap(<PaymentPendingScreen redirecting />));
  expect(
    screen.getByRole('region', { name: 'Themed payment' })
  ).toHaveTextContent('redirect Going to payment');
  expect(
    screen.queryByText('We will update the status')
  ).not.toBeInTheDocument();
});
