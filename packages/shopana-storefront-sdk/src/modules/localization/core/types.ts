import type { Locale } from '../../../shop/types';

export type LocalePrefixMode = 'always' | 'as-needed';

export interface LocalizationConfig {
  defaultLocale: string;
  localePrefix: LocalePrefixMode;
}

export interface LocalizationState {
  currentLocale: Locale;
  availableLocales: readonly Locale[];
  getLocaleUrl: (localeCode: string) => string;
  changeLocale: (localeCode: string) => void;
}

