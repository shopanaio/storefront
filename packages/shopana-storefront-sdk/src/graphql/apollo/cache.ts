import type {
  ApolloCache,
  Cache,
  DocumentNode,
  FieldPolicy,
  InMemoryCacheConfig,
  NormalizedCacheObject,
  OperationVariables,
  StoreObject,
  TypePolicy,
} from '@apollo/client';
import { InMemoryCache } from '@apollo/client';
import { cursorConnectionPolicy } from './pagination/cursorPagination';
import {
  indexRequestResults,
  queryResultKey,
  type RequestQueryResult,
} from './requestResultCache';
import { objectTypes } from './generated/objectTypes';
import { possibleTypes } from './generated/possibleTypes';

/** Root fields that find one entity by its handle, by the type of the entity. */
const HANDLE_LOOKUPS = {
  productByHandle: 'Product',
  categoryByHandle: 'Category',
  collectionByHandle: 'Collection',
  vendorByHandle: 'Vendor',
} as const;

type HandleTypename = (typeof HANDLE_LOOKUPS)[keyof typeof HANDLE_LOOKUPS];

const HANDLE_TYPENAMES = new Set<string>(Object.values(HANDLE_LOOKUPS));

/** The types indexed by handle: those of the lookups and the listing card (`cachedProductCardId`). */
const INDEXED_TYPENAMES = new Set<string>([...HANDLE_TYPENAMES, 'ProductCard']);

/** Ids of the cached entities with a handle, by `Typename:handle`. */
type HandleIndex = Map<string, string>;
type NodeIndex = Map<string, HandleTypename>;

function indexHandle(
  index: HandleIndex,
  nodes: NodeIndex,
  object: Readonly<StoreObject>
): void {
  const { __typename, id, handle } = object;
  if (
    typeof __typename === 'string' &&
    HANDLE_TYPENAMES.has(__typename) &&
    typeof id === 'string'
  ) {
    nodes.set(id, __typename as HandleTypename);
  }
  if (
    typeof __typename === 'string' &&
    typeof id === 'string' &&
    typeof handle === 'string'
  ) {
    index.set(`${__typename}:${handle}`, id);
  }
}

/**
 * Entities keyed by id as usual, and one selected without id (`vendor { name }`) stays inside
 * its parent; each one written with its handle is indexed on the way.
 */
function handleKeyFields(
  index: HandleIndex,
  nodes: NodeIndex
): TypePolicy['keyFields'] {
  return (object) => {
    if (object.id === undefined || object.id === null) return false;
    indexHandle(index, nodes, object);
    return ['id'];
  };
}

/**
 * `productByHandle(handle)` and the like answer from the entity already cached under that
 * handle (a product another query read, a category of a menu) when the query itself never ran.
 * A listing card is a `ProductCard`, not a `Product`, and answers none of them. Fields the page
 * needs beyond the cached ones are missing, so a cache-first query still goes to the network.
 */
function handleLookupPolicy(
  index: HandleIndex,
  typename: HandleTypename
): FieldPolicy {
  return {
    read(existing, { args, toReference, canRead }) {
      if (existing !== undefined) return existing;
      const handle = args?.handle;
      if (typeof handle !== 'string') return undefined;
      const id = index.get(`${typename}:${handle}`);
      if (!id) return undefined;
      const reference = toReference({ __typename: typename, id });
      return reference && canRead(reference) ? reference : undefined;
    },
  };
}

/** Relay lookup of an entity already loaded by its handle. Missing connection fields still cause a network read. */
function nodeLookupPolicy(nodes: NodeIndex): FieldPolicy {
  return {
    read(existing, { args, toReference, canRead }) {
      if (existing !== undefined) return existing;
      const id = args?.id;
      const typename = typeof id === 'string' ? nodes.get(id) : undefined;
      if (!typename) return undefined;
      const reference = toReference({ __typename: typename, id });
      return reference && canRead(reference) ? reference : undefined;
    },
  };
}

/** An `InMemoryCache` class: Apollo's own, or the one of a framework integration. */
export type InMemoryCacheClass = new (
  config: InMemoryCacheConfig
) => InMemoryCache;

const storefrontCacheClasses = new WeakMap<
  InMemoryCacheClass,
  new (
    config: InMemoryCacheConfig,
    handles: HandleIndex,
    nodes: NodeIndex,
    results: readonly RequestQueryResult[]
  ) => InMemoryCache
>();

/**
 * The cache class over `Base`. Restored snapshots (SSR state, page hydration) skip key fields:
 * their handles are indexed here. Whole responses of the server (`results`) are written when a
 * query first asks for its own, so their documents need not be in the page's first code, and
 * through key fields, so their handles index themselves.
 */
