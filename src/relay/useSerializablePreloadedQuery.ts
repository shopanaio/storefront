// Convert preloaded query object (with raw GraphQL Response) into
// Relay's PreloadedQuery.

import { PreloadedQuery, PreloadFetchPolicy } from "react-relay";
import { ConcreteRequest, IEnvironment, OperationType } from "relay-runtime";
import { useSerializablePreloadedQuery as useSerializablePreloadedQuerySDK } from "@shopana/storefront-sdk/graphql/relay";
import { responseCache } from "@src/relay/Environment";
import { SerializablePreloadedQuery } from "./loadSerializableQuery";

// Wrapper hook that uses project's responseCache
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
