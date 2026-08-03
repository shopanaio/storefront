import type {
  ApolloClient,
  DocumentNode,
  NormalizedCacheObject,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';

export interface SerializableApolloQuery<
  TData,
  TVariables extends OperationVariables,
> {
  data: TData;
  variables: TVariables;
  cacheState: NormalizedCacheObject;
}

/**
 * Imperative SSR loader for code that cannot use the PreloadQuery component.
 * The GraphQL document deliberately is not included in the returned value so
 * that the payload remains safe to serialize through a React Server Component.
 */
export async function loadSerializableQuery<
  TData,
  TVariables extends OperationVariables,
>(
  client: ApolloClient,
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
  variables: TVariables
): Promise<SerializableApolloQuery<TData, TVariables>> {
  const result = await client.query<TData, TVariables>({
    query,
    variables,
  });

  return {
    data: result.data as TData,
    variables,
    cacheState: client.extract() as NormalizedCacheObject,
  };
}
