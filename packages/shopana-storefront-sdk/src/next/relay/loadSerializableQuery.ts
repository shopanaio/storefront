import { headers } from "next/headers";
import { OperationType, RequestParameters, VariablesOf } from "relay-runtime";
import { ConcreteRequest } from "relay-runtime/lib/util/RelayConcreteNode";
import {
  loadSerializableQuery as loadSerializableQueryBase,
  SerializablePreloadedQuery,
} from "../../graphql/relay";
import type { FetchGraphQLFunction } from "../../graphql/relay";

// Re-export type from base relay module
export type { SerializablePreloadedQuery };

export default async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  fetchGraphQL: FetchGraphQLFunction,
  params: RequestParameters,
  variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  const cookie = (await headers()).get("cookie") ?? undefined;
  return loadSerializableQueryBase(fetchGraphQL, params, variables, cookie);
}
