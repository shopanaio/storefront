'use client';

import { useLazyLoadQuery } from '../../../../graphql/apollo/hooks/useLazyLoadQuery';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import {
  SdkUseGetSessionQueryDocument,
  type SdkUseGetSessionQuery,
  type SdkUseGetSessionQueryVariables,
} from '../../../../graphql/apollo/generated/operations';

export const useGetSessionQuery = SdkUseGetSessionQueryDocument;

export const useGetSession = (_fetchKey: number = 0) =>
  useLazyLoadQuery(
    useGetSessionQuery,
    {},
    {
      fetchPolicy: 'network-only',
      fetchKey: _fetchKey,
    }
  );

export const useGetSessionPreloaded = (
  preloadedQuery: SerializableApolloQuery<
    SdkUseGetSessionQuery,
    SdkUseGetSessionQueryVariables
  >
) => preloadedQuery.data;

const sessionHooks = { useGetSession, useGetSessionPreloaded };

export default sessionHooks;
