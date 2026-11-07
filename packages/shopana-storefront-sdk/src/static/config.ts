import type { ApolloClient } from '@apollo/client';
import type { StaticFieldAspects } from '../graphql/apollo/fieldAspects';
import type { StorefrontLocale } from '../modules/localization/core/locale';

/**
 * What the static site builder renders for a theme (`static.config.ts`): which page families
 * it enumerates in which store languages, the client pages it writes as shells, and where the
 * files go. Every page is rendered as a guest: the same HTML for every buyer, personalized by
 * the browser after hydration.
 */
export interface StaticSiteConfig {
  /** Store languages to render: `all`, or URL segments (`['en', 'uk']`). */
  locales: 'all' | readonly string[];
  /** The page families to render (see `StaticPageFamily`). */
  pages: StaticPagesConfig;
  /**
   * Collection handles rendered besides those the menus link to: the Storefront API has no
   * list of collections.
   */
  extraCollections?: readonly string[];
  /**
   * Addresses of pages the browser renders itself (cart, checkout, account, search): written
   * as a document with the layout of their page and a skeleton in place of the content.
   */
  shells?: readonly string[];
  /** The theme's 404 page as `404.html`, answered with 404 for any unknown address. */
  notFound?: boolean;
  /**
   * The directory the builder writes to, relative to the theme: `<runtimeDir>/build/static`
   * by default, next to the browser build, where `storefront-runtime start` finds it.
   */
  output?: string;
  /** Pages rendered at once (worker threads). */
  concurrency?: number;
  /** Pages a worker renders before it is replaced by a new one (module state, caches). */
  pagesPerWorker?: number;
  publish?: StaticPublishConfig;
  /**
   * Aspects of the theme's own fields (`STATIC_FIELD_ASPECTS`): which part of an entity each
   * field of its fragments shows, so an event of another part renders none of its pages. A
   * field without an entry is `content`.
   */
  fieldAspects?: StaticFieldAspects;
}

export interface StaticPublishConfig {
  /**
   * `fs`: the output directory. `s3`: the bucket of `STOREFRONT_STATIC_STORE`
   * (`s3://<bucket>/<prefix>`), written over the S3 API.
   */
  store: 'fs' | 's3';
  /**
   * The CDN in front of the site: `cloudflare` tags every page and its data
   * (`Cache-Tag: pg:<pageKey>, build:<buildId>`) and purges the tags of what a render changed
   * (`CLOUDFLARE_PURGE_TOKEN`, `CLOUDFLARE_ZONE_ID`); `none` while no CDN caches HTML.
   */
  cdn: 'none' | 'cloudflare';
}

/** The page families the builder knows: a page type (or a module page) and its addresses. */
export type StaticPageFamily =
  | 'home'
  | 'product'
  | 'category'
  | 'collection'
  | 'vendor'
  | 'page'
  | 'policies'
  | 'list-collections'
  | 'blog';

/** A Storefront API list the builder walks for the handles of a family. */
export type StaticEnumerator =
  | 'products'
  | 'categories'
  | 'menus'
  | 'vendors'
  | 'onlineStorePages'
  | 'store.policies';

/** What a theme's own address source gets: one store language at a time. */
export interface StaticEnumerateContext {
  locale: StorefrontLocale;
  /** A server client of the Storefront API, as a guest, in `locale`. */
  client: ApolloClient;
}

/**
 * Addresses of a family the theme lists itself (a blog with no API yet): paths without the
 * locale segment.
 */
export type StaticPathSource = (
  context: StaticEnumerateContext
) => Promise<readonly string[]> | readonly string[];

/** A family rendered at one address (`true`), or at each address its source lists. */
export type StaticPageFamilyConfig =
  | true
  | { enumerate: StaticEnumerator | StaticPathSource };

export type StaticPagesConfig = Partial<
  Record<StaticPageFamily, StaticPageFamilyConfig>
>;

export function defineStaticSite<const TConfig extends StaticSiteConfig>(
  config: TConfig
): TConfig {
  return config;
}
