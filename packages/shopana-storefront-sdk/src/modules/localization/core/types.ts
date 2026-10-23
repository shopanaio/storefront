import type { SdkLocalizationFragment } from '../../../graphql/apollo/generated/operations';
import type { HrefTarget } from './href';
import type { StorefrontLocale } from './locale';

export type LocalePrefixMode = 'always' | 'as-needed';

export interface StorefrontRoutingConfig {
  /** `as-needed` leaves the default locale without a path segment. */
  localePrefix: LocalePrefixMode;
}

/** Store languages for routing: the store default and every language of its market. */
export interface StorefrontLocales {
  defaultLocale: StorefrontLocale;
  locales: readonly StorefrontLocale[];
}

export type StorefrontMarket = SdkLocalizationFragment['market'];
export type StorefrontCountry = SdkLocalizationFragment['country'];
export type StorefrontCurrency = SdkLocalizationFragment['currency'];

export interface LocalizationState {
  /** Active language, taken from the URL locale segment. */
  locale: StorefrontLocale;
  defaultLocale: StorefrontLocale;
  availableLanguages: readonly StorefrontLocale[];
  localePrefix: LocalePrefixMode;
  market: StorefrontMarket;
  country: StorefrontCountry;
  currency: StorefrontCurrency;
  availableCountries: readonly StorefrontCountry[];
  availableCurrencies: readonly StorefrontCurrency[];
  /** Store timezone used for dates. */
  timeZone: string;
  /** BCP 47 locale for `Intl` formatting. */
  intlLocale: string;
  /** Localized href for the active locale, or for `options.locale` (a segment or API code). */
  buildHref: (target: HrefTarget, options?: { locale?: string }) => string;
  /** Pathname without the locale segment. */
  stripLocale: (pathname: string) => string;
  /** Opens the current page in another store language. */
  switchLocale: (locale: string) => void;
}
