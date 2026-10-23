'use client';

import * as React from 'react';
import {
  SdkAccountProductActionsQueryDocument,
  SdkCustomerWishlistQueryDocument,
  SdkWishlistProductAddMutationDocument,
  SdkWishlistProductRemoveMutationDocument,
  type ImageTransformInput,
  type SdkWishlistProductAddMutation,
  type SdkWishlistProductRemoveMutation,
} from '../../../graphql/apollo/generated/operations';
import {
  DEFAULT_PAGE_SIZE,
  newIdempotencyKey,
  useCustomerConnectionQuery,
  useCustomerMutation,
  type CustomerMutationConfig,
} from './internal.js';
import type {
  AddedWishlistItem,
  CustomerConnectionOptions,
  CustomerConnectionState,
  CustomerMutation,
  CustomerWishlist,
  WishlistItem,
} from './types.js';

export interface WishlistOptions extends CustomerConnectionOptions {
  /** Transform of the product images. */
  imageTransform?: ImageTransformInput;
}

export interface WishlistState extends CustomerConnectionState<WishlistItem> {
  /** The default wishlist; `null` until the customer saves the first product. */
  wishlist: CustomerWishlist | null;
}

/** Items of the default wishlist of the signed-in customer, page by page. */
export function useWishlist({
  first = DEFAULT_PAGE_SIZE,
  imageTransform,
}: WishlistOptions = {}): WishlistState {
  const { data, state } = useCustomerConnectionQuery(
    SdkCustomerWishlistQueryDocument,
    { first, imageTransform },
    (value) => value.customer?.defaultWishlist?.items
  );
  const apiWishlist = data?.customer?.defaultWishlist;
  const wishlist = React.useMemo<CustomerWishlist | null>(
    () =>
      apiWishlist
        ? {
            id: apiWishlist.id,
            name: apiWishlist.name,
            isDefault: apiWishlist.isDefault,
          }
        : null,
    [apiWishlist]
  );
  return { ...state, wishlist };
}

// The wishlist page and the product actions both read the saved products.
const refetchQueries = [
  SdkCustomerWishlistQueryDocument,
  SdkAccountProductActionsQueryDocument,
];

const addConfig: CustomerMutationConfig<
  SdkWishlistProductAddMutation,
  SdkWishlistProductAddMutation['wishlistProductAdd'],
  AddedWishlistItem
> = {
  payload: (data) => data.wishlistProductAdd,
  result: (payload) => payload.wishlistItem,
  refetchQueries,
};

/**
 * Saves a product to the default wishlist, creating the list when there is none. Saving a
 * product that is already there resolves to the item it already has.
 */
export function useAddWishlistProduct(): CustomerMutation<
  string,
  AddedWishlistItem
> {
  const [commit, loading] = useCustomerMutation(
    SdkWishlistProductAddMutationDocument,
    addConfig
  );
  const addProduct = React.useCallback(
    (productId: string) =>
      commit({ input: { productId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [addProduct, loading] as const;
}

const removeConfig: CustomerMutationConfig<
  SdkWishlistProductRemoveMutation,
  SdkWishlistProductRemoveMutation['wishlistProductRemove'],
  string
> = {
  payload: (data) => data.wishlistProductRemove,
  result: (payload) => payload.deletedWishlistItemId,
  refetchQueries,
};

/** Removes a wishlist item; resolves to the removed item id. */
export function useRemoveWishlistItem(): CustomerMutation<string, string> {
  const [commit, loading] = useCustomerMutation(
    SdkWishlistProductRemoveMutationDocument,
    removeConfig
  );
  const removeItem = React.useCallback(
    (itemId: string) =>
      commit({ input: { itemId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [removeItem, loading] as const;
}
