import type {
  InMemoryCacheConfig,
  NormalizedCacheObject,
} from '@apollo/client';
import { InMemoryCache } from '@apollo/client-integration-nextjs';
import { cursorConnectionPolicy } from './pagination/cursorPagination';

/**
 * Shared cache policy factory for the RSC and browser clients.
 * Add schema-specific keyFields and pagination policies here so hydration uses
 * exactly the same normalization rules on both sides of the RSC boundary.
 */
export function createApolloCache(
  overrides: InMemoryCacheConfig = {}
): InMemoryCache {
  const baseTypePolicies: NonNullable<InMemoryCacheConfig['typePolicies']> = {
    Collection: {
      fields: {
        products: cursorConnectionPolicy(['query', 'sort', 'filters']),
      },
    },
    Category: {
      fields: {
        products: cursorConnectionPolicy(['sort', 'filters']),
      },
    },
    Product: {
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
    Query: {
      fields: {
        searchProducts: cursorConnectionPolicy(['query', 'sort', 'filters']),
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

  return new InMemoryCache({ ...overrides, typePolicies });
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