function storefrontCacheClass(Base: InMemoryCacheClass) {
  let StorefrontCache = storefrontCacheClasses.get(Base);
  if (!StorefrontCache) {
    StorefrontCache = class extends Base {
      readonly #handles: HandleIndex;
      readonly #nodes: NodeIndex;
      readonly #pending: Map<string, RequestQueryResult>;

      constructor(
        config: InMemoryCacheConfig,
        handles: HandleIndex,
        nodes: NodeIndex,
        results: readonly RequestQueryResult[]
      ) {
        super(config);
        this.#handles = handles;
        this.#nodes = nodes;
        this.#pending = indexRequestResults(results);
      }

      // Not `#private`: compiled down, such a method could not call `super`.
      private writePending(
        query: DocumentNode,
        variables: unknown,
        id?: string
      ) {
        if (this.#pending.size === 0) return;
        const key = queryResultKey(query, variables, id);
        const result = key && this.#pending.get(key);
        if (!key || !result) return;
        this.#pending.delete(key);
        // No broadcast: this runs inside a read, in a render, and the data is what the server
        // rendered with.
        super.write({
          dataId: 'ROOT_QUERY',
          query,
          variables: variables as OperationVariables,
          result: result.d,
          broadcast: false,
        });
      }

      override read<TData>(options: Cache.ReadOptions<TData>) {
        this.writePending(
          options.query,
          options.variables,
          options.rootId ?? options.id
        );
        return super.read(options);
      }

      override diff<TData>(options: Cache.DiffOptions<TData>) {
        this.writePending(options.query, options.variables, options.id);
        return super.diff(options);
      }

      override write<TData>(options: Cache.WriteOptions<TData>) {
        // A newer answer of the query: the server's must not overwrite it later.
        if (this.#pending.size > 0) {
          const key = queryResultKey(
            options.query,
            options.variables,
            options.dataId
          );
          if (key) this.#pending.delete(key);
        }
        return super.write(options);
      }

      override reset(options?: Cache.ResetOptions) {
        this.#pending.clear();
        return super.reset(options);
      }

      override restore(data: NormalizedCacheObject): this {
        for (const record of Object.values(data)) {
          if (
            record &&
            typeof record === 'object' &&
            INDEXED_TYPENAMES.has(String(record.__typename))
          ) {
            indexHandle(this.#handles, this.#nodes, record as StoreObject);
          }
        }
        return super.restore(data);
      }
    };
    storefrontCacheClasses.set(Base, StorefrontCache);
  }
  return StorefrontCache;
}

/**
 * Shared cache policy factory for the RSC and browser clients.
 * Add schema-specific keyFields and pagination policies here so hydration uses
 * exactly the same normalization rules on both sides of the RSC boundary.
 */
export function createApolloCache(
  overrides: InMemoryCacheConfig = {},
  Base: InMemoryCacheClass = InMemoryCache,
  results: readonly RequestQueryResult[] = []
): InMemoryCache {
  const handles: HandleIndex = new Map();
  const nodes: NodeIndex = new Map();
  const ownTypePolicies: NonNullable<InMemoryCacheConfig['typePolicies']> = {
    Collection: {
      keyFields: handleKeyFields(handles, nodes),
      fields: {
        products: cursorConnectionPolicy(['query', 'sort', 'filters']),
      },
    },
    Category: {
      keyFields: handleKeyFields(handles, nodes),
      fields: {
        products: cursorConnectionPolicy(['sort', 'filters']),
      },
    },
    Product: {
      keyFields: handleKeyFields(handles, nodes),
      fields: {
        frequentlyBoughtTogether: cursorConnectionPolicy([]),
        questions: cursorConnectionPolicy(['sort']),
        relatedProducts: cursorConnectionPolicy([]),
        reviews: cursorConnectionPolicy([
          'sort',
          'rating',
          'verifiedOnly',
          'withMediaOnly',
        ]),
      },
    },
    Vendor: {
      keyFields: handleKeyFields(handles, nodes),
      fields: {
        products: cursorConnectionPolicy(['query', 'sort', 'filters']),
      },
    },
    // A card id holds the product and the variant its source fixed, so two listings that show
    // one product with different variants keep two cards. A card variant is the variant itself
    // (ADR-023). Indexed by the product's handle for `cachedProductCardId`.
    ProductCard: {
      keyFields: handleKeyFields(handles, nodes),
    },
    ProductCardVariant: {
      keyFields: ['id'],
    },
    // A filter and its values are ids within one listing, with that listing's counts: stored
    // inside it, or another listing would overwrite the filters every page reads.
    Filter: {
      keyFields: false,
    },
    FilterValue: {
      keyFields: false,
    },
    // No id: the collection stays under `Query.dynamicCollection`, keyed by its rules. Merged,
    // not replaced: the rules labels and the products of one set of rules come in separate
    // queries, and each would drop the other's fields (and refetch them) on every write.
    DynamicCollection: {
      merge: true,
      fields: {
        // FILTER and RANK pages of one query are different listings.
        products: cursorConnectionPolicy([
          'query',
          'queryMode',
          'sort',
          'filters',
        ]),
      },
    },
    Query: {
      fields: {
        node: nodeLookupPolicy(nodes),
        searchProducts: cursorConnectionPolicy(['query', 'sort', 'filters']),
        ...Object.fromEntries(
          Object.entries(HANDLE_LOOKUPS).map(([field, typename]) => [
            field,
            handleLookupPolicy(handles, typename),
          ])
        ),
      },
    },
    // Customer connections are keyed by the page size, so readers with different sizes (the
    // wishlist page and the product actions) keep separate lists; `after` pages are appended.
    Customer: {
      fields: {
        addresses: cursorConnectionPolicy(['first']),
        dataRequests: cursorConnectionPolicy(['first']),
        reviewRequests: cursorConnectionPolicy(['first']),
      },
    },
    CustomerWishlist: {
      fields: {
        items: cursorConnectionPolicy(['first']),
      },
    },
    LoyaltyAccount: {
      fields: {
        transactions: cursorConnectionPolicy(['first']),
      },
    },
  };
  // An object written without an id (its type has none, or the query does not select it)
  // stays inside its parent, and Apollo replaces it with what the next query writes there:
  // the fields only the other query asked for are lost, and that query goes to the network
  // again. Merged instead. A reference, a list or an object of another type is still
  // replaced, so only the same object of the same parent field merges.
  const baseTypePolicies: NonNullable<InMemoryCacheConfig['typePolicies']> = {
    ...Object.fromEntries(
      objectTypes.map((typename) => [typename, { merge: true }])
    ),
  };
  for (const [typename, policy] of Object.entries(ownTypePolicies)) {
    baseTypePolicies[typename] = { ...baseTypePolicies[typename], ...policy };
  }

  const typePolicies: NonNullable<InMemoryCacheConfig['typePolicies']> = {
    ...baseTypePolicies,
    ...overrides.typePolicies,
  };
  for (const [typename, base] of Object.entries(baseTypePolicies)) {
    const override = overrides.typePolicies?.[typename];
    if (!override) continue;
    typePolicies[typename] = {
      ...base,
      ...override,
      fields: { ...base.fields, ...override.fields },
    };
  }

  const StorefrontCache = storefrontCacheClass(Base);
  const cache = new StorefrontCache(
    {
      // A server cache lives for one request, so remembering results between reads saves
      // little and costs a dependency graph. The browser's cache lives as long as the page,
      // and its hooks rely on stable results.
      resultCaching: typeof window !== 'undefined',
      ...overrides,
      // Fragments on interfaces and unions (`... on Media`) match only with the schema types.
      possibleTypes: Object.fromEntries(
        Object.entries({ ...possibleTypes, ...overrides.possibleTypes }).map(
          ([supertype, subtypes]) => [supertype, [...subtypes]]
        )
      ),
      typePolicies,
    },
    handles,
    nodes,
    results
  );
  cacheHandles.set(cache, handles);
  return cache;
}

/** The handle index of every cache `createApolloCache` made. */
const cacheHandles = new WeakMap<ApolloCache, HandleIndex>();

/**
 * The cache id of a listing card of the product with this handle (the last one cached), or null.
 * A card is a `ProductCard`, which `productByHandle` never answers: the product page reads it
 * itself while it loads (its cover and title).
 */
export function cachedProductCardId(
  cache: ApolloCache,
  handle: string
): string | null {
  const id = cacheHandles.get(cache)?.get(`ProductCard:${handle}`);
  return id ? (cache.identify({ __typename: 'ProductCard', id }) ?? null) : null;
}

/**
 * Merges normalized snapshots record-by-record. Page definitions that execute
 * parallel operations must instead extract once from their shared request
 * client after every operation settles.
 */
export function mergeApolloCacheStates(
  ...states: Array<NormalizedCacheObject | null | undefined>
): NormalizedCacheObject {
  const merged: NormalizedCacheObject = {};

  for (const state of states) {
    if (!state) continue;

    for (const [cacheKey, incoming] of Object.entries(state)) {
      const existing = merged[cacheKey];
      merged[cacheKey] =
        isCacheRecord(existing) && isCacheRecord(incoming)
          ? { ...existing, ...incoming }
          : incoming;
    }
  }

  return merged;
}

function isCacheRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
