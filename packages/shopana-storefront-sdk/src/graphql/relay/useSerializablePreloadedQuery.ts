// Convert preloaded query object (with raw GraphQL Response) into
// Relay's PreloadedQuery.

import { useMemo } from "react";
import { PreloadedQuery, PreloadFetchPolicy } from "react-relay";
import {
  ConcreteRequest,
  IEnvironment,
  OperationType,
  QueryResponseCache,
} from "relay-runtime";
import { SerializablePreloadedQuery } from "./loadSerializableQuery";

/**
 * Convert serializable preloaded query into Relay's PreloadedQuery object.
 * It also writes this serializable preloaded query into QueryResponseCache,
 * so the network layer can use these cache results when fetching data in usePreloadedQuery.
 *
 * @param environment - Relay environment
 * @param preloadQuery - Serializable preloaded query from server
 * @param responseCache - Query response cache (optional, for client-side only)
 * @param fetchPolicy - Relay fetch policy
 */
export function useSerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  environment: IEnvironment,
  preloadQuery: SerializablePreloadedQuery<TRequest, TQuery>,
  responseCache: QueryResponseCache | null = null,
  fetchPolicy: PreloadFetchPolicy = "store-or-network"
): PreloadedQuery<TQuery> {
  useMemo(() => {
    if (responseCache) {
      writePreloadedQueryToCache(preloadQuery, responseCache);
    }
  }, [preloadQuery, responseCache]);

  return {
    environment,
    fetchKey: preloadQuery.params.id ?? preloadQuery.params.cacheID,
    fetchPolicy,
    isDisposed: false,
    name: preloadQuery.params.name,
    kind: "PreloadedQuery",
    variables: preloadQuery.variables,
    dispose: () => {
      return;
    },
  };
}

function writePreloadedQueryToCache<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  preloadedQueryObject: SerializablePreloadedQuery<TRequest, TQuery>,
  responseCache: QueryResponseCache
) {
  const cacheKey =
    preloadedQueryObject.params.id ?? preloadedQueryObject.params.cacheID;
  responseCache.set(
    cacheKey,
    preloadedQueryObject.variables,
    preloadedQueryObject.response
  );
}
