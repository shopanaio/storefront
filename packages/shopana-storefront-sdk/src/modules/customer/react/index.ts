/**
 * Customer account of the signed-in customer. Every hook reads nothing without a customer
 * session; every mutation rejects with `CustomerMutationError`.
 */
export { SdkLoyaltyAccountQueryDocument as loyaltyAccountQuery } from '../../../graphql/apollo/generated/operations';
export {
  CustomerMutationError,
  type CustomerMutationErrorKind,
  type CustomerMutationErrorOptions,
} from './CustomerMutationError.js';
export type {
  AddedWishlistItem,
  CustomerAddress,
  CustomerAddressCreateValues,
  CustomerAddressDefaults,
  CustomerAddressDefaultValues,
  CustomerAddressUpdateValues,
  CustomerConnectionOptions,
  CustomerConnectionState,
  CustomerDataRequest,
  CustomerDataRequestValues,
  CustomerMarketingConsent,
  CustomerMarketingConsentChange,
  CustomerMarketingConsentValues,
  CustomerMutation,
  CustomerProfile,
  CustomerProfileValues,
  CustomerQueryState,
  CustomerUserError,
  CustomerWishlist,
  LoyaltyAccount,
  LoyaltyTransaction,
  ProductComparison,
  ProductComparisonChange,
  ReviewRequest,
  WishlistItem,
  WithStringScalars,
} from './types.js';
export {
  useCustomer,
  useMarketingConsents,
  useUpdateCustomer,
  useUpdateMarketingConsent,
  type CustomerState,
  type MarketingConsentsState,
} from './useCustomer.js';
export {
  useCreateCustomerAddress,
  useCustomerAddresses,
  useDeleteCustomerAddress,
  useSetDefaultCustomerAddress,
  useUpdateCustomerAddress,
  type CustomerAddressesState,
} from './useCustomerAddresses.js';
export {
  useAddWishlistProduct,
  useRemoveWishlistItem,
  useWishlist,
  type WishlistOptions,
  type WishlistState,
} from './useWishlist.js';
export {
  useAddComparisonVariant,
  useClearComparisonCategory,
  useProductComparisons,
  useRemoveComparisonVariant,
  type ProductComparisonsOptions,
  type ProductComparisonsState,
} from './useProductComparisons.js';
export {
  useLoyaltyAccount,
  useLoyaltyTransactions,
  useRefetchLoyaltyAccount,
  type LoyaltyAccountState,
} from './useLoyalty.js';
export {
  useCancelDataRequest,
  useCreateDataRequest,
  useDataRequests,
} from './useDataRequests.js';
export {
  useReviewRequests,
  type ReviewRequestsOptions,
} from './useReviewRequests.js';
