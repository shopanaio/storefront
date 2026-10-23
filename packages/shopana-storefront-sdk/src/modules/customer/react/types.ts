import type {
  CustomerAddressCreateInput,
  CustomerAddressDefaultSetInput,
  CustomerAddressUpdateInput,
  CustomerDataRequestCreateInput,
  CustomerMarketingConsentUpdateInput,
  CustomerUpdateInput,
  SdkCustomerAddressFragment,
  SdkCustomerDataRequestFragment,
  SdkCustomerMarketingConsentFragment,
  SdkCustomerProductComparisonsQuery,
  SdkCustomerProfileFragment,
  SdkCustomerUserErrorFragment,
  SdkLoyaltyAccountFragment,
  SdkLoyaltyTransactionFragment,
  SdkReviewRequestFragment,
  SdkWishlistItemFragment,
  SdkWishlistProductAddMutation,
} from '../../../graphql/apollo/generated/operations';

type IsAny<T> = 0 extends 1 & T ? true : false;

type ScalarField<T, K extends keyof T> =
  IsAny<T[K]> extends true
    ? // A nullable field is optional in the generated types; `any` swallowed its `null`.
      Partial<Pick<T, K>> extends Pick<T, K>
      ? string | null
      : string
    : WithStringScalars<T[K]>;

/**
 * The generated types leave the custom scalars the SDK codegen does not map (`Date`, `URL`,
 * `Decimal`, `UnsignedInt64`) as `any`. The Storefront API serializes all of them as strings:
 * dates as `YYYY-MM-DD`, points and amounts as decimal strings that may exceed 2^53.
 */
export type WithStringScalars<T> =
  IsAny<T> extends true
    ? string
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<WithStringScalars<U>>
      : T extends object
        ? object extends T
          ? T
          : { readonly [K in keyof T]: ScalarField<T, K> }
        : T;

/** A rejected field of a customer mutation, as the Storefront API reports it. */
export type CustomerUserError = Omit<
  SdkCustomerUserErrorFragment,
  '__typename'
>;

/** The signed-in customer: profile, contacts and their marketing consents. */
export type CustomerProfile = WithStringScalars<SdkCustomerProfileFragment>;

/** Profile fields `customerUpdate` accepts; omitted fields stay as they are. */
export type CustomerProfileValues = WithStringScalars<
  Omit<CustomerUpdateInput, 'idempotencyKey'>
>;

export type CustomerMarketingConsent =
  WithStringScalars<SdkCustomerMarketingConsentFragment>;

export type CustomerMarketingConsentValues = Omit<
  CustomerMarketingConsentUpdateInput,
  'idempotencyKey'
>;

export type CustomerAddress = WithStringScalars<SdkCustomerAddressFragment>;

export type CustomerAddressCreateValues = WithStringScalars<
  Omit<CustomerAddressCreateInput, 'idempotencyKey'>
>;

export type CustomerAddressUpdateValues = WithStringScalars<
  Omit<CustomerAddressUpdateInput, 'idempotencyKey'>
>;

export type CustomerAddressDefaultValues = Omit<
  CustomerAddressDefaultSetInput,
  'idempotencyKey'
>;

/** The default addresses of the customer after an address change. */
export interface CustomerAddressDefaults {
  defaultShippingAddressId: string | null;
  defaultBillingAddressId: string | null;
}

export interface CustomerWishlist {
  id: string;
  name: string;
  isDefault: boolean;
}

export type WishlistItem = WithStringScalars<SdkWishlistItemFragment>;

/** The item `wishlistProductAdd` answers: the new one, or the one already saved. */
export type AddedWishlistItem = WithStringScalars<
  NonNullable<
    SdkWishlistProductAddMutation['wishlistProductAdd']['wishlistItem']
  >
>;

/** Comparison of the variants the customer saved in one category. */
export type ProductComparison = WithStringScalars<
  NonNullable<
    SdkCustomerProductComparisonsQuery['customer']
  >['productComparisons']['nodes'][number]
>;

/** Result of a comparison change; `revision` is the new comparison revision when known. */
export interface ProductComparisonChange {
  revision: number | null;
}

export type LoyaltyAccount = WithStringScalars<SdkLoyaltyAccountFragment>;

export type LoyaltyTransaction =
  WithStringScalars<SdkLoyaltyTransactionFragment>;

export type CustomerDataRequest =
  WithStringScalars<SdkCustomerDataRequestFragment>;

export type CustomerDataRequestValues = Omit<
  CustomerDataRequestCreateInput,
  'idempotencyKey'
>;

export type ReviewRequest = WithStringScalars<SdkReviewRequestFragment>;

/** State shared by every customer query hook. */
export interface CustomerQueryState {
  /** No customer session: nothing is read and the data is empty. */
  requiresSignIn: boolean;
  /** The first read is in flight and nothing is cached yet. */
  loading: boolean;
  /**
   * The read failed and nothing was read before. When a later read fails, the data read
   * before stays and `error` stays `null`.
   */
  error: Error | null;
  /** Reads the data again; resolves when done, a failure only shows in `error`. */
  refetch(): Promise<void>;
}

/** State of a customer query that reads a connection page by page. */
export interface CustomerConnectionState<TNode> extends CustomerQueryState {
  /** Every page read so far, in API order. */
  nodes: readonly TNode[];
  totalCount: number;
  hasNext: boolean;
  loadingNext: boolean;
  /** Reads the next page and appends it to `nodes`. */
  loadNext(): Promise<void>;
}

/** Options of the hooks that read a connection. */
export interface CustomerConnectionOptions {
  /** Page size; the API caps it at 100. Defaults to 20. */
  first?: number;
}

/** A mutation hook: the function to call, and whether a call is in flight. */
export type CustomerMutation<TInput, TResult> = readonly [
  (input: TInput) => Promise<TResult>,
  boolean,
];
