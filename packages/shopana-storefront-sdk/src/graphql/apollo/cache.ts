import type {
  FieldPolicy,
  InMemoryCacheConfig,
  NormalizedCacheObject,
  StoreObject,
  TypePolicy,
} from '@apollo/client';
import { InMemoryCache } from '@apollo/client';
import { cursorConnectionPolicy } from './pagination/cursorPagination';
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

/** Ids of the cached entities with a handle, by `Typename:handle`. */
type HandleIndex = Map<string, string>;

function indexHandle(index: HandleIndex, object: Readonly<StoreObject>): void {
  const { __typename, id, handle } = object;
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
function handleKeyFields(index: HandleIndex): TypePolicy['keyFields'] {
  return (object) => {
    if (object.id === undefined || object.id === null) return false;
    indexHandle(index, object);
    return ['id'];
  };
}

/**
 * `productByHandle(handle)` and the like answer from the entity already cached under that
 * handle (a product card of a listing, a category of a menu) when the query itself never ran,
 * so a page opened from a card renders what the card had. Fields the page needs beyond that
 * are missing, so a cache-first query still goes to the network for them.
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

/** An `InMemoryCache` class: Apollo's own, or the one of a framework integration. */
export type InMemoryCacheClass = new (
  config: InMemoryCacheConfig
) => InMemoryCache;

const storefrontCacheClasses = new WeakMap<
  InMemoryCacheClass,
  new (config: InMemoryCacheConfig, handles: HandleIndex) => InMemoryCache
>();

/**
 * The cache class over `Base`. Restored snapshots (SSR state, page hydration) skip key fields:
 * their handles are indexed here.
 */
function storefrontCacheClass(Base: InMemoryCacheClass) {
  let StorefrontCache = storefrontCacheClasses.get(Base);
  if (!StorefrontCache) {
    StorefrontCache = class extends Base {
      readonly #handles: HandleIndex;

      constructor(config: InMemoryCacheConfig, handles: HandleIndex) {
        super(config);
        this.#handles = handles;
      }

      override restore(data: NormalizedCacheObject): this {
        for (const record of Object.values(data)) {
          if (
            record &&
            typeof record === 'object' &&
            HANDLE_TYPENAMES.has(String(record.__typename))
          ) {
            indexHandle(this.#handles, record as StoreObject);
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
  Base: InMemoryCacheClass = InMemoryCache
): InMemoryCache {
  const handles: HandleIndex = new Map();
  const baseTypePolicies: NonNullable<InMemoryCacheConfig['typePolicies']> = {
    Collection: {
      keyFields: handleKeyFields(handles),
      fields: {
        products: cursorConnectionPolicy(['query', 'sort', 'filters']),
      },
    },
    Category: {
      keyFields: handleKeyFields(handles),
      fields: {
        products: cursorConnectionPolicy(['sort', 'filters']),
      },
    },
    Product: {
      keyFields: handleKeyFields(handles),
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
      keyFields: handleKeyFields(handles),
    },
    Query: {
      fields: {
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
  return new StorefrontCache(
    {
      ...overrides,
      // Fragments on interfaces and unions (`... on Media`) match only with the schema types.
      possibleTypes: Object.fromEntries(
        Object.entries({ ...possibleTypes, ...overrides.possibleTypes }).map(
          ([supertype, subtypes]) => [supertype, [...subtypes]]
        )
      ),
      typePolicies,
    },
    handles
  );
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
