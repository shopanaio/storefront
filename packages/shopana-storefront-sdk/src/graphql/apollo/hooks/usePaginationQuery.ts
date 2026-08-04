import { NetworkStatus, type OperationVariables } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';
import type {
  CursorConnection,
  PaginationQueryDescriptor,
} from '../pagination/types';

export function usePaginationQuery<
  TData,
  TVariables extends OperationVariables,
  TConnection extends CursorConnection,
>(
  descriptor: PaginationQueryDescriptor<TData, TVariables, TConnection>,
  variables: TVariables
) {
  const result = useQuery(descriptor.query, {
    variables,
    notifyOnNetworkStatusChange: true,
  });
  const activeLoad = useRef<Promise<unknown> | null>(null);
  const variablesRef = useRef(variables);
  const connection = result.data ? descriptor.getConnection(result.data) : null;
  const variablesKey = JSON.stringify(variables);
  const fetchMore = result.fetchMore;
  const apolloRefetch = result.refetch;
  const hasNext = connection?.pageInfo.hasNextPage ?? false;
  const endCursor = connection?.pageInfo.endCursor ?? null;

  useEffect(() => {
    variablesRef.current = variables;
  }, [variables]);

  useEffect(() => {
    activeLoad.current = null;
  }, [variablesKey]);

  const loadNext = useCallback(
    (count: number) => {
      if (!hasNext) return Promise.resolve();
      if (activeLoad.current) return activeLoad.current;

      const nextVariables = descriptor.getNextVariables({
        variables: variablesRef.current,
        count,
        endCursor,
      });
      const request = fetchMore({ variables: nextVariables });
      activeLoad.current = request;
      void request.then(
        () => {
          if (activeLoad.current === request) activeLoad.current = null;
        },
        () => {
          if (activeLoad.current === request) activeLoad.current = null;
        }
      );
      return request;
    },
    [descriptor, endCursor, fetchMore, hasNext]
  );

  const refetch = useCallback(
    (nextVariables: Partial<TVariables> = {}) =>
      apolloRefetch({
        ...variablesRef.current,
        ...nextVariables,
        after: null,
      } as unknown as TVariables),
    [apolloRefetch]
  );

  return {
    data: result.data,
    error: result.error,
    hasNext,
    isLoadingNext: result.networkStatus === NetworkStatus.fetchMore,
    loadNext,
    refetch,
  };
}
