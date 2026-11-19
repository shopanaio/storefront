import type {
  ApolloClient,
  DocumentNode,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { logError } from '../../utils/logger';

export interface SerializableApolloQuery<
  TData,
  TVariables extends OperationVariables,
> {
  data: TData;
  variables: TVariables;
}

export interface LoadSerializableQueryOptions {
  /**
   * `none` (the default): a GraphQL error fails the load. `all`: the load gives the data of
   * the fields that resolved (null in place of the failed ones) and logs the errors, so a page
   * whose secondary fields fail (reviews, recommendations) still renders; a query that
   * returns no data at all fails as with `none`.
   */
  errorPolicy?: 'none' | 'all';
}

/**
 * Imperative SSR loader for code that cannot use the PreloadQuery component. The result
 * stays in the client's cache, which the document carries to the browser. The GraphQL
 * document deliberately is not included in the returned value so that the payload remains
 * safe to serialize through a React Server Component.
 */
export async function loadSerializableQuery<
  TData,
  TVariables extends OperationVariables,
>(
  client: ApolloClient,
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  { errorPolicy = 'none' }: LoadSerializableQueryOptions = {}
): Promise<SerializableApolloQuery<TData, TVariables>> {
  const result = await client.query<TData, TVariables>({
    query,
    variables,
    errorPolicy,
  });
  if (result.data === undefined) {
    throw result.error ?? new Error('The query returned no data');
  }
  if (result.error) {
    logError('Query resolved with errors', {
      component: 'loadSerializableQuery',
      error: result.error,
    });
  }

  return { data: result.data as TData, variables };
}
