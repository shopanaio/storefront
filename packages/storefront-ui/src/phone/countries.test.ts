import { countryOptions, loadCountryLabels } from './countries';

const countries = ['DE', 'PL', 'UA', 'LT'] as const;

it('puts the selected country first and the rest by name of the locale', async () => {
  const options = countryOptions({
    countries,
    labels: await loadCountryLabels('uk'),
    locale: 'uk',
    selected: 'UA',
  });
  expect(options.map((option) => option.country)).toEqual([
    'UA',
    'LT',
    'DE',
    'PL',
  ]);
  expect(options[0]).toMatchObject({ name: 'Україна', callingCode: '380' });
});

it('falls back to English names', async () => {
  expect((await loadCountryLabels('fr')).UA).toBe('Ukraine');
  expect((await loadCountryLabels('ru')).UA).toBe('Украина');
});
