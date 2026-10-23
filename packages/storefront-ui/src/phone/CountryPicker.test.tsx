import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StorefrontUIProvider } from '../StorefrontUIProvider';
import { CountryPicker } from './CountryPicker';

afterEach(cleanup);

const countries = ['DE', 'PL', 'UA'] as const;

const renderOpen = (onChange = vi.fn()) => {
  render(
    <CountryPicker value="UA" onChange={onChange} countries={countries} open />
  );
  return { onChange, search: screen.getByRole('combobox') };
};

const activeOption = (search: HTMLElement) =>
  document.getElementById(search.getAttribute('aria-activedescendant') ?? '');

describe('CountryPicker', () => {
  it('is a combobox over a list of options that are not tabbable', () => {
    const { search } = renderOpen();
    const list = screen.getByRole('listbox');
    expect(search).toHaveAttribute('aria-controls', list.id);
    expect(search).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    for (const option of options) {
      expect(option.id).not.toBe('');
      expect(option).not.toHaveAttribute('tabindex');
      expect(option.querySelector('button')).toBeNull();
    }
    // The selected country leads the list.
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(activeOption(search)).toBe(options[0]);
  });

  it('moves through the countries with the arrows, Home and End', () => {
    const { search } = renderOpen();
    const options = screen.getAllByRole('option');
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    expect(activeOption(search)).toBe(options[1]);
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    // It stops at the last one.
    expect(activeOption(search)).toBe(options[2]);
    fireEvent.keyDown(search, { key: 'ArrowUp' });
    expect(activeOption(search)).toBe(options[1]);
    fireEvent.keyDown(search, { key: 'Home' });
    expect(activeOption(search)).toBe(options[0]);
    fireEvent.keyDown(search, { key: 'End' });
    expect(activeOption(search)).toBe(options[2]);
  });

  it('picks the highlighted country with Enter', () => {
    const { search, onChange } = renderOpen();
    // Ukraine (selected), then Germany and Poland by name.
    fireEvent.keyDown(search, { key: 'ArrowDown' });
    expect(activeOption(search)).toHaveTextContent('Germany');
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('DE');
  });

  it('starts over from the first match as the buyer types', () => {
    const { search, onChange } = renderOpen();
    fireEvent.keyDown(search, { key: 'End' });
    fireEvent.change(search, { target: { value: 'pol' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('PL');
  });

  it('names the trigger from the texts of the provider', () => {
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
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
