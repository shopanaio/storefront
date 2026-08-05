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
    Category: {
      fields: {
        products: cursorConnectionPolicy(['sort', 'filters']),
      },
    },
    Product: {
      fields: {
        reviews: cursorConnectionPolicy(['sort']),
      },
    },
    Query: {
      fields: {
        searchProducts: cursorConnectionPolicy(['query', 'sort', 'filters']),
      },
    },
  };

  return new InMemoryCache({
    ...overrides,
    typePolicies: {
      ...baseTypePolicies,
      ...overrides.typePolicies,
      Category: {
        ...baseTypePolicies.Category,
        ...overrides.typePolicies?.Category,
        fields: {
          ...baseTypePolicies.Category?.fields,
          ...overrides.typePolicies?.Category?.fields,
        },
      },
      Product: {
        ...baseTypePolicies.Product,
        ...overrides.typePolicies?.Product,
        fields: {
          ...baseTypePolicies.Product?.fields,
          ...overrides.typePolicies?.Product?.fields,
        },
      },
      Query: {
        ...baseTypePolicies.Query,
        ...overrides.typePolicies?.Query,
        fields: {
          ...baseTypePolicies.Query?.fields,
          ...overrides.typePolicies?.Query?.fields,
        },
      },
    },
  });
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
