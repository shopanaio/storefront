export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: number; output: number; }
  /** A CSS color represented as a hexadecimal string. */
  Color: { input: any; output: any; }
  /** An opaque cursor used for pagination. */
  Cursor: { input: string; output: string; }
  /** An ISO 8601-encoded date and time string. */
  DateTime: { input: string; output: string; }
  /** An arbitrary-precision signed decimal number. */
  Decimal: { input: number; output: number; }
  /** An email address. */
  Email: { input: string; output: string; }
  /** A string containing HTML code. */
  HTML: { input: any; output: any; }
  /** An ISO 8601-encoded date and time string. */
  ISO8601DateTime: { input: any; output: any; }
  /** A JSON-serializable value. */
  JSON: { input: object; output: object; }
  Phone: { input: string; output: string; }
  TransportOptions: { input: any; output: any; }
  /** An RFC 3986 and RFC 3987 compliant URI string. */
  URL: { input: any; output: any; }
  /** An unsigned 64-bit integer serialized as a decimal string. */
  UnsignedInt64: { input: any; output: any; }
  Uuid: { input: string; output: string; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

/**
 * Variant-witness availability used by the canonical listing algebra.
 *
 * A product containing both available and unavailable variants can match both
 * states. Every other active variant filter remains applied to the witness.
 */
export enum Availability {
  Available = 'AVAILABLE',
  Unavailable = 'UNAVAILABLE'
}

/** A published category in the storefront catalog hierarchy. */
export type ApiCategory = ApiNode & {
  __typename?: 'Category';
  ancestors: Array<ApiCategory>;
  children: ApiCategoryConnection;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<ApiRichText>;
  excerpt?: Maybe<ApiRichText>;
  featuredMedia?: Maybe<ApiMedia>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  media: ApiCategoryMediaConnection;
  name: Scalars['String']['output'];
  parent?: Maybe<ApiCategory>;
  /**
   * Products published in this category.
   *
   * When query is provided, text search is applied inside the category scope.
   * With no query the contextual default sort is MANUAL. With a non-empty query
   * it is RELEVANCE.
   */
  products: ApiProductConnection;
  publishedAt: Scalars['DateTime']['output'];
  seo: ApiSeo;
  updatedAt: Scalars['DateTime']['output'];
};


/** A published category in the storefront catalog hierarchy. */
export type ApiCategoryChildrenArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published category in the storefront catalog hierarchy. */
export type ApiCategoryMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published category in the storefront catalog hierarchy. */
export type ApiCategoryProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<Array<ApiListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ListingSort>;
};

/** A Relay connection to categories. */
export type ApiCategoryConnection = ApiConnection & {
  __typename?: 'CategoryConnection';
  edges: Array<ApiCategoryEdge>;
  nodes: Array<ApiCategory>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** A category and its opaque position in a category connection. */
export type ApiCategoryEdge = {
  __typename?: 'CategoryEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiCategory;
};

/** A Relay connection to the media registered on a category. */
export type ApiCategoryMediaConnection = ApiConnection & {
  __typename?: 'CategoryMediaConnection';
  edges: Array<ApiCategoryMediaEdge>;
  nodes: Array<ApiMedia>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a category. */
export type ApiCategoryMediaEdge = {
  __typename?: 'CategoryMediaEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiMedia;
};

/** A checkout with multiple items. */
export type ApiCheckout = ApiNode & {
  __typename?: 'Checkout';
  /** Applied promo codes for the checkout. */
  appliedPromoCodes: Array<ApiCheckoutPromoCode>;
  /** Billing address used by payment providers and the resulting order. */
  billingAddress?: Maybe<ApiCheckoutBillingAddress>;
  /** Canonical sales channel used by pricing and eligibility rules. */
  channelCode: Scalars['String']['output'];
  /** All cost calculations for the checkout. */
  cost: ApiCheckoutCost;
  /** When this checkout was first created. */
  createdAt: Scalars['DateTime']['output'];
  /** Display and settlement currency of this checkout snapshot. */
  currencyCode: CurrencyCode;
  /** Customer identity associated with the checkout. */
  customerIdentity: ApiCheckoutCustomerIdentity;
  /** Customer note or special instructions for the checkout. */
  customerNote?: Maybe<Scalars['String']['output']>;
  /** Delivery groups. */
  deliveryGroups: Array<ApiCheckoutDeliveryGroup>;
  /** A globally-unique ID. */
  id: Scalars['ID']['output'];
  /** Ordered issues emitted by the checkout pipeline. */
  issues: Array<ApiCheckoutIssue>;
  /**
   * Ordered root items in the checkout. Bundle components are exposed through
   * CheckoutLine.children.
   */
  lines: Array<ApiCheckoutLine>;
  /** Locale used by checkout calculation and customer-facing messages. */
  localeCode: LocaleCode;
  /** Notifications for the user regarding the checkout. */
  notifications: Array<ApiCheckoutNotification>;
  /** Payment aggregate for this checkout. */
  payment: ApiCheckoutPayment;
  /** Revision of the last complete checkout pipeline result. */
  resultRevision: Scalars['String']['output'];
  /** Tags that can be used to organize checkout lines. */
  tags: Array<ApiCheckoutTag>;
  /** Quantity of the item being purchased. */
  totalQuantity: Scalars['Int']['output'];
  /** When this checkout was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** Whether the committed checkout is ready according to validation. */
  valid: Scalars['Boolean']['output'];
  /** Optimistic concurrency version of the committed checkout. */
  version: Scalars['Int']['output'];
};

/**
 * A normalized international billing address captured independently from
 * delivery destinations. Payment-provider-specific fields belong to data.
 */
export type ApiCheckoutBillingAddress = {
  __typename?: 'CheckoutBillingAddress';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  company?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<CountryCode>;
  /** Payment-provider-specific billing-address extension data. */
  data?: Maybe<Scalars['JSON']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  formatted: Array<Scalars['String']['output']>;
  formattedArea?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
  provinceCode?: Maybe<Scalars['String']['output']>;
  zip?: Maybe<Scalars['String']['output']>;
};

/**
 * Portable international postal fields for a checkout billing address.
 * Payment-provider-specific fields belong to data.
 */
export type ApiCheckoutBillingAddressInput = {
  address1?: InputMaybe<Scalars['String']['input']>;
  address2?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  company?: InputMaybe<Scalars['String']['input']>;
  countryCode?: InputMaybe<CountryCode>;
  /** Payment-provider-specific billing-address extension data. */
  data?: InputMaybe<Scalars['JSON']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  provinceCode?: InputMaybe<Scalars['String']['input']>;
  zip?: InputMaybe<Scalars['String']['input']>;
};

/** Input for replacing or clearing the checkout billing address. */
export type ApiCheckoutBillingAddressUpdateInput = {
  /** New address. Passing null clears the current billing address. */
  billingAddress?: InputMaybe<ApiCheckoutBillingAddressInput>;
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/**
 * Input data for a child item in a bundle.
 * Price configuration is automatically taken from ProductGroup in the database.
 */
export type ApiCheckoutChildLineInput = {
  /** Checkout-owned attributes passed to the pipeline. */
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  /** ID of the exact component item selected in the parent configuration. */
  componentItemId: Scalars['ID']['input'];
  /**
   * ID of the purchasable for child item.
   * Must be a variant that exists in parent product's groups.
   */
  purchasableId: Scalars['ID']['input'];
  /** Purchase intent for the child variant. */
  purchase?: InputMaybe<ApiCheckoutLinePurchaseInput>;
  /** Quantity of the child item. */
  quantity: Scalars['Int']['input'];
};

/** All monetary calculations related to the checkout. */
export type ApiCheckoutCost = {
  __typename?: 'CheckoutCost';
  /** Total value of items before any discounts. */
  subtotalAmount: ApiMoney;
  /** Final amount to be paid, including item cost, shipping, and taxes. */
  totalAmount: ApiMoney;
  /** Total discount from both item-level and checkout-level promotions. */
  totalDiscountAmount: ApiMoney;
  /** Total shipping cost (only MERCHANT_COLLECTED payments). */
  totalShippingAmount: ApiMoney;
  /** Total tax amount applied to the checkout. */
  totalTaxAmount: ApiMoney;
};

/** Input data for creating a new checkout. */
export type ApiCheckoutCreateInput = {
  /** Canonical sales channel used by pricing and eligibility rules. */
  channelCode: Scalars['String']['input'];
  /** Display currency code for all items. ISO 4217 (3 letters, e.g., "USD", "EUR") */
  currencyCode: CurrencyCode;
  /** ID of the external source for the checkout. */
  externalId?: InputMaybe<Scalars['String']['input']>;
  /** Source of sales for the checkout. */
  externalSource?: InputMaybe<Scalars['String']['input']>;
  /** Client-generated opaque key used to replay this create safely. */
  idempotencyKey: Scalars['String']['input'];
  /** Initial items to add to the new checkout. */
  items: Array<ApiCheckoutLineAddInput>;
  /** Locale code for the checkout. ISO 639-1 (2 letters, e.g., "en", "ru") */
  localeCode: LocaleCode;
  /** Optional tag definitions to initialize for this checkout. */
  tags?: InputMaybe<Array<ApiCheckoutTagInput>>;
};

/** Input data for updating the display currency of the checkout. */
export type ApiCheckoutCurrencyCodeUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Currency code according to ISO 4217 (e.g., "USD", "EUR"). */
  currencyCode: CurrencyCode;
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

export type ApiCheckoutCustomerIdentity = {
  __typename?: 'CheckoutCustomerIdentity';
  /** Country code of the customer. */
  countryCode?: Maybe<CountryCode>;
  /** Customer associated with the checkout. */
  customer?: Maybe<ApiCustomer>;
  /** Customer email address associated with the checkout. */
  email?: Maybe<Scalars['Email']['output']>;
  /** First name of the customer. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Last name of the customer. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Middle name of the customer. */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Phone number of the customer. */
  phone?: Maybe<Scalars['String']['output']>;
};

/** Input data for updating customer identification data associated with the checkout. */
export type ApiCheckoutCustomerIdentityUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /**
   * Country code of the customer.
   * ISO 3166-1 alpha-2.
   */
  countryCode?: InputMaybe<CountryCode>;
  /** Customer's email address. If specified, will be linked to the checkout. */
  email?: InputMaybe<Scalars['Email']['input']>;
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** First name of the customer. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** Last name of the customer. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Middle name of the customer. */
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number of the customer. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Input data for updating the customer note attached to the checkout. */
export type ApiCheckoutCustomerNoteUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /**
   * Text of the customer note (delivery instructions, etc.).
   * Empty value clears the note.
   */
  note?: InputMaybe<Scalars['String']['input']>;
};

/** A normalized international delivery address associated with a checkout. */
export type ApiCheckoutDeliveryAddress = {
  __typename?: 'CheckoutDeliveryAddress';
  /** Primary address line. */
  address1?: Maybe<Scalars['String']['output']>;
  /** Secondary address line. */
  address2?: Maybe<Scalars['String']['output']>;
  /** City name. */
  city?: Maybe<Scalars['String']['output']>;
  /** Company or organization receiving the delivery. */
  company?: Maybe<Scalars['String']['output']>;
  /** Localized country or territory name. */
  country?: Maybe<Scalars['String']['output']>;
  /** Country code (ISO 3166-1 alpha-2). */
  countryCode?: Maybe<CountryCode>;
  /** Carrier-specific address extension data. */
  data?: Maybe<Scalars['JSON']['output']>;
  /** Recipient first name captured with this destination. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Address lines formatted for the active storefront locale. */
  formatted: Array<Scalars['String']['output']>;
  /** Compact city, region, and country representation. */
  formattedArea?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the delivery address. */
  id?: Maybe<Scalars['ID']['output']>;
  /** Recipient last name captured with this destination. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Recipient name formatted for the active storefront locale. */
  name: Scalars['String']['output'];
  /** Contact phone captured with this destination. */
  phone?: Maybe<Scalars['String']['output']>;
  /** Localized region, state, or province name. */
  province?: Maybe<Scalars['String']['output']>;
  /** Province code. */
  provinceCode?: Maybe<Scalars['String']['output']>;
  /** Postal or ZIP code. */
  zip?: Maybe<Scalars['String']['output']>;
};

/**
 * Portable international postal fields for a checkout delivery address.
 *
 * Carrier-specific fields such as a Nova Poshta settlement, warehouse, or branch
 * identifier belong to data and are validated by the selected delivery option's
 * customerInputContract.
 */
export type ApiCheckoutDeliveryAddressInput = {
  /** Primary address line. */
  address1?: InputMaybe<Scalars['String']['input']>;
  /** Secondary address line. */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** City name. */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Company or organization receiving the delivery. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-2). */
  countryCode?: InputMaybe<CountryCode>;
  /**
   * Carrier-specific address extension data. The shape is defined by the
   * selected delivery option's customerInputContract.
   */
  data?: InputMaybe<Scalars['JSON']['input']>;
  /** Recipient's first name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient's last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number for delivery. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Province code. */
  provinceCode?: InputMaybe<Scalars['String']['input']>;
  /** Postal or ZIP code. */
  zip?: InputMaybe<Scalars['String']['input']>;
};

/** Delivery address update element: which address to update and with what data. */
export type ApiCheckoutDeliveryAddressUpdateInput = {
  /** New postal address values. */
  address: ApiCheckoutDeliveryAddressInput;
  /** Identifier of the existing delivery address in the checkout. */
  addressId: Scalars['ID']['input'];
};

/**
 * Input data for adding one or more delivery addresses to the checkout.
 * Supports multi-shipping.
 */
export type ApiCheckoutDeliveryAddressesAddInput = {
  /** List of delivery addresses to be added. */
  addresses: Array<ApiCheckoutDeliveryDestinationInput>;
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing one or more delivery addresses from the checkout. */
export type ApiCheckoutDeliveryAddressesRemoveInput = {
  /** Identifiers of delivery addresses to be removed. */
  addressIds: Array<Scalars['ID']['input']>;
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Input data for batch updating previously added delivery addresses. */
export type ApiCheckoutDeliveryAddressesUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of updates for delivery addresses. */
  updates: Array<ApiCheckoutDeliveryAddressUpdateInput>;
};

export type ApiCheckoutDeliveryDestinationInput = {
  address: ApiCheckoutDeliveryAddressInput;
  /** Checkout lines assigned to this destination. */
  checkoutLineIds: Array<Scalars['ID']['input']>;
};

/** Delivery group for one or more checkout lines. */
export type ApiCheckoutDeliveryGroup = {
  __typename?: 'CheckoutDeliveryGroup';
  /** Checkout lines associated with the delivery group. */
  checkoutLines: Array<ApiCheckoutLine>;
  /** Delivery address associated with the delivery group. */
  deliveryAddress?: Maybe<ApiCheckoutDeliveryAddress>;
  /** Unique identifier for the delivery group. */
  id: Scalars['ID']['output'];
  options: Array<ApiCheckoutDeliveryOption>;
  /** Recipient associated with the delivery group. */
  recipient?: Maybe<ApiCheckoutRecipient>;
  selection: ApiCheckoutDeliveryOptionSelection;
};

export enum CheckoutDeliveryMethodType {
  Local = 'LOCAL',
  None = 'NONE',
  PickupPoint = 'PICKUP_POINT',
  PickUp = 'PICK_UP',
  Retail = 'RETAIL',
  Shipping = 'SHIPPING'
}

/**
 * Input data for selecting/changing delivery method.
 * Can be applied to the entire checkout or to a specific delivery address.
 */
export type ApiCheckoutDeliveryMethodUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /**
   * Arbitrary customer-provided data for the selected delivery method.
   * It remains private selection intent and is never returned by Storefront API.
   */
  customerInput?: InputMaybe<Scalars['JSON']['input']>;
  /** Identifier of the delivery group for which the delivery method is selected. */
  deliveryGroupId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** Opaque handle returned by the current checkout snapshot. */
  optionHandle: Scalars['String']['input'];
};

export type ApiCheckoutDeliveryOption = {
  __typename?: 'CheckoutDeliveryOption';
  carrierCode?: Maybe<Scalars['String']['output']>;
  code: Scalars['String']['output'];
  cost: ApiMoney;
  customerInputContract?: Maybe<Scalars['JSON']['output']>;
  deliveryMethodType: CheckoutDeliveryMethodType;
  description?: Maybe<Scalars['String']['output']>;
  estimatedMaxDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  estimatedMinDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  handle: Scalars['String']['output'];
  phoneRequired: Scalars['Boolean']['output'];
  publicData: Scalars['JSON']['output'];
  title: Scalars['String']['output'];
};

export type ApiCheckoutDeliveryOptionSelection = {
  __typename?: 'CheckoutDeliveryOptionSelection';
  option?: Maybe<ApiCheckoutDeliveryOption>;
  previousOptionHandle?: Maybe<Scalars['String']['output']>;
  resetReason?: Maybe<ApiCheckoutSelectionResetReason>;
  status: CheckoutSelectionStatus;
};

/** Recipient update element: which delivery group's recipient to update and with what data. */
export type ApiCheckoutDeliveryRecipientUpdateInput = {
  /** Identifier of the delivery group in the checkout. */
  deliveryGroupId: Scalars['ID']['input'];
  /** New recipient values. */
  recipient: ApiCheckoutRecipientInput;
};

/** Input data for adding recipients for delivery groups. */
export type ApiCheckoutDeliveryRecipientsAddInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of recipients to be added for delivery groups. */
  recipients: Array<ApiCheckoutDeliveryRecipientUpdateInput>;
};

/** Input data for removing recipients associated with delivery groups. */
export type ApiCheckoutDeliveryRecipientsRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Identifiers of delivery groups whose recipients should be removed. */
  deliveryGroupIds: Array<Scalars['ID']['input']>;
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Input data for batch updating recipients for delivery groups. */
export type ApiCheckoutDeliveryRecipientsUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of updates for recipients. */
  updates: Array<ApiCheckoutDeliveryRecipientUpdateInput>;
};

export type ApiCheckoutIssue = {
  __typename?: 'CheckoutIssue';
  code: Scalars['String']['output'];
  effect: CheckoutIssueEffect;
  field: Array<Scalars['String']['output']>;
  lineId?: Maybe<Scalars['ID']['output']>;
  message: Scalars['String']['output'];
  retryable: Scalars['Boolean']['output'];
  severity: CheckoutIssueSeverity;
};

export enum CheckoutIssueEffect {
  Continue = 'CONTINUE',
  Stop = 'STOP'
}

export enum CheckoutIssueSeverity {
  Error = 'ERROR',
  Warning = 'WARNING'
}

/** Input data for updating the language/locale code of the checkout. */
export type ApiCheckoutLanguageCodeUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /**
   * Language/locale code (ISO 639-1, BCP 47 if necessary), e.g. "en", "ru", "uk".
   * Affects localization and formatting.
   */
  localeCode: Scalars['String']['input'];
};

/** A single item in a checkout. */
export type ApiCheckoutLine = ApiNode & {
  __typename?: 'CheckoutLine';
  /** Customer-visible checkout attributes captured for this line. */
  attributes: Scalars['JSON']['output'];
  /** A list of components that make up this checkout line, such as individual products in a bundle. */
  children: Array<ApiCheckoutLine>;
  /** Exact component item selected for this child line. Null for root lines. */
  componentItemId?: Maybe<Scalars['ID']['output']>;
  /** Cost calculations for this checkout item. */
  cost: ApiCheckoutLineCost;
  /** Global unique identifier for the checkout line. */
  id: Scalars['ID']['output'];
  /** Image of the purchasable resolved by the Media subgraph. */
  image?: Maybe<ApiMediaImage>;
  /** Original price before any adjustments (e.g., child price config). */
  originalPrice: ApiMoney;
  /** Parent bundle line. Null for a root checkout line. */
  parent?: Maybe<ApiCheckoutLine>;
  /** Price adjustment applied to this line (for child items in bundles). */
  priceConfig?: Maybe<ApiCheckoutLinePriceConfig>;
  /** Federated catalog object represented by purchasableId. */
  purchasable: ApiPurchasable;
  /** ID of the purchasable. */
  purchasableId: Scalars['ID']['output'];
  /** Purchase mode and selected selling plan captured for this line. */
  purchase: ApiCheckoutLinePurchase;
  /** Quantity of the item being purchased. */
  quantity: Scalars['Int']['output'];
  /** SKU of the purchasable. */
  sku?: Maybe<Scalars['String']['output']>;
  /** Optional tag assigned to this checkout line. */
  tag?: Maybe<ApiCheckoutTag>;
  /** Title of the purchasable. */
  title: Scalars['String']['output'];
};

/** Input data for a single item in the checkout. */
export type ApiCheckoutLineAddInput = {
  /** Checkout-owned attributes passed to the pipeline. */
  attributes?: InputMaybe<Scalars['JSON']['input']>;
  /** Child items for this line. If provided, this line becomes a parent. */
  children?: InputMaybe<Array<ApiCheckoutChildLineInput>>;
  /** ID of the product to add or update. */
  purchasableId: Scalars['ID']['input'];
  /** Purchase intent for the variant. */
  purchase?: InputMaybe<ApiCheckoutLinePurchaseInput>;
  /** Quantity of the product in the checkout. */
  quantity: Scalars['Int']['input'];
  /** Optional tag slug to associate with this line. */
  tagSlug?: InputMaybe<Scalars['String']['input']>;
};

/** Detailed breakdown of costs for a checkout line item */
export type ApiCheckoutLineCost = {
  __typename?: 'CheckoutLineCost';
  /** The original list price per unit before any discounts. */
  compareAtUnitPrice: ApiMoney;
  /** Discount amount applied to a line. */
  discountAmount: ApiMoney;
  /** Total cost of all units before discounts. */
  subtotalAmount: ApiMoney;
  /** Total tax amount applied to the checkout line. */
  taxAmount: ApiMoney;
  /** Total cost of this line (all units), after discounts and taxes. */
  totalAmount: ApiMoney;
  /** The current price per unit before discounts are applied (may differ from compareAt price if on sale). */
  unitPrice: ApiMoney;
};

/** Price adjustment configuration applied to a child line item. */
export type ApiCheckoutLinePriceConfig = {
  __typename?: 'CheckoutLinePriceConfig';
  /** Amount in minor units (always positive). Used for DISCOUNT_AMOUNT, MARKUP_AMOUNT, OVERRIDE. */
  amount?: Maybe<Scalars['Int']['output']>;
  /** Percentage (always positive). Used for DISCOUNT_PERCENT, MARKUP_PERCENT. */
  percent?: Maybe<Scalars['Float']['output']>;
  /** Type of price adjustment. */
  type: ChildPriceType;
};

/** Purchase mode captured in the committed checkout snapshot. */
export type ApiCheckoutLinePurchase = {
  __typename?: 'CheckoutLinePurchase';
  type: CheckoutLinePurchaseType;
};

export type ApiCheckoutLinePurchaseInput = {
  type: CheckoutLinePurchaseType;
};

export enum CheckoutLinePurchaseType {
  OneTime = 'ONE_TIME'
}

