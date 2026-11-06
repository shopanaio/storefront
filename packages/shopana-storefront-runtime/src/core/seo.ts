/**
 * What a storefront tells search engines besides its pages: `robots.txt` and the sitemaps
 * (`sitemap.xml`, an index of the files under `/sitemaps/`). The theme defines them
 * (`src/runtime/seo.ts`); the same under both runtimes, each serves them from its routes.
 */
import type { RuntimePageServices } from './page-definition';
import { siteUrl, siteAssetUrl, type RuntimeSite } from './site';

export const ROBOTS_PATH = '/robots.txt';
export const SITEMAP_PATH = '/sitemap.xml';
/** Directory of the sitemap files the index lists: `/sitemaps/<source>-<n>.xml`. */
export const SITEMAPS_DIRECTORY = '/sitemaps';
/** Addresses in one sitemap file at most (the sitemaps protocol limit). */
export const SITEMAP_URL_LIMIT = 50_000;

export interface RuntimeRobotsRule {
  /** `*` when left out. */
  userAgent?: string | string[];
  /**
   * Storefront paths without the locale segment (`/cart`): each applies in every store
   * language. A pattern starting with `/*` (`/*?*sort=`) applies as it is.
   */
  allow?: string[];
  disallow?: string[];
}

/** An address of a sitemap: a page in every store language, with its alternates. */
export interface RuntimeSitemapEntry {
  /** Storefront path without the locale segment (`/products/socks`). */
  path: string;
  /** Last change of the page's content. */
  lastModified?: string | Date | null;
  /** Images of the page (absolute or site URLs), for image search. */
  images?: readonly string[];
}

export interface RuntimeSitemapContext {
  /** Queries with the request client, in the store's default language. */
  services: RuntimePageServices;
}

/** The pages of one sitemap source (products, categories), loaded on each sitemap request. */
export type RuntimeSitemapSource = (
  context: RuntimeSitemapContext
) => Promise<readonly RuntimeSitemapEntry[]> | readonly RuntimeSitemapEntry[];

/** The theme's part (`src/runtime/seo.ts`). Without it all is allowed and there is no sitemap. */
export interface RuntimeSeoDefinition {
  robots?: { rules?: RuntimeRobotsRule[] };
  /** Sitemap sources by name (lower case letters, digits and `-`). */
  sitemaps?: Record<string, RuntimeSitemapSource>;
}

export function defineRuntimeSeo<const TSeo extends RuntimeSeoDefinition>(
  seo: TSeo
): TSeo {
  return seo;
}

const SOURCE_NAME = /^[a-z0-9-]+$/;

function sourceNames(seo: RuntimeSeoDefinition): string[] {
  const names = Object.keys(seo.sitemaps ?? {});
  for (const name of names) {
    if (!SOURCE_NAME.test(name)) {
      throw new Error(
        `Sitemap source "${name}": use lower case letters, digits and "-"`
      );
    }
  }
  return names;
}

function localizedRules(site: RuntimeSite, paths: readonly string[] = []) {
  return [
    ...new Set(
      paths.flatMap((path) =>
        path.startsWith('/*')
          ? [path]
          : site.locales.locales.map((locale) =>
              siteUrl(site, path, locale).slice(site.origin.length)
            )
      )
    ),
  ];
}

