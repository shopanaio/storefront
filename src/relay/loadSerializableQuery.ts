import { OperationType, RequestParameters, VariablesOf } from "relay-runtime";
import { ConcreteRequest } from "relay-runtime/lib/util/RelayConcreteNode";
import {
  loadSerializableQuery as loadSerializableQuerySDK,
  SerializablePreloadedQuery,
} from "@shopana/storefront-sdk/graphql/relay";
import { networkFetch } from "@src/relay/Environment";

// Re-export type from SDK
export type { SerializablePreloadedQuery };

// Wrapper function that uses project's networkFetch
export default async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  params: RequestParameters,
  variables: VariablesOf<TQuery>,
  serverCookies?: string
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  return loadSerializableQuerySDK(networkFetch, params, variables, serverCookies);
}
