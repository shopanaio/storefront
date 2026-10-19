import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { RecipientFormData } from '../types';
import { RecipientSectionView } from './Component';

const mocks = vi.hoisted(() => ({ saveDeliveryRecipient: vi.fn() }));

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ saveDeliveryRecipient: mocks.saveDeliveryRecipient }),
}));
vi.mock('#checkout/components/contact/ContactSelect', () => ({
  ContactSelect: () => <div>recipient form</div>,
}));

const self = (groups: string[]): RecipientFormData => ({
  self: true,
  deliveryGroupIds: groups,
  groupIdsWithoutRecipient: groups,
});
const other = (groups: string[]): RecipientFormData => ({
  self: false,
  deliveryGroupIds: groups,
  groupIdsWithoutRecipient: [],
  firstName: 'Olena',
  lastName: 'Koval',
  middleName: '',
  phone: '+380501112233',
});

const view = (data: RecipientFormData) => (
  <NextIntlClientProvider locale="en" messages={{ Checkout: {} }} onError={() => {}}>
    <RecipientSectionView data={data} />
  </NextIntlClientProvider>
);

describe('RecipientSectionView', () => {
  beforeEach(() => {
    mocks.saveDeliveryRecipient.mockReset().mockResolvedValue(undefined);
  });

  it('SC-ixhj: a regrouping of the delivery keeps the switch and the form of another recipient', async () => {
    const { rerender } = render(view(self(['g1'])));
    fireEvent.click(screen.getByRole('switch'));
    await act(async () => undefined);
    expect(screen.getByText('recipient form')).toBeInTheDocument();
    rerender(view(other(['g1'])));

    // The lines are split again: the new group has no recipient on the server yet.
    rerender(view(self(['g2'])));
    await act(async () => undefined);

    expect(screen.getByRole('switch')).toBeChecked();
    expect(screen.getByText('recipient form')).toBeInTheDocument();
    // The new group gets the recipient the buyer saved before.
    expect(mocks.saveDeliveryRecipient).toHaveBeenLastCalledWith({
      firstName: 'Olena',
      lastName: 'Koval',
      middleName: '',
      phone: '+380501112233',
    });
  });

  it('removes the recipient when the buyer receives the order', async () => {
    render(view(other(['g1'])));
    fireEvent.click(screen.getByRole('switch'));
    await act(async () => undefined);
    expect(mocks.saveDeliveryRecipient).toHaveBeenCalledWith(null);
    expect(screen.queryByText('recipient form')).toBeNull();
  });
});
