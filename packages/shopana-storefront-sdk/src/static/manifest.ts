/**
 * The manifest of a static site (`__static/manifest.json`): every file the builder wrote, with
 * its hash, entities and `validUntil`, for the builder itself (unchanged pages, renders of
 * single pages, publishing) and, later, the invalidation of single pages. The hybrid server
 * reads only its small index (`__static/server.json`, `StaticServerIndex`).
 */
export const STATIC_MANIFEST_VERSION = 1;

/** What a file of the site is. */
export type StaticFileKind =
  /** A page the builder rendered from the API. */
  | 'page'
  /** A client page: its layout and a skeleton, filled by the browser. */
  | 'shell'
  /** The shell of a page family, answered when its page has no file and no server renders. */
  | 'family-shell'
  /** The theme's 404 page, answered for unknown addresses when no server renders. */
  | 'not-found'
  /** The data of a page (`__static/data/*.json`): its Apollo state. */
  | 'data'
  /** `robots.txt`, the sitemaps. */
  | 'seo';

export interface StaticManifestFile {
  kind: StaticFileKind;
  /** The address the file answers; absent for data and the family shells. */
  path?: string;
  /** The store language of a page (its URL segment). */
  locale?: string;
  /** The HTTP status the file is answered with. */
  status: number;
  contentType: string;
  /** Hash of the content: the ETag the server answers with. */
  hash: string;
  /** The data file of a page. */
  data?: string;
  /** `Typename:id` of the entities a page shows. */
  entities?: string[];
  /** When a page's data changes by itself; null when no moment is known. */
  validUntil?: string | null;
  renderedAt: string;
}

export interface StaticManifest {
  version: typeof STATIC_MANIFEST_VERSION;
  /** The build of the theme the files were rendered with (its assets). */
  buildId: string;
  /** When the build started. */
  builtAt: string;
  /** URL segments of the store languages: the server tells a locale segment from a page's. */
  locales: string[];
  /** Page types whose addresses have static data (`StaticDocumentInfo.dataPageTypes`). */
  dataPageTypes: string[];
  /** Files by key (their path in the store). */
  files: Record<string, StaticManifestFile>;
  /**
   * Assets of earlier builds this one does not ship, with when they left: deleted a week
   * later, while cached HTML and open tabs may still ask for them. A page, its data or any
   * other file no build lists any more is deleted at once.
   */
  retired?: Record<string, string>;
}

/**
 * What the hybrid server needs of a static site (`__static/server.json`), written with every
 * manifest: small whatever the size of the catalog.
 */
export interface StaticServerIndex {
  version: typeof STATIC_MANIFEST_VERSION;
  buildId: string;
  /** URL segments of the store languages. */
  locales: string[];
  /** The status of each file answered with another than 200 (`404.html`). */
  statuses: Record<string, number>;
}

/** The server index of a manifest. */
export function staticServerIndex(manifest: StaticManifest): StaticServerIndex {
  return {
    version: manifest.version,
    buildId: manifest.buildId,
    locales: manifest.locales,
    statuses: Object.fromEntries(
      Object.entries(manifest.files)
        .filter(([, file]) => file.status !== 200)
        .map(([key, file]) => [key, file.status])
    ),
  };
}

/** What a static document tells the browser about itself (`window.__shopanaStatic`). */
export interface StaticDocumentInfo {
  buildId: string;
  renderedAt: string;
  /** URL segment of the page's language. */
  locale: string;
  path: string;
  /** When the page's data changes by itself, if known. */
  validUntil?: string | null;
  /**
   * Page types whose addresses the builder rendered with their data: a client navigation
   * asks the static site for the data of these only (never of a cart, an account, a search).
   */
  dataPageTypes: string[];
  /**
   * Prices come with the fast data too: the HTML of a static site in an image changes only
   * with the image, a bucket's within minutes of a change of a price.
   */
  volatilePrices?: boolean;
}

export const STATIC_DOCUMENT_GLOBAL = '__shopanaStatic';

/** The static document the browser runs in; null in a server-rendered one (or on the server). */
export function readStaticDocument(): StaticDocumentInfo | null {
  if (typeof window === 'undefined') return null;
  return (
    (window as unknown as Record<string, StaticDocumentInfo | undefined>)[
      STATIC_DOCUMENT_GLOBAL
    ] ?? null
  );
}
