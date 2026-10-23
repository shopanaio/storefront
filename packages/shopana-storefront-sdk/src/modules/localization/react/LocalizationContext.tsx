'use client';

import { createContext, useCallback, useMemo, type ReactNode } from 'react';
import type { SdkLocalizationFragment } from '../../../graphql/apollo/generated/operations';
import {
  buildHref as buildLocalizedHref,
  splitLocaleFromPathname,
  type HrefTarget,
  type LocaleRouting,
} from '../core/href';
import { findStorefrontLocale, type StorefrontLocale } from '../core/locale';
import type {
  LocalePrefixMode,
  LocalizationState,
  StorefrontLocales,
} from '../core/types';

export const LocalizationContext = createContext<LocalizationState | null>(
  null
);

export interface LocalizationProviderProps {
  children: ReactNode;
  locale: StorefrontLocale;
  locales: StorefrontLocales;
  localePrefix: LocalePrefixMode;
  localization: SdkLocalizationFragment;
  timeZone: string;
}

export function LocalizationProvider({
  children,
  locale,
  locales,
  localePrefix,
  localization,
  timeZone,
}: LocalizationProviderProps) {
  const segments = useMemo(
    () => locales.locales.map((item) => item.segment),
    [locales.locales]
  );

  const routingFor = useCallback(
    (segment: string): LocaleRouting => ({
      locale: segment,
      defaultLocale: locales.defaultLocale.segment,
      locales: segments,
      localePrefix,
    }),
    [locales.defaultLocale.segment, localePrefix, segments]
  );

  const buildHref = useCallback(
    (target: HrefTarget, options?: { locale?: string }) => {
      const targetLocale = options?.locale
        ? findStorefrontLocale(locales.locales, options.locale)
        : locale;
      if (!targetLocale) {
        throw new Error(`Unsupported locale: ${options?.locale}`);
      }
      return buildLocalizedHref(target, routingFor(targetLocale.segment));
    },
    [locale, locales.locales, routingFor]
  );

  const stripLocale = useCallback(
    (pathname: string) => splitLocaleFromPathname(pathname, segments).pathname,
    [segments]
  );

  const switchLocale = useCallback(
    (value: string) => {
      const target = findStorefrontLocale(locales.locales, value);
      if (!target) throw new Error(`Unsupported locale: ${value}`);
      if (target.segment === locale.segment) return;

      const url = new URL(window.location.href);
      const href = buildLocalizedHref(
        `${stripLocale(url.pathname)}${url.search}${url.hash}`,
        routingFor(target.segment)
      );
      // The root layout, the Apollo cache and next-intl messages belong to one locale.
      window.location.assign(href);
    },
    [locale.segment, locales.locales, routingFor, stripLocale]
  );

  const value = useMemo<LocalizationState>(
    () => ({
      locale,
      defaultLocale: locales.defaultLocale,
      availableLanguages: locales.locales,
      localePrefix,
      market: localization.market,
      country: localization.country,
      currency: localization.currency,
      availableCountries: localization.availableCountries,
      availableCurrencies: localization.availableCurrencies,
      timeZone,
      intlLocale: locale.tag,
      buildHref,
      stripLocale,
      switchLocale,
    }),
    [
      buildHref,
      locale,
      localePrefix,
      localization,
      locales,
      stripLocale,
      switchLocale,
      timeZone,
    ]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}
