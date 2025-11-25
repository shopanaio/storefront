"use client";

import { PreloadedQuery, PreloadFetchPolicy } from "react-relay";
import { ConcreteRequest, IEnvironment, OperationType } from "relay-runtime";
import { useSerializablePreloadedQuery as useSerializablePreloadedQueryBase } from "../../graphql/relay/useSerializablePreloadedQuery";
import { createResponseCache } from "../../graphql/relay/Environment";
import type { SerializablePreloadedQuery } from "../../graphql/relay/loadSerializableQuery";

// Re-export type for client components
export type { SerializablePreloadedQuery };

// Client-side response cache singleton
// Default: 5 minutes TTL, cache size 100
const responseCache = createResponseCache(5 * 60 * 1000, 100);

export default function useSerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  environment: IEnvironment,
  preloadQuery: SerializablePreloadedQuery<TRequest, TQuery>,
  fetchPolicy: PreloadFetchPolicy = "store-or-network"
): PreloadedQuery<TQuery> {
  return useSerializablePreloadedQueryBase(
    environment,
    preloadQuery,
    responseCache,
    fetchPolicy
  );
}
