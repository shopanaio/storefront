import { headers } from "next/headers";
import { OperationType, RequestParameters, VariablesOf } from "relay-runtime";
import { ConcreteRequest } from "relay-runtime/lib/util/RelayConcreteNode";
import {
  loadSerializableQuery as loadSerializableQueryBase,
} from "../../graphql/relay/loadSerializableQuery";
import type { SerializablePreloadedQuery } from "../../graphql/relay/loadSerializableQuery";
import { createFetchGraphQL } from "../../graphql/relay/Environment";
import type { FetchGraphQLFunction, RelayEnvironmentConfig } from "../../graphql/relay/types";

// Re-export type from base relay module
export type { SerializablePreloadedQuery };

// Overload 1: Accept FetchGraphQLFunction
async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  fetchGraphQL: FetchGraphQLFunction,
  params: RequestParameters,
  variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>>;

// Overload 2: Accept RelayEnvironmentConfig
async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  config: RelayEnvironmentConfig,
  params: RequestParameters,
  variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>>;

// Implementation
async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  fetchGraphQLOrConfig: FetchGraphQLFunction | RelayEnvironmentConfig,
  params: RequestParameters,
  variables: VariablesOf<TQuery>
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  const cookie = (await headers()).get("cookie") ?? undefined;

  // Check if first argument is a function or config object
  const fetchGraphQL =
    typeof fetchGraphQLOrConfig === "function"
      ? fetchGraphQLOrConfig
      : createFetchGraphQL({
          ...fetchGraphQLOrConfig,
          serverCookies: cookie,
        });

  return loadSerializableQueryBase(fetchGraphQL, params, variables, cookie);
}

export default loadSerializableQuery;
