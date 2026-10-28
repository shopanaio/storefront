import { describe, expect, it } from 'vitest';
import type { StorefrontLocales } from '@shopana/storefront-sdk/routing';
import { toStorefrontLocale } from '@shopana/storefront-sdk/routing';
import { isLocalizedPath, localePrefixRedirect } from './locale-routing';

const locales: StorefrontLocales = {
  defaultLocale: toStorefrontLocale('en'),
  locales: [toStorefrontLocale('en'), toStorefrontLocale('uk')],
};

const redirect = (
  href: string,
  segment: string | null,
  localePrefix: 'as-needed' | 'always'
) =>
  localePrefixRedirect(new URL(href, 'https://shop.test'), segment, locales, {
    localePrefix,
  });

describe('localePrefixRedirect', () => {
  it('drops the default locale segment under as-needed', () => {
    expect(redirect('/en/products/socks?size=m', 'en', 'as-needed')).toBe(
      '/products/socks?size=m'
    );
    expect(redirect('/en', 'en', 'as-needed')).toBe('/');
    expect(redirect('/uk/products/socks', 'uk', 'as-needed')).toBeNull();
    expect(redirect('/products/socks', null, 'as-needed')).toBeNull();
  });

  it('adds the default locale segment under always', () => {
    expect(redirect('/products/socks?size=m', null, 'always')).toBe(
      '/en/products/socks?size=m'
    );
    expect(redirect('/', null, 'always')).toBe('/en');
    expect(redirect('/en/products/socks', 'en', 'always')).toBeNull();
  });
});

describe('isLocalizedPath', () => {
  it('leaves the session handlers and static files alone', () => {
    expect(isLocalizedPath('/products/socks')).toBe(true);
    expect(isLocalizedPath('/auth/login')).toBe(false);
    expect(isLocalizedPath('/favicon.ico')).toBe(false);
  });
});
