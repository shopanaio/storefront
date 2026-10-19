import { fireEvent, render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { NextIntlClientProvider } from 'next-intl';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { CitySelect } from './CitySelect';

const KYIV = 'e718a680-4b33-11e4-ab6d-005056801329';

const renderSelect = (onSubmit: () => void) =>
  render(
    <MockedProvider mocks={[]}>
      <NextIntlClientProvider locale="uk" messages={{}} onError={() => {}}>
        <CitySelect city={{ name: 'Київ', settlementRef: KYIV }} onSubmit={onSubmit} />
      </NextIntlClientProvider>
    </MockedProvider>
  );

describe('CitySelect', () => {
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

  it('SC-fobt: picking the same city again saves nothing', async () => {
    const onSubmit = vi.fn();
    renderSelect(onSubmit);
    fireEvent.click(screen.getByRole('button', { name: /Київ/ }));
    // The search field opens with the city name; clearing it shows the popular cities.
    fireEvent.change(await screen.findByDisplayValue('Київ'), { target: { value: '' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Київ' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('saves another city', async () => {
    const onSubmit = vi.fn();
    renderSelect(onSubmit);
    fireEvent.click(screen.getByRole('button', { name: /Київ/ }));
    fireEvent.change(await screen.findByDisplayValue('Київ'), { target: { value: '' } });
    fireEvent.click(await screen.findByRole('button', { name: 'Львів' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Львів' }));
  });
});
