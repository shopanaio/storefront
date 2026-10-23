/**
 * One storefront language in the three forms it is used in:
 * - `code`: the API `LocaleCode` value (`uk`, `pt_BR`);
 * - `tag`: the BCP 47 tag for `Accept-Language`, `Intl` and `<html lang>` (`uk`, `pt-BR`);
 * - `segment`: the URL path segment (`uk`, `pt-br`).
 *
 * `name` is the language name written in that language (`Українська`, `Português (Brasil)`).
 */
export interface StorefrontLocale {
  code: string;
  tag: string;
  segment: string;
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

/** Name of a language in that language; the tag itself when `Intl` does not know it. */
export function localeDisplayName(tag: string): string {
  try {
    const name = new Intl.DisplayNames([tag], { type: 'language' }).of(tag);
    if (!name) return tag;
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1);
  } catch {
    return tag;
  }
}

export function toStorefrontLocale(code: string): StorefrontLocale {
  const tag = localeCodeToTag(code);
  return {
    code,
    tag,
    segment: localeCodeToSegment(code),
    name: localeDisplayName(tag),
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
