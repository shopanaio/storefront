import { describe, expect, it } from 'vitest';

import { buildHref, splitLocaleFromPathname, type LocaleRouting } from './href';
import { localeCodeToSegment, localeCodeToTag } from './locale';

const routing: LocaleRouting = {
  locale: 'uk',
  defaultLocale: 'en',
  locales: ['en', 'uk', 'pt-br'],
  localePrefix: 'as-needed',
};

describe('buildHref', () => {
  it('prefixes a non-default locale', () => {
    expect(buildHref('/cart', routing)).toBe('/uk/cart');
    expect(buildHref('/', routing)).toBe('/uk');
  });

  it('keeps the default locale unprefixed with as-needed', () => {
    expect(buildHref('/cart', { ...routing, locale: 'en' })).toBe('/cart');
  });

  it('prefixes the default locale with always', () => {
    expect(
      buildHref('/cart', { ...routing, locale: 'en', localePrefix: 'always' })
    ).toBe('/en/cart');
  });

  it('builds named routes with query and hash', () => {
    expect(
      buildHref(
        {
          route: 'product',
          params: { handle: 'tea' },
          query: { variant: '1', tags: ['a', 'b'], empty: null },
          hash: 'reviews',
        },
        routing
      )
    ).toBe('/uk/products/tea?variant=1&tags=a&tags=b#reviews');
  });

  it('replaces a locale segment that is already present', () => {
    expect(buildHref('/en/cart?x=1', routing)).toBe('/uk/cart?x=1');
  });

  it('returns absolute, hash and query hrefs unchanged', () => {
    expect(buildHref('https://example.com/a', routing)).toBe(
      'https://example.com/a'
    );
    expect(buildHref('//cdn.example.com/a', routing)).toBe(
      '//cdn.example.com/a'
    );
    expect(buildHref('mailto:a@b.c', routing)).toBe('mailto:a@b.c');
    expect(buildHref('#top', routing)).toBe('#top');
    expect(buildHref('?q=1', routing)).toBe('?q=1');
  });
});

describe('splitLocaleFromPathname', () => {
  it('splits only store locales', () => {
    expect(splitLocaleFromPathname('/pt-br/cart', routing.locales)).toEqual({
      locale: 'pt-br',
      pathname: '/cart',
    });
    expect(splitLocaleFromPathname('/faq', routing.locales)).toEqual({
      locale: null,
      pathname: '/faq',
    });
  });
});

describe('locale codes', () => {
  it('maps API codes to tags and segments', () => {
    expect(localeCodeToTag('pt_BR')).toBe('pt-BR');
    expect(localeCodeToSegment('pt_BR')).toBe('pt-br');
    expect(localeCodeToTag('uk')).toBe('uk');
  });
});
