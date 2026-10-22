import { countryLabels, countryOptions } from './countries';

const countries = ['DE', 'PL', 'UA', 'LT'] as const;

it('puts the selected country first and the rest by name of the locale', () => {
  const options = countryOptions({
    countries,
    labels: countryLabels('uk'),
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

it('finds countries by name or calling code', () => {
  const labels = countryLabels('uk-UA');
  const find = (query: string) =>
    countryOptions({ countries, labels, locale: 'uk', query }).map(
      (option) => option.country
    );
  expect(find('пол')).toEqual(['PL']);
  expect(find('+48')).toEqual(['PL']);
  expect(find('49')).toEqual(['DE']);
});

it('falls back to English names', () => {
  expect(countryLabels('fr').UA).toBe('Ukraine');
  expect(countryLabels('ru').UA).toBe('Украина');
});
