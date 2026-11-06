import type { MetaDescriptor } from 'react-router';
import { splitLocaleFromPathname } from '@shopana/storefront-sdk/routing';
import {
  jsonLdList,
  openGraphProductProperties,
  type RuntimeMetadata,
  type RuntimeMetadataImage,
  type RuntimeMetadataImages,
} from '../core/metadata';
import { withSiteMetadata, type RuntimeTitleTemplate } from '../core/site';
import type { RuntimeRootData } from './route-data';

function imageList(images: RuntimeMetadataImages | undefined) {
  if (!images) return [];
  return (Array.isArray(images) ? images : [images]).map(
    (image): RuntimeMetadataImage =>
      typeof image === 'string' ? { url: image } : image
  );
}

function robotsContent(robots: NonNullable<RuntimeMetadata['robots']>) {
  if (typeof robots === 'string') return robots;
  return [
    robots.index === false ? 'noindex' : 'index',
    robots.follow === false ? 'nofollow' : 'follow',
  ].join(', ');
}

/** The `meta` descriptors of React Router for page metadata, in document order. */
export function toMetaDescriptors(
  metadata: RuntimeMetadata | null | undefined
): MetaDescriptor[] {
  if (!metadata) return [];
  const tags: MetaDescriptor[] = [];
  const named = (name: string, content: string | number | undefined | null) => {
    if (content !== undefined && content !== null && content !== '') {
      tags.push({ name, content: String(content) });
    }
  };
  const property = (name: string, content: string | number | undefined) => {
    if (content !== undefined && content !== '') {
      tags.push({ property: name, content: String(content) });
    }
  };

  if (metadata.title) tags.push({ title: metadata.title });
  named('description', metadata.description);
  named(
    'keywords',
    Array.isArray(metadata.keywords)
      ? metadata.keywords.join(', ')
      : metadata.keywords
  );
  if (metadata.robots) named('robots', robotsContent(metadata.robots));

  const { alternates, openGraph, twitter } = metadata;
  if (alternates?.canonical) {
    tags.push({
      tagName: 'link',
      rel: 'canonical',
      href: alternates.canonical,
    });
  }
  for (const [hrefLang, href] of Object.entries(alternates?.languages ?? {})) {
    tags.push({ tagName: 'link', rel: 'alternate', hrefLang, href });
  }

  if (openGraph) {
    property('og:type', openGraph.type);
    property('og:title', openGraph.title);
    property('og:description', openGraph.description);
    property('og:url', openGraph.url);
    property('og:site_name', openGraph.siteName);
    property('og:locale', openGraph.locale);
    for (const locale of openGraph.alternateLocales ?? []) {
      property('og:locale:alternate', locale);
    }
    for (const image of imageList(openGraph.images)) {
      property('og:image', image.url);
      property('og:image:width', image.width);
      property('og:image:height', image.height);
      property('og:image:alt', image.alt);
    }
    const { article, product } = openGraph;
    if (article) {
      property('article:published_time', article.publishedTime);
      property('article:modified_time', article.modifiedTime);
      property('article:section', article.section);
      for (const author of article.authors ?? []) {
        property('article:author', author);
      }
      for (const tag of article.tags ?? []) property('article:tag', tag);
    }
    for (const [name, content] of openGraphProductProperties(product)) {
      property(name, content);
    }
  }

  if (twitter) {
    const images = imageList(twitter.images);
    // Without an image of its own the page leaves the card to the root's tags (and its image).
    named(
      'twitter:card',
      twitter.card ?? (images.length ? 'summary_large_image' : undefined)
    );
    named('twitter:title', twitter.title);
    named('twitter:description', twitter.description);
    for (const image of images) {
      named('twitter:image', image.url);
      named('twitter:image:alt', image.alt);
    }
  }

  for (const [name, content] of Object.entries(metadata.other ?? {})) {
    for (const value of Array.isArray(content) ? content : [content]) {
      named(name, value);
    }
  }

  for (const document of jsonLdList(metadata.jsonLd)) {
    tags.push({ 'script:ld+json': document } as MetaDescriptor);
  }

  return tags;
}

