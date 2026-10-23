'use client';

import {
  SdkCustomerReviewRequestsQueryDocument,
  type ImageTransformInput,
} from '../../../graphql/apollo/generated/operations';
import { DEFAULT_PAGE_SIZE, useCustomerConnectionQuery } from './internal.js';
import type {
  CustomerConnectionOptions,
  CustomerConnectionState,
  ReviewRequest,
} from './types.js';

export interface ReviewRequestsOptions extends CustomerConnectionOptions {
  /** Transform of the product images. */
  imageTransform?: ImageTransformInput;
}

/**
 * Review requests sent to the signed-in customer, page by page. The API has no status filter:
 * which requests still wait for a review is up to the reader (`status`, `expiresAt`, `review`).
 */
export function useReviewRequests({
  first = DEFAULT_PAGE_SIZE,
  imageTransform,
}: ReviewRequestsOptions = {}): CustomerConnectionState<ReviewRequest> {
  const { state } = useCustomerConnectionQuery(
    SdkCustomerReviewRequestsQueryDocument,
    { first, imageTransform },
    (value) => value.customer?.reviewRequests
  );
  return state;
}
