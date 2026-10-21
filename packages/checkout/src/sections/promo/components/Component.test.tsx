import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { PromoSectionView } from './Component';
import { usePromoDraft } from '../draft';
import type { PromoFormData } from '../types';

const api = vi.hoisted(() => ({
  addPromoCode: vi.fn<(input: { code: string }) => Promise<void>>(),
  removePromoCode: vi.fn<(input: { code: string }) => Promise<void>>(),
}));

vi.mock('#checkout/context/CheckoutApiContext', () => ({ useCheckoutApi: () => api }));
vi.mock('#checkout/context/CheckoutDataContext', () => ({
  useCheckoutData: () => ({ checkout: null }),
}));
vi.mock('#checkout/hooks/useLoyaltyAccount/useLoyaltyAccount', () => ({
  useLoyaltyAccount: () => ({ account: null }),
}));
vi.mock('#checkout/ui/useConfirm', () => ({ useConfirm: () => vi.fn() }));
vi.mock('#checkout/components/notices/SectionIssues', () => ({ SectionIssues: () => null }));

const view = (data: PromoFormData = { codes: [] }) => (
  <NextIntlClientProvider
    locale="en"
    messages={{
      Checkout: {
        'coupon-code': 'Promo code',
        apply: 'Apply',
        'promo-pending': 'Waits for a condition',
        'promo-rejected': 'Not applied',
      },
    }}
    onError={() => {}}
  >
    <PromoSectionView data={data} invalidate={() => {}} />
  </NextIntlClientProvider>
);

describe('PromoSectionView', () => {
  beforeEach(() => {
    api.addPromoCode.mockReset().mockResolvedValue(undefined);
    api.removePromoCode.mockReset().mockResolvedValue(undefined);
    usePromoDraft.setState({ code: '' });
  });

  it('SC-slxn: the code being typed survives the summary leaving the page during a renewal', () => {
    const first = render(view());
    fireEvent.change(screen.getByLabelText('Promo code'), { target: { value: 'WELCOME' } });

    // The summary is not rendered while the renewed checkout loads.
    first.unmount();
    render(view());

    expect(screen.getByLabelText('Promo code')).toHaveValue('WELCOME');
  });

  it('SC-08s8: a code the pricing stopped applying stays listed with the reason', async () => {
    const { rerender } = render(
      view({ codes: [{ code: 'SAVE10', status: 'APPLIED', message: null }] })
    );
    rerender(
      view({
        codes: [{ code: 'SAVE10', status: 'REJECTED', message: 'Spend $50 more to use it' }],
      })
    );

    expect(within(screen.getByRole('list')).getByText('SAVE10')).toBeInTheDocument();
    expect(screen.getByText('Spend $50 more to use it')).toBeInTheDocument();
    expect(api.removePromoCode).not.toHaveBeenCalled();
  });

  it('SC-08s8: a code added but not applied is kept, and the field is cleared', async () => {
    render(view());
    fireEvent.change(screen.getByLabelText('Promo code'), { target: { value: 'SAVE10' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    });

    expect(api.addPromoCode).toHaveBeenCalledWith({ code: 'SAVE10' });
    expect(api.removePromoCode).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Promo code')).toHaveValue('');
  });

  it('SC-2t9f: a delivery code entered before the delivery is shown as pending', () => {
    render(view({ codes: [{ code: 'FREESHIP', status: 'PENDING', message: null }] }));

    expect(within(screen.getByRole('list')).getByText('FREESHIP')).toBeInTheDocument();
    expect(screen.getByText('Waits for a condition')).toBeInTheDocument();
    expect(api.removePromoCode).not.toHaveBeenCalled();
  });
});
