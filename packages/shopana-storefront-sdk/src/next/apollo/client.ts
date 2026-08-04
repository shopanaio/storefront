'use client';

export {
  ApolloAppProvider,
  type ApolloAppProviderProps,
} from './ApolloProvider';
export type { TransportedQueryRef } from '@apollo/client-integration-nextjs';

export {
  useApolloClient,
  useBackgroundQuery,
  useFragment,
  useLazyQuery,
  useMutation,
  useQuery,
  useReadQuery,
  useSuspenseFragment,
  useSuspenseQuery,
} from '@apollo/client/react';
