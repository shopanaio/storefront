import type {
  ApolloClient,
  FetchPolicy,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';

export function fetchQuery<TData, TVariables extends OperationVariables>(
  client: ApolloClient,
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  options: { fetchPolicy?: FetchPolicy } = {}
): Promise<TData> {
  return client
    .query({ query, variables, fetchPolicy: options.fetchPolicy })
    .then((result) => result.data as TData);
}
