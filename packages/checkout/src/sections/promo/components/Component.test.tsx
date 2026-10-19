import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PromoSectionView } from './Component';

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ addPromoCode: vi.fn(), removePromoCode: vi.fn() }),
}));
vi.mock('#checkout/theme', () => ({ useCheckoutTheme: () => ({ LoyaltySlot: null }) }));
vi.mock('#checkout/ui/useConfirm', () => ({ useConfirm: () => vi.fn() }));
vi.mock('#checkout/components/notices/SectionIssues', () => ({ SectionIssues: () => null }));

const view = () => (
  <NextIntlClientProvider
    locale="en"
    messages={{ Checkout: { 'coupon-code': 'Promo code', apply: 'Apply' } }}
    onError={() => {}}
  >
    <PromoSectionView data={{ codes: [] }} invalidate={() => {}} />
  </NextIntlClientProvider>
);

describe('PromoSectionView', () => {
  it('SC-slxn: the code being typed survives the summary leaving the page during a renewal', () => {
    const first = render(view());
    fireEvent.change(screen.getByLabelText('Promo code'), { target: { value: 'WELCOME' } });

    // The summary is not rendered while the renewed checkout loads.
    first.unmount();
    render(view());

    expect(screen.getByLabelText('Promo code')).toHaveValue('WELCOME');
  });
});
