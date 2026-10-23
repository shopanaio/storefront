'use client';

import { useQuery } from '@apollo/client/react';
import {
  SdkOnlineStorePageByHandleDocument,
  type SdkOnlineStorePageFragment,
} from '../../../graphql/apollo/generated/operations';

export type OnlineStorePage = SdkOnlineStorePageFragment;

/**
 * An online store page by handle in the active locale. The page body is read as RichText `json`
 * and rendered by the theme; `html` of these pages is not sanitized by the API.
 */
export function useOnlineStorePage(handle: string | null | undefined) {
  const query = useQuery(SdkOnlineStorePageByHandleDocument, {
    variables: { handle: handle ?? '' },
    skip: !handle,
    fetchPolicy: 'cache-first',
  });
  return {
    page: query.data?.onlineStorePageByHandle ?? null,
    loading: query.loading,
    error: query.error,
  };
}
