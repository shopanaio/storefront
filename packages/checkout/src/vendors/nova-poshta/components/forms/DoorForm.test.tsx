import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { NovaPoshtaDirectory } from '../../api/carrier';
import { NovaPoshtaDirectoryProvider } from '../../api/directory';
import { DoorForm } from './DoorForm';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';
const CITY = '8d5a980d-391c-11dd-90d9-001a92567626';

const address = {
  addressId: 'a1',
  countryCode: 'UA',
  address1: null,
  address2: null,
  postalCode: null,
  provinceCode: null,
  city: 'Київ',
  data: {
    carriers: { 'nova-poshta': { settlementRef: SETTLEMENT, cityRef: CITY } },
  },
};

/** No street is searched for in these tests. */
const directory: NovaPoshtaDirectory = {
  settlements: () => Promise.reject(new Error('Not expected')),
  warehouses: () => Promise.reject(new Error('Not expected')),
  streets: async () => [],
};

const doorForm = (data: unknown, onSubmit: (data: unknown) => void) => (
  <NovaPoshtaDirectoryProvider directory={directory}>
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <DoorForm data={data} onSubmit={onSubmit} deliveryAddress={address} />
    </NextIntlClientProvider>
  </NovaPoshtaDirectoryProvider>
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
      cityRef: CITY,
      building: '12',
      apartment: '5',
      comment: 'Call me',
    });

    first.unmount();
    render(doorForm(draft, onSubmit));
    expect(
      screen
        .getAllByRole('textbox')
        .map((input) => (input as HTMLInputElement).value)
    ).toEqual(['12', '5', 'Call me']);
  });
});
