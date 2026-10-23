import type { ApolloClient } from '@apollo/client';
import { mapStorefrontProductOption } from './mapProductOption';
export { mapStorefrontProductOption } from './mapProductOption';
import {
  SdkCheckoutPlacementDocument,
  SdkCollectionByHandleDocument,
  SdkCollectionByIdDocument,
  SdkCollectionMediaDocument,
  SdkCollectionProductsDocument,
  SdkImageDocument,
  SdkLoyaltyRedemptionRemoveDocument,
  SdkLoyaltyRedemptionUpdateDocument,
  SdkOnlineStorePageDocument,
  SdkPlaceOrderDocument,
  SdkProductComparisonDocument,
  SdkProductOptionsDocument,
  SdkReviewMediaDocument,
  type CheckoutLoyaltyRedemptionRemoveInput,
  type CheckoutLoyaltyRedemptionUpdateInput,
  type PlaceOrderInput,
  type SdkCheckoutPlacementQueryVariables,
  type SdkCollectionByHandleQueryVariables,
  type SdkCollectionByIdQueryVariables,
  type SdkCollectionMediaQueryVariables,
  type SdkCollectionProductsQueryVariables,
  type SdkImageQueryVariables,
  type SdkOnlineStorePageQueryVariables,
  type SdkProductComparisonQueryVariables,
  type SdkProductOptionsQueryVariables,
  type SdkReviewMediaQueryVariables,
} from '../../graphql/apollo/generated/operations';

export type {
  CheckoutLifecycleStatus,
  CheckoutPlacementState,
  CheckoutLoyaltyRedemptionUpdateInput,
  CheckoutLoyaltyRedemptionRemoveInput,
  CollectionType,
  CollectionDefaultSort,
  CollectionSortDirection,
  ImageTransformInput,
  ImageFitMode,
  ImageGravity,
  ImageContentType,
  PlaceOrderInput,
  PlaceOrderCustomerActionType,
  ProductOptionType,
  SdkCollectionFieldsFragment as Collection,
  SdkPlacementFieldsFragment as CheckoutPlacement,
  SdkCollectionProductsQueryVariables as CollectionProductsInput,
  SdkCollectionMediaQueryVariables as CollectionMediaInput,
} from '../../graphql/apollo/generated/operations';

export interface StorefrontUserError {
  readonly code: string;
  readonly message: string;
  readonly field?: readonly string[] | null;
  readonly retryable: boolean;
}

export class StorefrontMutationError extends Error {
  constructor(readonly userErrors: readonly StorefrontUserError[]) {
    super(userErrors[0]?.message ?? 'Storefront mutation failed');
    this.name = 'StorefrontMutationError';
  }
}

export function assertStorefrontMutationSucceeded(
  errors: readonly StorefrontUserError[]
): void {
  if (errors.length) throw new StorefrontMutationError(errors);
}

function requireData<T>(data: T | null | undefined): T {
  if (data == null) throw new Error('The Storefront API returned no data');
  return data;
}

/** Uses the caller's Apollo client, authentication, and normalized cache. */
export function createStorefrontApi(client: ApolloClient) {
  return {
    async loadCollection(input: SdkCollectionByIdQueryVariables) {
      const result = await client.query({
        query: SdkCollectionByIdDocument,
        variables: input,
      });
      return requireData(result.data).collection ?? null;
    },
    async loadCollectionByHandle(input: SdkCollectionByHandleQueryVariables) {
      const result = await client.query({
        query: SdkCollectionByHandleDocument,
        variables: input,
      });
      return requireData(result.data).collectionByHandle ?? null;
    },
    async loadCollectionProducts(input: SdkCollectionProductsQueryVariables) {
      const result = await client.query({
        query: SdkCollectionProductsDocument,
        variables: input,
        fetchPolicy: 'network-only',
      });
      return requireData(result.data).collection?.products ?? null;
    },
    async loadCollectionMedia(input: SdkCollectionMediaQueryVariables) {
      const result = await client.query({
        query: SdkCollectionMediaDocument,
        variables: input,
      });
      return requireData(result.data).collection?.media ?? null;
    },
    async loadProductOptions(input: SdkProductOptionsQueryVariables) {
      const result = await client.query({
        query: SdkProductOptionsDocument,
        variables: input,
      });
      return (
        requireData(result.data).product?.options.map(
          mapStorefrontProductOption
        ) ?? null
      );
    },
    async loadProductComparison(input: SdkProductComparisonQueryVariables) {
      const result = await client.query({
        query: SdkProductComparisonDocument,
        variables: input,
      });
      return requireData(result.data).product?.comparison ?? null;
    },
    async loadImage(input: SdkImageQueryVariables) {
      const result = await client.query({
        query: SdkImageDocument,
        variables: input,
      });
      const node = requireData(result.data).node;
      return node?.__typename === 'MediaImage' ? node.image : null;
    },
    async loadOnlineStorePage(input: SdkOnlineStorePageQueryVariables) {
      const result = await client.query({
        query: SdkOnlineStorePageDocument,
        variables: input,
      });
      return requireData(result.data).onlineStorePageByHandle ?? null;
    },
    async loadReviewMedia(input: SdkReviewMediaQueryVariables) {
      const result = await client.query({
        query: SdkReviewMediaDocument,
        variables: input,
      });
      const node = requireData(result.data).node;
      return node?.__typename === 'ReviewMedia' ? node : null;
    },
    async updateLoyaltyRedemption(input: CheckoutLoyaltyRedemptionUpdateInput) {
      const result = await client.mutate({
        mutation: SdkLoyaltyRedemptionUpdateDocument,
        variables: { input },
      });
      const payload = requireData(result.data).checkoutLoyaltyRedemptionUpdate;
      assertStorefrontMutationSucceeded(payload.userErrors);
      return payload.checkout ?? null;
    },
    async removeLoyaltyRedemption(input: CheckoutLoyaltyRedemptionRemoveInput) {
      const result = await client.mutate({
        mutation: SdkLoyaltyRedemptionRemoveDocument,
        variables: { input },
      });
      const payload = requireData(result.data).checkoutLoyaltyRedemptionRemove;
      assertStorefrontMutationSucceeded(payload.userErrors);
      return payload.checkout ?? null;
    },
    async placeOrder(input: PlaceOrderInput) {
      const result = await client.mutate({
        mutation: SdkPlaceOrderDocument,
        variables: { input },
      });
      const payload = requireData(result.data).placeOrder;
      assertStorefrontMutationSucceeded(payload.userErrors);
      return payload;
    },
    async loadCheckoutPlacement(input: SdkCheckoutPlacementQueryVariables) {
      const result = await client.query({
        query: SdkCheckoutPlacementDocument,
        variables: input,
        fetchPolicy: 'network-only',
      });
      return requireData(result.data).checkoutPlacement ?? null;
    },
  };
}

export type StorefrontApi = ReturnType<typeof createStorefrontApi>;

export { handlePlaceOrderCustomerAction } from './customerAction';
export type {
  PlaceOrderCustomerAction,
  CustomerActionHandlers,
} from './customerAction';
