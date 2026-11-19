/**
 * The public site of a storefront: its origin and languages, the absolute addresses of its
 * pages, and the metadata every page gets from them (canonical address, the page in each
 * language, Open Graph and Twitter defaults). The same under both runtimes.
 */
import {
  isAbsoluteUrl,
  localizePathname,
  type LocalePrefixMode,
  type StorefrontLocale,
  type StorefrontLocales,
} from '@shopana/storefront-sdk/routing';
import {
  isIndexable,
  titleText,
  type RuntimeMetadata,
  type RuntimeMetadataImage,
  type RuntimeMetadataImages,
} from './metadata';

/** Where the storefront is served and in which languages. */
export interface RuntimeSite {
  /** Public origin (`https://shop.example`), without a trailing slash. */
  origin: string;
  /** Language of the page. */
  locale: StorefrontLocale;
  locales: StorefrontLocales;
  localePrefix: LocalePrefixMode;
}

/** The site of a page, as a page definition reads it (`context.site`). */
export interface RuntimeSiteContext {
  origin: string;
  /** Language of the page. */
  locale: StorefrontLocale;
  /**
   * Absolute address of a storefront path without the locale segment (`/products/socks`) in
   * the page's language; an absolute URL stays as it is.
   */
  url(path: string): string;
  /** Absolute address of a file of the site (`/icons/icon.png`); an absolute URL stays. */
  asset(url: string): string;
}

/** The store as the root data carries it (what the site metadata reads). */
export interface RuntimeSiteStore {
  name: string;
}

/** The page title with the store in it (`Socks — Shop`); the page's own title without one. */
export type RuntimeTitleTemplate = (
  title: string,
  store: RuntimeSiteStore
) => string;

