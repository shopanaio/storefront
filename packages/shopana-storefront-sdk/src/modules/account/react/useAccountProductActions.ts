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

export interface AccountProductActionsInput {
  productId: string;
  variantId: string;
  enabled?: boolean;
}

export interface AccountProductActions {
  isWishlisted: boolean;
  isCompared: boolean;
  loading: boolean;
  wishlistLoading: boolean;
  comparisonLoading: boolean;
  toggleWishlist(): Promise<void>;
  toggleComparison(): Promise<void>;
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
  enabled = true,
}: AccountProductActionsInput): AccountProductActions {
  const query = useQuery(accountProductActionsQuery, {
    skip: !enabled,
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

  const customer = query.data?.customer;
  const wishlistItem = customer?.defaultWishlist?.items.nodes.find(
    (item) => item.product?.id === productId
  );
  const isCompared = Boolean(
    customer?.productComparisons.nodes.some((comparison) =>
      comparison.columns.nodes.some((column) => column.variant.id === variantId)
    )
  );

  const refresh = React.useCallback(async () => {
    await query.refetch();
  }, [query.refetch]);

  const toggleWishlist = React.useCallback(async () => {
    if (wishlistItem) {
      const { data } = await removeWishlistProduct({
        variables: {
          input: {
            itemId: wishlistItem.id,
            idempotencyKey: crypto.randomUUID(),
          },
        },
      });
      assertMutationSucceeded(data?.wishlistProductRemove.errors);
    } else {
      const { data } = await addWishlistProduct({
        variables: {
          input: {
            productId,
            idempotencyKey: crypto.randomUUID(),
          },
        },
      });
      assertMutationSucceeded(data?.wishlistProductAdd.errors);
    }
    await refresh();
  }, [
    addWishlistProduct,
    productId,
    refresh,
    removeWishlistProduct,
    wishlistItem,
  ]);

  const toggleComparison = React.useCallback(async () => {
    if (!customer) {
      throw new Error('Product comparisons are not loaded');
    }

    if (isCompared) {
      const { data } = await removeComparisonVariant({
        variables: {
          input: {
            variantId,
            idempotencyKey: crypto.randomUUID(),
          },
        },
      });
      assertMutationSucceeded(data?.customerComparisonVariantRemove.errors);
    } else {
      const { data } = await addComparisonVariant({
        variables: {
          input: {
            variantId,
            idempotencyKey: crypto.randomUUID(),
          },
        },
      });
      assertMutationSucceeded(data?.customerComparisonVariantAdd.errors);
    }
    await refresh();
  }, [
    addComparisonVariant,
    customer,
    isCompared,
    refresh,
    removeComparisonVariant,
    variantId,
  ]);

  const wishlistLoading =
    query.loading || addWishlistState.loading || removeWishlistState.loading;
  const comparisonLoading =
    query.loading ||
    addComparisonState.loading ||
    removeComparisonState.loading;

  return {
    isWishlisted: Boolean(wishlistItem),
    isCompared,
    loading: wishlistLoading || comparisonLoading,
    wishlistLoading,
    comparisonLoading,
    toggleWishlist,
    toggleComparison,
  };
}

function assertMutationSucceeded(
  errors: readonly AccountUserError[] | null | undefined
): void {
  if (errors?.length) {
    throw new AccountMutationError(errors);
  }
}
