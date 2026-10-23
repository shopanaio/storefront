import type { HrefTarget } from './href';
import type { StorefrontLocale } from './locale';

export type LocalePrefixMode = 'always' | 'as-needed';

export interface StorefrontRoutingConfig {
  /** `as-needed` leaves the default locale without a path segment. */
  localePrefix: LocalePrefixMode;
}

/** Store languages for routing: the store default and every enabled store locale. */
export interface StorefrontLocales {
  defaultLocale: StorefrontLocale;
  locales: readonly StorefrontLocale[];
}

export interface LocalizationState {
  /** Active language, taken from the URL locale segment. */
  locale: StorefrontLocale;
  defaultLocale: StorefrontLocale;
  /** Enabled store languages, the store default included. */
  locales: readonly StorefrontLocale[];
  localePrefix: LocalePrefixMode;
  /** Store currency (`store.defaultCurrency`) for prices and the cart. */
  currencyCode: string;
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
