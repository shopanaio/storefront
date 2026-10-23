'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  accountProductActionsQuery,
  customerComparisonVariantAddMutation,
  customerComparisonVariantRemoveMutation,
  wishlistProductAddMutation,
  wishlistProductRemoveMutation,
  type AccountUserError,
} from './graphql.js';
import { useIsAuthenticated } from '../../session/react/context/SessionContext.js';

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
  /** Saves the product to the default wishlist, or removes it from there. */
  setWishlisted(productId: string, wishlisted: boolean): Promise<void>;
  /** Adds the variant to the comparisons, or removes it from them. */
  setCompared(variantId: string, compared: boolean): Promise<void>;
}

export class AccountMutationError extends Error {
  readonly userErrors: readonly AccountUserError[];

  constructor(userErrors: readonly AccountUserError[]) {
    super(userErrors[0]?.message ?? 'Unable to update the customer account');
    this.name = 'AccountMutationError';
    this.userErrors = userErrors;
  }
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
  const [addWishlistProduct, addWishlistState] = useMutation(
    wishlistProductAddMutation
  );
  const [removeWishlistProduct, removeWishlistState] = useMutation(
    wishlistProductRemoveMutation
  );
  const [addComparisonVariant, addComparisonState] = useMutation(
    customerComparisonVariantAddMutation
  );
  const [removeComparisonVariant, removeComparisonState] = useMutation(
    customerComparisonVariantRemoveMutation
  );

  const customer = isAuthenticated ? query.data?.customer : undefined;
  const wishlistItems = customer?.defaultWishlist?.items.nodes;
  const comparedVariantIds = customer?.productComparisons.nodes.flatMap(
    (comparison) => comparison.columns.nodes.map((column) => column.variant.id)
  );

  const { refetch } = query;
  const refresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const setWishlisted = React.useCallback(
    async (targetProductId: string, wishlisted: boolean) => {
      if (!isAuthenticated) return;
      if (wishlisted) {
        // Adding a saved product answers the item it already has.
        const { data } = await addWishlistProduct({
          variables: {
            input: {
              productId: targetProductId,
              idempotencyKey: crypto.randomUUID(),
            },
          },
        });
        assertMutationSucceeded(data?.wishlistProductAdd.errors);
      } else {
        const item = wishlistItems?.find(
          (candidate) => candidate.product?.id === targetProductId
        );
        if (!item) return;
        const { data } = await removeWishlistProduct({
          variables: {
            input: { itemId: item.id, idempotencyKey: crypto.randomUUID() },
          },
        });
        assertMutationSucceeded(data?.wishlistProductRemove.errors);
      }
      await refresh();
    },
    [
      addWishlistProduct,
      isAuthenticated,
      refresh,
      removeWishlistProduct,
      wishlistItems,
    ]
  );

  const setCompared = React.useCallback(
    async (targetVariantId: string, compared: boolean) => {
      if (!isAuthenticated) return;
      // Adding a compared variant, or removing one that is not, changes nothing.
      const input = {
        variantId: targetVariantId,
        idempotencyKey: crypto.randomUUID(),
      };
      if (compared) {
        const { data } = await addComparisonVariant({ variables: { input } });
        assertMutationSucceeded(data?.customerComparisonVariantAdd.errors);
      } else {
        const { data } = await removeComparisonVariant({
          variables: { input },
        });
        assertMutationSucceeded(data?.customerComparisonVariantRemove.errors);
      }
      await refresh();
    },
    [addComparisonVariant, isAuthenticated, refresh, removeComparisonVariant]
  );

  const wishlistLoading =
    query.loading || addWishlistState.loading || removeWishlistState.loading;
  const comparisonLoading =
    query.loading ||
    addComparisonState.loading ||
    removeComparisonState.loading;

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

function assertMutationSucceeded(
  errors: readonly AccountUserError[] | null | undefined
): void {
  if (errors?.length) {
    throw new AccountMutationError(errors);
  }
}
