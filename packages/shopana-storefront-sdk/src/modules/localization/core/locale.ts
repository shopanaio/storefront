/**
 * One storefront language in the three forms it is used in:
 * - `code`: the API `LocaleCode` value (`uk`, `pt_BR`);
 * - `tag`: the BCP 47 tag for `Accept-Language`, `Intl` and `<html lang>` (`uk`, `pt-BR`);
 * - `segment`: the URL path segment (`uk`, `pt-br`).
 */
export interface StorefrontLocale {
  code: string;
  tag: string;
  segment: string;
  name: string;
}

export interface StorefrontLanguage {
  code: string;
  name: string;
}

export function localeCodeToTag(code: string): string {
  const [language, ...rest] = code.split(/[_-]/);
  if (!rest.length) return language.toLowerCase();
  return [language.toLowerCase(), ...rest.map((part) => part.toUpperCase())].join(
    '-'
  );
}

export function localeCodeToSegment(code: string): string {
  return localeCodeToTag(code).toLowerCase();
}

export function toStorefrontLocale(
  language: StorefrontLanguage
): StorefrontLocale {
  return {
    code: language.code,
    tag: localeCodeToTag(language.code),
    segment: localeCodeToSegment(language.code),
    name: language.name,
  };
}

/** Finds the language of a URL segment, an API code or a BCP 47 tag, case-insensitively. */
export function findStorefrontLocale(
  locales: readonly StorefrontLocale[],
  value: string | null | undefined
): StorefrontLocale | undefined {
  if (!value) return undefined;
  const segment = localeCodeToSegment(value);
  return locales.find((locale) => locale.segment === segment);
}
