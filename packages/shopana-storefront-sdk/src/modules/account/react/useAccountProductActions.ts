'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { accountProductActionsQuery } from './graphql.js';
import { useIsAuthenticated } from '../../session/react/context/SessionContext.js';
import {
  useAddComparisonVariant,
  useRemoveComparisonVariant,
} from '../../customer/react/useProductComparisons.js';
import {
  useAddWishlistProduct,
  useRemoveWishlistItem,
} from '../../customer/react/useWishlist.js';

export interface AccountProductActionsInput {
  /** Product whose wishlist state is read. */
  productId: string;
  /** Variant whose comparison state is read. */
  variantId: string;
}

/**
 * The wishlist and comparison of the signed-in customer for one product page. Both belong to
 * the customer: without a session nothing is queried, `requiresSignIn` is true and the setters
 * do nothing, so the page asks for a sign-in first.
 *
 * The setters take the wanted state rather than toggling it, so an action asked for before a
 * sign-in can run after it without undoing what the account already has: adding a product
 * that is already saved, or a compared variant, leaves it as it is.
 */
export interface AccountProductActions {
  /** No customer session: the wishlist and comparisons need a sign-in. */
  requiresSignIn: boolean;
  isWishlisted: boolean;
  isCompared: boolean;
  loading: boolean;
  wishlistLoading: boolean;
  comparisonLoading: boolean;
  /**
   * Saves the product to the default wishlist, or removes it from there. Rejects with
   * `CustomerMutationError` from `@shopana/storefront-sdk/modules/customer/react`.
   */
  setWishlisted(productId: string, wishlisted: boolean): Promise<void>;
  /** Adds the variant to the comparisons, or removes it from them; rejects likewise. */
  setCompared(variantId: string, compared: boolean): Promise<void>;
}

export function useAccountProductActions({
  productId,
  variantId,
}: AccountProductActionsInput): AccountProductActions {
  const isAuthenticated = useIsAuthenticated();
  const query = useQuery(accountProductActionsQuery, {
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });
  // The mutations read this query and the wishlist and comparison pages again on success.
  const [addWishlistProduct, addingWishlistProduct] = useAddWishlistProduct();
  const [removeWishlistItem, removingWishlistItem] = useRemoveWishlistItem();
  const [addComparisonVariant, addingComparisonVariant] =
    useAddComparisonVariant();
  const [removeComparisonVariant, removingComparisonVariant] =
    useRemoveComparisonVariant();

  const customer = isAuthenticated ? query.data?.customer : undefined;
  const wishlistItems = customer?.defaultWishlist?.items.nodes;
  const comparedVariantIds = customer?.productComparisons.nodes.flatMap(
    (comparison) => comparison.columns.nodes.map((column) => column.variant.id)
  );

  const setWishlisted = React.useCallback(
    async (targetProductId: string, wishlisted: boolean) => {
      if (!isAuthenticated) return;
      if (wishlisted) {
        // Adding a saved product answers the item it already has.
        await addWishlistProduct(targetProductId);
        return;
      }
      const item = wishlistItems?.find(
        (candidate) => candidate.product?.id === targetProductId
      );
      if (!item) return;
      await removeWishlistItem(item.id);
    },
    [addWishlistProduct, isAuthenticated, removeWishlistItem, wishlistItems]
  );

  const setCompared = React.useCallback(
    async (targetVariantId: string, compared: boolean) => {
      if (!isAuthenticated) return;
      // Adding a compared variant, or removing one that is not, changes nothing.
      if (compared) {
        await addComparisonVariant(targetVariantId);
      } else {
        await removeComparisonVariant(targetVariantId);
      }
    },
    [addComparisonVariant, isAuthenticated, removeComparisonVariant]
  );

  const wishlistLoading =
    query.loading || addingWishlistProduct || removingWishlistItem;
  const comparisonLoading =
    query.loading || addingComparisonVariant || removingComparisonVariant;

  return {
    requiresSignIn: !isAuthenticated,
    isWishlisted: Boolean(
      wishlistItems?.some((item) => item.product?.id === productId)
    ),
    isCompared: Boolean(comparedVariantIds?.includes(variantId)),
    loading: wishlistLoading || comparisonLoading,
    wishlistLoading,
    comparisonLoading,
    setWishlisted,
    setCompared,
  };
}
