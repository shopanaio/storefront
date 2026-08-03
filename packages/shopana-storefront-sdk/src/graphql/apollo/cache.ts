import type { InMemoryCacheConfig } from '@apollo/client';
import { InMemoryCache } from '@apollo/client-integration-nextjs';

/**
 * Shared cache policy factory for the RSC and browser clients.
 * Add schema-specific keyFields and pagination policies here so hydration uses
 * exactly the same normalization rules on both sides of the RSC boundary.
 */
export function createApolloCache(
  overrides: InMemoryCacheConfig = {}
): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {},
    ...overrides,
  });
}
