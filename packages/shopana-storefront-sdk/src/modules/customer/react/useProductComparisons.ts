'use client';

import * as React from 'react';
import {
  SdkAccountProductActionsQueryDocument,
  SdkCustomerComparisonCategoryClearMutationDocument,
  SdkCustomerComparisonVariantAddMutationDocument,
  SdkCustomerComparisonVariantRemoveMutationDocument,
  SdkCustomerProductComparisonsQueryDocument,
  SdkProductComparisonDocument,
  type ImageTransformInput,
  type SdkComparisonMutationResultFragment,
} from '../../../graphql/apollo/generated/operations';
import {
  newIdempotencyKey,
  useCustomerMutation,
  useCustomerQuery,
  type CustomerMutationConfig,
} from './internal.js';
import type {
  CustomerMutation,
  CustomerQueryState,
  ProductComparison,
  ProductComparisonChange,
} from './types.js';

export interface ProductComparisonsOptions {
  /** Transform of the column images. */
  imageTransform?: ImageTransformInput;
}

export interface ProductComparisonsState extends CustomerQueryState {
  /** One comparison per category with saved variants; empty categories are left out. */
  comparisons: readonly ProductComparison[];
  /** Number of categories with a comparison. */
  totalCount: number;
  /** Number of saved variants across the comparisons. */
  itemCount: number;
}

/** Comparisons of the signed-in customer, grouped by the primary category of the variants. */
export function useProductComparisons({
  imageTransform,
}: ProductComparisonsOptions = {}): ProductComparisonsState {
  const { data, state } = useCustomerQuery(
    SdkCustomerProductComparisonsQueryDocument,
    { variables: { imageTransform } }
  );
  const comparisons = data?.customer?.productComparisons;
  return {
    ...state,
    comparisons: comparisons?.nodes ?? [],
    totalCount: comparisons?.totalCount ?? 0,
    itemCount: comparisons?.itemCount ?? 0,
  };
}

// The comparisons page, the product comparison table and the product actions all read which
// variants are saved.
const refetchQueries = [
  SdkCustomerProductComparisonsQueryDocument,
  SdkProductComparisonDocument,
  SdkAccountProductActionsQueryDocument,
];

function comparisonConfig<TData>(
  payload: (data: TData) => SdkComparisonMutationResultFragment
): CustomerMutationConfig<
  TData,
  SdkComparisonMutationResultFragment,
  ProductComparisonChange
> {
  return {
    payload,
    result: (value) => ({ revision: value.revision ?? null }),
    refetchQueries,
  };
}

const addConfig = comparisonConfig(
  (data: {
    customerComparisonVariantAdd: SdkComparisonMutationResultFragment;
  }) => data.customerComparisonVariantAdd
);
const removeConfig = comparisonConfig(
  (data: {
    customerComparisonVariantRemove: SdkComparisonMutationResultFragment;
  }) => data.customerComparisonVariantRemove
);
const clearConfig = comparisonConfig(
  (data: {
    customerComparisonCategoryClear: SdkComparisonMutationResultFragment;
  }) => data.customerComparisonCategoryClear
);

/** Saves a variant for comparison; adding a compared variant changes nothing. */
export function useAddComparisonVariant(): CustomerMutation<
  string,
  ProductComparisonChange
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerComparisonVariantAddMutationDocument,
    addConfig
  );
  const addVariant = React.useCallback(
    (variantId: string) =>
      commit({ input: { variantId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [addVariant, loading] as const;
}

/** Removes a variant from the comparisons; removing one that is not compared changes nothing. */
export function useRemoveComparisonVariant(): CustomerMutation<
  string,
  ProductComparisonChange
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerComparisonVariantRemoveMutationDocument,
    removeConfig
  );
  const removeVariant = React.useCallback(
    (variantId: string) =>
      commit({ input: { variantId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [removeVariant, loading] as const;
}

/** Removes every saved variant of one category (`ProductComparison.category.id`). */
export function useClearComparisonCategory(): CustomerMutation<
  string,
  ProductComparisonChange
> {
  const [commit, loading] = useCustomerMutation(
    SdkCustomerComparisonCategoryClearMutationDocument,
    clearConfig
  );
  const clearCategory = React.useCallback(
    (categoryId: string) =>
      commit({ input: { categoryId, idempotencyKey: newIdempotencyKey() } }),
    [commit]
  );
  return [clearCategory, loading] as const;
}
