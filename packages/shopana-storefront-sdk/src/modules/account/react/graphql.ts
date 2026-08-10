import { gql, type TypedDocumentNode } from '@apollo/client';

export interface AccountUserError {
  readonly code: string;
  readonly field?: readonly string[] | null;
  readonly message: string;
  readonly retryable: boolean;
}

export interface AccountProductActionsQueryData {
  readonly customer?: {
    readonly id: string;
    readonly defaultWishlist?: {
      readonly id: string;
      readonly items: {
        readonly nodes: readonly {
          readonly id: string;
          readonly product?: { readonly id: string } | null;
        }[];
      };
    } | null;
    readonly productComparisons: {
      readonly revision: number;
      readonly nodes: readonly {
        readonly columns: {
          readonly nodes: readonly {
            readonly variant: { readonly id: string };
          }[];
        };
      }[];
    };
  } | null;
}

interface WishlistProductAddData {
  readonly wishlistProductAdd: {
    readonly wishlistItem?: {
      readonly id: string;
      readonly product?: { readonly id: string } | null;
      readonly wishlist: { readonly id: string };
    } | null;
    readonly errors: readonly AccountUserError[];
  };
}

interface WishlistProductAddVariables {
  readonly input: {
    readonly productId: string;
    readonly wishlistId?: string;
    readonly idempotencyKey: string;
  };
}

interface WishlistProductRemoveData {
  readonly wishlistProductRemove: {
    readonly deletedWishlistItemId?: string | null;
    readonly errors: readonly AccountUserError[];
  };
}

interface WishlistProductRemoveVariables {
  readonly input: {
    readonly itemId: string;
    readonly idempotencyKey: string;
  };
}

type ComparisonMutationData<TField extends string> = {
  readonly [key in TField]: {
    readonly revision?: number | null;
    readonly errors: readonly AccountUserError[];
  };
};

interface ComparisonMutationVariables {
  readonly input: {
    readonly variantId: string;
    readonly expectedRevision: number;
    readonly idempotencyKey: string;
  };
}

const accountUserErrorFragment = gql`
  fragment SdkAccountUserErrorFragment on CustomerUserError {
    code
    field
    message
    retryable
  }
`;

const comparisonMutationResultFragment = gql`
  fragment SdkComparisonMutationResultFragment on CustomerComparisonMutationPayload {
    revision
    errors: userErrors {
      ...SdkAccountUserErrorFragment
    }
  }
  ${accountUserErrorFragment}
`;

export const accountProductActionsQuery = gql`
  query SdkAccountProductActionsQuery {
    customer {
      id
      defaultWishlist {
        id
        items(first: 100) {
          nodes {
            id
            product {
              id
            }
          }
        }
      }
      productComparisons {
        revision
        nodes {
          columns(first: 100) {
            nodes {
              variant {
                id
              }
            }
          }
        }
      }
    }
  }
` as TypedDocumentNode<AccountProductActionsQueryData>;

export const wishlistProductAddMutation = gql`
  mutation SdkWishlistProductAddMutation($input: WishlistProductAddInput!) {
    wishlistProductAdd(input: $input) {
      wishlistItem {
        id
        product {
          id
        }
        wishlist {
          id
        }
      }
      errors: userErrors {
        ...SdkAccountUserErrorFragment
      }
    }
  }
  ${accountUserErrorFragment}
` as TypedDocumentNode<WishlistProductAddData, WishlistProductAddVariables>;

export const wishlistProductRemoveMutation = gql`
  mutation SdkWishlistProductRemoveMutation(
    $input: WishlistProductRemoveInput!
  ) {
    wishlistProductRemove(input: $input) {
      deletedWishlistItemId
      errors: userErrors {
        ...SdkAccountUserErrorFragment
      }
    }
  }
  ${accountUserErrorFragment}
` as TypedDocumentNode<WishlistProductRemoveData, WishlistProductRemoveVariables>;

export const customerComparisonVariantAddMutation = gql`
  mutation SdkCustomerComparisonVariantAddMutation(
    $input: CustomerComparisonVariantAddInput!
  ) {
    customerComparisonVariantAdd(input: $input) {
      ...SdkComparisonMutationResultFragment
    }
  }
  ${comparisonMutationResultFragment}
` as TypedDocumentNode<
  ComparisonMutationData<'customerComparisonVariantAdd'>,
  ComparisonMutationVariables
>;

export const customerComparisonVariantRemoveMutation = gql`
  mutation SdkCustomerComparisonVariantRemoveMutation(
    $input: CustomerComparisonVariantRemoveInput!
  ) {
    customerComparisonVariantRemove(input: $input) {
      ...SdkComparisonMutationResultFragment
    }
  }
  ${comparisonMutationResultFragment}
` as TypedDocumentNode<
  ComparisonMutationData<'customerComparisonVariantRemove'>,
  ComparisonMutationVariables
>;
