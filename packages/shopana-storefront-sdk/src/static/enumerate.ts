import {
  SdkStaticCategoriesDocument,
  SdkStaticNavigationMenuDocument,
  SdkStaticOnlineStorePagesDocument,
  SdkStaticProductsDocument,
  SdkStaticStorePoliciesDocument,
  SdkStaticVendorsDocument,
  type SdkStaticMenuItemFragment,
} from '../graphql/apollo/generated/operations';
import {
  buildPath,
  parseRoute,
  type StorefrontRouteName,
} from '../utils/routeParser';
import type {
  StaticEnumerateContext,
  StaticEnumerator,
  StaticPageFamily,
  StaticSiteConfig,
} from './config';

/**
 * Nodes per request: the most a connection of the Storefront API returns (`first` is 1 to 100
 * in the schema).
 */
const PAGE_SIZE = 100;
/**
 * Requests per list at most: a list that never ends fails the build instead of running forever
 * (a list cut short would publish a site without the rest of its pages).
 */
const MAX_PAGES = 1_000;

/** An address of the static site, without the locale segment. */
export interface StaticRoute {
  path: string;
  family: StaticPageFamily;
}

interface Connection {
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    readonly endCursor?: string | null;
  };
  readonly nodes: ReadonlyArray<{ readonly handle: string }>;
}

/** Every handle of a connection, page after page. */
async function allHandles(
  loadPage: (after: string | null) => Promise<Connection>
): Promise<string[]> {
  const handles: string[] = [];
  let after: string | null = null;
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const connection = await loadPage(after);
    handles.push(...connection.nodes.map((node) => node.handle));
    if (!connection.pageInfo.hasNextPage || !connection.pageInfo.endCursor) {
      return handles;
    }
    after = connection.pageInfo.endCursor;
  }
  throw new Error(
    `A list of the Storefront API has more than ${MAX_PAGES * PAGE_SIZE} entries`
  );
}

/**
 * The collection handle of a menu target: its resource, or a collection address of the store
 * (`/collections/x`, `/c/x`, with or without the segment of `locale`).
 */
function collectionHandle(
  item: SdkStaticMenuItemFragment,
  locale: StaticEnumerateContext['locale']
): string | null {
  const { resource, url } = item.target ?? {};
  if (resource?.__typename === 'Collection') return resource.handle;
  if (!url?.startsWith('/') || url.startsWith('//')) return null;
  let pathname = url.replace(/[?#].*$/, '');
  const prefix = `/${locale.segment}`;
  if (pathname.toLowerCase() === prefix.toLowerCase()) return null;
  if (pathname.toLowerCase().startsWith(`${prefix.toLowerCase()}/`)) {
    pathname = pathname.slice(prefix.length);
  }
  try {
    const route = parseRoute(pathname);
    return route.pageType === 'collection'
      ? (route.params.handle ?? null)
      : null;
  } catch {
    // A malformed escape in the address: no page of the store.
    return null;
  }
}

/** Collections the navigation menus link to, at any depth. */
async function menuCollections(
  { client, locale }: StaticEnumerateContext,
  menus: readonly string[]
): Promise<string[]> {
  const handles: string[] = [];
  for (const handle of menus) {
    const { data } = await client.query({
      query: SdkStaticNavigationMenuDocument,
      variables: { handle },
      fetchPolicy: 'no-cache',
    });
    const visit = (
      items: ReadonlyArray<
        SdkStaticMenuItemFragment & {
          readonly children?: ReadonlyArray<SdkStaticMenuItemFragment> | null;
        }
      >
    ) => {
      for (const item of items) {
        const found = collectionHandle(item, locale);
        if (found) handles.push(found);
        if (item.children) visit(item.children);
      }
    };
    visit(data?.onlineStoreNavigationMenuByHandle?.items ?? []);
  }
  return handles;
}

export interface StaticEnumerateOptions extends StaticEnumerateContext {
  /** Menus the layout renders: the collections they link to are rendered. */
  navigationMenus: readonly string[];
}

/** The handles of an enumerator in one store language. */
async function enumerateHandles(
  enumerator: StaticEnumerator,
  options: StaticEnumerateOptions
): Promise<string[]> {
  const { client, navigationMenus } = options;
  switch (enumerator) {
    case 'products':
      return allHandles(async (after) => {
        const { data } = await client.query({
          query: SdkStaticProductsDocument,
          variables: { first: PAGE_SIZE, after },
          fetchPolicy: 'no-cache',
        });
        return data!.products;
      });
    case 'categories':
      return allHandles(async (after) => {
        const { data } = await client.query({
          query: SdkStaticCategoriesDocument,
          variables: { first: PAGE_SIZE, after },
          fetchPolicy: 'no-cache',
        });
        return data!.categories;
      });
    case 'vendors':
      return allHandles(async (after) => {
        const { data } = await client.query({
          query: SdkStaticVendorsDocument,
          variables: { first: PAGE_SIZE, after },
          fetchPolicy: 'no-cache',
        });
        return data!.vendors;
      });
    case 'onlineStorePages':
      return allHandles(async (after) => {
        const { data } = await client.query({
          query: SdkStaticOnlineStorePagesDocument,
          variables: { first: PAGE_SIZE, after },
          fetchPolicy: 'no-cache',
        });
        return data!.onlineStorePages;
      });
    case 'store.policies': {
      const { data } = await client.query({
        query: SdkStaticStorePoliciesDocument,
        fetchPolicy: 'no-cache',
      });
      return data?.store.policies.map((policy) => policy.handle) ?? [];
    }
    case 'menus':
      return menuCollections(options, navigationMenus);
  }
}

/** The storefront route of a family's addresses; null for a family at one address. */
const FAMILY_ROUTES: Record<StaticPageFamily, StorefrontRouteName | null> = {
  home: null,
  'list-collections': null,
  blog: null,
  product: 'product',
  category: 'category',
  collection: 'collection',
  vendor: 'vendor',
  page: 'page',
  policies: 'policy',
};

/** The address of a family that has one. */
const FAMILY_PATHS: Partial<Record<StaticPageFamily, string>> = {
  home: buildPath('home'),
  'list-collections': buildPath('list-collections'),
};

/**
 * Every address of the static site in one store language, without its locale segment: each
 * family of the config, by its enumerator or the theme's source. A handle twice is one page.
 */
export async function enumerateStaticRoutes(
  config: Pick<StaticSiteConfig, 'pages' | 'extraCollections'>,
  options: StaticEnumerateOptions
): Promise<StaticRoute[]> {
  const routes = new Map<string, StaticRoute>();
  const add = (family: StaticPageFamily, path: string) => {
    if (!routes.has(path)) routes.set(path, { path, family });
  };

  for (const [family, page] of Object.entries(config.pages) as Array<
    [StaticPageFamily, NonNullable<StaticSiteConfig['pages'][StaticPageFamily]>]
  >) {
    if (page === true) {
      const path = FAMILY_PATHS[family];
      if (!path) {
        throw new Error(
          `The static page family "${family}" lists its addresses: give it an enumerator`
        );
      }
      add(family, path);
      continue;
    }
    if (typeof page.enumerate === 'function') {
      for (const path of await page.enumerate(options)) add(family, path);
      continue;
    }
    const route = FAMILY_ROUTES[family];
    if (!route) {
      throw new Error(
        `The static page family "${family}" takes the theme's own address source`
      );
    }
    const handles = await enumerateHandles(page.enumerate, options);
    if (family === 'collection')
      handles.push(...(config.extraCollections ?? []));
    for (const handle of handles) add(family, buildPath(route, { handle }));
  }
  return [...routes.values()];
}
