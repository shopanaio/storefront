/**
 * Where the files of the static site live in a store (a directory, a bucket): one function from
 * an address to its key, shared by the builder, the hybrid server and the CDN worker in front
 * of it. Pure, without Node built-ins: the browser and a worker import it too.
 */

/** The manifest of the last build: the builder's. */
export const STATIC_MANIFEST_KEY = '__static/manifest.json';
/** What the hybrid server reads of the manifest (`StaticServerIndex`), small at any size. */
export const STATIC_SERVER_INDEX_KEY = '__static/server.json';
/** The data of each page (its Apollo state), for client navigations. */
export const STATIC_DATA_PREFIX = '__static/data/';
/** The theme's 404 page. */
export const STATIC_NOT_FOUND_KEY = '404.html';
/** The shells of the page families, for addresses without a file when no server renders. */
export const STATIC_SHELL_PREFIX = '__shell/';
/** Assets of the builds a static page was rendered with. */
export const STATIC_ASSETS_PREFIX = 'assets/';

/** Files of search engines the builder writes beside the pages. */
const SEO_FILE = /^\/(?:robots\.txt|sitemap\.xml|sitemaps\/[^/]+\.xml)$/;

/**
 * Whether a key is a file the builder writes for its pages (an HTML, its data, a shell, the
 * 404 page, a file of search engines): what a build deletes when it no longer lists it.
 * Assets, the manifest and anything else in the store are never such a file.
 */
export function isStaticSiteKey(key: string): boolean {
  return (
    key === 'index.html' ||
    key.endsWith('/index.html') ||
    key === STATIC_NOT_FOUND_KEY ||
    (key.startsWith(STATIC_DATA_PREFIX) && key.endsWith('.json')) ||
    (key.startsWith(STATIC_SHELL_PREFIX) && key.endsWith('.html')) ||
    SEO_FILE.test(`/${key}`)
  );
}

/** An address with a file extension is a file, not a page (`/favicon.ico`, `/x.data`). */
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

/**
 * The segments of a page address, or null for one that is no page of the static site: a file,
 * a path that leaves its root, an empty segment (`/uk//products`), a segment of the runtime's
 * own (`__static`, `__shell`). One trailing slash is the address without it.
 */
function pageSegments(pathname: string): string[] | null {
  if (!pathname.startsWith('/')) return null;
  const trimmed = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  const segments = trimmed === '/' ? [] : trimmed.slice(1).split('/');
  for (const segment of segments) {
    if (
      segment === '' ||
      segment === '.' ||
      segment === '..' ||
      segment.startsWith('__')
    ) {
      return null;
    }
    if (
      segment.includes('\\') ||
      segment.includes('%2F') ||
      segment.includes('%2f')
    ) {
      return null;
    }
  }
  if (
    segments.length > 0 &&
    FILE_EXTENSION.test(segments[segments.length - 1])
  ) {
    return null;
  }
  return segments;
}

/**
 * The key of the HTML of an address: `/` → `index.html`, `/uk/products/x` →
 * `uk/products/x/index.html`. The query string is not part of it: one HTML per address, the
 * browser reads the parameters. Null for an address that is no page (see `pageSegments`).
 * `robots.txt` and the sitemaps are their own keys.
 */
export function staticKeyForPath(pathname: string): string | null {
  if (SEO_FILE.test(pathname)) return pathname.slice(1);
  const segments = pageSegments(pathname);
  if (!segments) return null;
  return [...segments, 'index.html'].join('/');
}

/**
 * The key of the data of an address: `/` → `__static/data/index.json`, `/uk/products/x` →
 * `__static/data/uk/products/x.json`. Null where `staticKeyForPath` has no page.
 */
export function staticDataKeyForPath(pathname: string): string | null {
  const segments = pageSegments(pathname);
  if (!segments) return null;
  return `${STATIC_DATA_PREFIX}${segments.length ? segments.join('/') : 'index'}.json`;
}

/** The address the data of a page is answered at (`/__static/data/...json`). */
export function staticDataUrl(pathname: string): string | null {
  const key = staticDataKeyForPath(pathname);
  return key ? `/${key}` : null;
}

/** Page families with a shell, by the first segment of their address. */
export const STATIC_SHELL_FAMILIES: Readonly<Record<string, string>> = {
  products: 'products',
  p: 'products',
  categories: 'categories',
  collections: 'collections',
  c: 'collections',
  vendors: 'vendors',
  pages: 'pages',
};

/** The shell key of a family (`__shell/products.html`). */
export function staticShellKey(family: string): string {
  return `${STATIC_SHELL_PREFIX}${family}.html`;
}

/**
 * The shell of the family an address belongs to, by its first segment after the locale
 * (`/uk/products/x` → `__shell/products.html`); null for an address of no family. The shell of
 * a family renders the layout of its page type: the same for every language.
 */
export function staticShellKeyForPath(
  pathname: string,
  localeSegments: readonly string[]
): string | null {
  const segments = pageSegments(pathname);
  if (!segments || segments.length === 0) return null;
  const [first, ...rest] = segments;
  const unlocalized = localeSegments.includes(first.toLowerCase())
    ? rest
    : segments;
  if (unlocalized.length < 2) return null;
  const family = STATIC_SHELL_FAMILIES[unlocalized[0]];
  return family ? staticShellKey(family) : null;
}

/**
 * Query parameters a page renders nothing of: links of campaigns and ads, analytics. Any other
 * parameter may change what the page shows (`sort`, `filter.*`, `variant`, `q`), so its address
 * is rendered by the server, never answered with the HTML rendered without it.
 */
const IGNORED_QUERY_PARAMS: ReadonlySet<string> = new Set([
  'gclid',
  'gbraid',
  'wbraid',
  'dclid',
  'fbclid',
  'msclkid',
  'yclid',
  'ttclid',
  'twclid',
  'igshid',
  'li_fat_id',
  'mc_cid',
  'mc_eid',
  'srsltid',
  '_ga',
  '_gl',
  'ref',
]);

/** Whether a query string leaves the page as the builder rendered it: none, or tracking only. */
export function isStaticQuery(search: URLSearchParams): boolean {
  for (const name of search.keys()) {
    if (!name.startsWith('utm_') && !IGNORED_QUERY_PARAMS.has(name)) {
      return false;
    }
  }
  return true;
}
