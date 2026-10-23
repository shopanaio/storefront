import type { LocalePrefixMode } from './types';

interface BuildLocalizedPathnameOptions {
  pathname: string;
  localeCode: string;
  defaultLocale: string;
  availableLocaleCodes: readonly string[];
  localePrefix: LocalePrefixMode;
}

const normalizePathname = (pathname: string) => {
  if (!pathname) return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

export function buildLocalizedPathname({
  pathname,
  localeCode,
  defaultLocale,
  availableLocaleCodes,
  localePrefix,
}: BuildLocalizedPathnameOptions): string {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split('/');
  const firstSegment = segments[1]?.toLowerCase();
  const localeCodes = new Set(
    availableLocaleCodes.map((code) => code.toLowerCase())
  );

  if (firstSegment && localeCodes.has(firstSegment)) {
    segments.splice(1, 1);
  }

  const pathnameWithoutLocale = segments.join('/') || '/';
  const shouldPrefix =
    localePrefix === 'always' || localeCode !== defaultLocale;

  if (!shouldPrefix) return pathnameWithoutLocale;
  if (pathnameWithoutLocale === '/') return `/${localeCode}`;

  return `/${localeCode}${pathnameWithoutLocale}`;
}
