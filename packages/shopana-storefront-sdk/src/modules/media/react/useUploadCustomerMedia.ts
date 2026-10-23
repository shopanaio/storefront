'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  SdkCustomerMediaUploadDocument,
  type CustomerMediaPurpose,
  type SdkCustomerMediaUploadMutation,
} from '../../../graphql/apollo/generated/operations';
import {
  runStorefrontMutation,
  StorefrontRequestError,
} from '../../../core/StorefrontRequestError';
import { useIsAuthenticated } from '../../session/react/context/SessionContext.js';

/**
 * Stable codes of a rejected upload: `UNAUTHENTICATED`, `EMPTY_FILE`, `FILE_TOO_LARGE`,
 * `UNSUPPORTED_FILE_TYPE`, `INVALID_ALT`, `UPLOAD_LIMIT_EXCEEDED`, `INTERNAL_ERROR`.
 */
export type CustomerMediaUploadErrorCode =
  | 'UNAUTHENTICATED'
  | 'EMPTY_FILE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'INVALID_ALT'
  | 'UPLOAD_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

export type CustomerMedia = NonNullable<
  SdkCustomerMediaUploadMutation['customerMediaUpload']['media']
>;

export interface CustomerMediaUploadValues {
  /** JPEG, PNG, WebP, GIF or AVIF image up to 10 MiB. */
  file: File;
  purpose: CustomerMediaPurpose;
  /** Alternative text, up to 512 characters. */
  alt?: string;
}

/**
 * Uploads an image of the signed-in customer, e.g. a review photo; pass the media id where the
 * purpose's mutation accepts one. An unattached upload expires after 24 hours. Rejects with
 * `StorefrontRequestError<CustomerMediaUploadErrorCode>`; without a session nothing is sent.
 */
export function useUploadCustomerMedia(): readonly [
  (values: CustomerMediaUploadValues) => Promise<CustomerMedia>,
  boolean,
] {
  const isAuthenticated = useIsAuthenticated();
  const [mutate, state] = useMutation(SdkCustomerMediaUploadDocument);
  const upload = React.useCallback(
    async ({ file, purpose, alt }: CustomerMediaUploadValues) => {
      if (!isAuthenticated) {
        throw new StorefrontRequestError<CustomerMediaUploadErrorCode>(
          'userErrors',
          {
            userErrors: [
              {
                code: 'UNAUTHENTICATED',
                message: 'A customer session is required',
                field: null,
              },
            ],
          }
        );
      }
      return runStorefrontMutation<
        SdkCustomerMediaUploadMutation['customerMediaUpload'],
        CustomerMedia,
        CustomerMediaUploadErrorCode
      >(
        async () =>
          (
            await mutate({
              variables: { input: { file, purpose, alt: alt ?? null } },
            })
          ).data?.customerMediaUpload,
        (payload) => payload.media
      );
    },
    [isAuthenticated, mutate]
  );
  return [upload, state.loading] as const;
}