/** Repeated properties: the page's set replaces the root's whole set. */
const REPEATED_PROPERTIES = [
  'og:image',
  'og:locale:alternate',
  'article:author',
  'article:tag',
];

/**
 * The identity of a descriptor: the page's descriptors replace the root's with the same one.
 * Repeated tags share one identity, so the page's set replaces the root's whole set: its
 * images (`og:image*`, `twitter:image*`), Open Graph locales, authors and tags, and its
 * schema.org documents; language alternates are one per language.
 */
function descriptorKey(descriptor: MetaDescriptor): string | null {
  const record = descriptor as Record<string, unknown>;
  if ('title' in record) return 'title';
  if (typeof record.name === 'string') {
    return record.name.startsWith('twitter:image')
      ? 'name:twitter:image'
      : `name:${record.name}`;
  }
  if (typeof record.property === 'string') {
    const repeated = REPEATED_PROPERTIES.find((name) =>
      (record.property as string).startsWith(name)
    );
    return `property:${repeated ?? record.property}`;
  }
  if ('script:ld+json' in record) return 'script:ld+json';
  if (record.rel === 'canonical') return 'canonical';
  if (record.rel === 'alternate' && typeof record.hrefLang === 'string') {
    return `alternate:${record.hrefLang.toLowerCase()}`;
  }
  return null;
}

/**
 * The root's descriptors under the page's: the page wins for a title, a name, a property, the
 * canonical address, a language alternate and the images.
 */
export function mergeMetaDescriptors(
  parent: readonly MetaDescriptor[],
  page: readonly MetaDescriptor[]
): MetaDescriptor[] {
  const pageKeys = new Set(page.map(descriptorKey).filter(Boolean));
  return [
    ...parent.filter((descriptor) => {
      const key = descriptorKey(descriptor);
      return key === null || !pageKeys.has(key);
    }),
    ...page,
  ];
}

/**
 * Puts the metadata of a page the browser loaded itself into the document, over the tags the
 * route rendered: the title and the `<meta name|property>` tags (links stay as they are, they
 * matter to crawlers, which get the server's pages). Returns the undo, which restores what the
 * route rendered, so the next page starts from it.
 */
export function applyDocumentMetadata(metadata: RuntimeMetadata): () => void {
  const undo: Array<() => void> = [];
  for (const descriptor of toMetaDescriptors(metadata)) {
    const record = descriptor as Record<string, unknown>;
    if ('title' in record) {
      const previous = document.title;
      document.title = String(record.title);
      undo.push(() => {
        document.title = previous;
      });
      continue;
    }
    const attribute =
      typeof record.name === 'string'
        ? 'name'
        : typeof record.property === 'string'
          ? 'property'
          : null;
    if (!attribute || typeof record.content !== 'string') continue;
    const key = record[attribute] as string;
    const existing = document.head.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${CSS.escape(key)}"]`
    );
    if (existing) {
      const previous = existing.content;
      existing.content = record.content;
      undo.push(() => {
        existing.content = previous;
      });
    } else {
      const element = document.createElement('meta');
      element.setAttribute(attribute, key);
      element.content = record.content;
      document.head.append(element);
      undo.push(() => element.remove());
    }
  }
  return () => {
    for (const step of undo.reverse()) step();
  };
}

/**
 * The page's metadata with the site's (see `withSiteMetadata`), from the root data: the
 * store, the languages and the public origin. Without root data (the root error page) the
 * page's own.
 */
export function pageSiteMetadata(
  metadata: RuntimeMetadata | null | undefined,
  root: RuntimeRootData | null | undefined,
  pathname: string,
  titleTemplate: RuntimeTitleTemplate | undefined
): RuntimeMetadata | null | undefined {
  if (!root?.app) return metadata;
  const { store, locale, locales, localePrefix } = root.app;
  return withSiteMetadata(metadata, {
    site: { origin: root.origin, locale, locales, localePrefix },
    store,
    pathname: splitLocaleFromPathname(
      pathname,
      locales.locales.map((item) => item.segment)
    ).pathname,
    titleTemplate,
  });
}
