'use client';

import {
  createContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Locale } from '../../../shop/types';
import { buildLocalizedPathname } from '../core/buildLocalizedPathname';
import type {
  LocalizationConfig,
  LocalizationState,
} from '../core/types';

export const LocalizationContext = createContext<LocalizationState | null>(
  null
);

interface LocalizationProviderProps {
  children: ReactNode;
  config: LocalizationConfig;
  currentLocale: Locale;
  availableLocales: readonly Locale[];
}

export function LocalizationProvider({
  children,
  config,
  currentLocale,
  availableLocales,
}: LocalizationProviderProps) {
  const getLocaleUrl = useCallback(
    (localeCode: string) => {
      const url = new URL(window.location.href);
      url.pathname = buildLocalizedPathname({
        pathname: url.pathname,
        localeCode,
        defaultLocale: config.defaultLocale,
        availableLocaleCodes: availableLocales.map((locale) => locale.code),
        localePrefix: config.localePrefix,
      });

      return `${url.pathname}${url.search}${url.hash}`;
    },
    [availableLocales, config.defaultLocale, config.localePrefix]
  );

  const changeLocale = useCallback(
    (localeCode: string) => {
      if (localeCode === currentLocale.code) return;

      const localeExists = availableLocales.some(
        (locale) => locale.code === localeCode
      );

      if (!localeExists) {
        throw new Error(`Unsupported locale: ${localeCode}`);
      }

      window.location.assign(getLocaleUrl(localeCode));
    },
    [availableLocales, currentLocale.code, getLocaleUrl]
  );

  const value = useMemo<LocalizationState>(
    () => ({
      currentLocale,
      availableLocales,
      getLocaleUrl,
      changeLocale,
    }),
    [availableLocales, changeLocale, currentLocale, getLocaleUrl]
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

