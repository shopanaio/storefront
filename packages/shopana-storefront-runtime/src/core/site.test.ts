import { describe, expect, it } from 'vitest';
import { siteUrl, withSiteMetadata, type RuntimeSite } from './site';

const uk = { code: 'uk', tag: 'uk', segment: 'uk', name: 'Українська' };
const en = { code: 'en', tag: 'en', segment: 'en', name: 'English' };

const site: RuntimeSite = {
  origin: 'https://shop.test',
  locale: en,
  locales: { defaultLocale: uk, locales: [uk, en] },
  localePrefix: 'as-needed',
};
const store = { name: 'Shop' };

describe('siteUrl', () => {
  it('puts a storefront path in a language of the site', () => {
    expect(siteUrl(site, '/products/socks')).toBe(
      'https://shop.test/en/products/socks'
    );
    expect(siteUrl(site, '/products/socks?variant=2', uk)).toBe(
      'https://shop.test/products/socks?variant=2'
    );
    expect(siteUrl(site, '/', uk)).toBe('https://shop.test/');
    expect(siteUrl(site, 'https://cdn.test/a.png')).toBe(
      'https://cdn.test/a.png'
    );
  });
});

describe('withSiteMetadata', () => {
  it('fills the canonical address, the languages, Open Graph and Twitter', () => {
    expect(
      withSiteMetadata(
        {
          title: 'Socks',
          description: 'Warm socks',
          openGraph: { type: 'product', images: '/socks.png' },
        },
        {
          site,
          store,
          pathname: '/products/socks',
          titleTemplate: (title, { name }) => `${title} — ${name}`,
        }
      )
    ).toEqual({
      title: 'Socks — Shop',
      description: 'Warm socks',
      alternates: {
        canonical: 'https://shop.test/en/products/socks',
        languages: {
          uk: 'https://shop.test/products/socks',
          en: 'https://shop.test/en/products/socks',
          'x-default': 'https://shop.test/products/socks',
        },
      },
      openGraph: {
        type: 'product',
        title: 'Socks',
        description: 'Warm socks',
        url: 'https://shop.test/en/products/socks',
        siteName: 'Shop',
        locale: 'en',
        alternateLocales: ['uk'],
        images: [{ url: 'https://shop.test/socks.png' }],
      },
      twitter: {
        title: 'Socks',
        description: 'Warm socks',
        images: [{ url: 'https://shop.test/socks.png' }],
      },
    });
  });

  it("keeps the page's canonical path and leaves languages out of a noindex page", () => {
    const metadata = withSiteMetadata(
      {
        robots: { index: false },
        alternates: { canonical: '/categories/food' },
      },
      { site, store, pathname: '/categories/food' }
    );
    expect(metadata.alternates).toEqual({
      canonical: 'https://shop.test/en/categories/food',
    });
    expect(metadata.title).toBeUndefined();
    expect(metadata.openGraph?.title).toBe('Shop');
  });

  it('gives a noindex page no canonical address of its own', () => {
    const metadata = withSiteMetadata(
      { robots: 'noindex, follow' },
      { site, store, pathname: '/search' }
    );
    expect(metadata.alternates).toEqual({});
    expect(metadata.openGraph?.url).toBe('https://shop.test/en/search');
  });
});
