import type { SerializableApolloQuery } from '@shopana/storefront-sdk/graphql/apollo';
import type {
  SdkProductQuery,
  SdkProductQueryVariables,
} from '@shopana/storefront-sdk/graphql/apollo/generated/operations';
import { mapApiProductToProduct } from '@src/hooks/product/mapApiProductToProduct';
import type { UsePreloadedProductResult } from './types';
import type { ReviewsData } from '@shopana/storefront-sdk/queries/Reviews';

const usePreloadedProduct = (
  queryReference: SerializableApolloQuery<
    SdkProductQuery,
    SdkProductQueryVariables
  >
): UsePreloadedProductResult => {
  const data = queryReference.data;

  const apiProduct = data?.product ?? null;
  const product = mapApiProductToProduct(apiProduct);

  return {
    product,
    productReviewsRef: apiProduct as ReviewsData | null,
  };
};

export default usePreloadedProduct;
