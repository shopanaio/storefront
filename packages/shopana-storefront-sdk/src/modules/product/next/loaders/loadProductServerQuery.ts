import {
  loadSerializableQuery,
  type SerializableApolloQuery,
} from '../../../../graphql/apollo/loadSerializableQuery';
import { getApolloRequestClient } from '../../../../next/apollo/server';
import type { ApolloEnvironmentConfig } from '../../../../graphql/apollo/types';
import {
  SdkProductQueryDocument,
  type SdkProductQuery,
  type SdkProductQueryVariables,
  type ProductComponentSelectionInput,
  type ReviewSort,
} from '../../../../graphql/apollo/generated/operations';
export type ProductReviewSort = ReviewSort;
export interface LoadProductServerQueryOptions {
  environmentConfig: ApolloEnvironmentConfig;
  handle: string;
  reviewsFirst?: number;
  reviewsSort?: ProductReviewSort;
  componentSelections?: ReadonlyArray<ProductComponentSelectionInput>;
}
export async function loadProductServerQuery(
  options: LoadProductServerQueryOptions
): Promise<SerializableApolloQuery<SdkProductQuery, SdkProductQueryVariables>> {
  const {
    environmentConfig,
    handle,
    reviewsFirst = 3,
    reviewsSort = 'MOST_HELPFUL',
    componentSelections,
  } = options;
  const client = await getApolloRequestClient(environmentConfig);
  return loadSerializableQuery(client, SdkProductQueryDocument, {
    handle,
    first: reviewsFirst,
    sort: reviewsSort,
    componentSelections,
  });
}
export type { SdkProductQuery as ProductQueryType };
