import { useStorePolicy as useSdkStorePolicy } from '@shopana/storefront-sdk/modules/content/react';

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
  const { policy, loading } = useSdkStorePolicy(handle);
  return {
    policy: policy
      ? {
          handle: policy.handle,
          title: policy.title,
          path: policy.path,
          html: policy.body?.html ?? '',
        }
      : null,
    loading,
  };
}
