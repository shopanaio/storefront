import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { NovaPoshtaDirectory } from '../../api/carrier';
import { NovaPoshtaDirectoryProvider } from '../../api/directory';
import type { Street } from '../../types';
import { StreetAutocomplete, matchSegments } from './StreetAutocomplete';

const SETTLEMENT = 'e718a680-4b33-11e4-ab6d-005056801329';

const street = (ref: string, name: string): Street => ({
  ref,
  settlementRef: SETTLEMENT,
  name,
  present: `вул. ${name}`,
  streetType: 'вул.',
});

const KHRESHCHATYK = street('s1', 'Хрещатик');
const KHRESHCHATYTSKA = street('s2', 'Хрещатицька');

/** The directory finds both streets by "хре" in the settlement. */
const directory = (): NovaPoshtaDirectory => ({
  settlements: () => Promise.reject(new Error('Not expected')),
  warehouses: () => Promise.reject(new Error('Not expected')),
  streets: async ({ settlementRef, query }) =>
    settlementRef === SETTLEMENT && query === 'хре'
      ? [KHRESHCHATYK, KHRESHCHATYTSKA]
      : [],
});

/**
 * The menu item of a street, found by its text: jsdom gives `<mark>` no inline display, so the
 * accessible name it computes splits the highlighted word ("вул. Хре щатик").
 */
const findStreetItem = (present: string) =>
  screen.findByRole('menuitem', {
    name: (_, element) => element.textContent === present,
  });

const autocomplete = (
  changeStreet = vi.fn(),
  streetPresent: string | null = null
) => (
  <NovaPoshtaDirectoryProvider directory={directory()}>
    <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
      <StreetAutocomplete
        streetPresent={streetPresent}
        changeStreet={changeStreet}
        settlementRef={SETTLEMENT}
      />
    </NextIntlClientProvider>
  </NovaPoshtaDirectoryProvider>
);

describe('matchSegments', () => {
  it('marks every case-insensitive match of the search text', () => {
    expect(matchSegments('вул. Хрещатик', 'хре')).toEqual([
      { text: 'вул. ', match: false },
      { text: 'Хре', match: true },
      { text: 'щатик', match: false },
    ]);
    expect(matchSegments('аба', 'а')).toEqual([
      { text: 'а', match: true },
      { text: 'б', match: false },
      { text: 'а', match: true },
    ]);
  });

  it('leaves the text whole when nothing is typed', () => {
    expect(matchSegments('вул. Хрещатик', '  ')).toEqual([
      { text: 'вул. Хрещатик', match: false },
    ]);
  });
});

describe('StreetAutocomplete', () => {
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

  it('opens a menu of matching streets with the typed text highlighted', async () => {
    const changeStreet = vi.fn();
    render(autocomplete(changeStreet));
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'хре' } });

    const item = await findStreetItem('вул. Хрещатик');
    expect(item.querySelector('mark')?.textContent).toBe('Хре');

    fireEvent.click(item);
    expect(changeStreet).toHaveBeenCalledWith(KHRESHCHATYK);
  });

  it('picks the street chosen with the arrows on Enter', async () => {
    const changeStreet = vi.fn();
    render(autocomplete(changeStreet));
    const input = screen.getByRole('combobox');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'хре' } });
    await findStreetItem('вул. Хрещатицька');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(changeStreet).toHaveBeenCalledWith(KHRESHCHATYTSKA);
  });

  it('keeps the picked street when the field is left without a pick', () => {
    const changeStreet = vi.fn();
    render(autocomplete(changeStreet, 'вул. Хрещатик'));
    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'хре' } });
    expect(input.value).toBe('хре');

    fireEvent.blur(input);
    expect(input.value).toBe('вул. Хрещатик');
    expect(changeStreet).not.toHaveBeenCalled();
  });
});
