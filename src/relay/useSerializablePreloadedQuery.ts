import { PreloadedQuery, PreloadFetchPolicy } from "react-relay";
import { ConcreteRequest, IEnvironment, OperationType } from "relay-runtime";
import {
  useSerializablePreloadedQuery as useSerializablePreloadedQuerySDK,
  createResponseCache,
  SerializablePreloadedQuery,
} from "@shopana/storefront-sdk/graphql/relay";
import { environmentConfig } from "@src/config/environment.config";

// Re-export type for client components
export type { SerializablePreloadedQuery };

// Client-side response cache
const responseCache = createResponseCache(
  environmentConfig.cacheTTL,
  environmentConfig.cacheSize
);

export default function useSerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  environment: IEnvironment,
  preloadQuery: SerializablePreloadedQuery<TRequest, TQuery>,
  fetchPolicy: PreloadFetchPolicy = "store-or-network"
): PreloadedQuery<TQuery> {
  return useSerializablePreloadedQuerySDK(
    environment,
    preloadQuery,
    responseCache,
    fetchPolicy
  );
}
