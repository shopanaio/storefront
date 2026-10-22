import { useQuery } from '@apollo/client/react';
import { storePolicyQuery } from '#checkout/api/queries/storePolicyQuery.shopana';

/** A published store policy as the policy modal shows it. */
export interface StorePolicy {
  handle: string;
  title: string;
  /** Storefront path of the policy page. */
  path: string;
  /** HTML the API sanitized. */
  html: string;
}

/**
 * The latest published version of the policy with the handle; `null` while loading, when it is
 * not published or cannot be read, and when no handle is given.
 */
export function useStorePolicy(handle: string | null): {
  policy: StorePolicy | null;
  loading: boolean;
} {
  const { data, loading } = useQuery(storePolicyQuery, {
    variables: { handle: handle ?? '' },
    skip: !handle,
  });
  const loaded =
    data?.storePolicy?.handle === handle ? data?.storePolicy : null;
  return {
    policy: loaded
      ? {
          handle: loaded.handle,
          title: loaded.title,
          path: loaded.path,
          html: typeof loaded.body?.html === 'string' ? loaded.body.html : '',
        }
      : null,
    loading,
  };
}
