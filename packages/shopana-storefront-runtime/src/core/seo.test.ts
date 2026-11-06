import { describe, expect, it } from 'vitest';
import type { RuntimePageServices } from './page-definition';
import {
  buildRobotsTxt,
  buildSitemapFile,
  buildSitemapIndex,
  defineRuntimeSeo,
} from './seo';
import type { RuntimeSite } from './site';

const uk = { code: 'uk', tag: 'uk', segment: 'uk', name: 'Українська' };
const en = { code: 'en', tag: 'en', segment: 'en', name: 'English' };

const site: RuntimeSite = {
  origin: 'https://shop.test',
  locale: uk,
  locales: { defaultLocale: uk, locales: [uk, en] },
  localePrefix: 'as-needed',
};
const context = { services: {} as RuntimePageServices };

const seo = defineRuntimeSeo({
  robots: { rules: [{ disallow: ['/cart', '/*?*sort='] }] },
  sitemaps: {
    products: () => [
      {
        path: '/products/socks',
        lastModified: '2026-11-01T10:00:00Z',
        images: ['https://cdn.test/socks.png'],
      },
      { path: '/products/a&b' },
    ],
  },
});

describe('buildRobotsTxt', () => {
  it('applies a path in every language and names the sitemap', () => {
    expect(buildRobotsTxt(seo, site)).toBe(
      [
        'User-agent: *',
        'Disallow: /cart',
        'Disallow: /en/cart',
        'Disallow: /*?*sort=',
        '',
        'Sitemap: https://shop.test/sitemap.xml',
        '',
      ].join('\n')
    );
  });

  it('allows everything without rules or sitemaps', () => {
    expect(buildRobotsTxt({}, site)).toBe('User-agent: *\nDisallow:\n');
  });
});

describe('sitemaps', () => {
  it('lists the files of each source in the index', async () => {
    const index = await buildSitemapIndex(seo, site, context);
    expect(index).toContain(
      '<sitemap><loc>https://shop.test/sitemaps/products-1.xml</loc><lastmod>2026-11-01T10:00:00.000Z</lastmod></sitemap>'
    );
  });

  it('lists each page in every language with its alternates', async () => {
    const file = await buildSitemapFile(seo, site, context, 'products-1.xml');
    expect(file).toContain(
      '<url><loc>https://shop.test/products/socks</loc><lastmod>2026-11-01T10:00:00.000Z</lastmod>' +
        '<xhtml:link rel="alternate" hreflang="uk" href="https://shop.test/products/socks"/>' +
        '<xhtml:link rel="alternate" hreflang="en" href="https://shop.test/en/products/socks"/>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://shop.test/products/socks"/>' +
        '<image:image><image:loc>https://cdn.test/socks.png</image:loc></image:image></url>'
    );
    expect(file).toContain('<loc>https://shop.test/en/products/socks</loc>');
    expect(file).toContain('<loc>https://shop.test/products/a&amp;b</loc>');
  });

  it('answers no file for an unknown source or page', async () => {
    expect(await buildSitemapFile(seo, site, context, 'orders-1.xml')).toBe(
      null
    );
    expect(await buildSitemapFile(seo, site, context, 'products-2.xml')).toBe(
      null
    );
    expect(await buildSitemapFile(seo, site, context, '../x.xml')).toBe(null);
  });

  it('lists no file of an empty source', async () => {
    const empty = defineRuntimeSeo({ sitemaps: { vendors: () => [] } });
    expect(await buildSitemapIndex(empty, site, context)).not.toContain(
      'vendors-1.xml'
    );
    expect(await buildSitemapFile(empty, site, context, 'vendors-1.xml')).toBe(
      null
    );
  });

  it('loads a source once for the index and its files', async () => {
    let loads = 0;
    const counted = defineRuntimeSeo({
      sitemaps: {
        pages: () => {
          loads += 1;
          return [{ path: '/' }];
        },
      },
    });
    await buildSitemapIndex(counted, site, context);
    await buildSitemapFile(counted, site, context, 'pages-1.xml');
    expect(loads).toBe(1);
  });
});
