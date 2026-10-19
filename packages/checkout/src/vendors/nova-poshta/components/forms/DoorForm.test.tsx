import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { DoorForm } from './DoorForm';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';

const address = {
  addressId: 'a1',
  countryCode: 'UA',
  address1: null,
  address2: null,
  postalCode: null,
  provinceCode: null,
  city: 'Київ',
  data: { carriers: { 'nova-poshta': { settlementRef: SETTLEMENT } } },
};

const doorForm = (data: unknown, onSubmit: (data: unknown) => void) => (
  <MockedProvider mocks={[]}>
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <DoorForm data={data} onSubmit={onSubmit} deliveryAddress={address} />
    </NextIntlClientProvider>
  </MockedProvider>
);

describe('DoorForm', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('SC-fobt: keeps building, apartment and comment typed before the street after a remount', () => {
    const onSubmit = vi.fn();
    const first = render(doorForm(undefined, onSubmit));
    const [building, apartment, comment] = screen.getAllByRole('textbox');
    fireEvent.change(building, { target: { value: '12' } });
    fireEvent.change(apartment, { target: { value: '5' } });
    fireEvent.change(comment, { target: { value: 'Call me' } });

    const draft = onSubmit.mock.lastCall?.[0];
    expect(draft).toEqual({
      type: 'DOOR',
      settlementRef: SETTLEMENT,
      building: '12',
      apartment: '5',
      comment: 'Call me',
    });

    first.unmount();
    render(doorForm(draft, onSubmit));
    expect(screen.getAllByRole('textbox').map((input) => (input as HTMLInputElement).value)).toEqual(
      ['12', '5', 'Call me']
    );
  });
});
