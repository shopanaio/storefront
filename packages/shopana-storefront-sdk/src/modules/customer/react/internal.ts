'use client';

import * as React from 'react';
import {
  NetworkStatus,
  type DocumentNode,
  type OperationVariables,
  type TypedDocumentNode,
} from '@apollo/client';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useIsAuthenticated } from '../../session/react/context/SessionContext.js';
import { CustomerMutationError } from './CustomerMutationError.js';
import type {
  CustomerConnectionState,
  CustomerQueryState,
  CustomerUserError,
} from './types.js';

export const DEFAULT_PAGE_SIZE = 20;

/** Every customer mutation takes a key, so a retried request is applied once. */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

function toError(error: { message: string } | undefined): Error | null {
  if (!error) return null;
  return error instanceof Error ? error : new Error(error.message);
}

interface QueryOptions<TVariables> {
  variables?: TVariables;
  nextFetchPolicy?: 'cache-first';
}

/**
 * A query of the signed-in customer: skipped without a session, and its data dropped once the
 * session ends.
 */
export function useCustomerQuery<TData, TVariables extends OperationVariables>(
  query: TypedDocumentNode<TData, TVariables>,
  { variables, nextFetchPolicy }: QueryOptions<TVariables> = {}
) {
  const isAuthenticated = useIsAuthenticated();
  const result = useQuery(query, {
    variables,
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy,
    notifyOnNetworkStatusChange: true,
  } as useQuery.Options<TData, TVariables>);
  const data: TData | undefined = isAuthenticated
    ? (result.data as TData | undefined)
    : undefined;
  const { refetch: apolloRefetch } = result;

  const refetch = React.useCallback(async () => {
    if (!isAuthenticated) return;
    await apolloRefetch().catch(() => undefined);
  }, [apolloRefetch, isAuthenticated]);

  const state: CustomerQueryState = {
    requiresSignIn: !isAuthenticated,
    loading: isAuthenticated && result.loading && !data,
    error: isAuthenticated && !data ? toError(result.error) : null,
    refetch,
  };
  return { data, result, state };
}

export interface ConnectionLike<TNode> {
  readonly edges: ReadonlyArray<{ readonly node: TNode }>;
  readonly pageInfo: {
    readonly hasNextPage: boolean;
    readonly endCursor?: string | null;
  };
  readonly totalCount: number;
}

/**
 * A customer query over one connection. The pages are merged by the cursor policy of the
 * field in `createApolloCache`, so `loadNext` only asks for the page after the last one.
 */
export function useCustomerConnectionQuery<
  TData,
  TVariables extends OperationVariables & { first?: number | null },
  TNode,
>(
  query: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  getConnection: (data: TData) => ConnectionLike<TNode> | null | undefined
): { data: TData | undefined; state: CustomerConnectionState<TNode> } {
  const { data, result, state } = useCustomerQuery(query, { variables });
  const connection = data ? getConnection(data) : null;
  const hasNext = connection?.pageInfo.hasNextPage ?? false;
  const endCursor = connection?.pageInfo.endCursor ?? null;
  const { fetchMore } = result;
  const pendingRef = React.useRef<Promise<void> | null>(null);

  const loadNext = React.useCallback(() => {
    if (!hasNext || !endCursor) return Promise.resolve();
    if (pendingRef.current) return pendingRef.current;
    const request = fetchMore({
      // `first` and the other variables stay those of the first page.
      variables: { after: endCursor } as unknown as Partial<TVariables>,
    })
      .then(() => undefined)
      .catch(() => undefined)
      .finally(() => {
        pendingRef.current = null;
      });
    pendingRef.current = request;
    return request;
  }, [endCursor, fetchMore, hasNext]);

  const nodes = React.useMemo(
    () => connection?.edges.map((edge) => edge.node) ?? [],
    [connection]
  );

  return {
    data,
    state: {
      ...state,
      nodes,
      totalCount: connection?.totalCount ?? 0,
      hasNext,
      loadingNext: result.networkStatus === NetworkStatus.fetchMore,
      loadNext,
    },
  };
}

interface CustomerMutationPayload {
  readonly errors: readonly CustomerUserError[];
}

export interface CustomerMutationConfig<
  TData,
  TPayload extends CustomerMutationPayload,
  TResult,
> {
  payload(data: TData): TPayload | null | undefined;
  /** The entity the mutation resolves to; missing means `emptyPayload`. */
  result(payload: TPayload): TResult | null | undefined;
  /** Queries read again once the mutation succeeded, so their lists stay correct. */
  refetchQueries?: readonly DocumentNode[];
}

/**
 * Runs a customer mutation: rejects with `CustomerMutationError` without a session, on a
 * failed request, on user errors and on an empty payload, and reads the given queries again
 * after a success. A failed re-read does not fail the mutation, which is already applied.
 *
 * `config` must be stable (a module constant).
 */
export function useCustomerMutation<
  TData,
  TVariables extends OperationVariables,
  TPayload extends CustomerMutationPayload,
  TResult,
>(
  mutation: TypedDocumentNode<TData, TVariables>,
  config: CustomerMutationConfig<TData, TPayload, TResult>
): readonly [(variables: TVariables) => Promise<TResult>, boolean] {
  const isAuthenticated = useIsAuthenticated();
  const client = useApolloClient();
  const [apolloMutate, state] = useMutation(mutation);

  const commit = React.useCallback(
    async (variables: TVariables): Promise<TResult> => {
      if (!isAuthenticated) {
        throw new CustomerMutationError('unauthenticated');
      }
      // The conditional parameter type of the Apollo mutate function does not resolve for a
      // generic `TVariables`; the variables are always passed here.
      const mutate = apolloMutate as unknown as (options: {
        variables: TVariables;
      }) => Promise<{ data?: TData | null }>;
      let data: TData | null | undefined;
      try {
        const response = await mutate({ variables });
        data = response.data;
      } catch (cause) {
        throw new CustomerMutationError('request', { cause });
      }
      const payload = data ? config.payload(data) : null;
      if (!payload) throw new CustomerMutationError('emptyPayload');
      if (payload.errors.length) {
        throw new CustomerMutationError('userErrors', {
          userErrors: payload.errors,
        });
      }
      const value = config.result(payload);
      if (value == null) throw new CustomerMutationError('emptyPayload');
      if (config.refetchQueries?.length) {
        await client
          .refetchQueries({ include: [...config.refetchQueries] })
          .catch(() => undefined);
      }
      return value;
    },
    [apolloMutate, client, config, isAuthenticated]
  );

  return [commit, state.loading] as const;
}