/** Single replacement operation. */
export type ApiCheckoutLineReplaceInput = {
  /** Source line ID to replace (quantity will be moved from this line). */
  lineId: Scalars['ID']['input'];
  /** Target purchasable ID to receive the quantity. */
  purchasableId: Scalars['ID']['input'];
  /**
   * Quantity to move; if not set, moves full quantity from source line.
   * Must be greater than 0 if provided.
   */
  quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** Input data for updating the quantity of a specific checkout item. */
export type ApiCheckoutLineUpdateInput = {
  /** ID of the checkout item to update. */
  lineId: Scalars['ID']['input'];
  /**
   * New quantity for the checkout item.
   * If set to 0, the item will be removed.
   */
  quantity: Scalars['Int']['input'];
};

/** Input data for adding an item to an existing checkout. */
export type ApiCheckoutLinesAddInput = {
  /** ID of the checkout. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of checkout items to add. */
  lines: Array<ApiCheckoutLineAddInput>;
};

/** Input data for clearing all items from a checkout. */
export type ApiCheckoutLinesClearInput = {
  /** ID of the checkout to clear. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing one or more items from the checkout. */
export type ApiCheckoutLinesDeleteInput = {
  /** ID of the checkout. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** IDs of the lines to remove. */
  lineIds: Array<Scalars['ID']['input']>;
};

/**
 * Input data for replacing one or more checkout lines.
 * Each replacement moves quantity from source line to target line.
 * If quantity is not provided, full quantity from the source line will be moved.
 */
export type ApiCheckoutLinesReplaceInput = {
  /** ID of the checkout. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of replacement operations to apply. */
  lines: Array<ApiCheckoutLineReplaceInput>;
};

/** Input data for updating the quantity of a specific checkout item. */
export type ApiCheckoutLinesUpdateInput = {
  /** ID of the checkout. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** List of checkout items to update. */
  lines: Array<ApiCheckoutLineUpdateInput>;
};

/** Uniform result returned by every mutation that changes a checkout. */
export type ApiCheckoutMutationPayload = {
  __typename?: 'CheckoutMutationPayload';
  /** The committed checkout snapshot, or null when the mutation failed. */
  checkout?: Maybe<ApiCheckout>;
  /** Validation, concurrency, and business errors produced by the operation. */
  userErrors: Array<ApiCheckoutUserError>;
};

/** A non-blocking warning generated by checkout operations. */
export type ApiCheckoutNotification = {
  __typename?: 'CheckoutNotification';
  /** Code categorizing the warning. */
  code: CheckoutNotificationCode;
  /** A globally-unique ID. */
  id: Scalars['ID']['output'];
  /** Whether the warning has been acknowledged by the user. */
  isDismissed: Scalars['Boolean']['output'];
  /** Importance level of the warning. */
  severity: NotificationSeverity;
};

/**
 * Codes for warnings that may be returned with Checkout mutations,
 * indicating non-blocking adjustments or issues in the checkout.
 */
export enum CheckoutNotificationCode {
  /** An item in the checkout is no longer available for sale. */
  ItemUnavailable = 'ITEM_UNAVAILABLE',
  /**
   * The requested quantity exceeds available stock;
   * quantity was automatically reduced to the maximum available.
   */
  NotEnoughStock = 'NOT_ENOUGH_STOCK',
  /** The requested item is completely out of stock and has been removed from the checkout. */
  OutOfStock = 'OUT_OF_STOCK',
  /** The price of one or more items has changed since they were added to the checkout. */
  PriceChanged = 'PRICE_CHANGED'
}

/** Payment aggregate for a checkout. */
export type ApiCheckoutPayment = {
  __typename?: 'CheckoutPayment';
  /** Available payment methods for this checkout context. */
  methods: Array<ApiCheckoutPaymentMethod>;
  /**
   * Amount payable to the merchant via the selected method.
   * This excludes SHIPPING_CARRIER components (CARRIER_DIRECT).
   */
  payableAmount: ApiMoney;
  selection: ApiCheckoutPaymentMethodSelection;
};

/** Payment method available/selected for checkout. */
export type ApiCheckoutPaymentMethod = {
  __typename?: 'CheckoutPaymentMethod';
  code: Scalars['String']['output'];
  flow: PaymentFlow;
  handle: Scalars['String']['output'];
  providerCode: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ApiCheckoutPaymentMethodSelection = {
  __typename?: 'CheckoutPaymentMethodSelection';
  method?: Maybe<ApiCheckoutPaymentMethod>;
  previousMethodHandle?: Maybe<Scalars['String']['output']>;
  resetReason?: Maybe<ApiCheckoutSelectionResetReason>;
  status: CheckoutSelectionStatus;
};

/** Select or change payment method for the checkout. */
export type ApiCheckoutPaymentMethodUpdateInput = {
  /** Checkout identifier. */
  checkoutId: Scalars['ID']['input'];
  /**
   * Arbitrary customer-provided data for the selected payment method.
   * It remains private selection intent and is never returned by Storefront API.
   */
  customerInput?: InputMaybe<Scalars['JSON']['input']>;
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** Opaque handle returned by the current checkout snapshot. */
  methodHandle: Scalars['String']['input'];
};

/** Applied promo code for a checkout. */
export type ApiCheckoutPromoCode = {
  __typename?: 'CheckoutPromoCode';
  /** When this promo code was applied. */
  appliedAt: Scalars['DateTime']['output'];
  /** Promo code text. */
  code: Scalars['String']['output'];
  /** Discount conditions. */
  conditions?: Maybe<Scalars['JSON']['output']>;
  /** Discount type (percentage). */
  discountType: Scalars['String']['output'];
  /** Discount provider. */
  provider: Scalars['String']['output'];
  /** Discount value (percentage as number). */
  value: Scalars['Int']['output'];
};

/** Input data for applying a promo code to the checkout. */
export type ApiCheckoutPromoCodeAddInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code. */
  code: Scalars['String']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing a previously applied promo code from the checkout. */
export type ApiCheckoutPromoCodeRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code to be cancelled. */
  code: Scalars['String']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
};

/** Recipient details for the delivery group. */
export type ApiCheckoutRecipient = {
  __typename?: 'CheckoutRecipient';
  /** Email of the recipient. */
  email?: Maybe<Scalars['Email']['output']>;
  /** First name of the recipient. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Last name of the recipient. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Middle name of the recipient. */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Phone of the recipient. */
  phone?: Maybe<Scalars['String']['output']>;
};

/** Input fields for recipient details. */
export type ApiCheckoutRecipientInput = {
  /** Email of the recipient. */
  email?: InputMaybe<Scalars['Email']['input']>;
  /** First name of the recipient. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Last name of the recipient. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Middle name of the recipient. */
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Phone of the recipient. */
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type ApiCheckoutSelectionResetReason = {
  __typename?: 'CheckoutSelectionResetReason';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export enum CheckoutSelectionStatus {
  None = 'NONE',
  Reset = 'RESET',
  Selected = 'SELECTED'
}

/** A tag that can be attached to checkout lines. */
export type ApiCheckoutTag = ApiNode & {
  __typename?: 'CheckoutTag';
  /** Tag creation timestamp. */
  createdAt: Scalars['DateTime']['output'];
  /** Global identifier of the tag. */
  id: Scalars['ID']['output'];
  /** Slug identifier (a-zA-Z0-9). */
  slug: Scalars['String']['output'];
  /** Whether the tag enforces uniqueness for checkout lines. */
  unique: Scalars['Boolean']['output'];
  /** Last update timestamp. */
  updatedAt: Scalars['DateTime']['output'];
};

/** Input payload for checkoutTagCreate mutation. */
export type ApiCheckoutTagCreateInput = {
  /** Checkout identifier. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** Tag configuration. */
  tag: ApiCheckoutTagInput;
};

/** Input payload for checkoutTagDelete mutation. */
export type ApiCheckoutTagDeleteInput = {
  /** Checkout identifier. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** Tag identifier (global ID). */
  tagId: Scalars['ID']['input'];
};

/** Tag definition used when initializing or mutating checkout tags. */
export type ApiCheckoutTagInput = {
  /** Slug identifier consisting of alphanumeric characters. */
  slug: Scalars['String']['input'];
  /** Whether this tag enforces uniqueness for checkout lines. */
  unique: Scalars['Boolean']['input'];
};

/** Input payload for checkoutTagUpdate mutation. */
export type ApiCheckoutTagUpdateInput = {
  /** Checkout identifier. */
  checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  idempotencyKey: Scalars['String']['input'];
  /** New slug, if tag needs to be renamed. */
  slug?: InputMaybe<Scalars['String']['input']>;
  /** Tag identifier (global ID). */
  tagId: Scalars['ID']['input'];
  /** Updated uniqueness flag. */
  unique?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A customer-facing checkout mutation error safe to display in storefronts. */
export type ApiCheckoutUserError = ApiDisplayableError & {
  __typename?: 'CheckoutUserError';
  /** Stable machine-readable error code. */
  code: Scalars['String']['output'];
  /** Path to the input field associated with the error, when available. */
  field?: Maybe<Array<Scalars['String']['output']>>;
  /** Human-readable error message. */
  message: Scalars['String']['output'];
  /** Whether retrying the same request may succeed without changing input. */
  retryable: Scalars['Boolean']['output'];
};

/**
 * Price adjustment type for child items in a bundle.
 * Values are always positive - the type determines the operation.
 */
export enum ChildPriceType {
  /** Use original price without adjustments */
  Base = 'BASE',
  /** Subtract fixed amount from original price */
  DiscountAmount = 'DISCOUNT_AMOUNT',
  /** Subtract percentage from original price */
  DiscountPercent = 'DISCOUNT_PERCENT',
  /** Item is free (price = 0) */
  Free = 'FREE',
  /** Add fixed amount to original price */
  MarkupAmount = 'MARKUP_AMOUNT',
  /** Add percentage to original price */
  MarkupPercent = 'MARKUP_PERCENT',
  /** Override with fixed price */
  Override = 'OVERRIDE'
}

/** Shared fields exposed by every Relay-style connection. */
export type ApiConnection = {
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiCountry = {
  __typename?: 'Country';
  code: CountryCode;
  name: Scalars['String']['output'];
};

/** Supported country codes. */
export enum CountryCode {
  Ac = 'AC',
  Ad = 'AD',
  Ae = 'AE',
  Af = 'AF',
  Ag = 'AG',
  Ai = 'AI',
  Al = 'AL',
  Am = 'AM',
  An = 'AN',
  Ao = 'AO',
  Ar = 'AR',
  At = 'AT',
  Au = 'AU',
  Aw = 'AW',
  Ax = 'AX',
  Az = 'AZ',
  Ba = 'BA',
  Bb = 'BB',
  Bd = 'BD',
  Be = 'BE',
  Bf = 'BF',
  Bg = 'BG',
  Bh = 'BH',
  Bi = 'BI',
  Bj = 'BJ',
  Bl = 'BL',
  Bm = 'BM',
  Bn = 'BN',
  Bo = 'BO',
  Bq = 'BQ',
  Br = 'BR',
  Bs = 'BS',
  Bt = 'BT',
  Bv = 'BV',
  Bw = 'BW',
  By = 'BY',
  Bz = 'BZ',
  Ca = 'CA',
  Cc = 'CC',
  Cd = 'CD',
  Cf = 'CF',
  Cg = 'CG',
  Ch = 'CH',
  Ci = 'CI',
  Ck = 'CK',
  Cl = 'CL',
  Cm = 'CM',
  Cn = 'CN',
  Co = 'CO',
  Cr = 'CR',
  Cu = 'CU',
  Cv = 'CV',
  Cw = 'CW',
  Cx = 'CX',
  Cy = 'CY',
  Cz = 'CZ',
  De = 'DE',
  Dj = 'DJ',
  Dk = 'DK',
  Dm = 'DM',
  Do = 'DO',
  Dz = 'DZ',
  Ec = 'EC',
  Ee = 'EE',
  Eg = 'EG',
  Eh = 'EH',
  Er = 'ER',
  Es = 'ES',
  Et = 'ET',
  Fi = 'FI',
  Fj = 'FJ',
  Fk = 'FK',
  Fm = 'FM',
  Fo = 'FO',
  Fr = 'FR',
  Ga = 'GA',
  Gb = 'GB',
  Gd = 'GD',
  Ge = 'GE',
  Gf = 'GF',
  Gg = 'GG',
  Gh = 'GH',
  Gi = 'GI',
  Gl = 'GL',
  Gm = 'GM',
  Gn = 'GN',
  Gp = 'GP',
  Gq = 'GQ',
  Gr = 'GR',
  Gs = 'GS',
  Gt = 'GT',
  Gw = 'GW',
  Gy = 'GY',
  Hk = 'HK',
  Hm = 'HM',
  Hn = 'HN',
  Hr = 'HR',
  Ht = 'HT',
  Hu = 'HU',
  Id = 'ID',
  Ie = 'IE',
  Il = 'IL',
  Im = 'IM',
  In = 'IN',
  Io = 'IO',
  Iq = 'IQ',
  Ir = 'IR',
  Is = 'IS',
  It = 'IT',
  Je = 'JE',
  Jm = 'JM',
  Jo = 'JO',
  Jp = 'JP',
  Ke = 'KE',
  Kg = 'KG',
  Kh = 'KH',
  Ki = 'KI',
  Km = 'KM',
  Kn = 'KN',
  Kp = 'KP',
  Kr = 'KR',
  Kw = 'KW',
  Ky = 'KY',
  Kz = 'KZ',
  La = 'LA',
  Lb = 'LB',
  Lc = 'LC',
  Li = 'LI',
  Lk = 'LK',
  Lr = 'LR',
  Ls = 'LS',
  Lt = 'LT',
  Lu = 'LU',
  Lv = 'LV',
  Ly = 'LY',
  Ma = 'MA',
  Mc = 'MC',
  Md = 'MD',
  Me = 'ME',
  Mf = 'MF',
  Mg = 'MG',
  Mh = 'MH',
  Mk = 'MK',
  Ml = 'ML',
  Mm = 'MM',
  Mn = 'MN',
  Mo = 'MO',
  Mq = 'MQ',
  Mr = 'MR',
  Ms = 'MS',
  Mt = 'MT',
  Mu = 'MU',
  Mv = 'MV',
  Mw = 'MW',
  Mx = 'MX',
  My = 'MY',
  Mz = 'MZ',
  Na = 'NA',
  Nc = 'NC',
  Ne = 'NE',
  Nf = 'NF',
  Ng = 'NG',
  Ni = 'NI',
  Nl = 'NL',
  No = 'NO',
  Np = 'NP',
  Nr = 'NR',
  Nu = 'NU',
  Nz = 'NZ',
  Om = 'OM',
  Pa = 'PA',
  Pe = 'PE',
  Pf = 'PF',
  Pg = 'PG',
  Ph = 'PH',
  Pk = 'PK',
  Pl = 'PL',
  Pm = 'PM',
  Pn = 'PN',
  Ps = 'PS',
  Pt = 'PT',
  Pw = 'PW',
  Py = 'PY',
  Qa = 'QA',
  Re = 'RE',
  Ro = 'RO',
  Rs = 'RS',
  Ru = 'RU',
  Rw = 'RW',
  Sa = 'SA',
  Sb = 'SB',
  Sc = 'SC',
  Sd = 'SD',
  Se = 'SE',
  Sg = 'SG',
  Sh = 'SH',
  Si = 'SI',
  Sj = 'SJ',
  Sk = 'SK',
  Sl = 'SL',
  Sm = 'SM',
  Sn = 'SN',
  So = 'SO',
  Sr = 'SR',
  Ss = 'SS',
  St = 'ST',
  Sv = 'SV',
  Sx = 'SX',
  Sy = 'SY',
  Sz = 'SZ',
  Ta = 'TA',
  Tc = 'TC',
  Td = 'TD',
  Tf = 'TF',
  Tg = 'TG',
  Th = 'TH',
  Tj = 'TJ',
  Tk = 'TK',
  Tl = 'TL',
  Tm = 'TM',
  Tn = 'TN',
  To = 'TO',
  Tr = 'TR',
  Tt = 'TT',
  Tv = 'TV',
  Tw = 'TW',
  Tz = 'TZ',
  Ua = 'UA',
  Ug = 'UG',
  Um = 'UM',
  Us = 'US',
  Uy = 'UY',
  Uz = 'UZ',
  Va = 'VA',
  Vc = 'VC',
  Ve = 'VE',
  Vg = 'VG',
  Vi = 'VI',
  Vn = 'VN',
  Vu = 'VU',
  Wf = 'WF',
  Ws = 'WS',
  Xk = 'XK',
  Ye = 'YE',
  Yt = 'YT',
  Za = 'ZA',
  Zm = 'ZM',
  Zw = 'ZW',
  Zz = 'ZZ'
}

/** The part of the image that should remain after cropping. */
export enum CropRegion {
  Bottom = 'BOTTOM',
  Center = 'CENTER',
  Left = 'LEFT',
  Right = 'RIGHT',
  Top = 'TOP'
}

export type ApiCurrency = {
  __typename?: 'Currency';
  code: CurrencyCode;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
};

/** Currency codes according to ISO 4217 */
export enum CurrencyCode {
  /** UAE Dirham (United Arab Emirates) - 2 decimals */
  Aed = 'AED',
  /** Afghan Afghani (Afghanistan) - 0 decimals */
  Afn = 'AFN',
  /** Albanian Lek (Albania) - 0 decimals */
  All = 'ALL',
  /** Armenian Dram (Armenia) - 2 decimals */
  Amd = 'AMD',
  /** Netherlands Antillean Guilder - 2 decimals */
  Ang = 'ANG',
  /** Angolan Kwanza (Angola) - 2 decimals */
  Aoa = 'AOA',
  /** Argentine Peso (Argentina) - 2 decimals */
  Ars = 'ARS',
  /** Australian Dollar (Australia) - 2 decimals */
  Aud = 'AUD',
  /** Aruban Florin (Aruba) - 2 decimals */
  Awg = 'AWG',
  /** Azerbaijani Manat (Azerbaijan) - 2 decimals */
  Azn = 'AZN',
  /** Bosnia-Herzegovina Convertible Mark - 2 decimals */
  Bam = 'BAM',
  /** Barbadian Dollar (Barbados) - 2 decimals */
  Bbd = 'BBD',
  /** Bangladeshi Taka (Bangladesh) - 2 decimals */
  Bdt = 'BDT',
  /** Bulgarian Lev (Bulgaria) - 2 decimals */
  Bgn = 'BGN',
  /** Bahraini Dinar (Bahrain) - 3 decimals */
  Bhd = 'BHD',
  /** Burundian Franc (Burundi) - 0 decimals */
  Bif = 'BIF',
  /** Bermudian Dollar (Bermuda) - 2 decimals */
  Bmd = 'BMD',
  /** Brunei Dollar (Brunei) - 2 decimals */
  Bnd = 'BND',
  /** Bolivian Boliviano (Bolivia) - 2 decimals */
  Bob = 'BOB',
  /** Brazilian Real (Brazil) - 2 decimals */
  Brl = 'BRL',
  /** Bahamian Dollar (Bahamas) - 2 decimals */
  Bsd = 'BSD',
  /** Bhutanese Ngultrum (Bhutan) - 2 decimals */
  Btn = 'BTN',
  /** Botswana Pula (Botswana) - 2 decimals */
  Bwp = 'BWP',
  /** Belarusian Ruble (Belarus) - 2 decimals */
  Byn = 'BYN',
  /** Belize Dollar (Belize) - 2 decimals */
  Bzd = 'BZD',
  /** Canadian Dollar (Canada) - 2 decimals */
  Cad = 'CAD',
  /** Congolese Franc (DR Congo) - 2 decimals */
  Cdf = 'CDF',
  /** Swiss Franc (Switzerland) - 2 decimals */
  Chf = 'CHF',
  /** Chilean Peso (Chile) - 0 decimals */
  Clp = 'CLP',
  /** Chinese Yuan (China) - 2 decimals */
  Cny = 'CNY',
  /** Colombian Peso (Colombia) - 2 decimals */
  Cop = 'COP',
  /** Costa Rican Colon (Costa Rica) - 2 decimals */
  Crc = 'CRC',
  /** Cuban Peso (Cuba) - 2 decimals */
  Cup = 'CUP',
  /** Cape Verdean Escudo (Cape Verde) - 2 decimals */
  Cve = 'CVE',
  /** Czech Koruna (Czech Republic) - 2 decimals */
  Czk = 'CZK',
  /** Djiboutian Franc (Djibouti) - 0 decimals */
  Djf = 'DJF',
  /** Danish Krone (Denmark) - 2 decimals */
  Dkk = 'DKK',
  /** Dominican Peso (Dominican Republic) - 2 decimals */
  Dop = 'DOP',
  /** Algerian Dinar (Algeria) - 2 decimals */
  Dzd = 'DZD',
  /** Egyptian Pound (Egypt) - 2 decimals */
  Egp = 'EGP',
  /** Eritrean Nakfa (Eritrea) - 2 decimals */
  Ern = 'ERN',
  /** Ethiopian Birr (Ethiopia) - 2 decimals */
  Etb = 'ETB',
  /** Euro (European Union) - 2 decimals */
  Eur = 'EUR',
  /** Fijian Dollar (Fiji) - 2 decimals */
  Fjd = 'FJD',
  /** Falkland Islands Pound - 2 decimals */
  Fkp = 'FKP',
  /** Faroese Króna (Faroe Islands) - 2 decimals */
  Fok = 'FOK',
  /** Pound Sterling (United Kingdom) - 2 decimals */
  Gbp = 'GBP',
  /** Georgian Lari (Georgia) - 2 decimals */
  Gel = 'GEL',
  /** Guernsey Pound (Guernsey) - 2 decimals */
  Ggp = 'GGP',
  /** Ghanaian Cedi (Ghana) - 2 decimals */
  Ghs = 'GHS',
  /** Gibraltar Pound (Gibraltar) - 2 decimals */
  Gip = 'GIP',
  /** Gambian Dalasi (Gambia) - 2 decimals */
  Gmd = 'GMD',
  /** Guinean Franc (Guinea) - 0 decimals */
  Gnf = 'GNF',
  /** Guatemalan Quetzal (Guatemala) - 2 decimals */
  Gtq = 'GTQ',
  /** Guyanese Dollar (Guyana) - 2 decimals */
  Gyd = 'GYD',
  /** Hong Kong Dollar (Hong Kong) - 2 decimals */
  Hkd = 'HKD',
  /** Honduran Lempira (Honduras) - 2 decimals */
  Hnl = 'HNL',
  /** Croatian Kuna (Croatia) - 2 decimals */
  Hrk = 'HRK',
  /** Haitian Gourde (Haiti) - 2 decimals */
  Htg = 'HTG',
  /** Hungarian Forint (Hungary) - 2 decimals */
  Huf = 'HUF',
  /** Indonesian Rupiah (Indonesia) - 0 decimals */
  Idr = 'IDR',
  /** Israeli New Shekel (Israel) - 2 decimals */
  Ils = 'ILS',
  /** Isle of Man Pound - 2 decimals */
  Imp = 'IMP',
  /** Indian Rupee (India) - 2 decimals */
  Inr = 'INR',
  /** Iraqi Dinar (Iraq) - 3 decimals */
  Iqd = 'IQD',
  /** Iranian Rial (Iran) - 2 decimals */
  Irr = 'IRR',
  /** Icelandic Króna (Iceland) - 0 decimals */
  Isk = 'ISK',
  /** Jersey Pound (Jersey) - 2 decimals */
  Jep = 'JEP',
  /** Jamaican Dollar (Jamaica) - 2 decimals */
  Jmd = 'JMD',
  /** Jordanian Dinar (Jordan) - 3 decimals */
  Jod = 'JOD',
  /** Japanese Yen (Japan) - 0 decimals */
  Jpy = 'JPY',
  /** Kenyan Shilling (Kenya) - 2 decimals */
  Kes = 'KES',
  /** Kyrgyzstani Som (Kyrgyzstan) - 2 decimals */
  Kgs = 'KGS',
  /** Cambodian Riel (Cambodia) - 2 decimals */
  Khr = 'KHR',
  /** Comorian Franc (Comoros) - 2 decimals */
  Kmf = 'KMF',
  /** North Korean Won (North Korea) - 2 decimals */
  Kpw = 'KPW',
  /** South Korean Won (South Korea) - 0 decimals */
  Krw = 'KRW',
  /** Kuwaiti Dinar (Kuwait) - 3 decimals */
  Kwd = 'KWD',
  /** Cayman Islands Dollar - 2 decimals */
  Kyd = 'KYD',
  /** Kazakhstani Tenge (Kazakhstan) - 2 decimals */
  Kzt = 'KZT',
  /** Lao Kip (Laos) - 2 decimals */
  Lak = 'LAK',
  /** Lebanese Pound (Lebanon) - 2 decimals */
  Lbp = 'LBP',
  /** Sri Lankan Rupee (Sri Lanka) - 2 decimals */
  Lkr = 'LKR',
  /** Liberian Dollar (Liberia) - 2 decimals */
  Lrd = 'LRD',
  /** Lesotho Loti (Lesotho) - 2 decimals */
  Lsl = 'LSL',
  /** Libyan Dinar (Libya) - 3 decimals */
  Lyd = 'LYD',
  /** Moroccan Dirham (Morocco) - 2 decimals */
  Mad = 'MAD',
  /** Moldovan Leu (Moldova) - 2 decimals */
  Mdl = 'MDL',
  /** Malagasy Ariary (Madagascar) - 2 decimals */
  Mga = 'MGA',
  /** Macedonian Denar (North Macedonia) - 2 decimals */
  Mkd = 'MKD',
  /** Burmese Kyat (Myanmar) - 2 decimals */
  Mmk = 'MMK',
  /** Mongolian Tögrög (Mongolia) - 2 decimals */
  Mnt = 'MNT',
  /** Macanese Pataca (Macau) - 2 decimals */
  Mop = 'MOP',
  /** Mauritanian Ouguiya (Mauritania) - 2 decimals */
  Mru = 'MRU',
  /** Mauritian Rupee (Mauritius) - 2 decimals */
  Mur = 'MUR',
  /** Maldivian Rufiyaa (Maldives) - 2 decimals */
  Mvr = 'MVR',
  /** Malawian Kwacha (Malawi) - 2 decimals */
  Mwk = 'MWK',
  /** Mexican Peso (Mexico) - 2 decimals */
  Mxn = 'MXN',
  /** Malaysian Ringgit (Malaysia) - 2 decimals */
  Myr = 'MYR',
  /** Mozambican Metical (Mozambique) - 2 decimals */
  Mzn = 'MZN',
  /** Namibian Dollar (Namibia) - 2 decimals */
  Nad = 'NAD',
  /** Nigerian Naira (Nigeria) - 2 decimals */
  Ngn = 'NGN',
  /** Nicaraguan Córdoba (Nicaragua) - 2 decimals */
  Nio = 'NIO',
  /** Norwegian Krone (Norway) - 2 decimals */
  Nok = 'NOK',
  /** Nepalese Rupee (Nepal) - 2 decimals */
  Npr = 'NPR',
  /** New Zealand Dollar (New Zealand) - 2 decimals */
  Nzd = 'NZD',
  /** Omani Rial (Oman) - 3 decimals */
  Omr = 'OMR',
  /** Panamanian Balboa (Panama) - 2 decimals */
  Pab = 'PAB',
  /** Peruvian Sol (Peru) - 2 decimals */
  Pen = 'PEN',
  /** Papua New Guinean Kina - 2 decimals */
  Pgk = 'PGK',
  /** Philippine Peso (Philippines) - 2 decimals */
  Php = 'PHP',
  /** Pakistani Rupee (Pakistan) - 2 decimals */
  Pkr = 'PKR',
  /** Polish Zloty (Poland) - 2 decimals */
  Pln = 'PLN',
  /** Paraguayan Guaraní (Paraguay) - 0 decimals */
  Pyg = 'PYG',
  /** Qatari Riyal (Qatar) - 2 decimals */
  Qar = 'QAR',
  /** Romanian Leu (Romania) - 2 decimals */
  Ron = 'RON',
  /** Serbian Dinar (Serbia) - 2 decimals */
  Rsd = 'RSD',
  /** Russian Ruble (Russia) - 2 decimals */
  Rub = 'RUB',
  /** Rwandan Franc (Rwanda) - 0 decimals */
  Rwf = 'RWF',
  /** Saudi Riyal (Saudi Arabia) - 2 decimals */
  Sar = 'SAR',
  /** Solomon Islands Dollar - 2 decimals */
  Sbd = 'SBD',
  /** Seychelles Rupee (Seychelles) - 2 decimals */
  Scr = 'SCR',
  /** Sudanese Pound (Sudan) - 2 decimals */
  Sdg = 'SDG',
  /** Swedish Krona (Sweden) - 2 decimals */
  Sek = 'SEK',
  /** Singapore Dollar (Singapore) - 2 decimals */
  Sgd = 'SGD',
  /** Saint Helena Pound - 2 decimals */
  Shp = 'SHP',
  /** Sierra Leonean Leone - 2 decimals */
  Sle = 'SLE',
  /** Somali Shilling (Somalia) - 2 decimals */
  Sos = 'SOS',
  /** Surinamese Dollar (Suriname) - 2 decimals */
  Srd = 'SRD',
  /** South Sudanese Pound - 2 decimals */
  Ssp = 'SSP',
  /** São Tomé and Príncipe Dobra - 2 decimals */
  Stn = 'STN',
  /** Salvadoran Colón (El Salvador) - 2 decimals */
  Svc = 'SVC',
  /** Syrian Pound (Syria) - 2 decimals */
  Syp = 'SYP',
  /** Eswatini Lilangeni (Eswatini) - 2 decimals */
  Szl = 'SZL',
  /** Thai Baht (Thailand) - 2 decimals */
  Thb = 'THB',
  /** Tajikistani Somoni (Tajikistan) - 2 decimals */
  Tjs = 'TJS',
  /** Turkmenistani Manat (Turkmenistan) - 2 decimals */
  Tmt = 'TMT',
  /** Tunisian Dinar (Tunisia) - 3 decimals */
  Tnd = 'TND',
  /** Tongan Paʻanga (Tonga) - 2 decimals */
  Top = 'TOP',
  /** Turkish Lira (Turkey) - 2 decimals */
  Try = 'TRY',
  /** Trinidad and Tobago Dollar - 2 decimals */
  Ttd = 'TTD',
  /** New Taiwan Dollar (Taiwan) - 2 decimals */
  Twd = 'TWD',
  /** Tanzanian Shilling (Tanzania) - 2 decimals */
  Tzs = 'TZS',
  /** Ukrainian Hryvnia (Ukraine) - 2 decimals */
  Uah = 'UAH',
  /** Ugandan Shilling (Uganda) - 0 decimals */
  Ugx = 'UGX',
  /** United States Dollar (USA) - 2 decimals */
  Usd = 'USD',
  /** Uruguayan Peso (Uruguay) - 2 decimals */
  Uyu = 'UYU',
  /** Uzbekistani Som (Uzbekistan) - 2 decimals */
  Uzs = 'UZS',
  /** Venezuelan Bolívar (Venezuela) - 2 decimals */
  Ves = 'VES',
  /** Vietnamese Dong (Vietnam) - 0 decimals */
  Vnd = 'VND',
  /** Vanuatu Vatu (Vanuatu) - 0 decimals */
  Vuv = 'VUV',
  /** Samoan Tala (Samoa) - 2 decimals */
  Wst = 'WST',
  /** Central African CFA Franc - 0 decimals */
  Xaf = 'XAF',
  /** East Caribbean Dollar - 2 decimals */
  Xcd = 'XCD',
  /** Special Drawing Rights (IMF) - 0 decimals */
  Xdr = 'XDR',
  /** West African CFA Franc - 0 decimals */
  Xof = 'XOF',
  /** CFP Franc - 0 decimals */
  Xpf = 'XPF',
  /** Yemeni Rial (Yemen) - 2 decimals */
  Yer = 'YER',
  /** South African Rand (South Africa) - 2 decimals */
  Zar = 'ZAR',
  /** Zambian Kwacha (Zambia) - 2 decimals */
  Zmw = 'ZMW',
  /** Zimbabwean Dollar (Zimbabwe) - 2 decimals */
  Zwl = 'ZWL'
}

/** A canonical storefront customer owned by the Customers subgraph. */
export type ApiCustomer = {
  __typename?: 'Customer';
  /** Mailing addresses owned by the customer. */
  addresses: Array<ApiCustomerAddress>;
  /** The customer's default mailing address, when one has been selected. */
  defaultAddress?: Maybe<ApiCustomerAddress>;
  /** Display name derived from available profile and contact information. */
  displayName: Scalars['String']['output'];
  /** Authenticated customer's email address and its marketing consent. */
  emailAddress?: Maybe<ApiCustomerEmailAddress>;
  /** Customer's first name, if the profile has been completed. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Globally unique customer ID. */
  id: Scalars['ID']['output'];
  /** Customer's last name, if the profile has been completed. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Orders owned by this authenticated customer, newest first by default. */
  orders: ApiOrderConnection;
  /** Authenticated customer's phone number. */
  phoneNumber?: Maybe<ApiCustomerPhoneNumber>;
  productQuestions: ApiProductQuestionConnection;
  reviewRequests: ApiReviewRequestConnection;
  reviews: ApiReviewConnection;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type ApiCustomerOrdersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  statuses?: InputMaybe<Array<OrderStatus>>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type ApiCustomerProductQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type ApiCustomerReviewRequestsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type ApiCustomerReviewsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ReviewSort>;
};

/**
 * A normalized international mailing address owned by the current customer.
 *
 * The core contract contains only portable postal fields. Delivery- and
 * payment-provider extensions belong to their respective checkout addresses.
 */
export type ApiCustomerAddress = {
  __typename?: 'CustomerAddress';
  /** Primary street address or post office box. */
  address1?: Maybe<Scalars['String']['output']>;
  /** Apartment, suite, unit, or other secondary address information. */
  address2?: Maybe<Scalars['String']['output']>;
  /** City, town, village, or locality. */
  city?: Maybe<Scalars['String']['output']>;
  /** Company or organization associated with the address. */
  company?: Maybe<Scalars['String']['output']>;
  /** Localized country or territory name. */
  country?: Maybe<Scalars['String']['output']>;
  /** ISO 3166-1 alpha-2 country or territory code. */
  countryCode?: Maybe<CountryCode>;
  /** Recipient's first name. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Address lines formatted for the active storefront locale. */
  formatted: Array<Scalars['String']['output']>;
  /** Compact city, region, and country representation. */
  formattedArea?: Maybe<Scalars['String']['output']>;
  /** Globally unique customer address ID. */
  id: Scalars['ID']['output'];
  /** Recipient's last name. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Recipient name formatted for the active storefront locale. */
  name: Scalars['String']['output'];
  /** Recipient phone number, preferably in E.164 format. */
  phone?: Maybe<Scalars['String']['output']>;
  /** Localized region, state, or province name. */
  province?: Maybe<Scalars['String']['output']>;
  /** Region, state, or province code. */
  provinceCode?: Maybe<Scalars['String']['output']>;
  /** Postal or ZIP code. */
  zip?: Maybe<Scalars['String']['output']>;
};

/** Result of creating a customer address. */
export type ApiCustomerAddressCreatePayload = {
  __typename?: 'CustomerAddressCreatePayload';
  /** The created address, or null when creation failed. */
  customerAddress?: Maybe<ApiCustomerAddress>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/** Result of deleting a customer address. */
export type ApiCustomerAddressDeletePayload = {
  __typename?: 'CustomerAddressDeletePayload';
  /** ID of the deleted address, or null when no address was deleted. */
  deletedAddressId?: Maybe<Scalars['ID']['output']>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/**
 * Portable international mailing-address input shared by create and update
 * operations. Country-specific requirements are validated using countryCode.
 */
export type ApiCustomerAddressInput = {
  /** Primary street address or post office box. */
  address1?: InputMaybe<Scalars['String']['input']>;
  /** Apartment, suite, unit, or other secondary address information. */
  address2?: InputMaybe<Scalars['String']['input']>;
  /** City, town, village, or locality. */
  city?: InputMaybe<Scalars['String']['input']>;
  /** Company or organization associated with the address. */
  company?: InputMaybe<Scalars['String']['input']>;
  /** ISO 3166-1 alpha-2 country or territory code. */
  countryCode?: InputMaybe<CountryCode>;
  /** Recipient's first name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient's last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient phone number, preferably in E.164 format. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Region, state, or province code. */
  provinceCode?: InputMaybe<Scalars['String']['input']>;
  /** Postal or ZIP code. */
  zip?: InputMaybe<Scalars['String']['input']>;
};

/** Result of updating a customer address. */
export type ApiCustomerAddressUpdatePayload = {
  __typename?: 'CustomerAddressUpdatePayload';
  /** The updated address, or null when the update failed. */
  customerAddress?: Maybe<ApiCustomerAddress>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/** The authenticated customer's email contact point. */
export type ApiCustomerEmailAddress = {
  __typename?: 'CustomerEmailAddress';
  /** Customer email address. */
  emailAddress: Scalars['String']['output'];
  /** Current email marketing consent, when available. */
  marketingConsent?: Maybe<ApiCustomerMarketingConsent>;
};

/** Result of subscribing the customer's email address to marketing. */
export type ApiCustomerEmailMarketingSubscribePayload = {
  __typename?: 'CustomerEmailMarketingSubscribePayload';
  /** Email contact point with its updated consent state. */
  emailAddress?: Maybe<ApiCustomerEmailAddress>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/** Result of unsubscribing the customer's email address from marketing. */
export type ApiCustomerEmailMarketingUnsubscribePayload = {
  __typename?: 'CustomerEmailMarketingUnsubscribePayload';
  /** Email contact point with its updated consent state. */
  emailAddress?: Maybe<ApiCustomerEmailAddress>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/** Current consent state for one customer marketing channel. */
export type ApiCustomerMarketingConsent = {
  __typename?: 'CustomerMarketingConsent';
  /** Current customer-selectable consent state. */
  state: CustomerMarketingConsentState;
};

/** Customer-selectable marketing consent states. */
export enum CustomerMarketingConsentState {
  /** Consent has been initiated but is awaiting confirmation. */
  Pending = 'PENDING',
  /** The customer has consented to receive marketing messages. */
  Subscribed = 'SUBSCRIBED',
  /** The customer has withdrawn or declined marketing consent. */
  Unsubscribed = 'UNSUBSCRIBED'
}

/** The authenticated customer's phone contact point. */
export type ApiCustomerPhoneNumber = {
  __typename?: 'CustomerPhoneNumber';
  /** Customer phone number, preferably in E.164 format. */
  phoneNumber: Scalars['String']['output'];
};

/**
 * Minimal personal profile input for the initial storefront contract.
 * Additional customer-editable fields can be added when their behavior is defined.
 */
export type ApiCustomerUpdateInput = {
  /** New first name. Omit to leave it unchanged. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** New last name. Omit to leave it unchanged. */
  lastName?: InputMaybe<Scalars['String']['input']>;
};

/** Result of updating the authenticated customer's profile. */
export type ApiCustomerUpdatePayload = {
  __typename?: 'CustomerUpdatePayload';
  /** The updated customer, or null when the update could not be applied. */
  customer?: Maybe<ApiCustomer>;
  /** User-facing validation or business errors produced by the operation. */
  userErrors: Array<ApiCustomerUserError>;
};

/** A customer-facing mutation error. */
export type ApiCustomerUserError = {
  __typename?: 'CustomerUserError';
  /** Stable machine-readable error code, when available. */
  code?: Maybe<Scalars['String']['output']>;
  /** Path to the input field associated with the error, when available. */
  field?: Maybe<Array<Scalars['String']['output']>>;
  /** Human-readable error message safe to show to the customer. */
  message: Scalars['String']['output'];
};

/** Dimension (length) measurement units */
export enum DimensionUnit {
  /** Centimeter */
  Cm = 'cm',
  /** Foot */
  Ft = 'ft',
  /** Inch */
  In = 'in',
  /** Meter */
  M = 'm',
  /** Millimeter */
  Mm = 'mm'
}

/** Physical dimensions expressed in a common length unit. */
export type ApiDimensions = {
  __typename?: 'Dimensions';
  height: Scalars['Float']['output'];
  length: Scalars['Float']['output'];
  unit: DimensionUnit;
  width: Scalars['Float']['output'];
};

/** Represents an error in the input of a mutation. */
export type ApiDisplayableError = {
  field?: Maybe<Array<Scalars['String']['output']>>;
  message: Scalars['String']['output'];
};

/** A video hosted outside of the platform. */
export type ApiExternalVideo = ApiMedia & ApiNode & {
  __typename?: 'ExternalVideo';
  alt?: Maybe<Scalars['String']['output']>;
  embedUrl: Scalars['URL']['output'];
  host: MediaHost;
  id: Scalars['ID']['output'];
  mediaContentType: MediaContentType;
  originUrl: Scalars['URL']['output'];
  presentation?: Maybe<ApiMediaPresentation>;
  previewImage?: Maybe<ApiImage>;
};

/** A configured listing facet owned by the Listing service. */
export type ApiFacet = ApiNode & {
  __typename?: 'Facet';
  facetType: FacetType;
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  selectionMode: FacetSelectionMode;
  slug: Scalars['String']['output'];
  uiType: FacetUiType;
};

export type ApiFacetFilterInput = {
  /** Public facet handle, for example `color` or `material`. */
  facet: Scalars['String']['input'];
  /** Public facet value handle, for example `blue` or `cotton`. */
  value: Scalars['String']['input'];
};

export enum FacetSelectionMode {
  Multi = 'MULTI',
  Single = 'SINGLE'
}

/**
 * Canonical color or gradient metadata associated with a facet value. Image
 * swatches are not exposed until the Media storefront entity path is available.
 */
export type ApiFacetSwatch = ApiNode & {
  __typename?: 'FacetSwatch';
  colorOne?: Maybe<Scalars['String']['output']>;
  colorTwo?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  swatchType: SwatchType;
};

export enum FacetType {
  Feature = 'FEATURE',
  InStock = 'IN_STOCK',
  Option = 'OPTION',
  Price = 'PRICE',
  Tag = 'TAG'
}

export enum FacetUiType {
  Boolean = 'BOOLEAN',
  Checkbox = 'CHECKBOX',
  Dropdown = 'DROPDOWN',
  Radio = 'RADIO',
  Range = 'RANGE'
}

/** A configured value belonging to a canonical listing facet. */
export type ApiFacetValue = ApiNode & {
  __typename?: 'FacetValue';
  facet: ApiFacet;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  kind: FacetValueKind;
  label: Scalars['String']['output'];
  sortIndex: Scalars['Int']['output'];
  swatch?: Maybe<ApiFacetSwatch>;
};

export enum FacetValueKind {
  Group = 'GROUP',
  Source = 'SOURCE'
}

/** Error information for a failed field. */
export type ApiFieldError = {
  __typename?: 'FieldError';
  /** Optional machine-readable error code. */
  code?: Maybe<Scalars['String']['output']>;
  /** Name of the field that caused the error. */
  field: Scalars['String']['output'];
  /** Human-readable error message. */
  message: Scalars['String']['output'];
};

/**
 * A filter available for the current result set.
 *
 * The input of each FilterValue is a JSON object matching ListingFilterInput and
 * can be passed unchanged into the filters argument of the next request.
 */
export type ApiFilter = {
  __typename?: 'Filter';
  /**
   * The configured canonical facet represented by this filter.
   * Null for virtual availability and price filters.
   */
  facet?: Maybe<ApiFacet>;
  /** Stable public identifier within the storefront listing contract. */
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  /** Preferred visual representation of filter values. */
  presentation?: Maybe<FilterPresentation>;
  /** Typed bounds and active selection for a PRICE_RANGE filter. */
  priceRange?: Maybe<ApiFilterPriceRange>;
  /**
   * The selection behavior configured on facet. Null for virtual filters, whose
   * behavior is determined by Filter.type.
   */
  selectionMode?: Maybe<FacetSelectionMode>;
  type: FilterType;
  /** Selectable values and reusable inputs for this filter. */
  values: Array<ApiFilterValue>;
};

export enum FilterPresentation {
  Swatch = 'SWATCH',
  Text = 'TEXT'
}

/** Store-currency price metadata expressed in decimal major units. */
export type ApiFilterPriceRange = {
  __typename?: 'FilterPriceRange';
  max: ApiMoney;
  min: ApiMoney;
  selectedMax?: Maybe<ApiMoney>;
  selectedMin?: Maybe<ApiMoney>;
};

export enum FilterType {
  Boolean = 'BOOLEAN',
  List = 'LIST',
  PriceRange = 'PRICE_RANGE'
}

export type ApiFilterValue = {
  __typename?: 'FilterValue';
  /**
   * Number of distinct matching products after target-filter isolation.
   * Selected values remain present when their count is zero.
   */
  count: Scalars['Int']['output'];
  /**
   * The configured canonical facet value represented by this result value.
   * Null for virtual availability and price values.
   */
  facetValue?: Maybe<ApiFacetValue>;
  /** Stable identifier within the parent filter. */
  id: Scalars['String']['output'];
  /** A JSON object matching ListingFilterInput that can be reused in filters. */
  input: Scalars['JSON']['output'];
  label: Scalars['String']['output'];
  selected: Scalars['Boolean']['output'];
  /** Canonical swatch associated with facetValue, when configured. */
  swatch?: Maybe<ApiFacetSwatch>;
};

/**
 * Any file that doesn't fit into a designated type like image or video. For
 * example, a PDF or JSON document.
 */
export type ApiGenericFile = ApiNode & {
  __typename?: 'GenericFile';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mimeType?: Maybe<Scalars['String']['output']>;
  originalFileSize?: Maybe<Scalars['Int']['output']>;
  previewImage?: Maybe<ApiImage>;
  url?: Maybe<Scalars['URL']['output']>;
};

/** An image resource with URL, dimensions, and transformation options. */
export type ApiImage = {
  __typename?: 'Image';
  altText?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  thumbhash?: Maybe<Scalars['String']['output']>;
  url: Scalars['URL']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};


/** An image resource with URL, dimensions, and transformation options. */
export type ApiImageUrlArgs = {
  transform?: InputMaybe<ApiImageTransformInput>;
};

/** List of supported image content types. */
export enum ImageContentType {
  Jpg = 'JPG',
  Png = 'PNG',
  Webp = 'WEBP'
}

/** The available options for transforming an image. */
export type ApiImageTransformInput = {
  crop?: InputMaybe<CropRegion>;
  maxHeight?: InputMaybe<Scalars['Int']['input']>;
  maxWidth?: InputMaybe<Scalars['Int']['input']>;
  preferredContentType?: InputMaybe<ImageContentType>;
  scale?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Buyer-safe inventory information for a product variant.
 *
 * Warehouse identities, reservations, unavailable quantities, and unit costs are
 * operational data and are intentionally available only through the Admin API.
 */
export type ApiInventoryItem = ApiNode & {
  __typename?: 'InventoryItem';
  availableForSale: Scalars['Boolean']['output'];
  currentlyNotInStock: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  inventoryPolicy: ProductVariantInventoryPolicy;
  quantityAvailable?: Maybe<Scalars['Int']['output']>;
  requiresShipping: Scalars['Boolean']['output'];
  sku?: Maybe<Scalars['String']['output']>;
  tracked: Scalars['Boolean']['output'];
  variant: ApiProductVariant;
};

export type ApiLanguage = {
  __typename?: 'Language';
  code: LocaleCode;
  name: Scalars['String']['output'];
};

/**
 * One structured listing predicate.
 *
 * Exactly one field must be provided. Different filter kinds are combined with
 * AND. Repeated values of the same filter are combined with OR. Variant facets,
 * price, and availability are evaluated against the same variant.
 */
export type ApiListingFilterInput = {
  availability?: InputMaybe<Availability>;
  facet?: InputMaybe<ApiFacetFilterInput>;
  price?: InputMaybe<ApiPriceRangeFilterInput>;
  vendorId?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Deterministic storefront product sorting.
 *
 * Availability placement is controlled by listing/search policy and is not
 * reversed by the selected product sort.
 */
export enum ListingSort {
  /** Creation date descending. Available in global, category, and query contexts. */
  CreatedAt = 'CREATED_AT',
  /** Merchant-defined order. Available only in category scope. */
  Manual = 'MANUAL',
  /** Published date descending. Available in global, category, and query contexts. */
  Newest = 'NEWEST',
  /** Storefront price ascending. Available in global, category, and query contexts. */
  PriceAsc = 'PRICE_ASC',
  /** Storefront price descending. Available in global, category, and query contexts. */
  PriceDesc = 'PRICE_DESC',
  /** Search relevance. Available when a query is active in any scope. */
  Relevance = 'RELEVANCE',
  /** Localized title ascending. Available in global, category, and query contexts. */
  TitleAsc = 'TITLE_ASC',
  /** Localized title descending. Available in global, category, and query contexts. */
  TitleDesc = 'TITLE_DESC'
}

/** Language/Locale codes based on ISO 639-1 and BCP 47 */
export enum LocaleCode {
  /** Akan */
  Ak = 'ak',
  /** Amharic */
  Am = 'am',
  /** Arabic */
  Ar = 'ar',
  /** Assamese */
  As = 'as',
  /** Azerbaijani */
  Az = 'az',
  /** Belarusian */
  Be = 'be',
  /** Bulgarian */
  Bg = 'bg',
  /** Bambara */
  Bm = 'bm',
  /** Bangla */
  Bn = 'bn',
  /** Tibetan */
  Bo = 'bo',
  /** Breton */
  Br = 'br',
  /** Bosnian */
  Bs = 'bs',
  /** Catalan */
  Ca = 'ca',
  /** Chechen */
  Ce = 'ce',
  /** Central Kurdish */
  Ckb = 'ckb',
  /** Czech */
  Cs = 'cs',
  /** Welsh */
  Cy = 'cy',
  /** Danish */
  Da = 'da',
  /** German */
  De = 'de',
  /** Dzongkha */
  Dz = 'dz',
  /** Ewe */
  Ee = 'ee',
  /** Greek */
  El = 'el',
  /** English */
  En = 'en',
  /** Esperanto */
  Eo = 'eo',
  /** Spanish */
  Es = 'es',
  /** Estonian */
  Et = 'et',
  /** Basque */
  Eu = 'eu',
  /** Persian */
  Fa = 'fa',
  /** Fulah */
  Ff = 'ff',
  /** Finnish */
  Fi = 'fi',
  /** Filipino */
  Fil = 'fil',
  /** Faroese */
  Fo = 'fo',
  /** French */
  Fr = 'fr',
  /** Western Frisian */
  Fy = 'fy',
  /** Irish */
  Ga = 'ga',
  /** Scottish Gaelic */
  Gd = 'gd',
  /** Galician */
  Gl = 'gl',
  /** Gujarati */
  Gu = 'gu',
  /** Manx */
  Gv = 'gv',
  /** Hausa */
  Ha = 'ha',
  /** Hebrew */
  He = 'he',
  /** Hindi */
  Hi = 'hi',
  /** Croatian */
  Hr = 'hr',
  /** Hungarian */
  Hu = 'hu',
  /** Armenian */
  Hy = 'hy',
  /** Interlingua */
  Ia = 'ia',
  /** Indonesian */
  Id = 'id',
  /** Igbo */
  Ig = 'ig',
  /** Sichuan Yi */
  Ii = 'ii',
  /** Icelandic */
  Is = 'is',
  /** Italian */
  It = 'it',
  /** Japanese */
  Ja = 'ja',
  /** Javanese */
  Jv = 'jv',
  /** Georgian */
  Ka = 'ka',
  /** Kikuyu */
  Ki = 'ki',
  /** Kazakh */
  Kk = 'kk',
  /** Kalaallisut */
  Kl = 'kl',
  /** Khmer */
  Km = 'km',
  /** Kannada */
  Kn = 'kn',
  /** Korean */
  Ko = 'ko',
  /** Kashmiri */
  Ks = 'ks',
  /** Kurdish */
  Ku = 'ku',
  /** Cornish */
  Kw = 'kw',
  /** Kyrgyz */
  Ky = 'ky',
  /** Luxembourgish */
  Lb = 'lb',
  /** Ganda */
  Lg = 'lg',
  /** Lingala */
  Ln = 'ln',
  /** Lao */
  Lo = 'lo',
  /** Lithuanian */
  Lt = 'lt',
  /** Luba-Katanga */
  Lu = 'lu',
  /** Latvian */
  Lv = 'lv',
  /** Malagasy */
  Mg = 'mg',
  /** Māori */
  Mi = 'mi',
  /** Macedonian */
  Mk = 'mk',
  /** Malayalam */
  Ml = 'ml',
  /** Mongolian */
  Mn = 'mn',
  /** Marathi */
  Mr = 'mr',
  /** Malay */
  Ms = 'ms',
  /** Maltese */
  Mt = 'mt',
  /** Burmese */
  My = 'my',
  /** Norwegian Bokmål */
  Nb = 'nb',
  /** North Ndebele */
  Nd = 'nd',
  /** Nepali */
  Ne = 'ne',
  /** Dutch */
  Nl = 'nl',
  /** Norwegian Nynorsk */
  Nn = 'nn',
  /** Norwegian */
  No = 'no',
  /** Oromo */
  Om = 'om',
  /** Odia */
  Or = 'or',
  /** Ossetic */
  Os = 'os',
  /** Punjabi */
  Pa = 'pa',
  /** Polish */
  Pl = 'pl',
  /** Pashto */
  Ps = 'ps',
  /** Portuguese (Brazil) */
  PtBr = 'pt_BR',
  /** Portuguese (Portugal) */
  PtPt = 'pt_PT',
  /** Quechua */
  Qu = 'qu',
  /** Romansh */
  Rm = 'rm',
  /** Rundi */
  Rn = 'rn',
  /** Romanian */
  Ro = 'ro',
  /** Russian */
  Ru = 'ru',
  /** Kinyarwanda */
  Rw = 'rw',
  /** Sanskrit */
  Sa = 'sa',
  /** Sardinian */
  Sc = 'sc',
  /** Sindhi */
  Sd = 'sd',
  /** Northern Sami */
  Se = 'se',
  /** Sango */
  Sg = 'sg',
  /** Sinhala */
  Si = 'si',
  /** Slovak */
  Sk = 'sk',
  /** Slovenian */
  Sl = 'sl',
  /** Shona */
  Sn = 'sn',
  /** Somali */
  So = 'so',
  /** Albanian */
  Sq = 'sq',
  /** Serbian */
  Sr = 'sr',
  /** Sundanese */
  Su = 'su',
  /** Swedish */
  Sv = 'sv',
  /** Swahili */
  Sw = 'sw',
  /** Tamil */
  Ta = 'ta',
  /** Telugu */
  Te = 'te',
  /** Tajik */
  Tg = 'tg',
  /** Thai */
  Th = 'th',
  /** Tigrinya */
  Ti = 'ti',
  /** Turkmen */
  Tk = 'tk',
  /** Tongan */
  To = 'to',
  /** Turkish */
  Tr = 'tr',
  /** Tatar */
  Tt = 'tt',
  /** Uyghur */
  Ug = 'ug',
  /** Ukrainian */
  Uk = 'uk',
  /** Urdu */
  Ur = 'ur',
  /** Uzbek */
  Uz = 'uz',
  /** Vietnamese */
  Vi = 'vi',
  /** Wolof */
  Wo = 'wo',
  /** Xhosa */
  Xh = 'xh',
  /** Yiddish */
  Yi = 'yi',
  /** Yoruba */
  Yo = 'yo',
  /** Chinese (Simplified) */
  ZhCn = 'zh_CN',
  /** Chinese (Traditional) */
  ZhTw = 'zh_TW',
  /** Zulu */
  Zu = 'zu'
}

export type ApiLocalization = {
  __typename?: 'Localization';
  availableCountries: Array<ApiCountry>;
  availableCurrencies: Array<ApiCurrency>;
  availableLanguages: Array<ApiLanguage>;
  country: ApiCountry;
  currency: ApiCurrency;
  language: ApiLanguage;
  market: ApiMarket;
  store: ApiStore;
};

export type ApiMarket = ApiNode & {
  __typename?: 'Market';
  countries: Array<ApiCountry>;
  currencies: Array<ApiCurrency>;
  defaultCountry?: Maybe<ApiCountry>;
  defaultCurrency: ApiCurrency;
  defaultLanguage: ApiLanguage;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  languages: Array<ApiLanguage>;
  name: Scalars['String']['output'];
  taxIncluded: Scalars['Boolean']['output'];
  timezone: Scalars['String']['output'];
};

export type ApiMarketConnection = ApiConnection & {
  __typename?: 'MarketConnection';
  edges: Array<ApiMarketEdge>;
  nodes: Array<ApiMarket>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiMarketEdge = {
  __typename?: 'MarketEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiMarket;
};

/** A common set of fields for media content associated with products. */
export type ApiMedia = {
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mediaContentType: MediaContentType;
  presentation?: Maybe<ApiMediaPresentation>;
  previewImage?: Maybe<ApiImage>;
};

/** The possible content types for a media object. */
export enum MediaContentType {
  ExternalVideo = 'EXTERNAL_VIDEO',
  Image = 'IMAGE',
  Model_3D = 'MODEL_3D',
  Video = 'VIDEO'
}

/** Host for a media resource. */
export enum MediaHost {
  Vimeo = 'VIMEO',
  Youtube = 'YOUTUBE'
}

/** An image owned and resolved by the Media subgraph. */
export type ApiMediaImage = ApiMedia & ApiNode & {
  __typename?: 'MediaImage';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<ApiImage>;
  mediaContentType: MediaContentType;
  presentation?: Maybe<ApiMediaPresentation>;
  previewImage?: Maybe<ApiImage>;
};

/** A media presentation. */
export type ApiMediaPresentation = {
  __typename?: 'MediaPresentation';
  asJson?: Maybe<Scalars['JSON']['output']>;
};


/** A media presentation. */
export type ApiMediaPresentationAsJsonArgs = {
  format: MediaPresentationFormat;
};

/** The possible formats for a media presentation. */
export enum MediaPresentationFormat {
  Image = 'IMAGE',
  ModelViewer = 'MODEL_VIEWER'
}

/** A hosted 3D model. */
export type ApiModel3d = ApiMedia & ApiNode & {
  __typename?: 'Model3d';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mediaContentType: MediaContentType;
  presentation?: Maybe<ApiMediaPresentation>;
  previewImage?: Maybe<ApiImage>;
  sources: Array<ApiModel3dSource>;
};

/** A source for a hosted 3D model. */
export type ApiModel3dSource = {
  __typename?: 'Model3dSource';
  filesize: Scalars['Int']['output'];
  format: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

/** A precise monetary value with its associated currency. */
export type ApiMoney = {
  __typename?: 'Money';
  amount: Scalars['Decimal']['output'];
  currencyCode: CurrencyCode;
};

/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutation = {
  __typename?: 'Mutation';
  _catalog?: Maybe<Scalars['Boolean']['output']>;
  _listing?: Maybe<Scalars['Boolean']['output']>;
  _media?: Maybe<Scalars['Boolean']['output']>;
  /** Sets, replaces, or clears the billing address for the checkout. */
  checkoutBillingAddressUpdate: ApiCheckoutMutationPayload;
  /** Creates a new checkout. */
  checkoutCreate: ApiCheckoutMutationPayload;
  /** Updates the display currency of the checkout (ISO 4217, e.g. "USD", "EUR"). */
  checkoutCurrencyCodeUpdate: ApiCheckoutMutationPayload;
  /**
   * Updates customer identification data associated with the checkout
   * while authenticated customer ownership is resolved from trusted context.
   */
  checkoutCustomerIdentityUpdate: ApiCheckoutMutationPayload;
  /** Updates the customer note attached to the checkout (delivery instructions, etc.). */
  checkoutCustomerNoteUpdate: ApiCheckoutMutationPayload;
  /** Adds one or more delivery addresses to the checkout (supports multi-shipping). */
  checkoutDeliveryAddressesAdd: ApiCheckoutMutationPayload;
  /** Removes one or more delivery addresses previously attached to the checkout. */
  checkoutDeliveryAddressesRemove: ApiCheckoutMutationPayload;
  /** Updates previously added delivery addresses (e.g., correcting postal code or city). */
  checkoutDeliveryAddressesUpdate: ApiCheckoutMutationPayload;
  /** Selects or changes the delivery method for the entire checkout or specific address. */
  checkoutDeliveryMethodUpdate: ApiCheckoutMutationPayload;
  /** Adds recipients to delivery groups. */
  checkoutDeliveryRecipientsAdd: ApiCheckoutMutationPayload;
  /** Removes recipients from delivery groups. */
  checkoutDeliveryRecipientsRemove: ApiCheckoutMutationPayload;
  /** Updates recipients for delivery groups. */
  checkoutDeliveryRecipientsUpdate: ApiCheckoutMutationPayload;
  /** Updates the language/locale of the checkout (affects localization and formatting). */
  checkoutLanguageCodeUpdate: ApiCheckoutMutationPayload;
  /** Adds an item to an existing checkout. */
  checkoutLinesAdd: ApiCheckoutMutationPayload;
  /** Clears all items from a checkout. */
  checkoutLinesClear: ApiCheckoutMutationPayload;
  /** Removes a single item from the checkout. */
  checkoutLinesDelete: ApiCheckoutMutationPayload;
  /** Replaces one checkout line with another by merging quantities and removing the source line. */
  checkoutLinesReplace: ApiCheckoutMutationPayload;
  /** Updates the quantity of a specific checkout item. */
  checkoutLinesUpdate: ApiCheckoutMutationPayload;
  /** Selects or changes the payment method for the checkout. */
  checkoutPaymentMethodUpdate: ApiCheckoutMutationPayload;
  /** Applies a promo code/coupon to the checkout. */
  checkoutPromoCodeAdd: ApiCheckoutMutationPayload;
  /** Removes a previously applied promo code/coupon from the checkout. */
  checkoutPromoCodeRemove: ApiCheckoutMutationPayload;
  /** Creates a new checkout tag. */
  checkoutTagCreate: ApiCheckoutMutationPayload;
  /** Deletes a checkout tag. */
  checkoutTagDelete: ApiCheckoutMutationPayload;
  /** Updates a checkout tag. */
  checkoutTagUpdate: ApiCheckoutMutationPayload;
  /**
   * Creates a mailing address owned by the authenticated customer.
   * The new address can optionally become the customer's default address.
   */
  customerAddressCreate: ApiCustomerAddressCreatePayload;
  /**
   * Deletes a mailing address owned by the authenticated customer.
   * The operation must reject addresses belonging to another customer.
   */
  customerAddressDelete: ApiCustomerAddressDeletePayload;
  /**
   * Updates a mailing address owned by the authenticated customer.
   * The operation must reject addresses belonging to another customer.
   */
  customerAddressUpdate: ApiCustomerAddressUpdatePayload;
  /** Subscribes the authenticated customer's verified email address to marketing. */
  customerEmailMarketingSubscribe: ApiCustomerEmailMarketingSubscribePayload;
  /** Unsubscribes the authenticated customer's email address from marketing. */
  customerEmailMarketingUnsubscribe: ApiCustomerEmailMarketingUnsubscribePayload;
  /**
   * Updates personal profile fields for the authenticated customer.
   * Authentication and customer ownership are resolved from storefront context.
   */
  customerUpdate: ApiCustomerUpdatePayload;
  /** Cancels an eligible order owned by the authenticated customer. */
  orderCancel: ApiOrderCancelPayload;
  /**
   * Starts another payment attempt for an eligible failed, expired, or pending
   * order payment. Replaying the same idempotency key returns the same attempt.
   */
  orderPaymentRetry: ApiOrderPaymentRetryPayload;
  /** Creates a new checkout from currently purchasable lines of an order. */
  orderReorder: ApiOrderReorderPayload;
  /** Cancels a return request while its current state permits cancellation. */
  orderReturnRequestCancel: ApiOrderReturnRequestCancelPayload;
  /** Creates a return request for eligible quantities of purchased lines. */
  orderReturnRequestCreate: ApiOrderReturnRequestCreatePayload;
  /** Creates a new session using email and password. */
  passwordSignIn: ApiPasswordSignInPayload;
  /** Registers a new user and returns a session. */
  passwordSignUp: ApiPasswordSignUpPayload;
  /**
   * Places a committed checkout through the durable order placement workflow.
   * Repeating the same request with the same idempotency key returns the same result.
   */
  placeOrder: ApiPlaceOrderPayload;
  /**
   * Adds a customer answer to an existing product question.
   *
   * Customer answers must be enabled by reviewStoreConfiguration. Official and
   * accepted-answer state cannot be assigned through the Storefront API.
   */
  productQuestionAnswerCreate: ApiProductQuestionAnswerCreatePayload;
  /** Deletes a question answer owned by the authenticated customer. */
  productQuestionAnswerDelete: ApiProductQuestionAnswerDeletePayload;
  /** Updates a question answer owned by the authenticated customer. */
  productQuestionAnswerUpdate: ApiProductQuestionAnswerUpdatePayload;
  /**
   * Submits a product question in the active storefront context.
   *
   * The authenticated customer is resolved from trusted request context. Guest
   * submission is available only when enabled by reviewStoreConfiguration.
   */
  productQuestionCreate: ApiProductQuestionCreatePayload;
  /** Deletes a product question owned by the authenticated customer. */
  productQuestionDelete: ApiProductQuestionDeletePayload;
  /** Creates, updates, pauses, or removes the viewer's question subscription. */
  productQuestionSubscriptionSet: ApiProductQuestionSubscriptionSetPayload;
  /** Updates a product question owned by the authenticated customer. */
  productQuestionUpdate: ApiProductQuestionUpdatePayload;
  /** Sends a password recovery email. */
  requestPasswordRecovery: ApiPasswordRecoveryPayload;
  /** Resets the user's password with a recovery token. */
  resetPassword: ApiResetPasswordPayload;
  /**
   * Reports storefront review content for moderation.
   *
   * A viewer may have only one active report for the same content. Customer or
   * anonymous visitor identity is resolved from trusted storefront request
   * context and cannot be supplied as a GraphQL argument.
   */
  reviewContentReportCreate: ApiReviewContentReportCreatePayload;
  /** Removes the current viewer's LIKE or DISLIKE vote. */
  reviewContentVoteRemove: ApiReviewContentVoteRemovePayload;
  /**
   * Sets the current viewer's LIKE or DISLIKE vote on storefront review content.
   *
   * Repeating the same vote is idempotent. Setting the opposite type replaces the
   * previous vote. Customer or anonymous visitor identity is resolved from
   * trusted storefront request context.
   */
  reviewContentVoteSet: ApiReviewContentVoteSetPayload;
  /**
   * Submits a product review in the active storefront context.
   *
   * The authenticated customer is resolved from trusted request context. Guest
   * submission is available only when enabled by reviewStoreConfiguration.
   * Verification and moderation state are always determined by the service.
   */
  reviewCreate: ApiReviewCreatePayload;
  /** Deletes a review owned by the authenticated customer within its edit window. */
  reviewDelete: ApiReviewDeletePayload;
  /** Updates a review owned by the authenticated customer within its edit window. */
  reviewUpdate: ApiReviewUpdatePayload;
  /** Signs out the current user. */
  signOut: Scalars['Boolean']['output'];
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutBillingAddressUpdateArgs = {
  input: ApiCheckoutBillingAddressUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutCreateArgs = {
  input: ApiCheckoutCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutCurrencyCodeUpdateArgs = {
  input: ApiCheckoutCurrencyCodeUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutCustomerIdentityUpdateArgs = {
  input: ApiCheckoutCustomerIdentityUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutCustomerNoteUpdateArgs = {
  input: ApiCheckoutCustomerNoteUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryAddressesAddArgs = {
  input: ApiCheckoutDeliveryAddressesAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryAddressesRemoveArgs = {
  input: ApiCheckoutDeliveryAddressesRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryAddressesUpdateArgs = {
  input: ApiCheckoutDeliveryAddressesUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryMethodUpdateArgs = {
  input: ApiCheckoutDeliveryMethodUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryRecipientsAddArgs = {
  input: ApiCheckoutDeliveryRecipientsAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryRecipientsRemoveArgs = {
  input: ApiCheckoutDeliveryRecipientsRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutDeliveryRecipientsUpdateArgs = {
  input: ApiCheckoutDeliveryRecipientsUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLanguageCodeUpdateArgs = {
  input: ApiCheckoutLanguageCodeUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLinesAddArgs = {
  input: ApiCheckoutLinesAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLinesClearArgs = {
  input: ApiCheckoutLinesClearInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLinesDeleteArgs = {
  input: ApiCheckoutLinesDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLinesReplaceArgs = {
  input: ApiCheckoutLinesReplaceInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutLinesUpdateArgs = {
  input: ApiCheckoutLinesUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutPaymentMethodUpdateArgs = {
  input: ApiCheckoutPaymentMethodUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutPromoCodeAddArgs = {
  input: ApiCheckoutPromoCodeAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutPromoCodeRemoveArgs = {
  input: ApiCheckoutPromoCodeRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutTagCreateArgs = {
  input: ApiCheckoutTagCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutTagDeleteArgs = {
  input: ApiCheckoutTagDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCheckoutTagUpdateArgs = {
  input: ApiCheckoutTagUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCustomerAddressCreateArgs = {
  address: ApiCustomerAddressInput;
  defaultAddress?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCustomerAddressDeleteArgs = {
  addressId: Scalars['ID']['input'];
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCustomerAddressUpdateArgs = {
  address?: InputMaybe<ApiCustomerAddressInput>;
  addressId: Scalars['ID']['input'];
  defaultAddress?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationCustomerUpdateArgs = {
  input: ApiCustomerUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationOrderCancelArgs = {
  input: ApiOrderCancelInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationOrderPaymentRetryArgs = {
  input: ApiOrderPaymentRetryInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationOrderReorderArgs = {
  input: ApiOrderReorderInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationOrderReturnRequestCancelArgs = {
  input: ApiOrderReturnRequestCancelInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationOrderReturnRequestCreateArgs = {
  input: ApiOrderReturnRequestCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationPasswordSignInArgs = {
  input: ApiPasswordSignInInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationPasswordSignUpArgs = {
  input: ApiPasswordSignUpInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationPlaceOrderArgs = {
  input: ApiPlaceOrderInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionAnswerCreateArgs = {
  input: ApiProductQuestionAnswerCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionAnswerDeleteArgs = {
  input: ApiReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionAnswerUpdateArgs = {
  input: ApiProductQuestionAnswerUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionCreateArgs = {
  input: ApiProductQuestionCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionDeleteArgs = {
  input: ApiReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionSubscriptionSetArgs = {
  input: ApiProductQuestionSubscriptionSetInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationProductQuestionUpdateArgs = {
  input: ApiProductQuestionUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationRequestPasswordRecoveryArgs = {
  input: ApiPasswordRecoveryInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationResetPasswordArgs = {
  input: ApiResetPasswordInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewContentReportCreateArgs = {
  input: ApiReviewContentReportCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewContentVoteRemoveArgs = {
  input: ApiReviewContentVoteRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewContentVoteSetArgs = {
  input: ApiReviewContentVoteSetInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewCreateArgs = {
  input: ApiReviewCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewDeleteArgs = {
  input: ApiReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type ApiMutationReviewUpdateArgs = {
  input: ApiReviewUpdateInput;
};

/** Enables global object identification following the Relay specification. */
export type ApiNode = {
  id: Scalars['ID']['output'];
};

/** Severity levels for checkout warnings. */
export enum NotificationSeverity {
  /** Informational notice; does not indicate any change in checkout data. */
  Info = 'INFO',
  /** Notification about automatic adjustments (e.g., quantity reduced). */
  Warning = 'WARNING'
}

/** A storefront navigation menu owned by the Online Store app. */
export type ApiOnlineStoreNavigationMenu = ApiNode & {
  __typename?: 'OnlineStoreNavigationMenu';
  /** Stable handle used by storefront layouts, for example `main-menu`. */
  handle: Scalars['String']['output'];
  /** The globally unique Relay ID of the menu. */
  id: Scalars['ID']['output'];
  /** Top-level menu items in merchant-defined order. */
  items: ApiOnlineStoreNavigationMenuItemConnection;
};


/** A storefront navigation menu owned by the Online Store app. */
export type ApiOnlineStoreNavigationMenuItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A Relay connection containing navigation menus. */
export type ApiOnlineStoreNavigationMenuConnection = ApiConnection & {
  __typename?: 'OnlineStoreNavigationMenuConnection';
  edges: Array<ApiOnlineStoreNavigationMenuEdge>;
  nodes: Array<ApiOnlineStoreNavigationMenu>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiOnlineStoreNavigationMenuEdge = {
  __typename?: 'OnlineStoreNavigationMenuEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiOnlineStoreNavigationMenu;
};

/** A localized item in an ordered navigation tree. */
export type ApiOnlineStoreNavigationMenuItem = ApiNode & {
  __typename?: 'OnlineStoreNavigationMenuItem';
  /** Direct children in merchant-defined order. */
  children: ApiOnlineStoreNavigationMenuItemConnection;
  /** The globally unique Relay ID of the item. */
  id: Scalars['ID']['output'];
  /**
   * Label in the requested locale.
   *
   * When locale is omitted, the active storefront locale is used. Null is
   * returned when the requested locale is not active or has no translation.
   */
  label?: Maybe<Scalars['String']['output']>;
  menu: ApiOnlineStoreNavigationMenu;
  openInNewTab: Scalars['Boolean']['output'];
  parent?: Maybe<ApiOnlineStoreNavigationMenuItem>;
  target: ApiOnlineStoreNavigationTarget;
};


/** A localized item in an ordered navigation tree. */
export type ApiOnlineStoreNavigationMenuItemChildrenArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A localized item in an ordered navigation tree. */
export type ApiOnlineStoreNavigationMenuItemLabelArgs = {
  locale?: InputMaybe<LocaleCode>;
};

/** A Relay connection containing one ordered level of a menu tree. */
export type ApiOnlineStoreNavigationMenuItemConnection = ApiConnection & {
  __typename?: 'OnlineStoreNavigationMenuItemConnection';
  edges: Array<ApiOnlineStoreNavigationMenuItemEdge>;
  nodes: Array<ApiOnlineStoreNavigationMenuItem>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiOnlineStoreNavigationMenuItemEdge = {
  __typename?: 'OnlineStoreNavigationMenuItemEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiOnlineStoreNavigationMenuItem;
};

/** A normalized, frontend-ready navigation destination. */
export type ApiOnlineStoreNavigationTarget = {
  __typename?: 'OnlineStoreNavigationTarget';
  /**
   * Referenced federated Node when the resource is public and resolvable.
   *
   * This can resolve to OnlineStorePage, Product, or Category. It is null for
   * URL targets and unavailable resources.
   */
  resource?: Maybe<ApiNode>;
  /** Global Relay ID of the referenced resource. Null only for a URL target. */
  resourceId?: Maybe<Scalars['ID']['output']>;
  type: OnlineStoreNavigationTargetType;
  /**
   * Frontend-ready destination URL. For resource targets this is the canonical
   * storefront URL derived from the referenced resource.
   */
  url: Scalars['URL']['output'];
};

/** Kinds of destination supported by the Online Store domain model. */
export enum OnlineStoreNavigationTargetType {
  Category = 'CATEGORY',
  Page = 'PAGE',
  Product = 'PRODUCT',
  Url = 'URL'
}

/** Open Graph metadata for a localized page. */
export type ApiOnlineStoreOpenGraphMetadata = {
  __typename?: 'OnlineStoreOpenGraphMetadata';
  description?: Maybe<Scalars['String']['output']>;
  /** Social preview image resolved by the Media subgraph. */
  image?: Maybe<ApiMediaImage>;
  title?: Maybe<Scalars['String']['output']>;
};

/** A published, locale-aware content page owned by the Online Store app. */
export type ApiOnlineStorePage = ApiNode & {
  __typename?: 'OnlineStorePage';
  /**
   * Localized page content.
   *
   * When locale is omitted, the active storefront locale is used. Null is
   * returned when the requested locale is not active or has no translation.
   */
  content?: Maybe<ApiOnlineStorePageContent>;
  /** Stable, locale-independent handle used to build the page URL. */
  handle: Scalars['String']['output'];
  /** The globally unique Relay ID of the page. */
  id: Scalars['ID']['output'];
  /** The instant at which this page became publicly visible. */
  publishedAt: Scalars['DateTime']['output'];
  /** Optional storefront template variant selected by the merchant. */
  templateSuffix?: Maybe<Scalars['String']['output']>;
};


/** A published, locale-aware content page owned by the Online Store app. */
export type ApiOnlineStorePageContentArgs = {
  locale?: InputMaybe<LocaleCode>;
};

/** A Relay connection containing published Online Store pages. */
export type ApiOnlineStorePageConnection = ApiConnection & {
  __typename?: 'OnlineStorePageConnection';
  edges: Array<ApiOnlineStorePageEdge>;
  nodes: Array<ApiOnlineStorePage>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** One localized representation of an Online Store page. */
export type ApiOnlineStorePageContent = {
  __typename?: 'OnlineStorePageContent';
  body?: Maybe<ApiRichText>;
  /** Locale resolved for this representation. */
  locale: LocaleCode;
  seo?: Maybe<ApiOnlineStoreSeo>;
  title: Scalars['String']['output'];
};

export type ApiOnlineStorePageEdge = {
  __typename?: 'OnlineStorePageEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiOnlineStorePage;
};

/** Search engine and social sharing metadata for a localized page. */
export type ApiOnlineStoreSeo = {
  __typename?: 'OnlineStoreSEO';
  description?: Maybe<Scalars['String']['output']>;
  openGraph?: Maybe<ApiOnlineStoreOpenGraphMetadata>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Metadata used when a catalog page is shared on social platforms. */
export type ApiOpenGraphMetadata = {
  __typename?: 'OpenGraphMetadata';
  description?: Maybe<Scalars['String']['output']>;
  image?: Maybe<ApiMedia>;
  title?: Maybe<Scalars['String']['output']>;
};

/** A customer-visible order in the active storefront context. */
export type ApiOrder = ApiNode & {
  __typename?: 'Order';
  appliedPromoCodes: Array<ApiOrderPromoCode>;
  channelCode?: Maybe<Scalars['String']['output']>;
  closedAt?: Maybe<Scalars['DateTime']['output']>;
  cost: ApiOrderCost;
  createdAt: Scalars['DateTime']['output'];
  currencyCode: CurrencyCode;
  customerIdentity: ApiOrderCustomerIdentity;
  customerNote?: Maybe<Scalars['String']['output']>;
  deliveryGroups: Array<ApiOrderDeliveryGroup>;
  deliveryStatus: OrderDeliveryStatus;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  fulfillmentStatus: OrderFulfillmentStatus;
  fulfillments: Array<ApiOrderFulfillment>;
  id: Scalars['ID']['output'];
  lines: Array<ApiOrderLine>;
  localeCode?: Maybe<LocaleCode>;
  /** Human-readable order number unique within the store. */
  number: Scalars['BigInt']['output'];
  payment: ApiOrderPayment;
  /** @deprecated Use payment.method. */
  paymentMethod?: Maybe<ApiOrderPaymentMethod>;
  placedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Return requests created for this order, newest first. */
  returnRequests: ApiOrderReturnRequestConnection;
  /** Server-evaluated post-order actions available to the current customer. */
  selfService: ApiOrderSelfService;
  status: OrderStatus;
  totalQuantity: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};


/** A customer-visible order in the active storefront context. */
export type ApiOrderReturnRequestsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type ApiOrderCancelInput = {
  expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  idempotencyKey: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  orderId: Scalars['ID']['input'];
  reason: OrderCancellationReason;
};

export type ApiOrderCancelPayload = {
  __typename?: 'OrderCancelPayload';
  order?: Maybe<ApiOrder>;
  userErrors: Array<ApiOrderUserError>;
};

/** Customer-selected reason for cancelling an order. */
export enum OrderCancellationReason {
  ChangedMind = 'CHANGED_MIND',
  DuplicateOrder = 'DUPLICATE_ORDER',
  IncorrectAddress = 'INCORRECT_ADDRESS',
  IncorrectItems = 'INCORRECT_ITEMS',
  Other = 'OTHER',
  PaymentIssue = 'PAYMENT_ISSUE'
}

export type ApiOrderConnection = ApiConnection & {
  __typename?: 'OrderConnection';
  edges: Array<ApiOrderEdge>;
  nodes: Array<ApiOrder>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** All monetary calculations captured when the order was placed. */
export type ApiOrderCost = {
  __typename?: 'OrderCost';
  subtotalAmount: ApiMoney;
  totalAmount: ApiMoney;
  totalDiscountAmount: ApiMoney;
  totalShippingAmount: ApiMoney;
  totalTaxAmount: ApiMoney;
};

/** Customer identity snapshot captured by the order. */
export type ApiOrderCustomerIdentity = {
  __typename?: 'OrderCustomerIdentity';
  countryCode?: Maybe<CountryCode>;
  customer?: Maybe<ApiCustomer>;
  email?: Maybe<Scalars['Email']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

/** Immutable delivery destination captured for an order. */
export type ApiOrderDeliveryAddress = ApiNode & {
  __typename?: 'OrderDeliveryAddress';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  countryCode?: Maybe<CountryCode>;
  id: Scalars['ID']['output'];
  postalCode?: Maybe<Scalars['String']['output']>;
  provinceCode?: Maybe<Scalars['String']['output']>;
};

/** A delivery group and its immutable order snapshot. */
export type ApiOrderDeliveryGroup = ApiNode & {
  __typename?: 'OrderDeliveryGroup';
  address?: Maybe<ApiOrderDeliveryAddress>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lines: Array<ApiOrderLine>;
  method?: Maybe<ApiOrderDeliveryMethod>;
  recipient?: Maybe<ApiOrderRecipient>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Delivery method selected for an order delivery group. */
export type ApiOrderDeliveryMethod = {
  __typename?: 'OrderDeliveryMethod';
  code: Scalars['String']['output'];
  paymentModel?: Maybe<Scalars['String']['output']>;
  providerCode: Scalars['String']['output'];
  type: OrderDeliveryMethodType;
};

/** The delivery method selected for an order delivery group. */
export enum OrderDeliveryMethodType {
  Local = 'LOCAL',
  None = 'NONE',
  PickupPoint = 'PICKUP_POINT',
  PickUp = 'PICK_UP',
  Retail = 'RETAIL',
  Shipping = 'SHIPPING'
}

/** Aggregate customer-facing delivery state across all shipments. */
export enum OrderDeliveryStatus {
  Cancelled = 'CANCELLED',
  Delayed = 'DELAYED',
  Delivered = 'DELIVERED',
  DeliveryAttempted = 'DELIVERY_ATTEMPTED',
  Exception = 'EXCEPTION',
  InTransit = 'IN_TRANSIT',
  NotShipped = 'NOT_SHIPPED',
  OutForDelivery = 'OUT_FOR_DELIVERY',
  PartiallyShipped = 'PARTIALLY_SHIPPED',
  ReturnedToSender = 'RETURNED_TO_SENDER',
  Shipped = 'SHIPPED'
}

export type ApiOrderEdge = {
  __typename?: 'OrderEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiOrder;
};

/** Merchant fulfillment of one or more purchased line quantities. */
export type ApiOrderFulfillment = ApiNode & {
  __typename?: 'OrderFulfillment';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lines: Array<ApiOrderFulfillmentLine>;
  shipments: Array<ApiOrderShipment>;
  status: OrderFulfillmentOperationStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** Quantity from an order line assigned to a fulfillment. */
export type ApiOrderFulfillmentLine = {
  __typename?: 'OrderFulfillmentLine';
  orderLine: ApiOrderLine;
  quantity: Scalars['Int']['output'];
};

/** Lifecycle state of one fulfillment operation. */
export enum OrderFulfillmentOperationStatus {
  Cancelled = 'CANCELLED',
  Failure = 'FAILURE',
  Open = 'OPEN',
  Pending = 'PENDING',
  Success = 'SUCCESS'
}

/** Aggregate fulfillment state across every line in an order. */
export enum OrderFulfillmentStatus {
  Cancelled = 'CANCELLED',
  Fulfilled = 'FULFILLED',
  OnHold = 'ON_HOLD',
  PartiallyFulfilled = 'PARTIALLY_FULFILLED',
  Scheduled = 'SCHEDULED',
  Unfulfilled = 'UNFULFILLED'
}

/** Immutable customer-visible snapshot of one purchased line. */
export type ApiOrderLine = ApiNode & {
  __typename?: 'OrderLine';
  cost: ApiOrderLineCost;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['URL']['output']>;
  purchasableId: Scalars['ID']['output'];
  purchasableSnapshot: Scalars['JSON']['output'];
  quantity: Scalars['Int']['output'];
  /** Current return eligibility after previous returns and policy limits. */
  returnEligibility: ApiOrderLineReturnEligibility;
  sku?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiOrderLineCost = {
  __typename?: 'OrderLineCost';
  discountAmount: ApiMoney;
  subtotalAmount: ApiMoney;
  taxAmount: ApiMoney;
  totalAmount: ApiMoney;
  unitCompareAtPrice: ApiMoney;
  unitPrice: ApiMoney;
};

/** Return eligibility for one purchased order line. */
export type ApiOrderLineReturnEligibility = {
  __typename?: 'OrderLineReturnEligibility';
  eligible: Scalars['Boolean']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  maxQuantity: Scalars['Int']['output'];
  unavailableReason?: Maybe<Scalars['String']['output']>;
  unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

/** Current payment aggregate and immutable payment history for an order. */
export type ApiOrderPayment = {
  __typename?: 'OrderPayment';
  authorizedAmount: ApiMoney;
  capturedAmount: ApiMoney;
  method?: Maybe<ApiOrderPaymentMethod>;
  outstandingAmount: ApiMoney;
  refundedAmount: ApiMoney;
  refunds: Array<ApiOrderRefund>;
  retry: ApiOrderPaymentRetry;
  status: OrderPaymentStatus;
  transactions: Array<ApiOrderPaymentTransaction>;
  voids: Array<ApiOrderVoid>;
};

/** Customer interaction required to continue the new payment attempt. */
export type ApiOrderPaymentCustomerAction = {
  __typename?: 'OrderPaymentCustomerAction';
  data?: Maybe<Scalars['JSON']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  instructions?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type: OrderPaymentCustomerActionType;
  url?: Maybe<Scalars['URL']['output']>;
};

/** Customer interaction required to continue a retried payment. */
export enum OrderPaymentCustomerActionType {
  Instructions = 'INSTRUCTIONS',
  Redirect = 'REDIRECT'
}

/** The customer interaction model of the selected payment method. */
export enum OrderPaymentFlow {
  Offline = 'OFFLINE',
  Online = 'ONLINE',
  OnDelivery = 'ON_DELIVERY'
}

/** Payment method selected when the order was placed. */
export type ApiOrderPaymentMethod = {
  __typename?: 'OrderPaymentMethod';
  code: Scalars['String']['output'];
  flow: OrderPaymentFlow;
  providerCode: Scalars['String']['output'];
};

/** Availability of another customer-initiated payment attempt. */
export type ApiOrderPaymentRetry = {
  __typename?: 'OrderPaymentRetry';
  available: Scalars['Boolean']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  unavailableReason?: Maybe<Scalars['String']['output']>;
  unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

export type ApiOrderPaymentRetryInput = {
  expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  idempotencyKey: Scalars['String']['input'];
  orderId: Scalars['ID']['input'];
  /** HTTPS URL to which an online payment provider may return the customer. */
  returnUrl?: InputMaybe<Scalars['URL']['input']>;
};

export type ApiOrderPaymentRetryPayload = {
  __typename?: 'OrderPaymentRetryPayload';
  attemptId?: Maybe<Scalars['ID']['output']>;
  customerAction?: Maybe<ApiOrderPaymentCustomerAction>;
  order?: Maybe<ApiOrder>;
  status?: Maybe<OrderPaymentRetryStatus>;
  userErrors: Array<ApiOrderUserError>;
};

/** State returned after requesting another payment attempt. */
export enum OrderPaymentRetryStatus {
  Authorized = 'AUTHORIZED',
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  RequiresAction = 'REQUIRES_ACTION'
}

/** Aggregate payment state for an order. */
export enum OrderPaymentStatus {
  Authorized = 'AUTHORIZED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Paid = 'PAID',
  PartiallyPaid = 'PARTIALLY_PAID',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Voided = 'VOIDED'
}

/** One immutable payment operation recorded against an order. */
export type ApiOrderPaymentTransaction = ApiNode & {
  __typename?: 'OrderPaymentTransaction';
  amount: ApiMoney;
  createdAt: Scalars['DateTime']['output'];
  failureCode?: Maybe<Scalars['String']['output']>;
  failureMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  kind: OrderPaymentTransactionKind;
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  providerCode: Scalars['String']['output'];
  reference?: Maybe<Scalars['String']['output']>;
  status: OrderPaymentTransactionStatus;
};

/** The accounting operation represented by a payment transaction. */
export enum OrderPaymentTransactionKind {
  Authorization = 'AUTHORIZATION',
  Capture = 'CAPTURE',
  Refund = 'REFUND',
  Sale = 'SALE',
  Void = 'VOID'
}

/** Lifecycle state of a payment transaction. */
export enum OrderPaymentTransactionStatus {
  Cancelled = 'CANCELLED',
  Failure = 'FAILURE',
  Pending = 'PENDING',
  Success = 'SUCCESS'
}

/** A promotional code captured when the order was placed. */
export type ApiOrderPromoCode = {
  __typename?: 'OrderPromoCode';
  appliedAt: Scalars['DateTime']['output'];
  code: Scalars['String']['output'];
  conditions?: Maybe<Scalars['JSON']['output']>;
  discountType: Scalars['String']['output'];
  provider: Scalars['String']['output'];
  value: Scalars['Decimal']['output'];
};

/** Immutable recipient details captured for an order delivery group. */
export type ApiOrderRecipient = {
  __typename?: 'OrderRecipient';
  email?: Maybe<Scalars['Email']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  middleName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
};

/** Customer-visible refund recorded against the order. */
export type ApiOrderRefund = ApiNode & {
  __typename?: 'OrderRefund';
  amount: ApiMoney;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lines: Array<ApiOrderRefundLine>;
  note?: Maybe<Scalars['String']['output']>;
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status: OrderRefundStatus;
};

/** Quantity and amount returned for one purchased order line. */
export type ApiOrderRefundLine = {
  __typename?: 'OrderRefundLine';
  amount: ApiMoney;
  orderLine: ApiOrderLine;
  quantity: Scalars['Int']['output'];
};

/** Lifecycle state of a customer-visible refund. */
export enum OrderRefundStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Succeeded = 'SUCCEEDED'
}

export type ApiOrderReorderInput = {
  idempotencyKey: Scalars['String']['input'];
  /** Lines to copy. When omitted, every currently purchasable order line is used. */
  lines?: InputMaybe<Array<ApiOrderReorderLineInput>>;
  orderId: Scalars['ID']['input'];
};

/** Optional quantity override for one line copied into a reorder checkout. */
export type ApiOrderReorderLineInput = {
  orderLineId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};

export type ApiOrderReorderPayload = {
  __typename?: 'OrderReorderPayload';
  checkout?: Maybe<ApiCheckout>;
  skippedLines: Array<ApiOrderReorderSkippedLine>;
  userErrors: Array<ApiOrderUserError>;
};

/** An order line that could not be copied into the new checkout. */
export type ApiOrderReorderSkippedLine = {
  __typename?: 'OrderReorderSkippedLine';
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  orderLine: ApiOrderLine;
};

/** Customer-selected reason for returning an order line. */
export enum OrderReturnReason {
  ChangedMind = 'CHANGED_MIND',
  Damaged = 'DAMAGED',
  Defective = 'DEFECTIVE',
  IncorrectItem = 'INCORRECT_ITEM',
  NotAsDescribed = 'NOT_AS_DESCRIBED',
  Other = 'OTHER',
  SizeOrFit = 'SIZE_OR_FIT'
}

/** A customer-created request to return one or more order lines. */
export type ApiOrderReturnRequest = ApiNode & {
  __typename?: 'OrderReturnRequest';
  canCancel: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  customerNote?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lines: Array<ApiOrderReturnRequestLine>;
  order: ApiOrder;
  requestedAt: Scalars['DateTime']['output'];
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  revision: Scalars['Int']['output'];
  status: OrderReturnRequestStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiOrderReturnRequestCancelInput = {
  expectedRevision: Scalars['Int']['input'];
  idempotencyKey: Scalars['String']['input'];
  returnRequestId: Scalars['ID']['input'];
};

export type ApiOrderReturnRequestCancelPayload = {
  __typename?: 'OrderReturnRequestCancelPayload';
  returnRequest?: Maybe<ApiOrderReturnRequest>;
  userErrors: Array<ApiOrderUserError>;
};

export type ApiOrderReturnRequestConnection = ApiConnection & {
  __typename?: 'OrderReturnRequestConnection';
  edges: Array<ApiOrderReturnRequestEdge>;
  nodes: Array<ApiOrderReturnRequest>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiOrderReturnRequestCreateInput = {
  customerNote?: InputMaybe<Scalars['String']['input']>;
  expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  idempotencyKey: Scalars['String']['input'];
  lines: Array<ApiOrderReturnRequestLineInput>;
  orderId: Scalars['ID']['input'];
};

export type ApiOrderReturnRequestCreatePayload = {
  __typename?: 'OrderReturnRequestCreatePayload';
  order?: Maybe<ApiOrder>;
  returnRequest?: Maybe<ApiOrderReturnRequest>;
  userErrors: Array<ApiOrderUserError>;
};

export type ApiOrderReturnRequestEdge = {
  __typename?: 'OrderReturnRequestEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiOrderReturnRequest;
};

/** One line requested for return. */
export type ApiOrderReturnRequestLine = {
  __typename?: 'OrderReturnRequestLine';
  note?: Maybe<Scalars['String']['output']>;
  orderLine: ApiOrderLine;
  quantity: Scalars['Int']['output'];
  reason: OrderReturnReason;
};

export type ApiOrderReturnRequestLineInput = {
  note?: InputMaybe<Scalars['String']['input']>;
  orderLineId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  reason: OrderReturnReason;
};

/** Customer-visible lifecycle of a return request. */
export enum OrderReturnRequestStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InTransit = 'IN_TRANSIT',
  Received = 'RECEIVED',
  Rejected = 'REJECTED',
  Requested = 'REQUESTED'
}

/** Post-order capabilities evaluated for the authenticated customer. */
export type ApiOrderSelfService = {
  __typename?: 'OrderSelfService';
  cancel: ApiOrderSelfServiceAction;
  reorder: ApiOrderSelfServiceAction;
  requestReturn: ApiOrderSelfServiceAction;
  retryPayment: ApiOrderSelfServiceAction;
};

/** Availability of one post-order action in the current order state. */
export type ApiOrderSelfServiceAction = {
  __typename?: 'OrderSelfServiceAction';
  available: Scalars['Boolean']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  unavailableReason?: Maybe<Scalars['String']['output']>;
  /** Stable machine-readable explanation when the action is unavailable. */
  unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

/** One physical shipment created for an order fulfillment. */
export type ApiOrderShipment = ApiNode & {
  __typename?: 'OrderShipment';
  carrierCode?: Maybe<Scalars['String']['output']>;
  carrierName?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  estimatedDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  events: Array<ApiOrderTrackingEvent>;
  id: Scalars['ID']['output'];
  serviceCode?: Maybe<Scalars['String']['output']>;
  shippedAt?: Maybe<Scalars['DateTime']['output']>;
  status: OrderShipmentStatus;
  tracking: Array<ApiOrderTrackingInfo>;
  updatedAt: Scalars['DateTime']['output'];
};

/** Customer-facing lifecycle state of one physical shipment. */
export enum OrderShipmentStatus {
  Cancelled = 'CANCELLED',
  Delayed = 'DELAYED',
  Delivered = 'DELIVERED',
  DeliveryAttempted = 'DELIVERY_ATTEMPTED',
  Exception = 'EXCEPTION',
  InTransit = 'IN_TRANSIT',
  LabelCreated = 'LABEL_CREATED',
  OutForDelivery = 'OUT_FOR_DELIVERY',
  PickedUp = 'PICKED_UP',
  ReadyForPickup = 'READY_FOR_PICKUP',
  ReturnedToSender = 'RETURNED_TO_SENDER'
}

/** The lifecycle state of an order visible to its customer. */
export enum OrderStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Closed = 'CLOSED',
  Draft = 'DRAFT'
}

/** Carrier scan or merchant-provided progress event for a shipment. */
export type ApiOrderTrackingEvent = ApiNode & {
  __typename?: 'OrderTrackingEvent';
  happenedAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  location?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  status: OrderShipmentStatus;
};

/** Carrier tracking identity. A shipment may expose multiple tracking numbers. */
export type ApiOrderTrackingInfo = {
  __typename?: 'OrderTrackingInfo';
  company?: Maybe<Scalars['String']['output']>;
  number: Scalars['String']['output'];
  url?: Maybe<Scalars['URL']['output']>;
};

/** Customer-facing post-order mutation error. */
export type ApiOrderUserError = ApiDisplayableError & {
  __typename?: 'OrderUserError';
  code: Scalars['String']['output'];
  field?: Maybe<Array<Scalars['String']['output']>>;
  message: Scalars['String']['output'];
  retryable: Scalars['Boolean']['output'];
};

/** Customer-visible void of a previously authorized payment amount. */
export type ApiOrderVoid = ApiNode & {
  __typename?: 'OrderVoid';
  amount: ApiMoney;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  processedAt?: Maybe<Scalars['DateTime']['output']>;
  reason?: Maybe<Scalars['String']['output']>;
  status: OrderVoidStatus;
};

/** Lifecycle state of a payment authorization void. */
export enum OrderVoidStatus {
  Cancelled = 'CANCELLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Succeeded = 'SUCCEEDED'
}

/** Returns information about pagination in a connection. */
export type ApiPageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['Cursor']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['Cursor']['output']>;
};

/** Input data for requesting a password recovery email. */
export type ApiPasswordRecoveryInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  email: Scalars['Email']['input'];
};

/** Payload returned after requesting password recovery. */
export type ApiPasswordRecoveryPayload = {
  __typename?: 'PasswordRecoveryPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** True if the recovery email was sent successfully. */
  success: Scalars['Boolean']['output'];
};

/** Input data for signing in with email and password. */
export type ApiPasswordSignInInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  email: Scalars['Email']['input'];
  /** User's password. */
  password: Scalars['String']['input'];
};

/** Payload returned after signing in. */
export type ApiPasswordSignInPayload = {
  __typename?: 'PasswordSignInPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** Newly created session. */
  session?: Maybe<ApiSession>;
};

/** Input data for registering a new user. */
export type ApiPasswordSignUpInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  email: Scalars['Email']['input'];
  /** User's password. */
  password: Scalars['String']['input'];
};

/** Payload returned after signing up. */
export type ApiPasswordSignUpPayload = {
  __typename?: 'PasswordSignUpPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** Newly created session. */
  session?: Maybe<ApiSession>;
};

/** Payment flow for the method. */
export enum PaymentFlow {
  /** Customer pays offline via provider (QR code, display code, etc). */
  Offline = 'OFFLINE',
  /** Customer pays online via provider (redirect/app flow handled externally). */
  Online = 'ONLINE',
  /** Customer pays later/on delivery or by invoice (offline instructions). */
  OnDelivery = 'ON_DELIVERY'
}

/** Customer interaction required to continue payment. */
export type ApiPlaceOrderCustomerAction = {
  __typename?: 'PlaceOrderCustomerAction';
  data?: Maybe<Scalars['JSON']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  instructions?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  type: PlaceOrderCustomerActionType;
  url?: Maybe<Scalars['String']['output']>;
};

export enum PlaceOrderCustomerActionType {
  Instructions = 'INSTRUCTIONS',
  Redirect = 'REDIRECT'
}

/** Input used to place one immutable checkout snapshot. */
export type ApiPlaceOrderInput = {
  /** Checkout identifier. */
  checkoutId: Scalars['ID']['input'];
  /** Optimistic concurrency version returned by Checkout.version. */
  expectedCheckoutVersion: Scalars['Int']['input'];
  /** Pipeline revision returned by Checkout.resultRevision. */
  expectedResultRevision: Scalars['String']['input'];
  /** Client-generated opaque key used to replay placement safely. */
  idempotencyKey: Scalars['String']['input'];
  /** HTTPS URL to which an online payment provider may return the customer. */
  returnUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Result of the durable place-order workflow. */
export type ApiPlaceOrderPayload = {
  __typename?: 'PlaceOrderPayload';
  /** Checkout snapshot committed by this placement. */
  checkoutId?: Maybe<Scalars['ID']['output']>;
  /** Checkout.version captured by this placement. */
  checkoutVersion?: Maybe<Scalars['Int']['output']>;
  customerAction?: Maybe<ApiPlaceOrderCustomerAction>;
  orderId?: Maybe<Scalars['ID']['output']>;
  paymentCollectionId?: Maybe<Scalars['ID']['output']>;
  paymentFailure?: Maybe<ApiPlaceOrderPaymentFailure>;
  paymentOperationId?: Maybe<Scalars['ID']['output']>;
  paymentSessionId?: Maybe<Scalars['ID']['output']>;
  /** Durable placement identifier used by Query.checkoutPlacement. */
  placementId?: Maybe<Scalars['ID']['output']>;
  /** Checkout.resultRevision captured by this placement. */
  resultRevision?: Maybe<Scalars['String']['output']>;
  status?: Maybe<PlaceOrderStatus>;
  /** Validation, stale-snapshot, and business errors produced before placement. */
  userErrors: Array<ApiCheckoutUserError>;
};

/** Normalized terminal or retryable payment failure. */
export type ApiPlaceOrderPaymentFailure = {
  __typename?: 'PlaceOrderPaymentFailure';
  category: PlaceOrderPaymentFailureCategory;
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  providerCode?: Maybe<Scalars['String']['output']>;
  retryable: Scalars['Boolean']['output'];
};

export enum PlaceOrderPaymentFailureCategory {
  Authentication = 'AUTHENTICATION',
  Configuration = 'CONFIGURATION',
  Conflict = 'CONFLICT',
  Declined = 'DECLINED',
  FraudSuspected = 'FRAUD_SUSPECTED',
  InvalidRequest = 'INVALID_REQUEST',
  NotSupported = 'NOT_SUPPORTED',
  ProviderUnavailable = 'PROVIDER_UNAVAILABLE',
  RateLimited = 'RATE_LIMITED',
  Timeout = 'TIMEOUT',
  Unknown = 'UNKNOWN'
}

export enum PlaceOrderStatus {
  Authorized = 'AUTHORIZED',
  Paid = 'PAID',
  PaymentFailed = 'PAYMENT_FAILED',
  PaymentNotRequired = 'PAYMENT_NOT_REQUIRED',
  PaymentPending = 'PAYMENT_PENDING',
  RequiresAction = 'REQUIRES_ACTION',
  RequiresConfirmation = 'REQUIRES_CONFIRMATION'
}

/** Direction in which a price adjustment changes the base price. */
export enum PriceAdjustmentOperation {
  /** Subtract the calculated value from the base price. */
  Decrease = 'DECREASE',
  /** Add the calculated value to the base price. */
  Increase = 'INCREASE'
}

/** Representation used to calculate a price adjustment. */
export enum PriceAdjustmentValueType {
  /** Use a monetary value expressed in minor currency units. */
  FixedAmount = 'FIXED_AMOUNT',
  /** Calculate the value from basis points where 10000 equals 100%. */
  Percentage = 'PERCENTAGE'
}

/**
 * Price bounds in decimal major units and in the storefront context currency.
 * For example, 19.99 represents nineteen currency units and ninety-nine cents.
 */
export type ApiPriceRangeFilterInput = {
  max?: InputMaybe<Scalars['Decimal']['input']>;
  min?: InputMaybe<Scalars['Decimal']['input']>;
};

/** A published item offered for sale in the storefront catalog. */
export type ApiProduct = ApiNode & {
  __typename?: 'Product';
  availableForSale: Scalars['Boolean']['output'];
  categories: ApiCategoryConnection;
  compareAtPriceRange?: Maybe<ApiProductPriceRange>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<ApiRichText>;
  excerpt?: Maybe<ApiRichText>;
  featureGroups: Array<ApiProductFeatureGroup>;
  featuredMedia?: Maybe<ApiMedia>;
  features: Array<ApiProductFeature>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  media: ApiProductMediaConnection;
  options: Array<ApiProductOption>;
  priceRange?: Maybe<ApiProductPriceRange>;
  primaryCategory?: Maybe<ApiCategory>;
  publishedAt: Scalars['DateTime']['output'];
  /** Published question and answer aggregates for this product. */
  questionSummary: ApiProductQuestionSummary;
  /** Published questions for this product. */
  questions: ApiProductQuestionConnection;
  /** Rating criteria applicable to this product in display order. */
  reviewRatingCriteria: ApiReviewRatingCriterionConnection;
  /** Published review aggregates for this product. */
  reviewSummary: ApiProductReviewSummary;
  /** Published reviews for this product. */
  reviews: ApiReviewConnection;
  selectedOrFirstAvailableVariant?: Maybe<ApiProductVariant>;
  seo: ApiSeo;
  tags: Array<ApiTag>;
  title: Scalars['String']['output'];
  totalInventory?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  variantBySelectedOptions?: Maybe<ApiProductVariant>;
  variants: ApiProductVariantConnection;
  vendor?: Maybe<ApiVendor>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  answered?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductReviewRatingCriteriaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductReviewsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ReviewSort>;
  verifiedOnly?: InputMaybe<Scalars['Boolean']['input']>;
  withMediaOnly?: InputMaybe<Scalars['Boolean']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductSelectedOrFirstAvailableVariantArgs = {
  selectedOptions?: InputMaybe<Array<ApiSelectedOptionInput>>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductVariantBySelectedOptionsArgs = {
  selectedOptions: Array<ApiSelectedOptionInput>;
};


/** A published item offered for sale in the storefront catalog. */
export type ApiProductVariantsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ApiProductComponentConfiguration = {
  __typename?: 'ProductComponentConfiguration';
  componentsSubtotal: ApiMoney;
  displayStyle: ProductComponentDisplayStyle;
  groups: Array<ApiProductComponentGroup>;
  id: Scalars['ID']['output'];
  totalPrice: ApiMoney;
};

export enum ProductComponentDisplayStyle {
  Accordion = 'ACCORDION',
  Flat = 'FLAT',
  Tabs = 'TABS',
  Wizard = 'WIZARD'
}

export type ApiProductComponentGroup = {
  __typename?: 'ProductComponentGroup';
  id: Scalars['ID']['output'];
  items: Array<ApiProductComponentItem>;
  maxSelection?: Maybe<Scalars['Int']['output']>;
  minSelection?: Maybe<Scalars['Int']['output']>;
  required: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
};

export type ApiProductComponentItem = {
  __typename?: 'ProductComponentItem';
  availableForSale: Scalars['Boolean']['output'];
  featuredMedia?: Maybe<ApiMedia>;
  id: Scalars['ID']['output'];
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  minQuantity: Scalars['Int']['output'];
  product: ApiProduct;
  quantity: Scalars['Int']['output'];
  required: Scalars['Boolean']['output'];
  selected: Scalars['Boolean']['output'];
  title: Scalars['String']['output'];
  totalPrice: ApiMoney;
  unitPrice: ApiMoney;
  variant: ApiProductVariant;
};

export type ApiProductComponentSelectionInput = {
  itemId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** A Relay connection containing products from one canonical listing request. */
export type ApiProductConnection = ApiConnection & {
  __typename?: 'ProductConnection';
  /**
   * Sorts valid for this context. MANUAL is category-only. RELEVANCE is returned
   * only when a non-empty query is active.
   */
  availableSorts: Array<ListingSort>;
  /** A list of product edges. */
  edges: Array<ApiProductEdge>;
  /**
   * Filters calculated over the complete matched result set, not only this page.
   *
   * Each count uses target-filter isolation: selections from the filter being
   * counted are excluded while every other filter remains active.
   */
  filters: Array<ApiFilter>;
  /** The products contained in the returned edges. */
  nodes: Array<ApiProduct>;
  /** Information to aid in pagination. */
  pageInfo: ApiPageInfo;
  /** The effective sort selected for this request. */
  sort: ListingSort;
  /** The exact number of products matching every active filter. */
  totalCount: Scalars['Int']['output'];
};

export type ApiProductEdge = {
  __typename?: 'ProductEdge';
  /** An opaque cursor for this product in the current listing. */
  cursor: Scalars['Cursor']['output'];
  /** The product at the end of the edge. */
  node: ApiProduct;
};

/** A localized product specification such as material or screen size. */
export type ApiProductFeature = ApiNode & {
  __typename?: 'ProductFeature';
  group?: Maybe<ApiProductFeatureGroup>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  values: Array<ApiProductFeatureValue>;
};

/** A presentation group containing related product specifications. */
export type ApiProductFeatureGroup = ApiNode & {
  __typename?: 'ProductFeatureGroup';
  features: Array<ApiProductFeature>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

/** A localized value assigned to a product specification. */
export type ApiProductFeatureValue = ApiNode & {
  __typename?: 'ProductFeatureValue';
  feature: ApiProductFeature;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
};

/** A Relay connection to the media registered on a product. */
export type ApiProductMediaConnection = ApiConnection & {
  __typename?: 'ProductMediaConnection';
  edges: Array<ApiProductMediaEdge>;
  nodes: Array<ApiMedia>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a product. */
export type ApiProductMediaEdge = {
  __typename?: 'ProductMediaEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiMedia;
};

/** A configurable product dimension such as size, color, or material. */
export type ApiProductOption = ApiNode & {
  __typename?: 'ProductOption';
  displayType: ProductOptionDisplayType;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  optionValues: Array<ApiProductOptionValue>;
  position: Scalars['Int']['output'];
};

/** How an option should be presented by a product option picker. */
export enum ProductOptionDisplayType {
  Buttons = 'BUTTONS',
  Dropdown = 'DROPDOWN',
  Swatch = 'SWATCH'
}

/** The visual representation used for an option value. */
export enum ProductOptionSwatchType {
  Color = 'COLOR',
  Gradient = 'GRADIENT',
  Image = 'IMAGE'
}

/** One customer-selectable value of a product option. */
export type ApiProductOptionValue = ApiNode & {
  __typename?: 'ProductOptionValue';
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  swatch?: Maybe<ApiProductOptionValueSwatch>;
};

export type ApiProductOptionValueSwatch = {
  __typename?: 'ProductOptionValueSwatch';
  color?: Maybe<Scalars['Color']['output']>;
  image?: Maybe<ApiMedia>;
  metadata?: Maybe<Scalars['JSON']['output']>;
  secondaryColor?: Maybe<Scalars['Color']['output']>;
  type: ProductOptionSwatchType;
};

/** The lowest and highest current variant prices for a product. */
export type ApiProductPriceRange = {
  __typename?: 'ProductPriceRange';
  maxVariantPrice: ApiMoney;
  minVariantPrice: ApiMoney;
};

export type ApiProductQuestion = ApiNode & ApiReviewContent & {
  __typename?: 'ProductQuestion';
  answers: ApiProductQuestionAnswerConnection;
  author: ApiReviewContentAuthor;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  kind: ReviewContentKind;
  locale: LocaleCode;
  metrics: ApiReviewContentMetrics;
  product: ApiProduct;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  revision: Scalars['Int']['output'];
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  translations: Array<ApiReviewContentTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  variant?: Maybe<ApiProductVariant>;
  viewerCapabilities: ApiReviewContentViewerCapabilities;
  viewerEngagement: ApiReviewContentViewerEngagement;
  viewerSubscription?: Maybe<ApiProductQuestionSubscription>;
};


export type ApiProductQuestionAnswersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionAnswerSort>;
};

export type ApiProductQuestionAnswer = ApiNode & ApiReviewContent & {
  __typename?: 'ProductQuestionAnswer';
  author: ApiReviewContentAuthor;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isAccepted: Scalars['Boolean']['output'];
  isOfficial: Scalars['Boolean']['output'];
  kind: ReviewContentKind;
  locale: LocaleCode;
  metrics: ApiReviewContentMetrics;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  question: ApiProductQuestion;
  revision: Scalars['Int']['output'];
  sortIndex: Scalars['Int']['output'];
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  translations: Array<ApiReviewContentTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  viewerCapabilities: ApiReviewContentViewerCapabilities;
  viewerEngagement: ApiReviewContentViewerEngagement;
};

export type ApiProductQuestionAnswerConnection = ApiConnection & {
  __typename?: 'ProductQuestionAnswerConnection';
  edges: Array<ApiProductQuestionAnswerEdge>;
  nodes: Array<ApiProductQuestionAnswer>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Input for an authenticated customer answer to a product question. */
export type ApiProductQuestionAnswerCreateInput = {
  /**
   * Shared text, locale, and idempotency metadata. Guest author data is rejected
   * because storefront question answers require an authenticated customer.
   */
  content: ApiReviewContentSubmissionInput;
  /** Revision returned by ProductQuestion.revision. */
  expectedRevision: Scalars['Int']['input'];
  productQuestionId: Scalars['ID']['input'];
};

/** Result of adding a customer answer to a product question. */
export type ApiProductQuestionAnswerCreatePayload = {
  __typename?: 'ProductQuestionAnswerCreatePayload';
  answer?: Maybe<ApiProductQuestionAnswer>;
  productQuestion?: Maybe<ApiProductQuestion>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductQuestionAnswerDeletePayload = {
  __typename?: 'ProductQuestionAnswerDeletePayload';
  deletedAnswerId?: Maybe<Scalars['ID']['output']>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductQuestionAnswerEdge = {
  __typename?: 'ProductQuestionAnswerEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiProductQuestionAnswer;
};

/** Customer-facing orderings supported by question-answer connections. */
export enum ProductQuestionAnswerSort {
  MostHelpful = 'MOST_HELPFUL',
  Newest = 'NEWEST',
  Oldest = 'OLDEST'
}

/** Customer-editable fields of an existing question answer. */
export type ApiProductQuestionAnswerUpdateInput = {
  answerId: Scalars['ID']['input'];
  content: ApiReviewContentEditInput;
  expectedRevision: Scalars['Int']['input'];
};

export type ApiProductQuestionAnswerUpdatePayload = {
  __typename?: 'ProductQuestionAnswerUpdatePayload';
  answer?: Maybe<ApiProductQuestionAnswer>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductQuestionConnection = ApiConnection & {
  __typename?: 'ProductQuestionConnection';
  edges: Array<ApiProductQuestionEdge>;
  nodes: Array<ApiProductQuestion>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Input for a customer or guest product-question submission. */
export type ApiProductQuestionCreateInput = {
  /** Shared text, locale, guest identity, and idempotency metadata. */
  content: ApiReviewContentSubmissionInput;
  productId: Scalars['ID']['input'];
  variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Result of submitting a product question. */
export type ApiProductQuestionCreatePayload = {
  __typename?: 'ProductQuestionCreatePayload';
  productQuestion?: Maybe<ApiProductQuestion>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductQuestionDeletePayload = {
  __typename?: 'ProductQuestionDeletePayload';
  deletedProductQuestionId?: Maybe<Scalars['ID']['output']>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductQuestionEdge = {
  __typename?: 'ProductQuestionEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiProductQuestion;
};

/** Customer-facing orderings supported by product-question connections. */
export enum ProductQuestionSort {
  MostAnswered = 'MOST_ANSWERED',
  MostHelpful = 'MOST_HELPFUL',
  Newest = 'NEWEST',
  Oldest = 'OLDEST'
}

export type ApiProductQuestionSubscription = ApiNode & {
  __typename?: 'ProductQuestionSubscription';
  channel: ReviewNotificationChannel;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  lastNotifiedAt?: Maybe<Scalars['DateTime']['output']>;
  locale: LocaleCode;
  question: ApiProductQuestion;
  status: ProductQuestionSubscriptionStatus;
  subscriberCustomer?: Maybe<ApiCustomer>;
  updatedAt: Scalars['DateTime']['output'];
};

/**
 * Desired notification state for the current customer's product-question
 * subscription. The operation creates or updates the viewer's subscription.
 */
export type ApiProductQuestionSubscriptionSetInput = {
  channel?: InputMaybe<ReviewNotificationChannel>;
  locale?: InputMaybe<LocaleCode>;
  productQuestionId: Scalars['ID']['input'];
  subscribed: Scalars['Boolean']['input'];
};

export type ApiProductQuestionSubscriptionSetPayload = {
  __typename?: 'ProductQuestionSubscriptionSetPayload';
  subscription?: Maybe<ApiProductQuestionSubscription>;
  userErrors: Array<ApiReviewUserError>;
};

export enum ProductQuestionSubscriptionStatus {
  Active = 'ACTIVE',
  Paused = 'PAUSED',
  Unsubscribed = 'UNSUBSCRIBED'
}

/** Published question and answer aggregates for one product. */
export type ApiProductQuestionSummary = {
  __typename?: 'ProductQuestionSummary';
  answerCount: Scalars['Int']['output'];
  answeredQuestionCount: Scalars['Int']['output'];
  lastAnsweredAt?: Maybe<Scalars['DateTime']['output']>;
  lastQuestionAt?: Maybe<Scalars['DateTime']['output']>;
  officialAnswerCount: Scalars['Int']['output'];
  product: ApiProduct;
  questionCount: Scalars['Int']['output'];
  unansweredQuestionCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Customer-editable fields of an existing product question. */
export type ApiProductQuestionUpdateInput = {
  content: ApiReviewContentEditInput;
  expectedRevision: Scalars['Int']['input'];
  productQuestionId: Scalars['ID']['input'];
};

export type ApiProductQuestionUpdatePayload = {
  __typename?: 'ProductQuestionUpdatePayload';
  productQuestion?: Maybe<ApiProductQuestion>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiProductRatingCriterionSummary = {
  __typename?: 'ProductRatingCriterionSummary';
  averageRating: Scalars['Float']['output'];
  criterion: ApiReviewRatingCriterion;
  ratingBreakdown: ApiReviewRatingBreakdown;
  reviewCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Published review aggregates for one product. */
export type ApiProductReviewSummary = {
  __typename?: 'ProductReviewSummary';
  averageRating: Scalars['Float']['output'];
  criteria: Array<ApiProductRatingCriterionSummary>;
  lastReviewedAt?: Maybe<Scalars['DateTime']['output']>;
  mediaReviewCount: Scalars['Int']['output'];
  product: ApiProduct;
  ratingBreakdown: ApiReviewRatingBreakdown;
  reviewCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verifiedReviewCount: Scalars['Int']['output'];
};

/** A purchasable combination of product option values. */
export type ApiProductVariant = ApiNode & {
  __typename?: 'ProductVariant';
  availableForSale: Scalars['Boolean']['output'];
  compareAtPrice?: Maybe<ApiMoney>;
  componentConfiguration?: Maybe<ApiProductComponentConfiguration>;
  createdAt: Scalars['DateTime']['output'];
  currentlyNotInStock: Scalars['Boolean']['output'];
  dimensions?: Maybe<ApiDimensions>;
  featuredMedia?: Maybe<ApiMedia>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  inventoryItem?: Maybe<ApiInventoryItem>;
  isDefault: Scalars['Boolean']['output'];
  media: ApiProductVariantMediaConnection;
  price?: Maybe<ApiMoney>;
  product: ApiProduct;
  quantityAvailable?: Maybe<Scalars['Int']['output']>;
  questions: ApiProductQuestionConnection;
  requiresShipping: Scalars['Boolean']['output'];
  reviews: ApiReviewConnection;
  selectedOptions: Array<ApiSelectedOption>;
  sku?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  weight?: Maybe<ApiWeight>;
};


/** A purchasable combination of product option values. */
export type ApiProductVariantComponentConfigurationArgs = {
  selections?: InputMaybe<Array<ApiProductComponentSelectionInput>>;
};


/** A purchasable combination of product option values. */
export type ApiProductVariantMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A purchasable combination of product option values. */
export type ApiProductVariantQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A purchasable combination of product option values. */
export type ApiProductVariantReviewsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ReviewSort>;
};

/** A Relay connection to product variants. */
export type ApiProductVariantConnection = ApiConnection & {
  __typename?: 'ProductVariantConnection';
  edges: Array<ApiProductVariantEdge>;
  nodes: Array<ApiProductVariant>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiProductVariantEdge = {
  __typename?: 'ProductVariantEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiProductVariant;
};

/** The policy applied when a tracked variant has no sellable inventory. */
export enum ProductVariantInventoryPolicy {
  /** The variant can be purchased when inventory is unavailable. */
  Continue = 'CONTINUE',
  /** The variant cannot be purchased when inventory is unavailable. */
  Deny = 'DENY'
}

/** A Relay connection to media selected for a particular product variant. */
export type ApiProductVariantMediaConnection = ApiConnection & {
  __typename?: 'ProductVariantMediaConnection';
  edges: Array<ApiProductVariantMediaEdge>;
  nodes: Array<ApiMedia>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** An ordered media item selected for a particular product variant. */
export type ApiProductVariantMediaEdge = {
  __typename?: 'ProductVariantMediaEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiMedia;
};

/** The catalog entity purchased by a checkout line. */
export type ApiPurchasable = ApiProductVariant;

/** Public Catalog entry points for the active storefront context. */
export type ApiQuery = {
  __typename?: 'Query';
  _media?: Maybe<Scalars['Boolean']['output']>;
  /** Returns published categories using Relay cursor pagination. */
  categories: ApiCategoryConnection;
  /** Returns a published category by its globally unique Relay ID. */
  category?: Maybe<ApiCategory>;
  /** Returns a published category by its stable storefront handle. */
  categoryByHandle?: Maybe<ApiCategory>;
  /** Get a checkout by its ID. */
  checkout?: Maybe<ApiCheckout>;
  /**
   * Returns the latest durable result of a checkout placement.
   *
   * This query is suitable for restoring state after a payment-provider redirect
   * and for polling asynchronous payment completion.
   */
  checkoutPlacement?: Maybe<ApiPlaceOrderPayload>;
  /**
   * Returns the customer associated with the authenticated storefront session.
   * The customer identity is resolved from trusted request context rather than
   * from a customer ID or access token supplied as a GraphQL argument.
   */
  customer?: Maybe<ApiCustomer>;
  /** Confirms that the request carries verified Headless storefront access. */
  headlessStorefrontAccess: Scalars['Boolean']['output'];
  /** Localization resolved for the current storefront request. */
  localization: ApiLocalization;
  /** An active storefront market by its stable handle. */
  market?: Maybe<ApiMarket>;
  /** Returns any catalog object by its globally unique Relay ID. */
  node?: Maybe<ApiNode>;
  /** Returns catalog objects in the same order as the supplied Relay IDs. */
  nodes: Array<Maybe<ApiNode>>;
  /** Returns an Online Store navigation menu by its global Relay ID. */
  onlineStoreNavigationMenu?: Maybe<ApiOnlineStoreNavigationMenu>;
  /** Returns an Online Store navigation menu by its stable handle. */
  onlineStoreNavigationMenuByHandle?: Maybe<ApiOnlineStoreNavigationMenu>;
  /** Returns Online Store navigation menus using Relay cursor pagination. */
  onlineStoreNavigationMenus: ApiOnlineStoreNavigationMenuConnection;
  /** Returns a published Online Store page by its global Relay ID. */
  onlineStorePage?: Maybe<ApiOnlineStorePage>;
  /** Returns a published Online Store page by its stable URL handle. */
  onlineStorePageByHandle?: Maybe<ApiOnlineStorePage>;
  /** Returns published Online Store pages using Relay cursor pagination. */
  onlineStorePages: ApiOnlineStorePageConnection;
  /**
   * Returns an order owned by the authenticated customer.
   *
   * Customer ownership and store scope are resolved from trusted storefront
   * context. An inaccessible order is returned as null.
   */
  order?: Maybe<ApiOrder>;
  /** Returns a return request owned by the authenticated customer. */
  orderReturnRequest?: Maybe<ApiOrderReturnRequest>;
  /** Returns a published product by its globally unique Relay ID. */
  product?: Maybe<ApiProduct>;
  /** Returns a published product by its stable storefront handle. */
  productByHandle?: Maybe<ApiProduct>;
  /** Returns a product question visible in the current storefront context. */
  productQuestion?: Maybe<ApiProductQuestion>;
  /** Returns a published product-question answer by its global ID. */
  productQuestionAnswer?: Maybe<ApiProductQuestionAnswer>;
  /** Returns a published product variant by its globally unique Relay ID. */
  productVariant?: Maybe<ApiProductVariant>;
  /**
   * Returns published products from the GLOBAL listing scope.
   *
   * The result uses the locale, currency, market, channel, and publication rules
   * from the active storefront context. Facets configured for SEARCH scope are
   * exposed because this request has no category context. The default sort is
   * NEWEST; MANUAL and RELEVANCE are not valid for this entry point.
   */
  products: ApiProductConnection;
  /** Returns a review visible in the current storefront context. */
  review?: Maybe<ApiReview>;
  /** Returns a published review reply by its global ID. */
  reviewReply?: Maybe<ApiReviewReply>;
  /** Returns a review request owned by the authenticated customer. */
  reviewRequest?: Maybe<ApiReviewRequest>;
  /** Storefront capabilities and limits for reviews and product questions. */
  reviewStoreConfiguration?: Maybe<ApiReviewStoreConfiguration>;
  /**
   * Search published products.
   *
   * Search uses the locale and currency from the active storefront context. The
   * query must contain 1-128 Unicode code points after whitespace normalization.
   * The contextual default sort is RELEVANCE.
   */
  searchProducts: ApiProductConnection;
  /** Retrieves the current authentication session. */
  session?: Maybe<ApiSession>;
  /** The store selected by the trusted storefront request context. */
  store: ApiStore;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryCategoryByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryCheckoutArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryCheckoutPlacementArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryMarketArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryNodesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStoreNavigationMenuArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStoreNavigationMenuByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStoreNavigationMenusArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStorePageArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStorePageByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOnlineStorePagesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOrderArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryOrderReturnRequestArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductQuestionArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductQuestionAnswerArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductVariantArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<Array<ApiListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ListingSort>;
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryReviewArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryReviewReplyArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQueryReviewRequestArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type ApiQuerySearchProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<Array<ApiListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sort?: InputMaybe<ListingSort>;
};

/** Input data for resetting a password using a token. */
export type ApiResetPasswordInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  email: Scalars['Email']['input'];
  /** New password. */
  password: Scalars['String']['input'];
  /** Password reset token sent to the email. */
  token: Scalars['String']['input'];
};

/** Payload returned after resetting the password. */
export type ApiResetPasswordPayload = {
  __typename?: 'ResetPasswordPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** True if the password was reset successfully. */
  success: Scalars['Boolean']['output'];
};

export type ApiReview = ApiNode & ApiReviewContent & {
  __typename?: 'Review';
  author: ApiReviewContentAuthor;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  incentiveDisclosure?: Maybe<Scalars['String']['output']>;
  isIncentivized: Scalars['Boolean']['output'];
  isVerifiedPurchase: Scalars['Boolean']['output'];
  kind: ReviewContentKind;
  locale: LocaleCode;
  media: Array<ApiReviewMedia>;
  metrics: ApiReviewContentMetrics;
  product: ApiProduct;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  rating: Scalars['Int']['output'];
  ratings: Array<ApiReviewRating>;
  replies: ApiReviewReplyConnection;
  revision: Scalars['Int']['output'];
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  translations: Array<ApiReviewContentTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  variant?: Maybe<ApiProductVariant>;
  verificationStatus: ReviewVerificationStatus;
  viewerCapabilities: ApiReviewContentViewerCapabilities;
  viewerEngagement: ApiReviewContentViewerEngagement;
};


export type ApiReviewRepliesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A Relay connection to product reviews. */
export type ApiReviewConnection = ApiConnection & {
  __typename?: 'ReviewConnection';
  edges: Array<ApiReviewEdge>;
  nodes: Array<ApiReview>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Shared storefront contract for reviews, replies, questions, and answers. */
export type ApiReviewContent = {
  author: ApiReviewContentAuthor;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  kind: ReviewContentKind;
  locale: LocaleCode;
  metrics: ApiReviewContentMetrics;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  revision: Scalars['Int']['output'];
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  translations: Array<ApiReviewContentTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  viewerCapabilities: ApiReviewContentViewerCapabilities;
  viewerEngagement: ApiReviewContentViewerEngagement;
};

/** Privacy-safe author snapshot rendered with storefront content. */
export type ApiReviewContentAuthor = {
  __typename?: 'ReviewContentAuthor';
  customer?: Maybe<ApiCustomer>;
  displayName: Scalars['String']['output'];
  type: ReviewContentAuthorType;
};

/** The identity class used to present a content author. */
export enum ReviewContentAuthorType {
  Customer = 'CUSTOMER',
  External = 'EXTERNAL',
  Guest = 'GUEST',
  Seller = 'SELLER',
  Staff = 'STAFF',
  System = 'SYSTEM'
}

export type ApiReviewContentConnection = ApiConnection & {
  __typename?: 'ReviewContentConnection';
  edges: Array<ApiReviewContentEdge>;
  nodes: Array<ApiReviewContent>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Optimistic input used to delete content owned by the current customer. */
export type ApiReviewContentDeleteInput = {
  expectedRevision: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
};

export type ApiReviewContentEdge = {
  __typename?: 'ReviewContentEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewContent;
};

/** Customer-editable text fields shared by reviews, questions, and answers. */
export type ApiReviewContentEditInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  locale?: InputMaybe<LocaleCode>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type ApiReviewContentExternalReference = ApiNode & {
  __typename?: 'ReviewContentExternalReference';
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  direction: ReviewExternalSyncDirection;
  externalId: Scalars['String']['output'];
  externalSystem: Scalars['String']['output'];
  externalType: Scalars['String']['output'];
  externalUrl?: Maybe<Scalars['URL']['output']>;
  id: Scalars['ID']['output'];
  lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  metadata: Scalars['JSON']['output'];
  syncStatus: ReviewExternalSyncStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiReviewContentExternalReferenceConnection = ApiConnection & {
  __typename?: 'ReviewContentExternalReferenceConnection';
  edges: Array<ApiReviewContentExternalReferenceEdge>;
  nodes: Array<ApiReviewContentExternalReference>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewContentExternalReferenceEdge = {
  __typename?: 'ReviewContentExternalReferenceEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewContentExternalReference;
};

/** The concrete Reviews aggregate represented by a content node. */
export enum ReviewContentKind {
  ProductQuestion = 'PRODUCT_QUESTION',
  QuestionAnswer = 'QUESTION_ANSWER',
  Review = 'REVIEW',
  ReviewReply = 'REVIEW_REPLY'
}

/** Counters maintained for fast storefront rendering. */
export type ApiReviewContentMetrics = {
  __typename?: 'ReviewContentMetrics';
  acceptedChildCount: Scalars['Int']['output'];
  childCount: Scalars['Int']['output'];
  dislikeCount: Scalars['Int']['output'];
  lastChildAt?: Maybe<Scalars['DateTime']['output']>;
  likeCount: Scalars['Int']['output'];
  mediaCount: Scalars['Int']['output'];
  officialChildCount: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiReviewContentPublication = ApiNode & {
  __typename?: 'ReviewContentPublication';
  channel: Scalars['String']['output'];
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  locale?: Maybe<LocaleCode>;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  status: ReviewPublicationStatus;
  unpublishedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/** A report submitted against storefront content. */
export type ApiReviewContentReport = ApiNode & {
  __typename?: 'ReviewContentReport';
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  reason: ReviewContentReportReason;
  reporterCustomer?: Maybe<ApiCustomer>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  status: ReviewContentReportStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiReviewContentReportConnection = ApiConnection & {
  __typename?: 'ReviewContentReportConnection';
  edges: Array<ApiReviewContentReportEdge>;
  nodes: Array<ApiReviewContentReport>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

/** Input for reporting storefront review content to moderation. */
export type ApiReviewContentReportCreateInput = {
  /** Review, reply, product question, or question answer being reported. */
  contentId: Scalars['ID']['input'];
  /**
   * Additional customer-provided context, limited to 2,000 characters. Details
   * are required when reason is OTHER.
   */
  details?: InputMaybe<Scalars['String']['input']>;
  reason: ReviewContentReportReason;
};

/** Result of submitting a storefront content report. */
export type ApiReviewContentReportCreatePayload = {
  __typename?: 'ReviewContentReportCreatePayload';
  /** Reported content with refreshed viewer engagement. */
  content?: Maybe<ApiReviewContent>;
  /**
   * The viewer's active report. An existing active report is returned when the
   * same logical submission is safely retried.
   */
  report?: Maybe<ApiReviewContentReport>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiReviewContentReportEdge = {
  __typename?: 'ReviewContentReportEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewContentReport;
};

export enum ReviewContentReportReason {
  ConflictOfInterest = 'CONFLICT_OF_INTEREST',
  FraudOrScam = 'FRAUD_OR_SCAM',
  Harassment = 'HARASSMENT',
  HateSpeech = 'HATE_SPEECH',
  IllegalContent = 'ILLEGAL_CONTENT',
  IntellectualProperty = 'INTELLECTUAL_PROPERTY',
  NotRelevant = 'NOT_RELEVANT',
  Offensive = 'OFFENSIVE',
  Other = 'OTHER',
  PersonalInformation = 'PERSONAL_INFORMATION',
  Spam = 'SPAM'
}

export enum ReviewContentReportStatus {
  Actioned = 'ACTIONED',
  Dismissed = 'DISMISSED',
  Open = 'OPEN',
  UnderReview = 'UNDER_REVIEW'
}

/** A revision of content owned by the current customer. */
export type ApiReviewContentRevision = ApiNode & {
  __typename?: 'ReviewContentRevision';
  changeReason?: Maybe<Scalars['String']['output']>;
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  revision: Scalars['Int']['output'];
};

export type ApiReviewContentRevisionConnection = ApiConnection & {
  __typename?: 'ReviewContentRevisionConnection';
  edges: Array<ApiReviewContentRevisionEdge>;
  nodes: Array<ApiReviewContentRevision>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewContentRevisionEdge = {
  __typename?: 'ReviewContentRevisionEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewContentRevision;
};

/** The public lifecycle state of customer-authored content. */
export enum ReviewContentStatus {
  Pending = 'PENDING',
  Published = 'PUBLISHED',
  Rejected = 'REJECTED'
}

/** Shared text and request metadata for customer-authored content. */
export type ApiReviewContentSubmissionInput = {
  /**
   * Guest author details. Required for a guest request and optional for an
   * authenticated customer request.
   */
  author?: InputMaybe<ApiReviewSubmissionAuthorInput>;
  /** Customer-authored body text, limited to 5,000 characters. */
  body: Scalars['String']['input'];
  /**
   * Client-generated opaque key used to safely replay the submission.
   * The key must be unique within the active store.
   */
  idempotencyKey: Scalars['String']['input'];
  /**
   * Submission locale. When omitted, the locale from trusted storefront context
   * is used.
   */
  locale?: InputMaybe<LocaleCode>;
};

export type ApiReviewContentTranslation = ApiNode & {
  __typename?: 'ReviewContentTranslation';
  body: Scalars['String']['output'];
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  locale: LocaleCode;
  revision: Scalars['Int']['output'];
  source: ReviewTranslationSource;
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

/**
 * Actions the current storefront viewer may perform on this content.
 *
 * Ownership, moderation state, and the configured edit window are already
 * applied, so storefront clients do not need to reproduce authorization rules.
 */
export type ApiReviewContentViewerCapabilities = {
  __typename?: 'ReviewContentViewerCapabilities';
  canDelete: Scalars['Boolean']['output'];
  canUpdate: Scalars['Boolean']['output'];
  editableUntil?: Maybe<Scalars['DateTime']['output']>;
};

/** Request-scoped engagement state for the current storefront visitor. */
export type ApiReviewContentViewerEngagement = {
  __typename?: 'ReviewContentViewerEngagement';
  hasReported: Scalars['Boolean']['output'];
  vote?: Maybe<ReviewContentVoteType>;
};

export type ApiReviewContentVote = ApiNode & {
  __typename?: 'ReviewContentVote';
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  type: ReviewContentVoteType;
  updatedAt: Scalars['DateTime']['output'];
  voterCustomer?: Maybe<ApiCustomer>;
};

export type ApiReviewContentVoteConnection = ApiConnection & {
  __typename?: 'ReviewContentVoteConnection';
  edges: Array<ApiReviewContentVoteEdge>;
  nodes: Array<ApiReviewContentVote>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewContentVoteEdge = {
  __typename?: 'ReviewContentVoteEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewContentVote;
};

/** Input for removing the current viewer's reaction from review content. */
export type ApiReviewContentVoteRemoveInput = {
  contentId: Scalars['ID']['input'];
};

/** Result of removing the current viewer's reaction. */
export type ApiReviewContentVoteRemovePayload = {
  __typename?: 'ReviewContentVoteRemovePayload';
  content?: Maybe<ApiReviewContent>;
  removedVoteId?: Maybe<Scalars['ID']['output']>;
  userErrors: Array<ApiReviewUserError>;
};

/** Input for setting the current viewer's reaction to review content. */
export type ApiReviewContentVoteSetInput = {
  /** Review, reply, product question, or question answer to vote on. */
  contentId: Scalars['ID']['input'];
  type: ReviewContentVoteType;
};

/** Result of setting or replacing the current viewer's vote. */
export type ApiReviewContentVoteSetPayload = {
  __typename?: 'ReviewContentVoteSetPayload';
  /** Updated content with refreshed metrics and viewer engagement. */
  content?: Maybe<ApiReviewContent>;
  userErrors: Array<ApiReviewUserError>;
  /** The current viewer's resulting vote. */
  vote?: Maybe<ApiReviewContentVote>;
};

export enum ReviewContentVoteType {
  Dislike = 'DISLIKE',
  Like = 'LIKE'
}

/** Input for a customer or guest product-review submission. */
export type ApiReviewCreateInput = {
  /** Shared text, locale, guest identity, and idempotency metadata. */
  content: ApiReviewContentSubmissionInput;
  /** Review media in storefront display order. */
  media?: InputMaybe<Array<ApiReviewMediaCreateInput>>;
  /**
   * Order associated with the review. Ownership and eligibility are validated by
   * the service and cannot be used to self-assign verified-purchase status.
   */
  orderId?: InputMaybe<Scalars['ID']['input']>;
  /** Order line associated with the reviewed product or variant. */
  orderLineId?: InputMaybe<Scalars['ID']['input']>;
  productId: Scalars['ID']['input'];
  /** Overall rating from 1 through 5. */
  rating: Scalars['Int']['input'];
  /** Detailed values for the product's active rating criteria. */
  ratings?: InputMaybe<Array<ApiReviewRatingValueInput>>;
  /** Optional review title, limited to 150 characters. */
  title?: InputMaybe<Scalars['String']['input']>;
  variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Result of submitting a product review. */
export type ApiReviewCreatePayload = {
  __typename?: 'ReviewCreatePayload';
  review?: Maybe<ApiReview>;
  userErrors: Array<ApiReviewUserError>;
};

export type ApiReviewDeletePayload = {
  __typename?: 'ReviewDeletePayload';
  deletedReviewId?: Maybe<Scalars['ID']['output']>;
  userErrors: Array<ApiReviewUserError>;
};

export enum ReviewDuplicatePolicy {
  AllowMultiple = 'ALLOW_MULTIPLE',
  OnePerOrderLine = 'ONE_PER_ORDER_LINE',
  OnePerProduct = 'ONE_PER_PRODUCT'
}

export type ApiReviewEdge = {
  __typename?: 'ReviewEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReview;
};

export enum ReviewExternalSyncDirection {
  Bidirectional = 'BIDIRECTIONAL',
  Export = 'EXPORT',
  Import = 'IMPORT'
}

export enum ReviewExternalSyncStatus {
  Disabled = 'DISABLED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Synced = 'SYNCED'
}

export type ApiReviewMedia = ApiNode & {
  __typename?: 'ReviewMedia';
  caption?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  media: ApiMedia;
  review: ApiReview;
  sortIndex: Scalars['Int']['output'];
  status: ReviewContentStatus;
  updatedAt: Scalars['DateTime']['output'];
};

/** One media attachment submitted with a review. */
export type ApiReviewMediaCreateInput = {
  caption?: InputMaybe<Scalars['String']['input']>;
  mediaId: Scalars['ID']['input'];
  /** Zero-based display position. Defaults to the input list position. */
  sortIndex?: InputMaybe<Scalars['Int']['input']>;
};

export enum ReviewModerationAction {
  Assigned = 'ASSIGNED',
  AutoFlagged = 'AUTO_FLAGGED',
  Deleted = 'DELETED',
  Edited = 'EDITED',
  Published = 'PUBLISHED',
  Redacted = 'REDACTED',
  Rejected = 'REJECTED',
  Restored = 'RESTORED',
  Submitted = 'SUBMITTED'
}

/** A moderation case associated with content owned by the current customer. */
export type ApiReviewModerationCase = ApiNode & {
  __typename?: 'ReviewModerationCase';
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  dueAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  priority: Scalars['Int']['output'];
  reasonCode: Scalars['String']['output'];
  resolutionCode?: Maybe<Scalars['String']['output']>;
  resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  status: ReviewModerationCaseStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type ApiReviewModerationCaseConnection = ApiConnection & {
  __typename?: 'ReviewModerationCaseConnection';
  edges: Array<ApiReviewModerationCaseEdge>;
  nodes: Array<ApiReviewModerationCase>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewModerationCaseEdge = {
  __typename?: 'ReviewModerationCaseEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewModerationCase;
};

export enum ReviewModerationCaseStatus {
  Cancelled = 'CANCELLED',
  InReview = 'IN_REVIEW',
  Open = 'OPEN',
  Resolved = 'RESOLVED'
}

/** An append-only public lifecycle event for moderated content. */
export type ApiReviewModerationEvent = ApiNode & {
  __typename?: 'ReviewModerationEvent';
  action: ReviewModerationAction;
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  fromStatus?: Maybe<ReviewContentStatus>;
  id: Scalars['ID']['output'];
  isAutomated: Scalars['Boolean']['output'];
  moderationCase?: Maybe<ApiReviewModerationCase>;
  reasonCode?: Maybe<Scalars['String']['output']>;
  toStatus?: Maybe<ReviewContentStatus>;
};

export type ApiReviewModerationEventConnection = ApiConnection & {
  __typename?: 'ReviewModerationEventConnection';
  edges: Array<ApiReviewModerationEventEdge>;
  nodes: Array<ApiReviewModerationEvent>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewModerationEventEdge = {
  __typename?: 'ReviewModerationEventEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewModerationEvent;
};

export enum ReviewModerationMode {
  Automated = 'AUTOMATED',
  Postmoderation = 'POSTMODERATION',
  Premoderation = 'PREMODERATION'
}

/** Automated moderation evidence associated with customer-owned content. */
export type ApiReviewModerationSignal = ApiNode & {
  __typename?: 'ReviewModerationSignal';
  content: ApiReviewContent;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  modelVersion?: Maybe<Scalars['String']['output']>;
  provider: Scalars['String']['output'];
  score?: Maybe<Scalars['Float']['output']>;
  signalType: Scalars['String']['output'];
  verdict: ReviewModerationVerdict;
};

export type ApiReviewModerationSignalConnection = ApiConnection & {
  __typename?: 'ReviewModerationSignalConnection';
  edges: Array<ApiReviewModerationSignalEdge>;
  nodes: Array<ApiReviewModerationSignal>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewModerationSignalEdge = {
  __typename?: 'ReviewModerationSignalEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewModerationSignal;
};

export enum ReviewModerationVerdict {
  Block = 'BLOCK',
  Pass = 'PASS',
  Review = 'REVIEW'
}

export enum ReviewNotificationChannel {
  Email = 'EMAIL',
  InApp = 'IN_APP',
  Push = 'PUSH',
  Sms = 'SMS'
}

export enum ReviewPublicationStatus {
  Draft = 'DRAFT',
  Failed = 'FAILED',
  Published = 'PUBLISHED',
  Scheduled = 'SCHEDULED',
  Unpublished = 'UNPUBLISHED'
}

export type ApiReviewRating = {
  __typename?: 'ReviewRating';
  createdAt: Scalars['DateTime']['output'];
  criterion: ApiReviewRatingCriterion;
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['Int']['output'];
};

/** Distribution of reviews across the five supported rating values. */
export type ApiReviewRatingBreakdown = {
  __typename?: 'ReviewRatingBreakdown';
  rating1Count: Scalars['Int']['output'];
  rating2Count: Scalars['Int']['output'];
  rating3Count: Scalars['Int']['output'];
  rating4Count: Scalars['Int']['output'];
  rating5Count: Scalars['Int']['output'];
};

/** A localized rating dimension such as quality, fit, or value. */
export type ApiReviewRatingCriterion = ApiNode & {
  __typename?: 'ReviewRatingCriterion';
  appliesToAllProducts: Scalars['Boolean']['output'];
  assignments: Array<ApiReviewRatingCriterionAssignment>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultDescription?: Maybe<Scalars['String']['output']>;
  defaultTitle: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  sortIndex: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  translations: Array<ApiReviewRatingCriterionTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  weight: Scalars['Float']['output'];
};

export type ApiReviewRatingCriterionAssignment = ApiNode & {
  __typename?: 'ReviewRatingCriterionAssignment';
  createdAt: Scalars['DateTime']['output'];
  criterion: ApiReviewRatingCriterion;
  id: Scalars['ID']['output'];
  isRequired: Scalars['Boolean']['output'];
  sortIndex: Scalars['Int']['output'];
  target: ApiReviewRatingCriterionTarget;
  targetType: ReviewRatingCriterionTargetType;
};

/** A Relay connection to rating criteria applicable in the current context. */
export type ApiReviewRatingCriterionConnection = ApiConnection & {
  __typename?: 'ReviewRatingCriterionConnection';
  edges: Array<ApiReviewRatingCriterionEdge>;
  nodes: Array<ApiReviewRatingCriterion>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewRatingCriterionEdge = {
  __typename?: 'ReviewRatingCriterionEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewRatingCriterion;
};

export type ApiReviewRatingCriterionTarget = ApiCategory | ApiProduct;

export enum ReviewRatingCriterionTargetType {
  Category = 'CATEGORY',
  Product = 'PRODUCT'
}

export type ApiReviewRatingCriterionTranslation = {
  __typename?: 'ReviewRatingCriterionTranslation';
  description?: Maybe<Scalars['String']['output']>;
  locale: LocaleCode;
  title: Scalars['String']['output'];
};

/** One detailed rating value supplied for an active product criterion. */
export type ApiReviewRatingValueInput = {
  criterionId: Scalars['ID']['input'];
  /** Rating from 1 through 5. */
  value: Scalars['Int']['input'];
};

export type ApiReviewReply = ApiNode & ApiReviewContent & {
  __typename?: 'ReviewReply';
  author: ApiReviewContentAuthor;
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isOfficial: Scalars['Boolean']['output'];
  kind: ReviewContentKind;
  locale: LocaleCode;
  metrics: ApiReviewContentMetrics;
  publishedAt?: Maybe<Scalars['DateTime']['output']>;
  review: ApiReview;
  revision: Scalars['Int']['output'];
  sortIndex: Scalars['Int']['output'];
  status: ReviewContentStatus;
  title?: Maybe<Scalars['String']['output']>;
  translations: Array<ApiReviewContentTranslation>;
  updatedAt: Scalars['DateTime']['output'];
  viewerCapabilities: ApiReviewContentViewerCapabilities;
  viewerEngagement: ApiReviewContentViewerEngagement;
};

export type ApiReviewReplyConnection = ApiConnection & {
  __typename?: 'ReviewReplyConnection';
  edges: Array<ApiReviewReplyEdge>;
  nodes: Array<ApiReviewReply>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewReplyEdge = {
  __typename?: 'ReviewReplyEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewReply;
};

/** A customer-facing invitation to review a purchased product. */
export type ApiReviewRequest = ApiNode & {
  __typename?: 'ReviewRequest';
  attemptCount: Scalars['Int']['output'];
  channel: ReviewNotificationChannel;
  createdAt: Scalars['DateTime']['output'];
  customer: ApiCustomer;
  deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  events: ApiReviewRequestEventConnection;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  locale: LocaleCode;
  openedAt?: Maybe<Scalars['DateTime']['output']>;
  product: ApiProduct;
  review?: Maybe<ApiReview>;
  scheduledAt: Scalars['DateTime']['output'];
  sentAt?: Maybe<Scalars['DateTime']['output']>;
  status: ReviewRequestStatus;
  submittedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  variant?: Maybe<ApiProductVariant>;
};


/** A customer-facing invitation to review a purchased product. */
export type ApiReviewRequestEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ApiReviewRequestConnection = ApiConnection & {
  __typename?: 'ReviewRequestConnection';
  edges: Array<ApiReviewRequestEdge>;
  nodes: Array<ApiReviewRequest>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewRequestEdge = {
  __typename?: 'ReviewRequestEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewRequest;
};

export type ApiReviewRequestEvent = ApiNode & {
  __typename?: 'ReviewRequestEvent';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  occurredAt: Scalars['DateTime']['output'];
  reviewRequest: ApiReviewRequest;
  type: ReviewRequestEventType;
};

export type ApiReviewRequestEventConnection = ApiConnection & {
  __typename?: 'ReviewRequestEventConnection';
  edges: Array<ApiReviewRequestEventEdge>;
  nodes: Array<ApiReviewRequestEvent>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiReviewRequestEventEdge = {
  __typename?: 'ReviewRequestEventEdge';
  cursor: Scalars['Cursor']['output'];
  node: ApiReviewRequestEvent;
};

export enum ReviewRequestEventType {
  Bounced = 'BOUNCED',
  Cancelled = 'CANCELLED',
  Clicked = 'CLICKED',
  Complained = 'COMPLAINED',
  Delivered = 'DELIVERED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Opened = 'OPENED',
  Scheduled = 'SCHEDULED',
  Sent = 'SENT',
  Submitted = 'SUBMITTED'
}

export enum ReviewRequestStatus {
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Opened = 'OPENED',
  Scheduled = 'SCHEDULED',
  Sent = 'SENT',
  Submitted = 'SUBMITTED'
}

/** Customer-facing orderings supported by review connections. */
export enum ReviewSort {
  HighestRating = 'HIGHEST_RATING',
  LowestRating = 'LOWEST_RATING',
  MostHelpful = 'MOST_HELPFUL',
  Newest = 'NEWEST',
  Oldest = 'OLDEST'
}

export type ApiReviewStoreConfiguration = ApiNode & {
  __typename?: 'ReviewStoreConfiguration';
  answerEditWindowHours: Scalars['Int']['output'];
  answerModerationMode: ReviewModerationMode;
  createdAt: Scalars['DateTime']['output'];
  customerAnswersEnabled: Scalars['Boolean']['output'];
  guestQuestionsEnabled: Scalars['Boolean']['output'];
  guestReviewsEnabled: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  maxAnswersPerQuestion: Scalars['Int']['output'];
  maxReviewMediaCount: Scalars['Int']['output'];
  questionEditWindowHours: Scalars['Int']['output'];
  questionModerationMode: ReviewModerationMode;
  questionsEnabled: Scalars['Boolean']['output'];
  reviewDuplicatePolicy: ReviewDuplicatePolicy;
  reviewEditWindowHours: Scalars['Int']['output'];
  reviewModerationMode: ReviewModerationMode;
  reviewRequestDelayDays: Scalars['Int']['output'];
  reviewRequestExpiryDays: Scalars['Int']['output'];
  reviewRequestsEnabled: Scalars['Boolean']['output'];
  reviewsEnabled: Scalars['Boolean']['output'];
  revision: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  verifiedPurchaseRequired: Scalars['Boolean']['output'];
};

/**
 * Guest identity supplied for a storefront content submission.
 *
 * Authenticated customer identity is always taken from trusted request context;
 * when a customer is authenticated this input is ignored.
 */
export type ApiReviewSubmissionAuthorInput = {
  /** Public display name shown alongside the submitted content. */
  displayName: Scalars['String']['input'];
  /** Contact email required for guest submissions and never exposed publicly. */
  email?: InputMaybe<Scalars['Email']['input']>;
};

export enum ReviewTranslationSource {
  Human = 'HUMAN',
  Import = 'IMPORT',
  Machine = 'MACHINE'
}

/** Customer-editable fields of an existing review. */
export type ApiReviewUpdateInput = {
  content?: InputMaybe<ApiReviewContentEditInput>;
  expectedRevision: Scalars['Int']['input'];
  /** Complete media replacement when supplied. An empty list removes media. */
  media?: InputMaybe<Array<ApiReviewMediaCreateInput>>;
  /** New overall rating from 1 through 5. */
  rating?: InputMaybe<Scalars['Int']['input']>;
  /** Complete detailed criterion rating replacement when supplied. */
  ratings?: InputMaybe<Array<ApiReviewRatingValueInput>>;
  reviewId: Scalars['ID']['input'];
};

export type ApiReviewUpdatePayload = {
  __typename?: 'ReviewUpdatePayload';
  review?: Maybe<ApiReview>;
  userErrors: Array<ApiReviewUserError>;
};

/** A customer-facing mutation error safe to display in a storefront. */
export type ApiReviewUserError = ApiDisplayableError & {
  __typename?: 'ReviewUserError';
  /** Stable machine-readable error code. */
  code?: Maybe<Scalars['String']['output']>;
  /** Path to the invalid input field, when available. */
  field?: Maybe<Array<Scalars['String']['output']>>;
  /** Human-readable error message. */
  message: Scalars['String']['output'];
};

export enum ReviewVerificationStatus {
  Revoked = 'REVOKED',
  Unverified = 'UNVERIFIED',
  Verified = 'VERIFIED'
}

/** Localized rich text in plain text, HTML, and structured JSON formats. */
export type ApiRichText = {
  __typename?: 'RichText';
  html: Scalars['HTML']['output'];
  json: Scalars['JSON']['output'];
  text: Scalars['String']['output'];
};

/** Search-engine and social-sharing metadata. */
export type ApiSeo = {
  __typename?: 'SEO';
  description?: Maybe<Scalars['String']['output']>;
  openGraph: ApiOpenGraphMetadata;
  title?: Maybe<Scalars['String']['output']>;
};

/** A resolved option/value pair selected by a product variant. */
export type ApiSelectedOption = {
  __typename?: 'SelectedOption';
  name: Scalars['String']['output'];
  option: ApiProductOption;
  optionValue: ApiProductOptionValue;
  value: Scalars['String']['output'];
};

/** Stable option and value handles used to resolve a product variant. */
export type ApiSelectedOptionInput = {
  option: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

/** Represents an authentication session. */
export type ApiSession = {
  __typename?: 'Session';
  /** JWT access token for authenticating subsequent requests. */
  accessToken?: Maybe<Scalars['String']['output']>;
  /** The authenticated user. */
  user: ApiUser;
};

export type ApiStore = ApiNode & {
  __typename?: 'Store';
  address?: Maybe<ApiStoreAddress>;
  brand: ApiStoreBrand;
  contact?: Maybe<ApiStoreContact>;
  defaultCurrency: CurrencyCode;
  defaultLocale: LocaleCode;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  markets: ApiMarketConnection;
  name: Scalars['String']['output'];
  timezone: Scalars['String']['output'];
};


export type ApiStoreMarketsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ApiStoreAddress = {
  __typename?: 'StoreAddress';
  address1?: Maybe<Scalars['String']['output']>;
  address2?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  companyName?: Maybe<Scalars['String']['output']>;
  countryCode: CountryCode;
  postalCode?: Maybe<Scalars['String']['output']>;
  province?: Maybe<Scalars['String']['output']>;
};

export type ApiStoreBrand = {
  __typename?: 'StoreBrand';
  coverImage?: Maybe<ApiMediaImage>;
  logo?: Maybe<ApiMediaImage>;
  primaryColor: Scalars['Color']['output'];
  secondaryColor: Scalars['Color']['output'];
  shortDescription?: Maybe<Scalars['String']['output']>;
  slogan?: Maybe<Scalars['String']['output']>;
  socialLinks: Array<ApiStoreSocialLink>;
  squareLogo?: Maybe<ApiMediaImage>;
};

export type ApiStoreContact = {
  __typename?: 'StoreContact';
  email?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phoneNumbers: Array<Scalars['String']['output']>;
};

export type ApiStoreSocialLink = {
  __typename?: 'StoreSocialLink';
  platform: Scalars['String']['output'];
  url: Scalars['URL']['output'];
};

export enum SwatchType {
  Color = 'COLOR',
  Gradient = 'GRADIENT'
}

/** A localized, stable label used to organize and filter products. */
export type ApiTag = ApiNode & {
  __typename?: 'Tag';
  handle: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** Represents a user in the system. */
export type ApiUser = ApiNode & {
  __typename?: 'User';
  /** User's email address. */
  email: Scalars['Email']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Whether the user's email has been verified. */
  isVerified: Scalars['Boolean']['output'];
  /** Preferred interface language (locale code). */
  language?: Maybe<LocaleCode>;
  /** Full name of the user. */
  name: ApiUserName;
  /** List of the user's orders. */
  orders: Array<ApiOrder>;
  /** Phone number in E.164 format. */
  phone?: Maybe<Scalars['Phone']['output']>;
};

/** Represents a generic error in the input of a mutation. */
export type ApiUserError = ApiDisplayableError & {
  __typename?: 'UserError';
  field?: Maybe<Array<Scalars['String']['output']>>;
  message: Scalars['String']['output'];
};

/** Customer's first, middle, and last name. */
export type ApiUserName = {
  __typename?: 'UserName';
  /** First name. */
  first: Scalars['String']['output'];
  /** Last name. */
  last: Scalars['String']['output'];
  /** Middle name (optional). */
  middle?: Maybe<Scalars['String']['output']>;
};

/** The brand, manufacturer, or supplier associated with a product. */
export type ApiVendor = ApiNode & {
  __typename?: 'Vendor';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

/** A video hosted on the platform's servers. */
export type ApiVideo = ApiMedia & ApiNode & {
  __typename?: 'Video';
  alt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  mediaContentType: MediaContentType;
  presentation?: Maybe<ApiMediaPresentation>;
  previewImage?: Maybe<ApiImage>;
  sources: Array<ApiVideoSource>;
};

/** A source for a hosted video. */
export type ApiVideoSource = {
  __typename?: 'VideoSource';
  format: Scalars['String']['output'];
  height: Scalars['Int']['output'];
  mimeType: Scalars['String']['output'];
  url: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

/** A weight measurement expressed in a supported unit. */
export type ApiWeight = {
  __typename?: 'Weight';
  unit: WeightUnit;
  value: Scalars['Float']['output'];
};

/** Weight measurement units */
export enum WeightUnit {
  /** Gram */
  G = 'g',
  /** Kilogram */
  Kg = 'kg',
  /** Pound */
  Lb = 'lb',
  /** Ounce */
  Oz = 'oz'
}

export enum Join__Graph {
  AppsHeadlessStorefront = 'APPS_HEADLESS_STOREFRONT',
  AppsOnlineStoreStorefront = 'APPS_ONLINE_STORE_STOREFRONT',
  CatalogStorefront = 'CATALOG_STOREFRONT',
  CheckoutStorefront = 'CHECKOUT_STOREFRONT',
  CustomersStorefront = 'CUSTOMERS_STOREFRONT',
  ListingStorefront = 'LISTING_STOREFRONT',
  MediaStorefront = 'MEDIA_STOREFRONT',
  OrdersStorefront = 'ORDERS_STOREFRONT',
  ProjectStorefront = 'PROJECT_STOREFRONT',
  ReviewsStorefront = 'REVIEWS_STOREFRONT'
}

export enum Link__Purpose {
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  Execution = 'EXECUTION',
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  Security = 'SECURITY'
}