/** `robots.txt`: the theme's rules in every store language and the sitemap index. */
export function buildRobotsTxt(
  seo: RuntimeSeoDefinition,
  site: RuntimeSite
): string {
  const rules = seo.robots?.rules?.length ? seo.robots.rules : [{}];
  const groups = rules.map((rule) => {
    const agents = [rule.userAgent ?? '*'].flat();
    const allow = localizedRules(site, rule.allow);
    const disallow = localizedRules(site, rule.disallow);
    return [
      ...agents.map((agent) => `User-agent: ${agent}`),
      ...allow.map((path) => `Allow: ${path}`),
      ...(disallow.length
        ? disallow.map((path) => `Disallow: ${path}`)
        : ['Disallow:']),
    ].join('\n');
  });
  const sitemap = sourceNames(seo).length
    ? [`Sitemap: ${site.origin}${SITEMAP_PATH}`]
    : [];
  return `${[...groups, ...sitemap].join('\n\n')}\n`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDate(value: RuntimeSitemapEntry['lastModified']): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Entries of one sitemap file: each makes an address per store language. */
function entriesPerFile(site: RuntimeSite): number {
  return Math.max(
    1,
    Math.floor(SITEMAP_URL_LIMIT / site.locales.locales.length)
  );
}

/**
 * How long the server keeps a source's pages: the index and each of its files read one load,
 * so a crawler going through them (or many requests at once) costs the catalog one walk.
 */
export const SITEMAP_SOURCE_TTL_MS = 10 * 60 * 1000;

interface CachedSource {
  expires: number;
  entries: Promise<readonly RuntimeSitemapEntry[]>;
}

const sourceCache = new WeakMap<RuntimeSeoDefinition, Map<string, CachedSource>>();

/** The pages of a source, loaded at most once per `SITEMAP_SOURCE_TTL_MS`; a failed load is dropped. */
function loadSource(
  seo: RuntimeSeoDefinition,
  name: string,
  context: RuntimeSitemapContext
): Promise<readonly RuntimeSitemapEntry[]> {
  const source = seo.sitemaps?.[name];
  if (!source) return Promise.resolve([]);
  let sources = sourceCache.get(seo);
  if (!sources) {
    sources = new Map();
    sourceCache.set(seo, sources);
  }
  const now = Date.now();
  const cached = sources.get(name);
  if (cached && cached.expires > now) return cached.entries;

  const entries = Promise.resolve().then(() => source(context));
  const entry = { expires: now + SITEMAP_SOURCE_TTL_MS, entries };
  sources.set(name, entry);
  entries.catch(() => {
    if (sources.get(name) === entry) sources.delete(name);
  });
  return entries;
}

/** `sitemap.xml`: the files of every source, each up to the limit of addresses; none of an empty source. */
export async function buildSitemapIndex(
  seo: RuntimeSeoDefinition,
  site: RuntimeSite,
  context: RuntimeSitemapContext
): Promise<string> {
  const perFile = entriesPerFile(site);
  const files = await Promise.all(
    sourceNames(seo).map(async (name) => {
      const entries = await loadSource(seo, name, context);
      const count = Math.ceil(entries.length / perFile);
      const lastModified = entries
        .map((entry) => isoDate(entry.lastModified))
        .filter((date): date is string => date !== null)
        .sort()
        .at(-1);
      return Array.from({ length: count }, (_, index) => ({
        loc: `${site.origin}${SITEMAPS_DIRECTORY}/${name}-${index + 1}.xml`,
        lastModified,
      }));
    })
  );
  const items = files
    .flat()
    .map(
      ({ loc, lastModified }) =>
        `<sitemap><loc>${escapeXml(loc)}</loc>${
          lastModified ? `<lastmod>${lastModified}</lastmod>` : ''
        }</sitemap>`
    );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...items,
    '</sitemapindex>',
    '',
  ].join('\n');
}

function urlElement(
  site: RuntimeSite,
  entry: RuntimeSitemapEntry,
  multilingual: boolean
): string[] {
  const lastModified = isoDate(entry.lastModified);
  const alternates = multilingual
    ? [
        ...site.locales.locales.map(
          (locale) =>
            `<xhtml:link rel="alternate" hreflang="${escapeXml(locale.tag)}" href="${escapeXml(
              siteUrl(site, entry.path, locale)
            )}"/>`
        ),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
          siteUrl(site, entry.path, site.locales.defaultLocale)
        )}"/>`,
      ].join('')
    : '';
  const images = (entry.images ?? [])
    .map(
      (image) =>
        `<image:image><image:loc>${escapeXml(
          siteAssetUrl(site, image)
        )}</image:loc></image:image>`
    )
    .join('');
  return site.locales.locales.map(
    (locale) =>
      `<url><loc>${escapeXml(siteUrl(site, entry.path, locale))}</loc>${
        lastModified ? `<lastmod>${lastModified}</lastmod>` : ''
      }${alternates}${images}</url>`
  );
}

/**
 * A sitemap file (`<source>-<n>.xml`): its part of the source's pages, each in every store
 * language with the addresses of the others. Null for a file that does not exist (past the
 * source's pages, or any file of an empty source).
 */
export async function buildSitemapFile(
  seo: RuntimeSeoDefinition,
  site: RuntimeSite,
  context: RuntimeSitemapContext,
  file: string
): Promise<string | null> {
  const match = /^([a-z0-9-]+)-([1-9]\d*)\.xml$/.exec(file);
  if (!match) return null;
  const [, name, page] = match;
  if (!sourceNames(seo).includes(name!)) return null;

  const perFile = entriesPerFile(site);
  const entries = await loadSource(seo, name!, context);
  const start = (Number(page) - 1) * perFile;
  if (start >= entries.length) return null;

  const multilingual = site.locales.locales.length > 1;
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...entries
      .slice(start, start + perFile)
      .flatMap((entry) => urlElement(site, entry, multilingual)),
    '</urlset>',
    '',
  ].join('\n');
}

/** Sitemaps and `robots.txt` change with the catalog; crawlers read them again after an hour. */
const CACHE_CONTROL = 'public, max-age=3600';

export function robotsResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    },
  });
}

export function sitemapResponse(body: string | null): Response {
  if (body === null) return new Response('Not Found', { status: 404 });
  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': CACHE_CONTROL,
    },
  });
}
