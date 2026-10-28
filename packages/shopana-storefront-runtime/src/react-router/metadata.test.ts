import { describe, expect, it } from 'vitest';
import { mergeMetaDescriptors, toMetaDescriptors } from './metadata';

describe('toMetaDescriptors', () => {
  it('renders page metadata as meta and link tags', () => {
    expect(
      toMetaDescriptors({
        title: 'Socks',
        description: 'Warm socks',
        keywords: ['socks', 'wool'],
        robots: { index: false },
        alternates: {
          canonical: 'https://shop.test/products/socks',
          languages: { uk: 'https://shop.test/uk/products/socks' },
        },
        openGraph: {
          title: 'Socks',
          images: [
            { url: 'https://shop.test/socks.png', width: 800, alt: 'Socks' },
          ],
        },
        twitter: { title: 'Socks', images: 'https://shop.test/socks.png' },
        other: { 'theme-color': '#000' },
      })
    ).toEqual([
      { title: 'Socks' },
      { name: 'description', content: 'Warm socks' },
      { name: 'keywords', content: 'socks, wool' },
      { name: 'robots', content: 'noindex, follow' },
      {
        tagName: 'link',
        rel: 'canonical',
        href: 'https://shop.test/products/socks',
      },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'uk',
        href: 'https://shop.test/uk/products/socks',
      },
      { property: 'og:title', content: 'Socks' },
      { property: 'og:image', content: 'https://shop.test/socks.png' },
      { property: 'og:image:width', content: '800' },
      { property: 'og:image:alt', content: 'Socks' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Socks' },
      { name: 'twitter:image', content: 'https://shop.test/socks.png' },
      { name: 'theme-color', content: '#000' },
    ]);
  });

  it('renders nothing without metadata', () => {
    expect(toMetaDescriptors(undefined)).toEqual([]);
    expect(toMetaDescriptors({ title: null, description: '' })).toEqual([]);
  });
});

describe('mergeMetaDescriptors', () => {
  it('keeps the root tags the page does not replace', () => {
    expect(
      mergeMetaDescriptors(
        [
          { title: 'Store' },
          { name: 'description', content: 'Store' },
          { name: 'viewport', content: 'width=device-width' },
          { property: 'og:image', content: '/store.png' },
          { property: 'og:image:width', content: '1200' },
          { tagName: 'link', rel: 'alternate', hrefLang: 'uk', href: '/uk' },
          { tagName: 'link', rel: 'alternate', hrefLang: 'en', href: '/' },
        ],
        [
          { title: 'Socks' },
          { name: 'description', content: 'Socks' },
          { property: 'og:image', content: '/socks.png' },
          { property: 'og:image', content: '/socks-2.png' },
          {
            tagName: 'link',
            rel: 'alternate',
            hrefLang: 'uk',
            href: '/uk/products/socks',
          },
        ]
      )
    ).toEqual([
      { name: 'viewport', content: 'width=device-width' },
      { tagName: 'link', rel: 'alternate', hrefLang: 'en', href: '/' },
      { title: 'Socks' },
      { name: 'description', content: 'Socks' },
      { property: 'og:image', content: '/socks.png' },
      { property: 'og:image', content: '/socks-2.png' },
      {
        tagName: 'link',
        rel: 'alternate',
        hrefLang: 'uk',
        href: '/uk/products/socks',
      },
    ]);
  });

  it('keeps the root images when the page has none', () => {
    const root = [{ property: 'og:image', content: '/store.png' }];
    expect(mergeMetaDescriptors(root, [{ title: 'Socks' }])).toEqual([
      ...root,
      { title: 'Socks' },
    ]);
  });
});
