'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { getCountryCallingCode } from 'react-phone-number-input';
import type { Country, Labels } from 'react-phone-number-input';
import en from 'react-phone-number-input/locale/en';

export type { Country };

/**
 * Country names of the library by language, loaded on first use, each its own chunk; Ukrainian
 * is its `ua` file. English is bundled: it is the fallback of every other language.
 */
const LOADERS: Record<string, () => Promise<{ default: Labels }>> = {
  ru: () => import('react-phone-number-input/locale/ru'),
  uk: () => import('react-phone-number-input/locale/ua'),
  ua: () => import('react-phone-number-input/locale/ua'),
};

const loaded = new Map<string, Labels>([['en', en]]);
const pending = new Map<string, Promise<Labels>>();
const listeners = new Set<() => void>();

const languageOf = (locale: string) =>
  locale.split('-')[0]?.toLowerCase() ?? '';

/** Loads the country names of a locale (`uk`, `uk-UA`, `ru`, `en`); English for any other. */
export function loadCountryLabels(locale: string): Promise<Labels> {
  const language = languageOf(locale);
  const ready = loaded.get(language);
  if (ready) return Promise.resolve(ready);
  const load = LOADERS[language];
  if (!load) return Promise.resolve(en);
  let request = pending.get(language);
  if (!request) {
    request = load().then(
      (module) => {
        loaded.set(language, module.default);
        pending.delete(language);
        listeners.forEach((listener) => listener());
        return module.default;
      },
      () => {
        pending.delete(language);
        return en;
      }
    );
    pending.set(language, request);
  }
  return request;
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Country names of a locale: English until its names are loaded (and on the server, so the
 * first render matches it), then the locale's.
 */
export function useCountryLabels(locale: string): Labels {
  const language = languageOf(locale);
  useEffect(() => {
    void loadCountryLabels(language);
  }, [language]);
  return useSyncExternalStore(
    subscribe,
    () => loaded.get(language) ?? en,
    () => en
  );
}

export interface CountryOption {
  country: Country;
  name: string;
  callingCode: string;
}

/** Countries of the picker: the selected one first, then the rest by name in the locale. */
export function countryOptions({
  countries,
  labels,
  locale,
  selected,
}: {
  countries: readonly Country[];
  labels: Labels;
  locale: string;
  selected?: Country;
}): CountryOption[] {
  const options = countries.map((country) => ({
    country,
    name: labels[country] ?? country,
    callingCode: getCountryCallingCode(country),
  }));
  const collator = new Intl.Collator(locale);
  return options.sort((a, b) => {
    if (a.country === selected) return -1;
    if (b.country === selected) return 1;
    return collator.compare(a.name, b.name);
  });
}