/** Address of a storefront path in a language of the site. */
export function siteUrl(
  site: RuntimeSite,
  path: string,
  locale: StorefrontLocale = site.locale
): string {
  if (isAbsoluteUrl(path)) return path;
  const suffixIndex = path.search(/[?#]/);
  const pathname = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? '' : path.slice(suffixIndex);
  const localized = localizePathname(pathname || '/', {
    locale: locale.segment,
    defaultLocale: site.locales.defaultLocale.segment,
    locales: site.locales.locales.map((item) => item.segment),
    localePrefix: site.localePrefix,
  });
  return `${site.origin}${localized}${suffix}`;
}

/** Address of a file of the site. */
export function siteAssetUrl(site: Pick<RuntimeSite, 'origin'>, url: string) {
  if (isAbsoluteUrl(url)) return url.startsWith('//') ? `https:${url}` : url;
  return `${site.origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

/**
 * The site of an address when the store languages are not known (a page the browser loads
 * outside the app's routes): its origin, one language named by its locale segment.
 */
export function addressSite(url: URL, localeSegment = ''): RuntimeSite {
  const locale: StorefrontLocale = {
    code: localeSegment,
    tag: localeSegment,
    segment: localeSegment,
    name: localeSegment,
  };
  return {
    origin: url.origin,
    locale,
    locales: { defaultLocale: locale, locales: [locale] },
    localePrefix: 'as-needed',
  };
}

export function createSiteContext(site: RuntimeSite): RuntimeSiteContext {
  return {
    origin: site.origin,
    locale: site.locale,
    url: (path) => siteUrl(site, path),
    asset: (url) => siteAssetUrl(site, url),
  };
}

/** Open Graph locale of a BCP 47 tag: `uk-UA` → `uk_UA`. */
export function openGraphLocale(tag: string): string {
  return tag.replace(/-/g, '_');
}

function imageList(images: RuntimeMetadataImages | undefined) {
  if (!images) return [];
  return (Array.isArray(images) ? images : [images]).map(
    (image): RuntimeMetadataImage =>
      typeof image === 'string' ? { url: image } : image
  );
}

function absoluteImages(
  site: RuntimeSite,
  images: RuntimeMetadataImages | undefined
): RuntimeMetadataImage[] | undefined {
  const list = imageList(images);
  if (!list.length) return undefined;
  return list.map((image) => ({
    ...image,
    url: siteAssetUrl(site, image.url),
  }));
}

export interface SiteMetadataOptions {
  site: RuntimeSite;
  store: RuntimeSiteStore;
  /** Path of the page without the locale segment and the query. */
  pathname: string;
  titleTemplate?: RuntimeTitleTemplate;
}

/**
 * The store languages a page has content in: those `codes` name (`StorefrontLocale.code`), every
 * store language when left out. Sitemaps and language alternates list only them.
 */
export function pageLocales(
  site: Pick<RuntimeSite, 'locales'>,
  codes: readonly string[] | null | undefined
): readonly StorefrontLocale[] {
  if (!codes) return site.locales.locales;
  return site.locales.locales.filter((locale) => codes.includes(locale.code));
}

/**
 * The language of `x-default`: the store's default one when the page has it, else the first
 * language the page has.
 */
export function defaultPageLocale(
  site: Pick<RuntimeSite, 'locales'>,
  locales: readonly StorefrontLocale[]
): StorefrontLocale | undefined {
  return (
    locales.find((locale) => locale.tag === site.locales.defaultLocale.tag) ??
    locales[0]
  );
}

/**
 * A page's metadata with what every page of the site has: the title in the app's template
 * (`{ absolute }` outside it), the canonical address (the page's path without its query unless
 * the page names one) and the page in each language it has (`alternates.locales`, every store
 * language when left out) with `x-default` (indexable pages; the languages only when the page
 * has several), the neighbouring pages of a list, and Open Graph and Twitter tags from the
 * page's own ones. A `noindex` page names no canonical address of its own: search engines read
 * the two as conflicting. Addresses are made absolute on the public origin.
 */
export function withSiteMetadata(
  metadata: RuntimeMetadata | null | undefined,
  { site, store, pathname, titleTemplate }: SiteMetadataOptions
): RuntimeMetadata {
  const page = metadata ?? {};
  const pageTitle = titleText(page.title);
  const title =
    page.title && typeof page.title !== 'string'
      ? titleTemplate
        ? pageTitle
        : page.title
      : pageTitle && titleTemplate
        ? titleTemplate(pageTitle, store)
        : page.title;

  const indexable = isIndexable(page.robots);
  const canonicalPath = page.alternates?.canonical ?? pathname;
  const pageUrl = siteUrl(site, canonicalPath);
  const canonical =
    indexable || page.alternates?.canonical ? pageUrl : undefined;
  const locales = pageLocales(site, page.alternates?.locales);
  const otherLocales = locales.filter(
    (locale) => locale.tag !== site.locale.tag
  );
  const xDefault = defaultPageLocale(site, locales);
  const languages =
    page.alternates?.languages ??
    (indexable &&
    otherLocales.length &&
    xDefault &&
    !isAbsoluteUrl(canonicalPath)
      ? Object.fromEntries([
          ...locales.map((locale) => [
            locale.tag,
            siteUrl(site, canonicalPath, locale),
          ]),
          ['x-default', siteUrl(site, canonicalPath, xDefault)],
        ])
      : undefined);
  const previous = page.pagination?.previous;
  const next = page.pagination?.next;

  const openGraph = page.openGraph ?? {};
  const ogTitle = openGraph.title ?? pageTitle ?? store.name;
  const ogDescription = openGraph.description ?? page.description ?? undefined;
  const ogImages = absoluteImages(site, openGraph.images);
  const twitter = page.twitter ?? {};

  return {
    ...page,
    title,
    alternates: {
      ...(canonical ? { canonical } : {}),
      ...(languages ? { languages } : {}),
    },
    pagination:
      previous || next
        ? {
            ...(previous ? { previous: siteUrl(site, previous) } : {}),
            ...(next ? { next: siteUrl(site, next) } : {}),
          }
        : undefined,
    openGraph: {
      ...openGraph,
      type: openGraph.type ?? 'website',
      title: ogTitle,
      description: ogDescription,
      url: openGraph.url ? siteUrl(site, openGraph.url) : pageUrl,
      siteName: openGraph.siteName ?? store.name,
      locale: openGraph.locale ?? openGraphLocale(site.locale.tag),
      alternateLocales:
        openGraph.alternateLocales ??
        otherLocales.map((locale) => openGraphLocale(locale.tag)),
      images: ogImages,
    },
    twitter: {
      ...twitter,
      title: twitter.title ?? ogTitle,
      description: twitter.description ?? ogDescription,
      images: twitter.images ? absoluteImages(site, twitter.images) : ogImages,
    },
  };
}
