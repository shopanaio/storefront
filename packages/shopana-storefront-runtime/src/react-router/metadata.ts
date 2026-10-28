import type { MetaDescriptor } from 'react-router';
import type {
  RuntimeMetadata,
  RuntimeMetadataImage,
  RuntimeMetadataImages,
} from '../core/metadata';

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
    property('og:title', openGraph.title);
    property('og:description', openGraph.description);
    property('og:url', openGraph.url);
    property('og:site_name', openGraph.siteName);
    property('og:locale', openGraph.locale);
    for (const image of imageList(openGraph.images)) {
      property('og:image', image.url);
      property('og:image:width', image.width);
      property('og:image:height', image.height);
      property('og:image:alt', image.alt);
    }
  }

  if (twitter) {
    const images = imageList(twitter.images);
    named('twitter:card', images.length ? 'summary_large_image' : 'summary');
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

  return tags;
}

/**
 * The identity of a descriptor: the page's descriptors replace the root's with the same one.
 * Repeated tags share one identity, so the page's set replaces the root's whole set: its
 * images (`og:image*`, `twitter:image*`) and its language alternates per language.
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
    return record.property.startsWith('og:image')
      ? 'property:og:image'
      : `property:${record.property}`;
  }
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
