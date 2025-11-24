import {
  GraphQLResponse,
  OperationType,
  RequestParameters,
  VariablesOf,
} from "relay-runtime";
import { ConcreteRequest } from "relay-runtime/lib/util/RelayConcreteNode";

export interface SerializablePreloadedQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
> {
  params: TRequest["params"];
  variables: VariablesOf<TQuery>;
  response: GraphQLResponse;
}

/**
 * Load GraphQL query and return serializable response
 * This response can be sent to the client to "warm" the QueryResponseCache
 * to avoid the client fetches.
 *
 * @param networkFetch - Function to fetch GraphQL data
 * @param params - Relay request parameters
 * @param variables - GraphQL variables
 * @param serverCookies - Optional server-side cookie string
 */
export async function loadSerializableQuery<
  TRequest extends ConcreteRequest,
  TQuery extends OperationType
>(
  networkFetch: (
    params: RequestParameters,
    variables: VariablesOf<TQuery>,
    serverCookies?: string
  ) => Promise<GraphQLResponse>,
  params: RequestParameters,
  variables: VariablesOf<TQuery>,
  serverCookies?: string
): Promise<SerializablePreloadedQuery<TRequest, TQuery>> {
  const response = await networkFetch(params, variables, serverCookies);
  return {
    params,
    variables,
    response,
  };
}
