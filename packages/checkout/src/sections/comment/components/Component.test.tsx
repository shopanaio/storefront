import { act, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { flushPendingInputs } from '#checkout/state/pendingInputs';
import { CommentSectionView } from './Component';

const mocks = vi.hoisted(() => ({ updateCustomerNote: vi.fn() }));

vi.mock('#checkout/context/CheckoutApiContext', () => ({
  useCheckoutApi: () => ({ updateCustomerNote: mocks.updateCustomerNote }),
}));

const view = (note: string) => (
  <NextIntlClientProvider
    locale="en"
    messages={{ Checkout: { 'order-note': 'Order note' } }}
    onError={() => {}}
  >
    <CommentSectionView data={{ note }} />
  </NextIntlClientProvider>
);

describe('CommentSectionView', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mocks.updateCustomerNote.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('SC-u63p: a failed save keeps the typed note and saves it again', async () => {
    mocks.updateCustomerNote
      .mockRejectedValueOnce(new Error('Failed to fetch'))
      .mockResolvedValue(undefined);
    const { rerender } = render(view('Call me'));
    fireEvent.change(screen.getByLabelText('Order note'), {
      target: { value: 'Call me before noon' },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(mocks.updateCustomerNote).toHaveBeenCalledTimes(1);

    // A checkout answer still carries the old note.
    rerender(view('Call me'));
    expect(screen.getByLabelText('Order note')).toHaveValue('Call me before noon');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500);
    });
    expect(mocks.updateCustomerNote).toHaveBeenCalledTimes(2);
    expect(mocks.updateCustomerNote).toHaveBeenLastCalledWith({ note: 'Call me before noon' });
    expect(screen.getByLabelText('Order note')).toHaveValue('Call me before noon');
  });

  it('sends the note being typed at once when the order is placed', () => {
    mocks.updateCustomerNote.mockResolvedValue(undefined);
    render(view('Call me'));
    fireEvent.change(screen.getByLabelText('Order note'), { target: { value: 'Ring twice' } });

    flushPendingInputs();

    expect(mocks.updateCustomerNote).toHaveBeenCalledWith({ note: 'Ring twice' });
  });
});
