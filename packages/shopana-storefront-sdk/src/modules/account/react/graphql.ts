import type { SdkAccountUserErrorFragment } from '../../../graphql/apollo/generated/operations';

export type AccountUserError = Omit<SdkAccountUserErrorFragment, '__typename'>;

export {
  SdkAccountProductActionsQueryDocument as accountProductActionsQuery,
  SdkCustomerComparisonVariantAddMutationDocument as customerComparisonVariantAddMutation,
  SdkCustomerComparisonVariantRemoveMutationDocument as customerComparisonVariantRemoveMutation,
  SdkWishlistProductAddMutationDocument as wishlistProductAddMutation,
  SdkWishlistProductRemoveMutationDocument as wishlistProductRemoveMutation,
} from '../../../graphql/apollo/generated/operations';
