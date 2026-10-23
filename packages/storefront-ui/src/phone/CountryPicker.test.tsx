import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { StorefrontUIProvider } from '../StorefrontUIProvider';
import { CountryPicker } from './CountryPicker';

afterEach(cleanup);

const countries = ['DE', 'PL', 'UA'] as const;

/** Desktop and phone widths: `lg` and up gets the popover, below it the native select. */
const setWidth = (desktop: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: !desktop && query.includes('max-width'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

const renderOpen = (onChange = vi.fn()) => {
  setWidth(true);
  render(
    <CountryPicker value="UA" onChange={onChange} countries={countries} open />
  );
  return { onChange, list: screen.getByRole('listbox') };
};

const activeOption = (list: HTMLElement) =>
  document.getElementById(list.getAttribute('aria-activedescendant') ?? '');

describe('CountryPicker on a desktop', () => {
  it('opens a focused list of options without a search field', async () => {
    const { list } = renderOpen();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(list));
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    for (const option of options) {
      expect(option).not.toHaveAttribute('tabindex');
    }
    // The selected country leads the list.
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(activeOption(list)).toBe(options[0]);
  });

  it('moves through the countries with the arrows, Home and End', () => {
    const { list } = renderOpen();
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    expect(activeOption(list)).toBe(options[1]);
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    // It stops at the last one.
    expect(activeOption(list)).toBe(options[2]);
    fireEvent.keyDown(list, { key: 'Home' });
    expect(activeOption(list)).toBe(options[0]);
    fireEvent.keyDown(list, { key: 'End' });
    expect(activeOption(list)).toBe(options[2]);
  });

  it('jumps to a name by its first letters and picks it with Enter', () => {
    const { list, onChange } = renderOpen();
    fireEvent.keyDown(list, { key: 'p' });
    expect(activeOption(list)).toHaveTextContent('Poland');
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('PL');
  });

  it('names the trigger from the texts of the provider', () => {
    setWidth(true);
    render(
      <StorefrontUIProvider
        texts={{
          countryPicker: {
            trigger: (country, code) => `${country} (+${code})`,
          },
        }}
      >
        <CountryPicker value="UA" onChange={vi.fn()} countries={countries} />
      </StorefrontUIProvider>
    );
    const trigger = screen.getByRole('button', { name: 'Ukraine (+380)' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  });
});

describe('CountryPicker on a phone or a tablet', () => {
  it('is the native select of the device', () => {
    setWidth(false);
    const onChange = vi.fn();
    render(
      <CountryPicker value="UA" onChange={onChange} countries={countries} />
    );
    const select = screen.getByRole('combobox', {
      name: 'Country: Ukraine, +380',
    });
    expect(select.tagName).toBe('SELECT');
    expect(screen.queryByRole('button')).toBeNull();
    // By name, with the calling code.
    expect(
      screen.getAllByRole('option').map((option) => option.textContent)
    ).toEqual(['Germany (+49)', 'Poland (+48)', 'Ukraine (+380)']);
    fireEvent.change(select, { target: { value: 'PL' } });
    expect(onChange).toHaveBeenCalledWith('PL');
  });
});
