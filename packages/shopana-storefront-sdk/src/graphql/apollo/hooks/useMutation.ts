import type {
  ApolloCache,
  MutationUpdaterFunction,
  OperationVariables,
  TypedDocumentNode,
} from '@apollo/client';
import { useMutation as useApolloMutation } from '@apollo/client/react';

export interface CommitOptions<TData, TVariables extends OperationVariables> {
  variables: TVariables;
  optimisticResponse?: TData;
  onCompleted?(data: TData, errors: readonly unknown[] | null): void;
  onError?(error: Error): void;
  updater?: MutationUpdaterFunction<
    TData,
    TVariables,
    ApolloCache
  >;
}

export function useMutation<TData, TVariables extends OperationVariables>(
  mutation: TypedDocumentNode<TData, TVariables>
) {
  const [mutate, result] = useApolloMutation(mutation);

  const commit = (options: CommitOptions<TData, TVariables>) =>
    mutate({
      variables: options.variables,
      optimisticResponse: options.optimisticResponse,
      update: options.updater,
    })
      .then(({ data, error }) => {
        if (error) throw error;
        if (data) options.onCompleted?.(data, null);
        return data;
      })
      .catch((error: Error) => {
        options.onError?.(error);
        if (!options.onError) throw error;
        return undefined;
      });

  return [commit, result.loading] as const;
}
