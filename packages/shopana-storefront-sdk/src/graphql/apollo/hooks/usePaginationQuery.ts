import { NetworkStatus, type OperationVariables } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useCallback, useEffect, useRef } from 'react';
import type {
  CursorConnection,
  PaginationQueryDescriptor,
} from '../pagination/types';
import { stableSerializeOperationVariables } from '../pagination/stableSerializeOperationVariables';

interface InFlightRequest {
  generation: number;
  promise: Promise<unknown>;
}

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
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });
  const variablesKey = stableSerializeOperationVariables(variables);
  const inputVariablesKeyRef = useRef(variablesKey);
  const activeVariablesRef = useRef(variables);
  const variablesGenerationRef = useRef(0);
  const activeRequestRef = useRef<InFlightRequest | null>(null);
  const connection = result.data ? descriptor.getConnection(result.data) : null;
  const fetchMore = result.fetchMore;
  const apolloRefetch = result.refetch;
  const hasNext = connection?.pageInfo.hasNextPage ?? false;
  const endCursor = connection?.pageInfo.endCursor ?? null;

  useEffect(() => {
    if (inputVariablesKeyRef.current === variablesKey) {
      return;
    }

    inputVariablesKeyRef.current = variablesKey;
    const activeVariablesKey = stableSerializeOperationVariables(
      activeVariablesRef.current
    );

    activeVariablesRef.current = variables;
    if (activeVariablesKey !== variablesKey) {
      variablesGenerationRef.current += 1;
      activeRequestRef.current = null;
    }
  }, [variables, variablesKey]);

  const trackRequest = useCallback(
    <T>(request: Promise<T>, generation: number): Promise<T> => {
      const tracked: InFlightRequest = { generation, promise: request };
      activeRequestRef.current = tracked;

      void request.then(
        () => {
          if (
            activeRequestRef.current === tracked &&
            variablesGenerationRef.current === generation
          ) {
            activeRequestRef.current = null;
          }
        },
        () => {
          if (
            activeRequestRef.current === tracked &&
            variablesGenerationRef.current === generation
          ) {
            activeRequestRef.current = null;
          }
        }
      );

      return request;
    },
    []
  );

  const loadNext = useCallback(
    (count: number) => {
      if (!hasNext) return Promise.resolve();
      if (activeRequestRef.current) {
        return activeRequestRef.current.promise;
      }

      const generation = variablesGenerationRef.current;
      const nextVariables = descriptor.getNextVariables({
        variables: activeVariablesRef.current,
        count,
        endCursor,
      });
      return trackRequest(fetchMore({ variables: nextVariables }), generation);
    },
    [descriptor, endCursor, fetchMore, hasNext, trackRequest]
  );

  const refetch = useCallback(
    (partialVariables: Partial<TVariables> = {}) => {
      const nextVariables = {
        ...activeVariablesRef.current,
        ...partialVariables,
        after: null,
      } as TVariables;
      const generation = variablesGenerationRef.current + 1;

      variablesGenerationRef.current = generation;
      activeVariablesRef.current = nextVariables;
      activeRequestRef.current = null;

      return trackRequest(apolloRefetch(nextVariables), generation);
    },
    [apolloRefetch, trackRequest]
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
