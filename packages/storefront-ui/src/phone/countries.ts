import { getCountryCallingCode } from 'react-phone-number-input';
import type { Country, Labels } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';
import ru from 'react-phone-number-input/locale/ru';
import ua from 'react-phone-number-input/locale/ua';

export type { Country };

/** Country names of the library by language; Ukrainian is its `ua` file. */
const LABELS: Record<string, Labels> = { en, ru, uk: ua, ua };

/** Country names for a locale (`uk`, `uk-UA`, `ru`, `en`), English for any other. */
export function countryLabels(locale: string): Labels {
  const language = locale.split('-')[0]?.toLowerCase() ?? '';
  return LABELS[language] ?? en;
}

export interface CountryOption {
  country: Country;
  name: string;
  callingCode: string;
}

/**
 * Countries of the picker: the selected one first, then the rest by name in the locale. With a
 * query, only those whose name or calling code contains it (`пол`, `48`, `+48`).
 */
export function countryOptions({
  countries,
  labels,
  locale,
  selected,
  query = '',
}: {
  countries: readonly Country[];
  labels: Labels;
  locale: string;
  selected?: Country;
  query?: string;
}): CountryOption[] {
  const options = countries.map((country) => ({
    country,
    name: labels[country] ?? country,
    callingCode: getCountryCallingCode(country),
  }));
  const collator = new Intl.Collator(locale);
  options.sort((a, b) => {
    if (a.country === selected) return -1;
    if (b.country === selected) return 1;
    return collator.compare(a.name, b.name);
  });
  const text = query.trim().toLocaleLowerCase(locale);
  if (!text) return options;
  const digits = text.replace(/^\+/, '');
  return options.filter(
    (option) =>
      option.name.toLocaleLowerCase(locale).includes(text) ||
      (/^\d+$/.test(digits) && option.callingCode.startsWith(digits))
  );
}
