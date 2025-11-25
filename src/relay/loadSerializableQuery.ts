import { headers } from "next/headers";
import { OperationType, RequestParameters, VariablesOf } from "relay-runtime";
import { ConcreteRequest } from "relay-runtime/lib/util/RelayConcreteNode";
import {
  loadSerializableQuery as loadSerializableQuerySDK,
  SerializablePreloadedQuery,
} from "@shopana/storefront-sdk/graphql/relay";
import { networkFetch } from "./networkFetch";

// Re-export type from SDK
export type { SerializablePreloadedQuery };

export default async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  params: RequestParameters,
  variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  const cookie = (await headers()).get("cookie") ?? undefined;
  return loadSerializableQuerySDK(networkFetch, params, variables, cookie);
}
