/**
 * The manifest of a static site (`__static/manifest.json`): what the builder wrote in its last
 * full build, read by the hybrid server (statuses, hashes) and, later, by the invalidation of
 * single pages (entities, `validUntil`).
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
  /** Files by key (their path in the store). */
  files: Record<string, StaticManifestFile>;
  /**
   * Keys of earlier builds no build lists any more, with when they left: deleted a week
   * later, while cached HTML and open tabs may still ask for them.
   */
  retired?: Record<string, string>;
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
