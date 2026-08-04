import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
  Decimal: { input: any; output: any; }
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
export type Availability =
  | 'AVAILABLE'
  | 'UNAVAILABLE';

/** A published category in the storefront catalog hierarchy. */
export type Category = Node & {
  readonly __typename: 'Category';
  readonly ancestors: ReadonlyArray<Category>;
  readonly children: CategoryConnection;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly description?: Maybe<RichText>;
  readonly excerpt?: Maybe<RichText>;
  readonly featuredMedia?: Maybe<Media>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly media: CategoryMediaConnection;
  readonly name: Scalars['String']['output'];
  readonly parent?: Maybe<Category>;
  /**
   * Products published in this category.
   *
   * When query is provided, text search is applied inside the category scope.
   * With no query the contextual default sort is MANUAL. With a non-empty query
   * it is RELEVANCE.
   */
  readonly products: ProductConnection;
  readonly publishedAt: Scalars['DateTime']['output'];
  readonly seo: Seo;
  readonly updatedAt: Scalars['DateTime']['output'];
};


/** A published category in the storefront catalog hierarchy. */
export type CategoryChildrenArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published category in the storefront catalog hierarchy. */
export type CategoryMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published category in the storefront catalog hierarchy. */
export type CategoryProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ListingSort>;
};

/** A Relay connection to categories. */
export type CategoryConnection = Connection & {
  readonly __typename: 'CategoryConnection';
  readonly edges: ReadonlyArray<CategoryEdge>;
  readonly nodes: ReadonlyArray<Category>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** A category and its opaque position in a category connection. */
export type CategoryEdge = {
  readonly __typename: 'CategoryEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Category;
};

/** A Relay connection to the media registered on a category. */
export type CategoryMediaConnection = Connection & {
  readonly __typename: 'CategoryMediaConnection';
  readonly edges: ReadonlyArray<CategoryMediaEdge>;
  readonly nodes: ReadonlyArray<Media>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a category. */
export type CategoryMediaEdge = {
  readonly __typename: 'CategoryMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Media;
};

/** A checkout with multiple items. */
export type Checkout = Node & {
  readonly __typename: 'Checkout';
  /** Applied promo codes for the checkout. */
  readonly appliedPromoCodes: ReadonlyArray<CheckoutPromoCode>;
  /** Billing address used by payment providers and the resulting order. */
  readonly billingAddress?: Maybe<CheckoutBillingAddress>;
  /** Canonical sales channel used by pricing and eligibility rules. */
  readonly channelCode: Scalars['String']['output'];
  /** All cost calculations for the checkout. */
  readonly cost: CheckoutCost;
  /** When this checkout was first created. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** Display and settlement currency of this checkout snapshot. */
  readonly currencyCode: CurrencyCode;
  /** Customer identity associated with the checkout. */
  readonly customerIdentity: CheckoutCustomerIdentity;
  /** Customer note or special instructions for the checkout. */
  readonly customerNote?: Maybe<Scalars['String']['output']>;
  /** Delivery groups. */
  readonly deliveryGroups: ReadonlyArray<CheckoutDeliveryGroup>;
  /** A globally-unique ID. */
  readonly id: Scalars['ID']['output'];
  /** Ordered issues emitted by the checkout pipeline. */
  readonly issues: ReadonlyArray<CheckoutIssue>;
  /**
   * Ordered root items in the checkout. Bundle components are exposed through
   * CheckoutLine.children.
   */
  readonly lines: ReadonlyArray<CheckoutLine>;
  /** Locale used by checkout calculation and customer-facing messages. */
  readonly localeCode: LocaleCode;
  /** Notifications for the user regarding the checkout. */
  readonly notifications: ReadonlyArray<CheckoutNotification>;
  /** Payment aggregate for this checkout. */
  readonly payment: CheckoutPayment;
  /** Revision of the last complete checkout pipeline result. */
  readonly resultRevision: Scalars['String']['output'];
  /** Tags that can be used to organize checkout lines. */
  readonly tags: ReadonlyArray<CheckoutTag>;
  /** Quantity of the item being purchased. */
  readonly totalQuantity: Scalars['Int']['output'];
  /** When this checkout was last updated. */
  readonly updatedAt: Scalars['DateTime']['output'];
  /** Whether the committed checkout is ready according to validation. */
  readonly valid: Scalars['Boolean']['output'];
  /** Optimistic concurrency version of the committed checkout. */
  readonly version: Scalars['Int']['output'];
};

/**
 * A normalized international billing address captured independently from
 * delivery destinations. Payment-provider-specific fields belong to data.
 */
export type CheckoutBillingAddress = {
  readonly __typename: 'CheckoutBillingAddress';
  readonly address1?: Maybe<Scalars['String']['output']>;
  readonly address2?: Maybe<Scalars['String']['output']>;
  readonly city?: Maybe<Scalars['String']['output']>;
  readonly company?: Maybe<Scalars['String']['output']>;
  readonly country?: Maybe<Scalars['String']['output']>;
  readonly countryCode?: Maybe<CountryCode>;
  /** Payment-provider-specific billing-address extension data. */
  readonly data?: Maybe<Scalars['JSON']['output']>;
  readonly firstName?: Maybe<Scalars['String']['output']>;
  readonly formatted: ReadonlyArray<Scalars['String']['output']>;
  readonly formattedArea?: Maybe<Scalars['String']['output']>;
  readonly lastName?: Maybe<Scalars['String']['output']>;
  readonly name: Scalars['String']['output'];
  readonly phone?: Maybe<Scalars['String']['output']>;
  readonly province?: Maybe<Scalars['String']['output']>;
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
  readonly zip?: Maybe<Scalars['String']['output']>;
};

/**
 * Portable international postal fields for a checkout billing address.
 * Payment-provider-specific fields belong to data.
 */
export type CheckoutBillingAddressInput = {
  readonly address1?: InputMaybe<Scalars['String']['input']>;
  readonly address2?: InputMaybe<Scalars['String']['input']>;
  readonly city?: InputMaybe<Scalars['String']['input']>;
  readonly company?: InputMaybe<Scalars['String']['input']>;
  readonly countryCode?: InputMaybe<CountryCode>;
  /** Payment-provider-specific billing-address extension data. */
  readonly data?: InputMaybe<Scalars['JSON']['input']>;
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
  readonly zip?: InputMaybe<Scalars['String']['input']>;
};

/** Input for replacing or clearing the checkout billing address. */
export type CheckoutBillingAddressUpdateInput = {
  /** New address. Passing null clears the current billing address. */
  readonly billingAddress?: InputMaybe<CheckoutBillingAddressInput>;
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/**
 * Input data for a child item in a bundle.
 * Price configuration is automatically taken from ProductGroup in the database.
 */
export type CheckoutChildLineInput = {
  /** Checkout-owned attributes passed to the pipeline. */
  readonly attributes?: InputMaybe<Scalars['JSON']['input']>;
  /** ID of the exact component item selected in the parent configuration. */
  readonly componentItemId: Scalars['ID']['input'];
  /**
   * ID of the purchasable for child item.
   * Must be a variant that exists in parent product's groups.
   */
  readonly purchasableId: Scalars['ID']['input'];
  /** Purchase intent for the child variant. */
  readonly purchase?: InputMaybe<CheckoutLinePurchaseInput>;
  /** Quantity of the child item. */
  readonly quantity: Scalars['Int']['input'];
};

/** All monetary calculations related to the checkout. */
export type CheckoutCost = {
  readonly __typename: 'CheckoutCost';
  /** Total value of items before any discounts. */
  readonly subtotalAmount: Money;
  /** Final amount to be paid, including item cost, shipping, and taxes. */
  readonly totalAmount: Money;
  /** Total discount from both item-level and checkout-level promotions. */
  readonly totalDiscountAmount: Money;
  /** Total shipping cost (only MERCHANT_COLLECTED payments). */
  readonly totalShippingAmount: Money;
  /** Total tax amount applied to the checkout. */
  readonly totalTaxAmount: Money;
};

/** Input data for creating a new checkout. */
export type CheckoutCreateInput = {
  /** Canonical sales channel used by pricing and eligibility rules. */
  readonly channelCode: Scalars['String']['input'];
  /** Display currency code for all items. ISO 4217 (3 letters, e.g., "USD", "EUR") */
  readonly currencyCode: CurrencyCode;
  /** ID of the external source for the checkout. */
  readonly externalId?: InputMaybe<Scalars['String']['input']>;
  /** Source of sales for the checkout. */
  readonly externalSource?: InputMaybe<Scalars['String']['input']>;
  /** Client-generated opaque key used to replay this create safely. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Initial items to add to the new checkout. */
  readonly items: ReadonlyArray<CheckoutLineAddInput>;
  /** Locale code for the checkout. ISO 639-1 (2 letters, e.g., "en", "ru") */
  readonly localeCode: LocaleCode;
  /** Optional tag definitions to initialize for this checkout. */
  readonly tags?: InputMaybe<ReadonlyArray<CheckoutTagInput>>;
};

/** Input data for updating the display currency of the checkout. */
export type CheckoutCurrencyCodeUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Currency code according to ISO 4217 (e.g., "USD", "EUR"). */
  readonly currencyCode: CurrencyCode;
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CheckoutCustomerIdentity = {
  readonly __typename: 'CheckoutCustomerIdentity';
  /** Country code of the customer. */
  readonly countryCode?: Maybe<CountryCode>;
  /** Customer associated with the checkout. */
  readonly customer?: Maybe<Customer>;
  /** Customer email address associated with the checkout. */
  readonly email?: Maybe<Scalars['Email']['output']>;
  /** First name of the customer. */
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Last name of the customer. */
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /** Middle name of the customer. */
  readonly middleName?: Maybe<Scalars['String']['output']>;
  /** Phone number of the customer. */
  readonly phone?: Maybe<Scalars['String']['output']>;
};

/** Input data for updating customer identification data associated with the checkout. */
export type CheckoutCustomerIdentityUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /**
   * Country code of the customer.
   * ISO 3166-1 alpha-2.
   */
  readonly countryCode?: InputMaybe<CountryCode>;
  /** Customer's email address. If specified, will be linked to the checkout. */
  readonly email?: InputMaybe<Scalars['Email']['input']>;
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** First name of the customer. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Last name of the customer. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Middle name of the customer. */
  readonly middleName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number of the customer. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
};

/** Input data for updating the customer note attached to the checkout. */
export type CheckoutCustomerNoteUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * Text of the customer note (delivery instructions, etc.).
   * Empty value clears the note.
   */
  readonly note?: InputMaybe<Scalars['String']['input']>;
};

/** A normalized international delivery address associated with a checkout. */
export type CheckoutDeliveryAddress = {
  readonly __typename: 'CheckoutDeliveryAddress';
  /** Primary address line. */
  readonly address1?: Maybe<Scalars['String']['output']>;
  /** Secondary address line. */
  readonly address2?: Maybe<Scalars['String']['output']>;
  /** City name. */
  readonly city?: Maybe<Scalars['String']['output']>;
  /** Company or organization receiving the delivery. */
  readonly company?: Maybe<Scalars['String']['output']>;
  /** Localized country or territory name. */
  readonly country?: Maybe<Scalars['String']['output']>;
  /** Country code (ISO 3166-1 alpha-2). */
  readonly countryCode?: Maybe<CountryCode>;
  /** Carrier-specific address extension data. */
  readonly data?: Maybe<Scalars['JSON']['output']>;
  /** Recipient first name captured with this destination. */
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Address lines formatted for the active storefront locale. */
  readonly formatted: ReadonlyArray<Scalars['String']['output']>;
  /** Compact city, region, and country representation. */
  readonly formattedArea?: Maybe<Scalars['String']['output']>;
  /** Unique identifier for the delivery address. */
  readonly id?: Maybe<Scalars['ID']['output']>;
  /** Recipient last name captured with this destination. */
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /** Recipient name formatted for the active storefront locale. */
  readonly name: Scalars['String']['output'];
  /** Contact phone captured with this destination. */
  readonly phone?: Maybe<Scalars['String']['output']>;
  /** Localized region, state, or province name. */
  readonly province?: Maybe<Scalars['String']['output']>;
  /** Province code. */
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
  /** Postal or ZIP code. */
  readonly zip?: Maybe<Scalars['String']['output']>;
};

/**
 * Portable international postal fields for a checkout delivery address.
 *
 * Carrier-specific fields such as a Nova Poshta settlement, warehouse, or branch
 * identifier belong to data and are validated by the selected delivery option's
 * customerInputContract.
 */
export type CheckoutDeliveryAddressInput = {
  /** Primary address line. */
  readonly address1?: InputMaybe<Scalars['String']['input']>;
  /** Secondary address line. */
  readonly address2?: InputMaybe<Scalars['String']['input']>;
  /** City name. */
  readonly city?: InputMaybe<Scalars['String']['input']>;
  /** Company or organization receiving the delivery. */
  readonly company?: InputMaybe<Scalars['String']['input']>;
  /** Country code (ISO 3166-1 alpha-2). */
  readonly countryCode?: InputMaybe<CountryCode>;
  /**
   * Carrier-specific address extension data. The shape is defined by the
   * selected delivery option's customerInputContract.
   */
  readonly data?: InputMaybe<Scalars['JSON']['input']>;
  /** Recipient's first name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient's last name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number for delivery. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  /** Province code. */
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
  /** Postal or ZIP code. */
  readonly zip?: InputMaybe<Scalars['String']['input']>;
};

/** Delivery address update element: which address to update and with what data. */
export type CheckoutDeliveryAddressUpdateInput = {
  /** New postal address values. */
  readonly address: CheckoutDeliveryAddressInput;
  /** Identifier of the existing delivery address in the checkout. */
  readonly addressId: Scalars['ID']['input'];
};

/**
 * Input data for adding one or more delivery addresses to the checkout.
 * Supports multi-shipping.
 */
export type CheckoutDeliveryAddressesAddInput = {
  /** List of delivery addresses to be added. */
  readonly addresses: ReadonlyArray<CheckoutDeliveryDestinationInput>;
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing one or more delivery addresses from the checkout. */
export type CheckoutDeliveryAddressesRemoveInput = {
  /** Identifiers of delivery addresses to be removed. */
  readonly addressIds: ReadonlyArray<Scalars['ID']['input']>;
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Input data for batch updating previously added delivery addresses. */
export type CheckoutDeliveryAddressesUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of updates for delivery addresses. */
  readonly updates: ReadonlyArray<CheckoutDeliveryAddressUpdateInput>;
};

export type CheckoutDeliveryDestinationInput = {
  readonly address: CheckoutDeliveryAddressInput;
  /** Checkout lines assigned to this destination. */
  readonly checkoutLineIds: ReadonlyArray<Scalars['ID']['input']>;
};

/** Delivery group for one or more checkout lines. */
export type CheckoutDeliveryGroup = {
  readonly __typename: 'CheckoutDeliveryGroup';
  /** Checkout lines associated with the delivery group. */
  readonly checkoutLines: ReadonlyArray<CheckoutLine>;
  /** Delivery address associated with the delivery group. */
  readonly deliveryAddress?: Maybe<CheckoutDeliveryAddress>;
  /** Unique identifier for the delivery group. */
  readonly id: Scalars['ID']['output'];
  readonly options: ReadonlyArray<CheckoutDeliveryOption>;
  /** Recipient associated with the delivery group. */
  readonly recipient?: Maybe<CheckoutRecipient>;
  readonly selection: CheckoutDeliveryOptionSelection;
};

export type CheckoutDeliveryMethodType =
  | 'LOCAL'
  | 'NONE'
  | 'PICKUP_POINT'
  | 'PICK_UP'
  | 'RETAIL'
  | 'SHIPPING';

/**
 * Input data for selecting/changing delivery method.
 * Can be applied to the entire checkout or to a specific delivery address.
 */
export type CheckoutDeliveryMethodUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /**
   * Arbitrary customer-provided data for the selected delivery method.
   * It remains private selection intent and is never returned by Storefront API.
   */
  readonly customerInput?: InputMaybe<Scalars['JSON']['input']>;
  /** Identifier of the delivery group for which the delivery method is selected. */
  readonly deliveryGroupId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Opaque handle returned by the current checkout snapshot. */
  readonly optionHandle: Scalars['String']['input'];
};

export type CheckoutDeliveryOption = {
  readonly __typename: 'CheckoutDeliveryOption';
  readonly carrierCode?: Maybe<Scalars['String']['output']>;
  readonly code: Scalars['String']['output'];
  readonly cost: Money;
  readonly customerInputContract?: Maybe<Scalars['JSON']['output']>;
  readonly deliveryMethodType: CheckoutDeliveryMethodType;
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly estimatedMaxDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  readonly estimatedMinDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  readonly handle: Scalars['String']['output'];
  readonly phoneRequired: Scalars['Boolean']['output'];
  readonly publicData: Scalars['JSON']['output'];
  readonly title: Scalars['String']['output'];
};

export type CheckoutDeliveryOptionSelection = {
  readonly __typename: 'CheckoutDeliveryOptionSelection';
  readonly option?: Maybe<CheckoutDeliveryOption>;
  readonly previousOptionHandle?: Maybe<Scalars['String']['output']>;
  readonly resetReason?: Maybe<CheckoutSelectionResetReason>;
  readonly status: CheckoutSelectionStatus;
};

/** Recipient update element: which delivery group's recipient to update and with what data. */
export type CheckoutDeliveryRecipientUpdateInput = {
  /** Identifier of the delivery group in the checkout. */
  readonly deliveryGroupId: Scalars['ID']['input'];
  /** New recipient values. */
  readonly recipient: CheckoutRecipientInput;
};

/** Input data for adding recipients for delivery groups. */
export type CheckoutDeliveryRecipientsAddInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of recipients to be added for delivery groups. */
  readonly recipients: ReadonlyArray<CheckoutDeliveryRecipientUpdateInput>;
};

/** Input data for removing recipients associated with delivery groups. */
export type CheckoutDeliveryRecipientsRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Identifiers of delivery groups whose recipients should be removed. */
  readonly deliveryGroupIds: ReadonlyArray<Scalars['ID']['input']>;
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Input data for batch updating recipients for delivery groups. */
export type CheckoutDeliveryRecipientsUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of updates for recipients. */
  readonly updates: ReadonlyArray<CheckoutDeliveryRecipientUpdateInput>;
};

export type CheckoutIssue = {
  readonly __typename: 'CheckoutIssue';
  readonly code: Scalars['String']['output'];
  readonly effect: CheckoutIssueEffect;
  readonly field: ReadonlyArray<Scalars['String']['output']>;
  readonly lineId?: Maybe<Scalars['ID']['output']>;
  readonly message: Scalars['String']['output'];
  readonly retryable: Scalars['Boolean']['output'];
  readonly severity: CheckoutIssueSeverity;
};

export type CheckoutIssueEffect =
  | 'CONTINUE'
  | 'STOP';

export type CheckoutIssueSeverity =
  | 'ERROR'
  | 'WARNING';

/** Input data for updating the language/locale code of the checkout. */
export type CheckoutLanguageCodeUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * Language/locale code (ISO 639-1, BCP 47 if necessary), e.g. "en", "ru", "uk".
   * Affects localization and formatting.
   */
  readonly localeCode: Scalars['String']['input'];
};

/** A single item in a checkout. */
export type CheckoutLine = Node & {
  readonly __typename: 'CheckoutLine';
  /** Customer-visible checkout attributes captured for this line. */
  readonly attributes: Scalars['JSON']['output'];
  /** A list of components that make up this checkout line, such as individual products in a bundle. */
  readonly children: ReadonlyArray<CheckoutLine>;
  /** Exact component item selected for this child line. Null for root lines. */
  readonly componentItemId?: Maybe<Scalars['ID']['output']>;
  /** Cost calculations for this checkout item. */
  readonly cost: CheckoutLineCost;
  /** Global unique identifier for the checkout line. */
  readonly id: Scalars['ID']['output'];
  /** Image of the purchasable resolved by the Media subgraph. */
  readonly image?: Maybe<MediaImage>;
  /** Original price before any adjustments (e.g., child price config). */
  readonly originalPrice: Money;
  /** Parent bundle line. Null for a root checkout line. */
  readonly parent?: Maybe<CheckoutLine>;
  /** Price adjustment applied to this line (for child items in bundles). */
  readonly priceConfig?: Maybe<CheckoutLinePriceConfig>;
  /** Federated catalog object represented by purchasableId. */
  readonly purchasable: Purchasable;
  /** ID of the purchasable. */
  readonly purchasableId: Scalars['ID']['output'];
  /** Purchase mode and selected selling plan captured for this line. */
  readonly purchase: CheckoutLinePurchase;
  /** Quantity of the item being purchased. */
  readonly quantity: Scalars['Int']['output'];
  /** SKU of the purchasable. */
  readonly sku?: Maybe<Scalars['String']['output']>;
  /** Optional tag assigned to this checkout line. */
  readonly tag?: Maybe<CheckoutTag>;
  /** Title of the purchasable. */
  readonly title: Scalars['String']['output'];
};

/** Input data for a single item in the checkout. */
export type CheckoutLineAddInput = {
  /** Checkout-owned attributes passed to the pipeline. */
  readonly attributes?: InputMaybe<Scalars['JSON']['input']>;
  /** Child items for this line. If provided, this line becomes a parent. */
  readonly children?: InputMaybe<ReadonlyArray<CheckoutChildLineInput>>;
  /** ID of the product to add or update. */
  readonly purchasableId: Scalars['ID']['input'];
  /** Purchase intent for the variant. */
  readonly purchase?: InputMaybe<CheckoutLinePurchaseInput>;
  /** Quantity of the product in the checkout. */
  readonly quantity: Scalars['Int']['input'];
  /** Optional tag slug to associate with this line. */
  readonly tagSlug?: InputMaybe<Scalars['String']['input']>;
};

/** Detailed breakdown of costs for a checkout line item */
export type CheckoutLineCost = {
  readonly __typename: 'CheckoutLineCost';
  /** The original list price per unit before any discounts. */
  readonly compareAtUnitPrice: Money;
  /** Discount amount applied to a line. */
  readonly discountAmount: Money;
  /** Total cost of all units before discounts. */
  readonly subtotalAmount: Money;
  /** Total tax amount applied to the checkout line. */
  readonly taxAmount: Money;
  /** Total cost of this line (all units), after discounts and taxes. */
  readonly totalAmount: Money;
  /** The current price per unit before discounts are applied (may differ from compareAt price if on sale). */
  readonly unitPrice: Money;
};

/** Price adjustment configuration applied to a child line item. */
export type CheckoutLinePriceConfig = {
  readonly __typename: 'CheckoutLinePriceConfig';
  /** Amount in minor units (always positive). Used for DISCOUNT_AMOUNT, MARKUP_AMOUNT, OVERRIDE. */
  readonly amount?: Maybe<Scalars['Int']['output']>;
  /** Percentage (always positive). Used for DISCOUNT_PERCENT, MARKUP_PERCENT. */
  readonly percent?: Maybe<Scalars['Float']['output']>;
  /** Type of price adjustment. */
  readonly type: ChildPriceType;
};

/** Purchase mode captured in the committed checkout snapshot. */
export type CheckoutLinePurchase = {
  readonly __typename: 'CheckoutLinePurchase';
  readonly type: CheckoutLinePurchaseType;
};

export type CheckoutLinePurchaseInput = {
  readonly type: CheckoutLinePurchaseType;
};

export type CheckoutLinePurchaseType =
  | 'ONE_TIME';

/** Single replacement operation. */
export type CheckoutLineReplaceInput = {
  /** Source line ID to replace (quantity will be moved from this line). */
  readonly lineId: Scalars['ID']['input'];
  /** Target purchasable ID to receive the quantity. */
  readonly purchasableId: Scalars['ID']['input'];
  /**
   * Quantity to move; if not set, moves full quantity from source line.
   * Must be greater than 0 if provided.
   */
  readonly quantity?: InputMaybe<Scalars['Int']['input']>;
};

/** Input data for updating the quantity of a specific checkout item. */
export type CheckoutLineUpdateInput = {
  /** ID of the checkout item to update. */
  readonly lineId: Scalars['ID']['input'];
  /**
   * New quantity for the checkout item.
   * If set to 0, the item will be removed.
   */
  readonly quantity: Scalars['Int']['input'];
};

/** Input data for adding an item to an existing checkout. */
export type CheckoutLinesAddInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of checkout items to add. */
  readonly lines: ReadonlyArray<CheckoutLineAddInput>;
};

/** Input data for clearing all items from a checkout. */
export type CheckoutLinesClearInput = {
  /** ID of the checkout to clear. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing one or more items from the checkout. */
export type CheckoutLinesDeleteInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** IDs of the lines to remove. */
  readonly lineIds: ReadonlyArray<Scalars['ID']['input']>;
};

/**
 * Input data for replacing one or more checkout lines.
 * Each replacement moves quantity from source line to target line.
 * If quantity is not provided, full quantity from the source line will be moved.
 */
export type CheckoutLinesReplaceInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of replacement operations to apply. */
  readonly lines: ReadonlyArray<CheckoutLineReplaceInput>;
};

/** Input data for updating the quantity of a specific checkout item. */
export type CheckoutLinesUpdateInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** List of checkout items to update. */
  readonly lines: ReadonlyArray<CheckoutLineUpdateInput>;
};

/** Uniform result returned by every mutation that changes a checkout. */
export type CheckoutMutationPayload = {
  readonly __typename: 'CheckoutMutationPayload';
  /** The committed checkout snapshot, or null when the mutation failed. */
  readonly checkout?: Maybe<Checkout>;
  /** Validation, concurrency, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CheckoutUserError>;
};

/** A non-blocking warning generated by checkout operations. */
export type CheckoutNotification = {
  readonly __typename: 'CheckoutNotification';
  /** Code categorizing the warning. */
  readonly code: CheckoutNotificationCode;
  /** A globally-unique ID. */
  readonly id: Scalars['ID']['output'];
  /** Whether the warning has been acknowledged by the user. */
  readonly isDismissed: Scalars['Boolean']['output'];
  /** Importance level of the warning. */
  readonly severity: NotificationSeverity;
};

/**
 * Codes for warnings that may be returned with Checkout mutations,
 * indicating non-blocking adjustments or issues in the checkout.
 */
export type CheckoutNotificationCode =
  /** An item in the checkout is no longer available for sale. */
  | 'ITEM_UNAVAILABLE'
  /**
   * The requested quantity exceeds available stock;
   * quantity was automatically reduced to the maximum available.
   */
  | 'NOT_ENOUGH_STOCK'
  /** The requested item is completely out of stock and has been removed from the checkout. */
  | 'OUT_OF_STOCK'
  /** The price of one or more items has changed since they were added to the checkout. */
  | 'PRICE_CHANGED';

/** Payment aggregate for a checkout. */
export type CheckoutPayment = {
  readonly __typename: 'CheckoutPayment';
  /** Available payment methods for this checkout context. */
  readonly methods: ReadonlyArray<CheckoutPaymentMethod>;
  /**
   * Amount payable to the merchant via the selected method.
   * This excludes SHIPPING_CARRIER components (CARRIER_DIRECT).
   */
  readonly payableAmount: Money;
  readonly selection: CheckoutPaymentMethodSelection;
};

/** Payment method available/selected for checkout. */
export type CheckoutPaymentMethod = {
  readonly __typename: 'CheckoutPaymentMethod';
  readonly code: Scalars['String']['output'];
  readonly flow: PaymentFlow;
  readonly handle: Scalars['String']['output'];
  readonly providerCode: Scalars['String']['output'];
  readonly title: Scalars['String']['output'];
};

export type CheckoutPaymentMethodSelection = {
  readonly __typename: 'CheckoutPaymentMethodSelection';
  readonly method?: Maybe<CheckoutPaymentMethod>;
  readonly previousMethodHandle?: Maybe<Scalars['String']['output']>;
  readonly resetReason?: Maybe<CheckoutSelectionResetReason>;
  readonly status: CheckoutSelectionStatus;
};

/** Select or change payment method for the checkout. */
export type CheckoutPaymentMethodUpdateInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /**
   * Arbitrary customer-provided data for the selected payment method.
   * It remains private selection intent and is never returned by Storefront API.
   */
  readonly customerInput?: InputMaybe<Scalars['JSON']['input']>;
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Opaque handle returned by the current checkout snapshot. */
  readonly methodHandle: Scalars['String']['input'];
};

/** Applied promo code for a checkout. */
export type CheckoutPromoCode = {
  readonly __typename: 'CheckoutPromoCode';
  /** When this promo code was applied. */
  readonly appliedAt: Scalars['DateTime']['output'];
  /** Promo code text. */
  readonly code: Scalars['String']['output'];
  /** Discount conditions. */
  readonly conditions?: Maybe<Scalars['JSON']['output']>;
  /** Discount type (percentage). */
  readonly discountType: Scalars['String']['output'];
  /** Discount provider. */
  readonly provider: Scalars['String']['output'];
  /** Discount value (percentage as number). */
  readonly value: Scalars['Int']['output'];
};

/** Input data for applying a promo code to the checkout. */
export type CheckoutPromoCodeAddInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code. */
  readonly code: Scalars['String']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Input data for removing a previously applied promo code from the checkout. */
export type CheckoutPromoCodeRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code to be cancelled. */
  readonly code: Scalars['String']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Recipient details for the delivery group. */
export type CheckoutRecipient = {
  readonly __typename: 'CheckoutRecipient';
  /** Email of the recipient. */
  readonly email?: Maybe<Scalars['Email']['output']>;
  /** First name of the recipient. */
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Last name of the recipient. */
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /** Middle name of the recipient. */
  readonly middleName?: Maybe<Scalars['String']['output']>;
  /** Phone of the recipient. */
  readonly phone?: Maybe<Scalars['String']['output']>;
};

/** Input fields for recipient details. */
export type CheckoutRecipientInput = {
  /** Email of the recipient. */
  readonly email?: InputMaybe<Scalars['Email']['input']>;
  /** First name of the recipient. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Last name of the recipient. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Middle name of the recipient. */
  readonly middleName?: InputMaybe<Scalars['String']['input']>;
  /** Phone of the recipient. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
};

export type CheckoutSelectionResetReason = {
  readonly __typename: 'CheckoutSelectionResetReason';
  readonly code: Scalars['String']['output'];
  readonly message: Scalars['String']['output'];
};

export type CheckoutSelectionStatus =
  | 'NONE'
  | 'RESET'
  | 'SELECTED';

/** A tag that can be attached to checkout lines. */
export type CheckoutTag = Node & {
  readonly __typename: 'CheckoutTag';
  /** Tag creation timestamp. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** Global identifier of the tag. */
  readonly id: Scalars['ID']['output'];
  /** Slug identifier (a-zA-Z0-9). */
  readonly slug: Scalars['String']['output'];
  /** Whether the tag enforces uniqueness for checkout lines. */
  readonly unique: Scalars['Boolean']['output'];
  /** Last update timestamp. */
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Input payload for checkoutTagCreate mutation. */
export type CheckoutTagCreateInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Tag configuration. */
  readonly tag: CheckoutTagInput;
};

/** Input payload for checkoutTagDelete mutation. */
export type CheckoutTagDeleteInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** Tag identifier (global ID). */
  readonly tagId: Scalars['ID']['input'];
};

/** Tag definition used when initializing or mutating checkout tags. */
export type CheckoutTagInput = {
  /** Slug identifier consisting of alphanumeric characters. */
  readonly slug: Scalars['String']['input'];
  /** Whether this tag enforces uniqueness for checkout lines. */
  readonly unique: Scalars['Boolean']['input'];
};

/** Input payload for checkoutTagUpdate mutation. */
export type CheckoutTagUpdateInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Checkout.version expected by the client. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Client-generated opaque key used to safely replay this mutation. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** New slug, if tag needs to be renamed. */
  readonly slug?: InputMaybe<Scalars['String']['input']>;
  /** Tag identifier (global ID). */
  readonly tagId: Scalars['ID']['input'];
  /** Updated uniqueness flag. */
  readonly unique?: InputMaybe<Scalars['Boolean']['input']>;
};

/** A customer-facing checkout mutation error safe to display in storefronts. */
export type CheckoutUserError = DisplayableError & {
  readonly __typename: 'CheckoutUserError';
  /** Stable machine-readable error code. */
  readonly code: Scalars['String']['output'];
  /** Path to the input field associated with the error, when available. */
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** Human-readable error message. */
  readonly message: Scalars['String']['output'];
  /** Whether retrying the same request may succeed without changing input. */
  readonly retryable: Scalars['Boolean']['output'];
};

/**
 * Price adjustment type for child items in a bundle.
 * Values are always positive - the type determines the operation.
 */
export type ChildPriceType =
  /** Use original price without adjustments */
  | 'BASE'
  /** Subtract fixed amount from original price */
  | 'DISCOUNT_AMOUNT'
  /** Subtract percentage from original price */
  | 'DISCOUNT_PERCENT'
  /** Item is free (price = 0) */
  | 'FREE'
  /** Add fixed amount to original price */
  | 'MARKUP_AMOUNT'
  /** Add percentage to original price */
  | 'MARKUP_PERCENT'
  /** Override with fixed price */
  | 'OVERRIDE';

/** Shared fields exposed by every Relay-style connection. */
export type Connection = {
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type Country = {
  readonly __typename: 'Country';
  readonly code: CountryCode;
  readonly name: Scalars['String']['output'];
};

/** Supported country codes. */
export type CountryCode =
  | 'AC'
  | 'AD'
  | 'AE'
  | 'AF'
  | 'AG'
  | 'AI'
  | 'AL'
  | 'AM'
  | 'AN'
  | 'AO'
  | 'AR'
  | 'AT'
  | 'AU'
  | 'AW'
  | 'AX'
  | 'AZ'
  | 'BA'
  | 'BB'
  | 'BD'
  | 'BE'
  | 'BF'
  | 'BG'
  | 'BH'
  | 'BI'
  | 'BJ'
  | 'BL'
  | 'BM'
  | 'BN'
  | 'BO'
  | 'BQ'
  | 'BR'
  | 'BS'
  | 'BT'
  | 'BV'
  | 'BW'
  | 'BY'
  | 'BZ'
  | 'CA'
  | 'CC'
  | 'CD'
  | 'CF'
  | 'CG'
  | 'CH'
  | 'CI'
  | 'CK'
  | 'CL'
  | 'CM'
  | 'CN'
  | 'CO'
  | 'CR'
  | 'CU'
  | 'CV'
  | 'CW'
  | 'CX'
  | 'CY'
  | 'CZ'
  | 'DE'
  | 'DJ'
  | 'DK'
  | 'DM'
  | 'DO'
  | 'DZ'
  | 'EC'
  | 'EE'
  | 'EG'
  | 'EH'
  | 'ER'
  | 'ES'
  | 'ET'
  | 'FI'
  | 'FJ'
  | 'FK'
  | 'FM'
  | 'FO'
  | 'FR'
  | 'GA'
  | 'GB'
  | 'GD'
  | 'GE'
  | 'GF'
  | 'GG'
  | 'GH'
  | 'GI'
  | 'GL'
  | 'GM'
  | 'GN'
  | 'GP'
  | 'GQ'
  | 'GR'
  | 'GS'
  | 'GT'
  | 'GW'
  | 'GY'
  | 'HK'
  | 'HM'
  | 'HN'
  | 'HR'
  | 'HT'
  | 'HU'
  | 'ID'
  | 'IE'
  | 'IL'
  | 'IM'
  | 'IN'
  | 'IO'
  | 'IQ'
  | 'IR'
  | 'IS'
  | 'IT'
  | 'JE'
  | 'JM'
  | 'JO'
  | 'JP'
  | 'KE'
  | 'KG'
  | 'KH'
  | 'KI'
  | 'KM'
  | 'KN'
  | 'KP'
  | 'KR'
  | 'KW'
  | 'KY'
  | 'KZ'
  | 'LA'
  | 'LB'
  | 'LC'
  | 'LI'
  | 'LK'
  | 'LR'
  | 'LS'
  | 'LT'
  | 'LU'
  | 'LV'
  | 'LY'
  | 'MA'
  | 'MC'
  | 'MD'
  | 'ME'
  | 'MF'
  | 'MG'
  | 'MH'
  | 'MK'
  | 'ML'
  | 'MM'
  | 'MN'
  | 'MO'
  | 'MQ'
  | 'MR'
  | 'MS'
  | 'MT'
  | 'MU'
  | 'MV'
  | 'MW'
  | 'MX'
  | 'MY'
  | 'MZ'
  | 'NA'
  | 'NC'
  | 'NE'
  | 'NF'
  | 'NG'
  | 'NI'
  | 'NL'
  | 'NO'
  | 'NP'
  | 'NR'
  | 'NU'
  | 'NZ'
  | 'OM'
  | 'PA'
  | 'PE'
  | 'PF'
  | 'PG'
  | 'PH'
  | 'PK'
  | 'PL'
  | 'PM'
  | 'PN'
  | 'PS'
  | 'PT'
  | 'PW'
  | 'PY'
  | 'QA'
  | 'RE'
  | 'RO'
  | 'RS'
  | 'RU'
  | 'RW'
  | 'SA'
  | 'SB'
  | 'SC'
  | 'SD'
  | 'SE'
  | 'SG'
  | 'SH'
  | 'SI'
  | 'SJ'
  | 'SK'
  | 'SL'
  | 'SM'
  | 'SN'
  | 'SO'
  | 'SR'
  | 'SS'
  | 'ST'
  | 'SV'
  | 'SX'
  | 'SY'
  | 'SZ'
  | 'TA'
  | 'TC'
  | 'TD'
  | 'TF'
  | 'TG'
  | 'TH'
  | 'TJ'
  | 'TK'
  | 'TL'
  | 'TM'
  | 'TN'
  | 'TO'
  | 'TR'
  | 'TT'
  | 'TV'
  | 'TW'
  | 'TZ'
  | 'UA'
  | 'UG'
  | 'UM'
  | 'US'
  | 'UY'
  | 'UZ'
  | 'VA'
  | 'VC'
  | 'VE'
  | 'VG'
  | 'VI'
  | 'VN'
  | 'VU'
  | 'WF'
  | 'WS'
  | 'XK'
  | 'YE'
  | 'YT'
  | 'ZA'
  | 'ZM'
  | 'ZW'
  | 'ZZ';

/** The part of the image that should remain after cropping. */
export type CropRegion =
  | 'BOTTOM'
  | 'CENTER'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP';

export type Currency = {
  readonly __typename: 'Currency';
  readonly code: CurrencyCode;
  readonly name: Scalars['String']['output'];
  readonly symbol: Scalars['String']['output'];
};

/** Currency codes according to ISO 4217 */
export type CurrencyCode =
  /** UAE Dirham (United Arab Emirates) - 2 decimals */
  | 'AED'
  /** Afghan Afghani (Afghanistan) - 0 decimals */
  | 'AFN'
  /** Albanian Lek (Albania) - 0 decimals */
  | 'ALL'
  /** Armenian Dram (Armenia) - 2 decimals */
  | 'AMD'
  /** Netherlands Antillean Guilder - 2 decimals */
  | 'ANG'
  /** Angolan Kwanza (Angola) - 2 decimals */
  | 'AOA'
  /** Argentine Peso (Argentina) - 2 decimals */
  | 'ARS'
  /** Australian Dollar (Australia) - 2 decimals */
  | 'AUD'
  /** Aruban Florin (Aruba) - 2 decimals */
  | 'AWG'
  /** Azerbaijani Manat (Azerbaijan) - 2 decimals */
  | 'AZN'
  /** Bosnia-Herzegovina Convertible Mark - 2 decimals */
  | 'BAM'
  /** Barbadian Dollar (Barbados) - 2 decimals */
  | 'BBD'
  /** Bangladeshi Taka (Bangladesh) - 2 decimals */
  | 'BDT'
  /** Bulgarian Lev (Bulgaria) - 2 decimals */
  | 'BGN'
  /** Bahraini Dinar (Bahrain) - 3 decimals */
  | 'BHD'
  /** Burundian Franc (Burundi) - 0 decimals */
  | 'BIF'
  /** Bermudian Dollar (Bermuda) - 2 decimals */
  | 'BMD'
  /** Brunei Dollar (Brunei) - 2 decimals */
  | 'BND'
  /** Bolivian Boliviano (Bolivia) - 2 decimals */
  | 'BOB'
  /** Brazilian Real (Brazil) - 2 decimals */
  | 'BRL'
  /** Bahamian Dollar (Bahamas) - 2 decimals */
  | 'BSD'
  /** Bhutanese Ngultrum (Bhutan) - 2 decimals */
  | 'BTN'
  /** Botswana Pula (Botswana) - 2 decimals */
  | 'BWP'
  /** Belarusian Ruble (Belarus) - 2 decimals */
  | 'BYN'
  /** Belize Dollar (Belize) - 2 decimals */
  | 'BZD'
  /** Canadian Dollar (Canada) - 2 decimals */
  | 'CAD'
  /** Congolese Franc (DR Congo) - 2 decimals */
  | 'CDF'
  /** Swiss Franc (Switzerland) - 2 decimals */
  | 'CHF'
  /** Chilean Peso (Chile) - 0 decimals */
  | 'CLP'
  /** Chinese Yuan (China) - 2 decimals */
  | 'CNY'
  /** Colombian Peso (Colombia) - 2 decimals */
  | 'COP'
  /** Costa Rican Colon (Costa Rica) - 2 decimals */
  | 'CRC'
  /** Cuban Peso (Cuba) - 2 decimals */
  | 'CUP'
  /** Cape Verdean Escudo (Cape Verde) - 2 decimals */
  | 'CVE'
  /** Czech Koruna (Czech Republic) - 2 decimals */
  | 'CZK'
  /** Djiboutian Franc (Djibouti) - 0 decimals */
  | 'DJF'
  /** Danish Krone (Denmark) - 2 decimals */
  | 'DKK'
  /** Dominican Peso (Dominican Republic) - 2 decimals */
  | 'DOP'
  /** Algerian Dinar (Algeria) - 2 decimals */
  | 'DZD'
  /** Egyptian Pound (Egypt) - 2 decimals */
  | 'EGP'
  /** Eritrean Nakfa (Eritrea) - 2 decimals */
  | 'ERN'
  /** Ethiopian Birr (Ethiopia) - 2 decimals */
  | 'ETB'
  /** Euro (European Union) - 2 decimals */
  | 'EUR'
  /** Fijian Dollar (Fiji) - 2 decimals */
  | 'FJD'
  /** Falkland Islands Pound - 2 decimals */
  | 'FKP'
  /** Faroese Króna (Faroe Islands) - 2 decimals */
  | 'FOK'
  /** Pound Sterling (United Kingdom) - 2 decimals */
  | 'GBP'
  /** Georgian Lari (Georgia) - 2 decimals */
  | 'GEL'
  /** Guernsey Pound (Guernsey) - 2 decimals */
  | 'GGP'
  /** Ghanaian Cedi (Ghana) - 2 decimals */
  | 'GHS'
  /** Gibraltar Pound (Gibraltar) - 2 decimals */
  | 'GIP'
  /** Gambian Dalasi (Gambia) - 2 decimals */
  | 'GMD'
  /** Guinean Franc (Guinea) - 0 decimals */
  | 'GNF'
  /** Guatemalan Quetzal (Guatemala) - 2 decimals */
  | 'GTQ'
  /** Guyanese Dollar (Guyana) - 2 decimals */
  | 'GYD'
  /** Hong Kong Dollar (Hong Kong) - 2 decimals */
  | 'HKD'
  /** Honduran Lempira (Honduras) - 2 decimals */
  | 'HNL'
  /** Croatian Kuna (Croatia) - 2 decimals */
  | 'HRK'
  /** Haitian Gourde (Haiti) - 2 decimals */
  | 'HTG'
  /** Hungarian Forint (Hungary) - 2 decimals */
  | 'HUF'
  /** Indonesian Rupiah (Indonesia) - 0 decimals */
  | 'IDR'
  /** Israeli New Shekel (Israel) - 2 decimals */
  | 'ILS'
  /** Isle of Man Pound - 2 decimals */
  | 'IMP'
  /** Indian Rupee (India) - 2 decimals */
  | 'INR'
  /** Iraqi Dinar (Iraq) - 3 decimals */
  | 'IQD'
  /** Iranian Rial (Iran) - 2 decimals */
  | 'IRR'
  /** Icelandic Króna (Iceland) - 0 decimals */
  | 'ISK'
  /** Jersey Pound (Jersey) - 2 decimals */
  | 'JEP'
  /** Jamaican Dollar (Jamaica) - 2 decimals */
  | 'JMD'
  /** Jordanian Dinar (Jordan) - 3 decimals */
  | 'JOD'
  /** Japanese Yen (Japan) - 0 decimals */
  | 'JPY'
  /** Kenyan Shilling (Kenya) - 2 decimals */
  | 'KES'
  /** Kyrgyzstani Som (Kyrgyzstan) - 2 decimals */
  | 'KGS'
  /** Cambodian Riel (Cambodia) - 2 decimals */
  | 'KHR'
  /** Comorian Franc (Comoros) - 2 decimals */
  | 'KMF'
  /** North Korean Won (North Korea) - 2 decimals */
  | 'KPW'
  /** South Korean Won (South Korea) - 0 decimals */
  | 'KRW'
  /** Kuwaiti Dinar (Kuwait) - 3 decimals */
  | 'KWD'
  /** Cayman Islands Dollar - 2 decimals */
  | 'KYD'
  /** Kazakhstani Tenge (Kazakhstan) - 2 decimals */
  | 'KZT'
  /** Lao Kip (Laos) - 2 decimals */
  | 'LAK'
  /** Lebanese Pound (Lebanon) - 2 decimals */
  | 'LBP'
  /** Sri Lankan Rupee (Sri Lanka) - 2 decimals */
  | 'LKR'
  /** Liberian Dollar (Liberia) - 2 decimals */
  | 'LRD'
  /** Lesotho Loti (Lesotho) - 2 decimals */
  | 'LSL'
  /** Libyan Dinar (Libya) - 3 decimals */
  | 'LYD'
  /** Moroccan Dirham (Morocco) - 2 decimals */
  | 'MAD'
  /** Moldovan Leu (Moldova) - 2 decimals */
  | 'MDL'
  /** Malagasy Ariary (Madagascar) - 2 decimals */
  | 'MGA'
  /** Macedonian Denar (North Macedonia) - 2 decimals */
  | 'MKD'
  /** Burmese Kyat (Myanmar) - 2 decimals */
  | 'MMK'
  /** Mongolian Tögrög (Mongolia) - 2 decimals */
  | 'MNT'
  /** Macanese Pataca (Macau) - 2 decimals */
  | 'MOP'
  /** Mauritanian Ouguiya (Mauritania) - 2 decimals */
  | 'MRU'
  /** Mauritian Rupee (Mauritius) - 2 decimals */
  | 'MUR'
  /** Maldivian Rufiyaa (Maldives) - 2 decimals */
  | 'MVR'
  /** Malawian Kwacha (Malawi) - 2 decimals */
  | 'MWK'
  /** Mexican Peso (Mexico) - 2 decimals */
  | 'MXN'
  /** Malaysian Ringgit (Malaysia) - 2 decimals */
  | 'MYR'
  /** Mozambican Metical (Mozambique) - 2 decimals */
  | 'MZN'
  /** Namibian Dollar (Namibia) - 2 decimals */
  | 'NAD'
  /** Nigerian Naira (Nigeria) - 2 decimals */
  | 'NGN'
  /** Nicaraguan Córdoba (Nicaragua) - 2 decimals */
  | 'NIO'
  /** Norwegian Krone (Norway) - 2 decimals */
  | 'NOK'
  /** Nepalese Rupee (Nepal) - 2 decimals */
  | 'NPR'
  /** New Zealand Dollar (New Zealand) - 2 decimals */
  | 'NZD'
  /** Omani Rial (Oman) - 3 decimals */
  | 'OMR'
  /** Panamanian Balboa (Panama) - 2 decimals */
  | 'PAB'
  /** Peruvian Sol (Peru) - 2 decimals */
  | 'PEN'
  /** Papua New Guinean Kina - 2 decimals */
  | 'PGK'
  /** Philippine Peso (Philippines) - 2 decimals */
  | 'PHP'
  /** Pakistani Rupee (Pakistan) - 2 decimals */
  | 'PKR'
  /** Polish Zloty (Poland) - 2 decimals */
  | 'PLN'
  /** Paraguayan Guaraní (Paraguay) - 0 decimals */
  | 'PYG'
  /** Qatari Riyal (Qatar) - 2 decimals */
  | 'QAR'
  /** Romanian Leu (Romania) - 2 decimals */
  | 'RON'
  /** Serbian Dinar (Serbia) - 2 decimals */
  | 'RSD'
  /** Russian Ruble (Russia) - 2 decimals */
  | 'RUB'
  /** Rwandan Franc (Rwanda) - 0 decimals */
  | 'RWF'
  /** Saudi Riyal (Saudi Arabia) - 2 decimals */
  | 'SAR'
  /** Solomon Islands Dollar - 2 decimals */
  | 'SBD'
  /** Seychelles Rupee (Seychelles) - 2 decimals */
  | 'SCR'
  /** Sudanese Pound (Sudan) - 2 decimals */
  | 'SDG'
  /** Swedish Krona (Sweden) - 2 decimals */
  | 'SEK'
  /** Singapore Dollar (Singapore) - 2 decimals */
  | 'SGD'
  /** Saint Helena Pound - 2 decimals */
  | 'SHP'
  /** Sierra Leonean Leone - 2 decimals */
  | 'SLE'
  /** Somali Shilling (Somalia) - 2 decimals */
  | 'SOS'
  /** Surinamese Dollar (Suriname) - 2 decimals */
  | 'SRD'
  /** South Sudanese Pound - 2 decimals */
  | 'SSP'
  /** São Tomé and Príncipe Dobra - 2 decimals */
  | 'STN'
  /** Salvadoran Colón (El Salvador) - 2 decimals */
  | 'SVC'
  /** Syrian Pound (Syria) - 2 decimals */
  | 'SYP'
  /** Eswatini Lilangeni (Eswatini) - 2 decimals */
  | 'SZL'
  /** Thai Baht (Thailand) - 2 decimals */
  | 'THB'
  /** Tajikistani Somoni (Tajikistan) - 2 decimals */
  | 'TJS'
  /** Turkmenistani Manat (Turkmenistan) - 2 decimals */
  | 'TMT'
  /** Tunisian Dinar (Tunisia) - 3 decimals */
  | 'TND'
  /** Tongan Paʻanga (Tonga) - 2 decimals */
  | 'TOP'
  /** Turkish Lira (Turkey) - 2 decimals */
  | 'TRY'
  /** Trinidad and Tobago Dollar - 2 decimals */
  | 'TTD'
  /** New Taiwan Dollar (Taiwan) - 2 decimals */
  | 'TWD'
  /** Tanzanian Shilling (Tanzania) - 2 decimals */
  | 'TZS'
  /** Ukrainian Hryvnia (Ukraine) - 2 decimals */
  | 'UAH'
  /** Ugandan Shilling (Uganda) - 0 decimals */
  | 'UGX'
  /** United States Dollar (USA) - 2 decimals */
  | 'USD'
  /** Uruguayan Peso (Uruguay) - 2 decimals */
  | 'UYU'
  /** Uzbekistani Som (Uzbekistan) - 2 decimals */
  | 'UZS'
  /** Venezuelan Bolívar (Venezuela) - 2 decimals */
  | 'VES'
  /** Vietnamese Dong (Vietnam) - 0 decimals */
  | 'VND'
  /** Vanuatu Vatu (Vanuatu) - 0 decimals */
  | 'VUV'
  /** Samoan Tala (Samoa) - 2 decimals */
  | 'WST'
  /** Central African CFA Franc - 0 decimals */
  | 'XAF'
  /** East Caribbean Dollar - 2 decimals */
  | 'XCD'
  /** Special Drawing Rights (IMF) - 0 decimals */
  | 'XDR'
  /** West African CFA Franc - 0 decimals */
  | 'XOF'
  /** CFP Franc - 0 decimals */
  | 'XPF'
  /** Yemeni Rial (Yemen) - 2 decimals */
  | 'YER'
  /** South African Rand (South Africa) - 2 decimals */
  | 'ZAR'
  /** Zambian Kwacha (Zambia) - 2 decimals */
  | 'ZMW'
  /** Zimbabwean Dollar (Zimbabwe) - 2 decimals */
  | 'ZWL';

/** A canonical storefront customer owned by the Customers subgraph. */
export type Customer = {
  readonly __typename: 'Customer';
  /** Mailing addresses owned by the customer. */
  readonly addresses: ReadonlyArray<CustomerAddress>;
  /** The customer's default mailing address, when one has been selected. */
  readonly defaultAddress?: Maybe<CustomerAddress>;
  /** Display name derived from available profile and contact information. */
  readonly displayName: Scalars['String']['output'];
  /** Authenticated customer's email address and its marketing consent. */
  readonly emailAddress?: Maybe<CustomerEmailAddress>;
  /** Customer's first name, if the profile has been completed. */
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Globally unique customer ID. */
  readonly id: Scalars['ID']['output'];
  /** Customer's last name, if the profile has been completed. */
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /** Orders owned by this authenticated customer, newest first by default. */
  readonly orders: OrderConnection;
  /** Authenticated customer's phone number. */
  readonly phoneNumber?: Maybe<CustomerPhoneNumber>;
  readonly productQuestions: ProductQuestionConnection;
  readonly reviewRequests: ReviewRequestConnection;
  readonly reviews: ReviewConnection;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerOrdersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  statuses?: InputMaybe<ReadonlyArray<OrderStatus>>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerProductQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerReviewRequestsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerReviewsArgs = {
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
export type CustomerAddress = {
  readonly __typename: 'CustomerAddress';
  /** Primary street address or post office box. */
  readonly address1?: Maybe<Scalars['String']['output']>;
  /** Apartment, suite, unit, or other secondary address information. */
  readonly address2?: Maybe<Scalars['String']['output']>;
  /** City, town, village, or locality. */
  readonly city?: Maybe<Scalars['String']['output']>;
  /** Company or organization associated with the address. */
  readonly company?: Maybe<Scalars['String']['output']>;
  /** Localized country or territory name. */
  readonly country?: Maybe<Scalars['String']['output']>;
  /** ISO 3166-1 alpha-2 country or territory code. */
  readonly countryCode?: Maybe<CountryCode>;
  /** Recipient's first name. */
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Address lines formatted for the active storefront locale. */
  readonly formatted: ReadonlyArray<Scalars['String']['output']>;
  /** Compact city, region, and country representation. */
  readonly formattedArea?: Maybe<Scalars['String']['output']>;
  /** Globally unique customer address ID. */
  readonly id: Scalars['ID']['output'];
  /** Recipient's last name. */
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /** Recipient name formatted for the active storefront locale. */
  readonly name: Scalars['String']['output'];
  /** Recipient phone number, preferably in E.164 format. */
  readonly phone?: Maybe<Scalars['String']['output']>;
  /** Localized region, state, or province name. */
  readonly province?: Maybe<Scalars['String']['output']>;
  /** Region, state, or province code. */
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
  /** Postal or ZIP code. */
  readonly zip?: Maybe<Scalars['String']['output']>;
};

/** Result of creating a customer address. */
export type CustomerAddressCreatePayload = {
  readonly __typename: 'CustomerAddressCreatePayload';
  /** The created address, or null when creation failed. */
  readonly customerAddress?: Maybe<CustomerAddress>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Result of deleting a customer address. */
export type CustomerAddressDeletePayload = {
  readonly __typename: 'CustomerAddressDeletePayload';
  /** ID of the deleted address, or null when no address was deleted. */
  readonly deletedAddressId?: Maybe<Scalars['ID']['output']>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/**
 * Portable international mailing-address input shared by create and update
 * operations. Country-specific requirements are validated using countryCode.
 */
export type CustomerAddressInput = {
  /** Primary street address or post office box. */
  readonly address1?: InputMaybe<Scalars['String']['input']>;
  /** Apartment, suite, unit, or other secondary address information. */
  readonly address2?: InputMaybe<Scalars['String']['input']>;
  /** City, town, village, or locality. */
  readonly city?: InputMaybe<Scalars['String']['input']>;
  /** Company or organization associated with the address. */
  readonly company?: InputMaybe<Scalars['String']['input']>;
  /** ISO 3166-1 alpha-2 country or territory code. */
  readonly countryCode?: InputMaybe<CountryCode>;
  /** Recipient's first name. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient's last name. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient phone number, preferably in E.164 format. */
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  /** Region, state, or province code. */
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
  /** Postal or ZIP code. */
  readonly zip?: InputMaybe<Scalars['String']['input']>;
};

/** Result of updating a customer address. */
export type CustomerAddressUpdatePayload = {
  readonly __typename: 'CustomerAddressUpdatePayload';
  /** The updated address, or null when the update failed. */
  readonly customerAddress?: Maybe<CustomerAddress>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** The authenticated customer's email contact point. */
export type CustomerEmailAddress = {
  readonly __typename: 'CustomerEmailAddress';
  /** Customer email address. */
  readonly emailAddress: Scalars['String']['output'];
  /** Current email marketing consent, when available. */
  readonly marketingConsent?: Maybe<CustomerMarketingConsent>;
};

/** Result of subscribing the customer's email address to marketing. */
export type CustomerEmailMarketingSubscribePayload = {
  readonly __typename: 'CustomerEmailMarketingSubscribePayload';
  /** Email contact point with its updated consent state. */
  readonly emailAddress?: Maybe<CustomerEmailAddress>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Result of unsubscribing the customer's email address from marketing. */
export type CustomerEmailMarketingUnsubscribePayload = {
  readonly __typename: 'CustomerEmailMarketingUnsubscribePayload';
  /** Email contact point with its updated consent state. */
  readonly emailAddress?: Maybe<CustomerEmailAddress>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Current consent state for one customer marketing channel. */
export type CustomerMarketingConsent = {
  readonly __typename: 'CustomerMarketingConsent';
  /** Current customer-selectable consent state. */
  readonly state: CustomerMarketingConsentState;
};

/** Customer-selectable marketing consent states. */
export type CustomerMarketingConsentState =
  /** Consent has been initiated but is awaiting confirmation. */
  | 'PENDING'
  /** The customer has consented to receive marketing messages. */
  | 'SUBSCRIBED'
  /** The customer has withdrawn or declined marketing consent. */
  | 'UNSUBSCRIBED';

/** The authenticated customer's phone contact point. */
export type CustomerPhoneNumber = {
  readonly __typename: 'CustomerPhoneNumber';
  /** Customer phone number, preferably in E.164 format. */
  readonly phoneNumber: Scalars['String']['output'];
};

/**
 * Minimal personal profile input for the initial storefront contract.
 * Additional customer-editable fields can be added when their behavior is defined.
 */
export type CustomerUpdateInput = {
  /** New first name. Omit to leave it unchanged. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  /** New last name. Omit to leave it unchanged. */
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
};

/** Result of updating the authenticated customer's profile. */
export type CustomerUpdatePayload = {
  readonly __typename: 'CustomerUpdatePayload';
  /** The updated customer, or null when the update could not be applied. */
  readonly customer?: Maybe<Customer>;
  /** User-facing validation or business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** A customer-facing mutation error. */
export type CustomerUserError = {
  readonly __typename: 'CustomerUserError';
  /** Stable machine-readable error code, when available. */
  readonly code?: Maybe<Scalars['String']['output']>;
  /** Path to the input field associated with the error, when available. */
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** Human-readable error message safe to show to the customer. */
  readonly message: Scalars['String']['output'];
};

/** Dimension (length) measurement units */
export type DimensionUnit =
  /** Centimeter */
  | 'cm'
  /** Foot */
  | 'ft'
  /** Inch */
  | 'in'
  /** Meter */
  | 'm'
  /** Millimeter */
  | 'mm';

/** Physical dimensions expressed in a common length unit. */
export type Dimensions = {
  readonly __typename: 'Dimensions';
  readonly height: Scalars['Float']['output'];
  readonly length: Scalars['Float']['output'];
  readonly unit: DimensionUnit;
  readonly width: Scalars['Float']['output'];
};

/** Represents an error in the input of a mutation. */
export type DisplayableError = {
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  readonly message: Scalars['String']['output'];
};

/** A video hosted outside of the platform. */
export type ExternalVideo = Media & Node & {
  readonly __typename: 'ExternalVideo';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly embedUrl: Scalars['URL']['output'];
  readonly host: MediaHost;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly originUrl: Scalars['URL']['output'];
  readonly presentation?: Maybe<MediaPresentation>;
  readonly previewImage?: Maybe<Image>;
};

/** A configured listing facet owned by the Listing service. */
export type Facet = Node & {
  readonly __typename: 'Facet';
  readonly facetType: FacetType;
  readonly id: Scalars['ID']['output'];
  readonly label: Scalars['String']['output'];
  readonly selectionMode: FacetSelectionMode;
  readonly slug: Scalars['String']['output'];
  readonly uiType: FacetUiType;
};

export type FacetFilterInput = {
  /** Public facet handle, for example `color` or `material`. */
  readonly facet: Scalars['String']['input'];
  /** Public facet value handle, for example `blue` or `cotton`. */
  readonly value: Scalars['String']['input'];
};

export type FacetSelectionMode =
  | 'MULTI'
  | 'SINGLE';

/**
 * Canonical color or gradient metadata associated with a facet value. Image
 * swatches are not exposed until the Media storefront entity path is available.
 */
export type FacetSwatch = Node & {
  readonly __typename: 'FacetSwatch';
  readonly colorOne?: Maybe<Scalars['String']['output']>;
  readonly colorTwo?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly metadata?: Maybe<Scalars['JSON']['output']>;
  readonly swatchType: SwatchType;
};

export type FacetType =
  | 'FEATURE'
  | 'IN_STOCK'
  | 'OPTION'
  | 'PRICE'
  | 'TAG';

export type FacetUiType =
  | 'BOOLEAN'
  | 'CHECKBOX'
  | 'DROPDOWN'
  | 'RADIO'
  | 'RANGE';

/** A configured value belonging to a canonical listing facet. */
export type FacetValue = Node & {
  readonly __typename: 'FacetValue';
  readonly facet: Facet;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly kind: FacetValueKind;
  readonly label: Scalars['String']['output'];
  readonly sortIndex: Scalars['Int']['output'];
  readonly swatch?: Maybe<FacetSwatch>;
};

export type FacetValueKind =
  | 'GROUP'
  | 'SOURCE';

/** Error information for a failed field. */
export type FieldError = {
  readonly __typename: 'FieldError';
  /** Optional machine-readable error code. */
  readonly code?: Maybe<Scalars['String']['output']>;
  /** Name of the field that caused the error. */
  readonly field: Scalars['String']['output'];
  /** Human-readable error message. */
  readonly message: Scalars['String']['output'];
};

/**
 * A filter available for the current result set.
 *
 * The input of each FilterValue is a JSON object matching ListingFilterInput and
 * can be passed unchanged into the filters argument of the next request.
 */
export type Filter = {
  readonly __typename: 'Filter';
  /**
   * The configured canonical facet represented by this filter.
   * Null for virtual availability and price filters.
   */
  readonly facet?: Maybe<Facet>;
  /** Stable public identifier within the storefront listing contract. */
  readonly id: Scalars['String']['output'];
  readonly label: Scalars['String']['output'];
  /** Preferred visual representation of filter values. */
  readonly presentation?: Maybe<FilterPresentation>;
  /** Typed bounds and active selection for a PRICE_RANGE filter. */
  readonly priceRange?: Maybe<FilterPriceRange>;
  /**
   * The selection behavior configured on facet. Null for virtual filters, whose
   * behavior is determined by Filter.type.
   */
  readonly selectionMode?: Maybe<FacetSelectionMode>;
  readonly type: FilterType;
  /** Selectable values and reusable inputs for this filter. */
  readonly values: ReadonlyArray<FilterValue>;
};

export type FilterPresentation =
  | 'SWATCH'
  | 'TEXT';

/** Store-currency price metadata expressed in decimal major units. */
export type FilterPriceRange = {
  readonly __typename: 'FilterPriceRange';
  readonly max: Money;
  readonly min: Money;
  readonly selectedMax?: Maybe<Money>;
  readonly selectedMin?: Maybe<Money>;
};

export type FilterType =
  | 'BOOLEAN'
  | 'LIST'
  | 'PRICE_RANGE';

export type FilterValue = {
  readonly __typename: 'FilterValue';
  /**
   * Number of distinct matching products after target-filter isolation.
   * Selected values remain present when their count is zero.
   */
  readonly count: Scalars['Int']['output'];
  /**
   * The configured canonical facet value represented by this result value.
   * Null for virtual availability and price values.
   */
  readonly facetValue?: Maybe<FacetValue>;
  /** Stable identifier within the parent filter. */
  readonly id: Scalars['String']['output'];
  /** A JSON object matching ListingFilterInput that can be reused in filters. */
  readonly input: Scalars['JSON']['output'];
  readonly label: Scalars['String']['output'];
  readonly selected: Scalars['Boolean']['output'];
  /** Canonical swatch associated with facetValue, when configured. */
  readonly swatch?: Maybe<FacetSwatch>;
};

/**
 * Any file that doesn't fit into a designated type like image or video. For
 * example, a PDF or JSON document.
 */
export type GenericFile = Node & {
  readonly __typename: 'GenericFile';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly mimeType?: Maybe<Scalars['String']['output']>;
  readonly originalFileSize?: Maybe<Scalars['Int']['output']>;
  readonly previewImage?: Maybe<Image>;
  readonly url?: Maybe<Scalars['URL']['output']>;
};

/** An image resource with URL, dimensions, and transformation options. */
export type Image = {
  readonly __typename: 'Image';
  readonly altText?: Maybe<Scalars['String']['output']>;
  readonly height?: Maybe<Scalars['Int']['output']>;
  readonly id?: Maybe<Scalars['ID']['output']>;
  readonly thumbhash?: Maybe<Scalars['String']['output']>;
  readonly url: Scalars['URL']['output'];
  readonly width?: Maybe<Scalars['Int']['output']>;
};


/** An image resource with URL, dimensions, and transformation options. */
export type ImageUrlArgs = {
  transform?: InputMaybe<ImageTransformInput>;
};

/** List of supported image content types. */
export type ImageContentType =
  | 'JPG'
  | 'PNG'
  | 'WEBP';

/** The available options for transforming an image. */
export type ImageTransformInput = {
  readonly crop?: InputMaybe<CropRegion>;
  readonly maxHeight?: InputMaybe<Scalars['Int']['input']>;
  readonly maxWidth?: InputMaybe<Scalars['Int']['input']>;
  readonly preferredContentType?: InputMaybe<ImageContentType>;
  readonly scale?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Buyer-safe inventory information for a product variant.
 *
 * Warehouse identities, reservations, unavailable quantities, and unit costs are
 * operational data and are intentionally available only through the Admin API.
 */
export type InventoryItem = Node & {
  readonly __typename: 'InventoryItem';
  readonly availableForSale: Scalars['Boolean']['output'];
  readonly currentlyNotInStock: Scalars['Boolean']['output'];
  readonly id: Scalars['ID']['output'];
  readonly inventoryPolicy: ProductVariantInventoryPolicy;
  readonly quantityAvailable?: Maybe<Scalars['Int']['output']>;
  readonly requiresShipping: Scalars['Boolean']['output'];
  readonly sku?: Maybe<Scalars['String']['output']>;
  readonly tracked: Scalars['Boolean']['output'];
  readonly variant: ProductVariant;
};

export type Language = {
  readonly __typename: 'Language';
  readonly code: LocaleCode;
  readonly name: Scalars['String']['output'];
};

/**
 * One structured listing predicate.
 *
 * Exactly one field must be provided. Different filter kinds are combined with
 * AND. Repeated values of the same filter are combined with OR. Variant facets,
 * price, and availability are evaluated against the same variant.
 */
export type ListingFilterInput = {
  readonly availability?: InputMaybe<Availability>;
  readonly facet?: InputMaybe<FacetFilterInput>;
  readonly price?: InputMaybe<PriceRangeFilterInput>;
  readonly vendorId?: InputMaybe<Scalars['ID']['input']>;
};

/**
 * Deterministic storefront product sorting.
 *
 * Availability placement is controlled by listing/search policy and is not
 * reversed by the selected product sort.
 */
export type ListingSort =
  /** Creation date descending. Available in global, category, and query contexts. */
  | 'CREATED_AT'
  /** Merchant-defined order. Available only in category scope. */
  | 'MANUAL'
  /** Published date descending. Available in global, category, and query contexts. */
  | 'NEWEST'
  /** Storefront price ascending. Available in global, category, and query contexts. */
  | 'PRICE_ASC'
  /** Storefront price descending. Available in global, category, and query contexts. */
  | 'PRICE_DESC'
  /** Search relevance. Available when a query is active in any scope. */
  | 'RELEVANCE'
  /** Localized title ascending. Available in global, category, and query contexts. */
  | 'TITLE_ASC'
  /** Localized title descending. Available in global, category, and query contexts. */
  | 'TITLE_DESC';

/** Language/Locale codes based on ISO 639-1 and BCP 47 */
export type LocaleCode =
  /** Akan */
  | 'ak'
  /** Amharic */
  | 'am'
  /** Arabic */
  | 'ar'
  /** Assamese */
  | 'as'
  /** Azerbaijani */
  | 'az'
  /** Belarusian */
  | 'be'
  /** Bulgarian */
  | 'bg'
  /** Bambara */
  | 'bm'
  /** Bangla */
  | 'bn'
  /** Tibetan */
  | 'bo'
  /** Breton */
  | 'br'
  /** Bosnian */
  | 'bs'
  /** Catalan */
  | 'ca'
  /** Chechen */
  | 'ce'
  /** Central Kurdish */
  | 'ckb'
  /** Czech */
  | 'cs'
  /** Welsh */
  | 'cy'
  /** Danish */
  | 'da'
  /** German */
  | 'de'
  /** Dzongkha */
  | 'dz'
  /** Ewe */
  | 'ee'
  /** Greek */
  | 'el'
  /** English */
  | 'en'
  /** Esperanto */
  | 'eo'
  /** Spanish */
  | 'es'
  /** Estonian */
  | 'et'
  /** Basque */
  | 'eu'
  /** Persian */
  | 'fa'
  /** Fulah */
  | 'ff'
  /** Finnish */
  | 'fi'
  /** Filipino */
  | 'fil'
  /** Faroese */
  | 'fo'
  /** French */
  | 'fr'
  /** Western Frisian */
  | 'fy'
  /** Irish */
  | 'ga'
  /** Scottish Gaelic */
  | 'gd'
  /** Galician */
  | 'gl'
  /** Gujarati */
  | 'gu'
  /** Manx */
  | 'gv'
  /** Hausa */
  | 'ha'
  /** Hebrew */
  | 'he'
  /** Hindi */
  | 'hi'
  /** Croatian */
  | 'hr'
  /** Hungarian */
  | 'hu'
  /** Armenian */
  | 'hy'
  /** Interlingua */
  | 'ia'
  /** Indonesian */
  | 'id'
  /** Igbo */
  | 'ig'
  /** Sichuan Yi */
  | 'ii'
  /** Icelandic */
  | 'is'
  /** Italian */
  | 'it'
  /** Japanese */
  | 'ja'
  /** Javanese */
  | 'jv'
  /** Georgian */
  | 'ka'
  /** Kikuyu */
  | 'ki'
  /** Kazakh */
  | 'kk'
  /** Kalaallisut */
  | 'kl'
  /** Khmer */
  | 'km'
  /** Kannada */
  | 'kn'
  /** Korean */
  | 'ko'
  /** Kashmiri */
  | 'ks'
  /** Kurdish */
  | 'ku'
  /** Cornish */
  | 'kw'
  /** Kyrgyz */
  | 'ky'
  /** Luxembourgish */
  | 'lb'
  /** Ganda */
  | 'lg'
  /** Lingala */
  | 'ln'
  /** Lao */
  | 'lo'
  /** Lithuanian */
  | 'lt'
  /** Luba-Katanga */
  | 'lu'
  /** Latvian */
  | 'lv'
  /** Malagasy */
  | 'mg'
  /** Māori */
  | 'mi'
  /** Macedonian */
  | 'mk'
  /** Malayalam */
  | 'ml'
  /** Mongolian */
  | 'mn'
  /** Marathi */
  | 'mr'
  /** Malay */
  | 'ms'
  /** Maltese */
  | 'mt'
  /** Burmese */
  | 'my'
  /** Norwegian Bokmål */
  | 'nb'
  /** North Ndebele */
  | 'nd'
  /** Nepali */
  | 'ne'
  /** Dutch */
  | 'nl'
  /** Norwegian Nynorsk */
  | 'nn'
  /** Norwegian */
  | 'no'
  /** Oromo */
  | 'om'
  /** Odia */
  | 'or'
  /** Ossetic */
  | 'os'
  /** Punjabi */
  | 'pa'
  /** Polish */
  | 'pl'
  /** Pashto */
  | 'ps'
  /** Portuguese (Brazil) */
  | 'pt_BR'
  /** Portuguese (Portugal) */
  | 'pt_PT'
  /** Quechua */
  | 'qu'
  /** Romansh */
  | 'rm'
  /** Rundi */
  | 'rn'
  /** Romanian */
  | 'ro'
  /** Russian */
  | 'ru'
  /** Kinyarwanda */
  | 'rw'
  /** Sanskrit */
  | 'sa'
  /** Sardinian */
  | 'sc'
  /** Sindhi */
  | 'sd'
  /** Northern Sami */
  | 'se'
  /** Sango */
  | 'sg'
  /** Sinhala */
  | 'si'
  /** Slovak */
  | 'sk'
  /** Slovenian */
  | 'sl'
  /** Shona */
  | 'sn'
  /** Somali */
  | 'so'
  /** Albanian */
  | 'sq'
  /** Serbian */
  | 'sr'
  /** Sundanese */
  | 'su'
  /** Swedish */
  | 'sv'
  /** Swahili */
  | 'sw'
  /** Tamil */
  | 'ta'
  /** Telugu */
  | 'te'
  /** Tajik */
  | 'tg'
  /** Thai */
  | 'th'
  /** Tigrinya */
  | 'ti'
  /** Turkmen */
  | 'tk'
  /** Tongan */
  | 'to'
  /** Turkish */
  | 'tr'
  /** Tatar */
  | 'tt'
  /** Uyghur */
  | 'ug'
  /** Ukrainian */
  | 'uk'
  /** Urdu */
  | 'ur'
  /** Uzbek */
  | 'uz'
  /** Vietnamese */
  | 'vi'
  /** Wolof */
  | 'wo'
  /** Xhosa */
  | 'xh'
  /** Yiddish */
  | 'yi'
  /** Yoruba */
  | 'yo'
  /** Chinese (Simplified) */
  | 'zh_CN'
  /** Chinese (Traditional) */
  | 'zh_TW'
  /** Zulu */
  | 'zu';

export type Localization = {
  readonly __typename: 'Localization';
  readonly availableCountries: ReadonlyArray<Country>;
  readonly availableCurrencies: ReadonlyArray<Currency>;
  readonly availableLanguages: ReadonlyArray<Language>;
  readonly country: Country;
  readonly currency: Currency;
  readonly language: Language;
  readonly market: Market;
  readonly store: Store;
};

export type Market = Node & {
  readonly __typename: 'Market';
  readonly countries: ReadonlyArray<Country>;
  readonly currencies: ReadonlyArray<Currency>;
  readonly defaultCountry?: Maybe<Country>;
  readonly defaultCurrency: Currency;
  readonly defaultLanguage: Language;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly languages: ReadonlyArray<Language>;
  readonly name: Scalars['String']['output'];
  readonly taxIncluded: Scalars['Boolean']['output'];
  readonly timezone: Scalars['String']['output'];
};

export type MarketConnection = Connection & {
  readonly __typename: 'MarketConnection';
  readonly edges: ReadonlyArray<MarketEdge>;
  readonly nodes: ReadonlyArray<Market>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type MarketEdge = {
  readonly __typename: 'MarketEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Market;
};

/** A common set of fields for media content associated with products. */
export type Media = {
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly presentation?: Maybe<MediaPresentation>;
  readonly previewImage?: Maybe<Image>;
};

/** The possible content types for a media object. */
export type MediaContentType =
  | 'EXTERNAL_VIDEO'
  | 'IMAGE'
  | 'MODEL_3D'
  | 'VIDEO';

/** Host for a media resource. */
export type MediaHost =
  | 'VIMEO'
  | 'YOUTUBE';

/** An image owned and resolved by the Media subgraph. */
export type MediaImage = Media & Node & {
  readonly __typename: 'MediaImage';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly image?: Maybe<Image>;
  readonly mediaContentType: MediaContentType;
  readonly presentation?: Maybe<MediaPresentation>;
  readonly previewImage?: Maybe<Image>;
};

/** A media presentation. */
export type MediaPresentation = {
  readonly __typename: 'MediaPresentation';
  readonly asJson?: Maybe<Scalars['JSON']['output']>;
};


/** A media presentation. */
export type MediaPresentationAsJsonArgs = {
  format: MediaPresentationFormat;
};

/** The possible formats for a media presentation. */
export type MediaPresentationFormat =
  | 'IMAGE'
  | 'MODEL_VIEWER';

/** A hosted 3D model. */
export type Model3d = Media & Node & {
  readonly __typename: 'Model3d';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly presentation?: Maybe<MediaPresentation>;
  readonly previewImage?: Maybe<Image>;
  readonly sources: ReadonlyArray<Model3dSource>;
};

/** A source for a hosted 3D model. */
export type Model3dSource = {
  readonly __typename: 'Model3dSource';
  readonly filesize: Scalars['Int']['output'];
  readonly format: Scalars['String']['output'];
  readonly mimeType: Scalars['String']['output'];
  readonly url: Scalars['String']['output'];
};

/** A precise monetary value with its associated currency. */
export type Money = {
  readonly __typename: 'Money';
  readonly amount: Scalars['Decimal']['output'];
  readonly currencyCode: CurrencyCode;
};

/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type Mutation = {
  readonly __typename: 'Mutation';
  readonly _catalog?: Maybe<Scalars['Boolean']['output']>;
  readonly _listing?: Maybe<Scalars['Boolean']['output']>;
  readonly _media?: Maybe<Scalars['Boolean']['output']>;
  /** Sets, replaces, or clears the billing address for the checkout. */
  readonly checkoutBillingAddressUpdate: CheckoutMutationPayload;
  /** Creates a new checkout. */
  readonly checkoutCreate: CheckoutMutationPayload;
  /** Updates the display currency of the checkout (ISO 4217, e.g. "USD", "EUR"). */
  readonly checkoutCurrencyCodeUpdate: CheckoutMutationPayload;
  /**
   * Updates customer identification data associated with the checkout
   * while authenticated customer ownership is resolved from trusted context.
   */
  readonly checkoutCustomerIdentityUpdate: CheckoutMutationPayload;
  /** Updates the customer note attached to the checkout (delivery instructions, etc.). */
  readonly checkoutCustomerNoteUpdate: CheckoutMutationPayload;
  /** Adds one or more delivery addresses to the checkout (supports multi-shipping). */
  readonly checkoutDeliveryAddressesAdd: CheckoutMutationPayload;
  /** Removes one or more delivery addresses previously attached to the checkout. */
  readonly checkoutDeliveryAddressesRemove: CheckoutMutationPayload;
  /** Updates previously added delivery addresses (e.g., correcting postal code or city). */
  readonly checkoutDeliveryAddressesUpdate: CheckoutMutationPayload;
  /** Selects or changes the delivery method for the entire checkout or specific address. */
  readonly checkoutDeliveryMethodUpdate: CheckoutMutationPayload;
  /** Adds recipients to delivery groups. */
  readonly checkoutDeliveryRecipientsAdd: CheckoutMutationPayload;
  /** Removes recipients from delivery groups. */
  readonly checkoutDeliveryRecipientsRemove: CheckoutMutationPayload;
  /** Updates recipients for delivery groups. */
  readonly checkoutDeliveryRecipientsUpdate: CheckoutMutationPayload;
  /** Updates the language/locale of the checkout (affects localization and formatting). */
  readonly checkoutLanguageCodeUpdate: CheckoutMutationPayload;
  /** Adds an item to an existing checkout. */
  readonly checkoutLinesAdd: CheckoutMutationPayload;
  /** Clears all items from a checkout. */
  readonly checkoutLinesClear: CheckoutMutationPayload;
  /** Removes a single item from the checkout. */
  readonly checkoutLinesDelete: CheckoutMutationPayload;
  /** Replaces one checkout line with another by merging quantities and removing the source line. */
  readonly checkoutLinesReplace: CheckoutMutationPayload;
  /** Updates the quantity of a specific checkout item. */
  readonly checkoutLinesUpdate: CheckoutMutationPayload;
  /** Selects or changes the payment method for the checkout. */
  readonly checkoutPaymentMethodUpdate: CheckoutMutationPayload;
  /** Applies a promo code/coupon to the checkout. */
  readonly checkoutPromoCodeAdd: CheckoutMutationPayload;
  /** Removes a previously applied promo code/coupon from the checkout. */
  readonly checkoutPromoCodeRemove: CheckoutMutationPayload;
  /** Creates a new checkout tag. */
  readonly checkoutTagCreate: CheckoutMutationPayload;
  /** Deletes a checkout tag. */
  readonly checkoutTagDelete: CheckoutMutationPayload;
  /** Updates a checkout tag. */
  readonly checkoutTagUpdate: CheckoutMutationPayload;
  /**
   * Creates a mailing address owned by the authenticated customer.
   * The new address can optionally become the customer's default address.
   */
  readonly customerAddressCreate: CustomerAddressCreatePayload;
  /**
   * Deletes a mailing address owned by the authenticated customer.
   * The operation must reject addresses belonging to another customer.
   */
  readonly customerAddressDelete: CustomerAddressDeletePayload;
  /**
   * Updates a mailing address owned by the authenticated customer.
   * The operation must reject addresses belonging to another customer.
   */
  readonly customerAddressUpdate: CustomerAddressUpdatePayload;
  /** Subscribes the authenticated customer's verified email address to marketing. */
  readonly customerEmailMarketingSubscribe: CustomerEmailMarketingSubscribePayload;
  /** Unsubscribes the authenticated customer's email address from marketing. */
  readonly customerEmailMarketingUnsubscribe: CustomerEmailMarketingUnsubscribePayload;
  /**
   * Updates personal profile fields for the authenticated customer.
   * Authentication and customer ownership are resolved from storefront context.
   */
  readonly customerUpdate: CustomerUpdatePayload;
  /** Cancels an eligible order owned by the authenticated customer. */
  readonly orderCancel: OrderCancelPayload;
  /**
   * Starts another payment attempt for an eligible failed, expired, or pending
   * order payment. Replaying the same idempotency key returns the same attempt.
   */
  readonly orderPaymentRetry: OrderPaymentRetryPayload;
  /** Creates a new checkout from currently purchasable lines of an order. */
  readonly orderReorder: OrderReorderPayload;
  /** Cancels a return request while its current state permits cancellation. */
  readonly orderReturnRequestCancel: OrderReturnRequestCancelPayload;
  /** Creates a return request for eligible quantities of purchased lines. */
  readonly orderReturnRequestCreate: OrderReturnRequestCreatePayload;
  /** Creates a new session using email and password. */
  readonly passwordSignIn: PasswordSignInPayload;
  /** Registers a new user and returns a session. */
  readonly passwordSignUp: PasswordSignUpPayload;
  /**
   * Places a committed checkout through the durable order placement workflow.
   * Repeating the same request with the same idempotency key returns the same result.
   */
  readonly placeOrder: PlaceOrderPayload;
  /**
   * Adds a customer answer to an existing product question.
   *
   * Customer answers must be enabled by reviewStoreConfiguration. Official and
   * accepted-answer state cannot be assigned through the Storefront API.
   */
  readonly productQuestionAnswerCreate: ProductQuestionAnswerCreatePayload;
  /** Deletes a question answer owned by the authenticated customer. */
  readonly productQuestionAnswerDelete: ProductQuestionAnswerDeletePayload;
  /** Updates a question answer owned by the authenticated customer. */
  readonly productQuestionAnswerUpdate: ProductQuestionAnswerUpdatePayload;
  /**
   * Submits a product question in the active storefront context.
   *
   * The authenticated customer is resolved from trusted request context. Guest
   * submission is available only when enabled by reviewStoreConfiguration.
   */
  readonly productQuestionCreate: ProductQuestionCreatePayload;
  /** Deletes a product question owned by the authenticated customer. */
  readonly productQuestionDelete: ProductQuestionDeletePayload;
  /** Creates, updates, pauses, or removes the viewer's question subscription. */
  readonly productQuestionSubscriptionSet: ProductQuestionSubscriptionSetPayload;
  /** Updates a product question owned by the authenticated customer. */
  readonly productQuestionUpdate: ProductQuestionUpdatePayload;
  /** Sends a password recovery email. */
  readonly requestPasswordRecovery: PasswordRecoveryPayload;
  /** Resets the user's password with a recovery token. */
  readonly resetPassword: ResetPasswordPayload;
  /**
   * Reports storefront review content for moderation.
   *
   * A viewer may have only one active report for the same content. Customer or
   * anonymous visitor identity is resolved from trusted storefront request
   * context and cannot be supplied as a GraphQL argument.
   */
  readonly reviewContentReportCreate: ReviewContentReportCreatePayload;
  /** Removes the current viewer's LIKE or DISLIKE vote. */
  readonly reviewContentVoteRemove: ReviewContentVoteRemovePayload;
  /**
   * Sets the current viewer's LIKE or DISLIKE vote on storefront review content.
   *
   * Repeating the same vote is idempotent. Setting the opposite type replaces the
   * previous vote. Customer or anonymous visitor identity is resolved from
   * trusted storefront request context.
   */
  readonly reviewContentVoteSet: ReviewContentVoteSetPayload;
  /**
   * Submits a product review in the active storefront context.
   *
   * The authenticated customer is resolved from trusted request context. Guest
   * submission is available only when enabled by reviewStoreConfiguration.
   * Verification and moderation state are always determined by the service.
   */
  readonly reviewCreate: ReviewCreatePayload;
  /** Deletes a review owned by the authenticated customer within its edit window. */
  readonly reviewDelete: ReviewDeletePayload;
  /** Updates a review owned by the authenticated customer within its edit window. */
  readonly reviewUpdate: ReviewUpdatePayload;
  /** Signs out the current user. */
  readonly signOut: Scalars['Boolean']['output'];
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutBillingAddressUpdateArgs = {
  input: CheckoutBillingAddressUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutCreateArgs = {
  input: CheckoutCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutCurrencyCodeUpdateArgs = {
  input: CheckoutCurrencyCodeUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutCustomerIdentityUpdateArgs = {
  input: CheckoutCustomerIdentityUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutCustomerNoteUpdateArgs = {
  input: CheckoutCustomerNoteUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryAddressesAddArgs = {
  input: CheckoutDeliveryAddressesAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryAddressesRemoveArgs = {
  input: CheckoutDeliveryAddressesRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryAddressesUpdateArgs = {
  input: CheckoutDeliveryAddressesUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryMethodUpdateArgs = {
  input: CheckoutDeliveryMethodUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryRecipientsAddArgs = {
  input: CheckoutDeliveryRecipientsAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryRecipientsRemoveArgs = {
  input: CheckoutDeliveryRecipientsRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutDeliveryRecipientsUpdateArgs = {
  input: CheckoutDeliveryRecipientsUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLanguageCodeUpdateArgs = {
  input: CheckoutLanguageCodeUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLinesAddArgs = {
  input: CheckoutLinesAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLinesClearArgs = {
  input: CheckoutLinesClearInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLinesDeleteArgs = {
  input: CheckoutLinesDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLinesReplaceArgs = {
  input: CheckoutLinesReplaceInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLinesUpdateArgs = {
  input: CheckoutLinesUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutPaymentMethodUpdateArgs = {
  input: CheckoutPaymentMethodUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutPromoCodeAddArgs = {
  input: CheckoutPromoCodeAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutPromoCodeRemoveArgs = {
  input: CheckoutPromoCodeRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutTagCreateArgs = {
  input: CheckoutTagCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutTagDeleteArgs = {
  input: CheckoutTagDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutTagUpdateArgs = {
  input: CheckoutTagUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressCreateArgs = {
  address: CustomerAddressInput;
  defaultAddress?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressDeleteArgs = {
  addressId: Scalars['ID']['input'];
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressUpdateArgs = {
  address?: InputMaybe<CustomerAddressInput>;
  addressId: Scalars['ID']['input'];
  defaultAddress?: InputMaybe<Scalars['Boolean']['input']>;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerUpdateArgs = {
  input: CustomerUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationOrderCancelArgs = {
  input: OrderCancelInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationOrderPaymentRetryArgs = {
  input: OrderPaymentRetryInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationOrderReorderArgs = {
  input: OrderReorderInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationOrderReturnRequestCancelArgs = {
  input: OrderReturnRequestCancelInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationOrderReturnRequestCreateArgs = {
  input: OrderReturnRequestCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationPasswordSignInArgs = {
  input: PasswordSignInInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationPasswordSignUpArgs = {
  input: PasswordSignUpInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionAnswerCreateArgs = {
  input: ProductQuestionAnswerCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionAnswerDeleteArgs = {
  input: ReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionAnswerUpdateArgs = {
  input: ProductQuestionAnswerUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionCreateArgs = {
  input: ProductQuestionCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionDeleteArgs = {
  input: ReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionSubscriptionSetArgs = {
  input: ProductQuestionSubscriptionSetInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationProductQuestionUpdateArgs = {
  input: ProductQuestionUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationRequestPasswordRecoveryArgs = {
  input: PasswordRecoveryInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewContentReportCreateArgs = {
  input: ReviewContentReportCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewContentVoteRemoveArgs = {
  input: ReviewContentVoteRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewContentVoteSetArgs = {
  input: ReviewContentVoteSetInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewCreateArgs = {
  input: ReviewCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewDeleteArgs = {
  input: ReviewContentDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationReviewUpdateArgs = {
  input: ReviewUpdateInput;
};

/** Enables global object identification following the Relay specification. */
export type Node = {
  readonly id: Scalars['ID']['output'];
};

/** Severity levels for checkout warnings. */
export type NotificationSeverity =
  /** Informational notice; does not indicate any change in checkout data. */
  | 'INFO'
  /** Notification about automatic adjustments (e.g., quantity reduced). */
  | 'WARNING';

/** A storefront navigation menu owned by the Online Store app. */
export type OnlineStoreNavigationMenu = Node & {
  readonly __typename: 'OnlineStoreNavigationMenu';
  /** Stable handle used by storefront layouts, for example `main-menu`. */
  readonly handle: Scalars['String']['output'];
  /** The globally unique Relay ID of the menu. */
  readonly id: Scalars['ID']['output'];
  /** Top-level menu items in merchant-defined order. */
  readonly items: OnlineStoreNavigationMenuItemConnection;
};


/** A storefront navigation menu owned by the Online Store app. */
export type OnlineStoreNavigationMenuItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A Relay connection containing navigation menus. */
export type OnlineStoreNavigationMenuConnection = Connection & {
  readonly __typename: 'OnlineStoreNavigationMenuConnection';
  readonly edges: ReadonlyArray<OnlineStoreNavigationMenuEdge>;
  readonly nodes: ReadonlyArray<OnlineStoreNavigationMenu>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type OnlineStoreNavigationMenuEdge = {
  readonly __typename: 'OnlineStoreNavigationMenuEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: OnlineStoreNavigationMenu;
};

/** A localized item in an ordered navigation tree. */
export type OnlineStoreNavigationMenuItem = Node & {
  readonly __typename: 'OnlineStoreNavigationMenuItem';
  /** Direct children in merchant-defined order. */
  readonly children: OnlineStoreNavigationMenuItemConnection;
  /** The globally unique Relay ID of the item. */
  readonly id: Scalars['ID']['output'];
  /**
   * Label in the requested locale.
   *
   * When locale is omitted, the active storefront locale is used. Null is
   * returned when the requested locale is not active or has no translation.
   */
  readonly label?: Maybe<Scalars['String']['output']>;
  readonly menu: OnlineStoreNavigationMenu;
  readonly openInNewTab: Scalars['Boolean']['output'];
  readonly parent?: Maybe<OnlineStoreNavigationMenuItem>;
  readonly target: OnlineStoreNavigationTarget;
};


/** A localized item in an ordered navigation tree. */
export type OnlineStoreNavigationMenuItemChildrenArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A localized item in an ordered navigation tree. */
export type OnlineStoreNavigationMenuItemLabelArgs = {
  locale?: InputMaybe<LocaleCode>;
};

/** A Relay connection containing one ordered level of a menu tree. */
export type OnlineStoreNavigationMenuItemConnection = Connection & {
  readonly __typename: 'OnlineStoreNavigationMenuItemConnection';
  readonly edges: ReadonlyArray<OnlineStoreNavigationMenuItemEdge>;
  readonly nodes: ReadonlyArray<OnlineStoreNavigationMenuItem>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type OnlineStoreNavigationMenuItemEdge = {
  readonly __typename: 'OnlineStoreNavigationMenuItemEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: OnlineStoreNavigationMenuItem;
};

/** A normalized, frontend-ready navigation destination. */
export type OnlineStoreNavigationTarget = {
  readonly __typename: 'OnlineStoreNavigationTarget';
  /**
   * Referenced federated Node when the resource is public and resolvable.
   *
   * This can resolve to OnlineStorePage, Product, or Category. It is null for
   * URL targets and unavailable resources.
   */
  readonly resource?: Maybe<Node>;
  /** Global Relay ID of the referenced resource. Null only for a URL target. */
  readonly resourceId?: Maybe<Scalars['ID']['output']>;
  readonly type: OnlineStoreNavigationTargetType;
  /**
   * Frontend-ready destination URL. For resource targets this is the canonical
   * storefront URL derived from the referenced resource.
   */
  readonly url: Scalars['URL']['output'];
};

/** Kinds of destination supported by the Online Store domain model. */
export type OnlineStoreNavigationTargetType =
  | 'CATEGORY'
  | 'PAGE'
  | 'PRODUCT'
  | 'URL';

/** Open Graph metadata for a localized page. */
export type OnlineStoreOpenGraphMetadata = {
  readonly __typename: 'OnlineStoreOpenGraphMetadata';
  readonly description?: Maybe<Scalars['String']['output']>;
  /** Social preview image resolved by the Media subgraph. */
  readonly image?: Maybe<MediaImage>;
  readonly title?: Maybe<Scalars['String']['output']>;
};

/** A published, locale-aware content page owned by the Online Store app. */
export type OnlineStorePage = Node & {
  readonly __typename: 'OnlineStorePage';
  /**
   * Localized page content.
   *
   * When locale is omitted, the active storefront locale is used. Null is
   * returned when the requested locale is not active or has no translation.
   */
  readonly content?: Maybe<OnlineStorePageContent>;
  /** Stable, locale-independent handle used to build the page URL. */
  readonly handle: Scalars['String']['output'];
  /** The globally unique Relay ID of the page. */
  readonly id: Scalars['ID']['output'];
  /** The instant at which this page became publicly visible. */
  readonly publishedAt: Scalars['DateTime']['output'];
  /** Optional storefront template variant selected by the merchant. */
  readonly templateSuffix?: Maybe<Scalars['String']['output']>;
};


/** A published, locale-aware content page owned by the Online Store app. */
export type OnlineStorePageContentArgs = {
  locale?: InputMaybe<LocaleCode>;
};

/** A Relay connection containing published Online Store pages. */
export type OnlineStorePageConnection = Connection & {
  readonly __typename: 'OnlineStorePageConnection';
  readonly edges: ReadonlyArray<OnlineStorePageEdge>;
  readonly nodes: ReadonlyArray<OnlineStorePage>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** One localized representation of an Online Store page. */
export type OnlineStorePageContent = {
  readonly __typename: 'OnlineStorePageContent';
  readonly body?: Maybe<RichText>;
  /** Locale resolved for this representation. */
  readonly locale: LocaleCode;
  readonly seo?: Maybe<OnlineStoreSeo>;
  readonly title: Scalars['String']['output'];
};

export type OnlineStorePageEdge = {
  readonly __typename: 'OnlineStorePageEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: OnlineStorePage;
};

/** Search engine and social sharing metadata for a localized page. */
export type OnlineStoreSeo = {
  readonly __typename: 'OnlineStoreSEO';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly openGraph?: Maybe<OnlineStoreOpenGraphMetadata>;
  readonly title?: Maybe<Scalars['String']['output']>;
};

/** Metadata used when a catalog page is shared on social platforms. */
export type OpenGraphMetadata = {
  readonly __typename: 'OpenGraphMetadata';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly image?: Maybe<Media>;
  readonly title?: Maybe<Scalars['String']['output']>;
};

/** A customer-visible order in the active storefront context. */
export type Order = Node & {
  readonly __typename: 'Order';
  readonly appliedPromoCodes: ReadonlyArray<OrderPromoCode>;
  readonly channelCode?: Maybe<Scalars['String']['output']>;
  readonly closedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly cost: OrderCost;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly currencyCode: CurrencyCode;
  readonly customerIdentity: OrderCustomerIdentity;
  readonly customerNote?: Maybe<Scalars['String']['output']>;
  readonly deliveryGroups: ReadonlyArray<OrderDeliveryGroup>;
  readonly deliveryStatus: OrderDeliveryStatus;
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly fulfillmentStatus: OrderFulfillmentStatus;
  readonly fulfillments: ReadonlyArray<OrderFulfillment>;
  readonly id: Scalars['ID']['output'];
  readonly lines: ReadonlyArray<OrderLine>;
  readonly localeCode?: Maybe<LocaleCode>;
  /** Human-readable order number unique within the store. */
  readonly number: Scalars['BigInt']['output'];
  readonly payment: OrderPayment;
  /** @deprecated Use payment.method. */
  readonly paymentMethod?: Maybe<OrderPaymentMethod>;
  readonly placedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Return requests created for this order, newest first. */
  readonly returnRequests: OrderReturnRequestConnection;
  /** Server-evaluated post-order actions available to the current customer. */
  readonly selfService: OrderSelfService;
  readonly status: OrderStatus;
  readonly totalQuantity: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
};


/** A customer-visible order in the active storefront context. */
export type OrderReturnRequestsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type OrderCancelInput = {
  readonly expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
  readonly note?: InputMaybe<Scalars['String']['input']>;
  readonly orderId: Scalars['ID']['input'];
  readonly reason: OrderCancellationReason;
};

export type OrderCancelPayload = {
  readonly __typename: 'OrderCancelPayload';
  readonly order?: Maybe<Order>;
  readonly userErrors: ReadonlyArray<OrderUserError>;
};

/** Customer-selected reason for cancelling an order. */
export type OrderCancellationReason =
  | 'CHANGED_MIND'
  | 'DUPLICATE_ORDER'
  | 'INCORRECT_ADDRESS'
  | 'INCORRECT_ITEMS'
  | 'OTHER'
  | 'PAYMENT_ISSUE';

export type OrderConnection = Connection & {
  readonly __typename: 'OrderConnection';
  readonly edges: ReadonlyArray<OrderEdge>;
  readonly nodes: ReadonlyArray<Order>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** All monetary calculations captured when the order was placed. */
export type OrderCost = {
  readonly __typename: 'OrderCost';
  readonly subtotalAmount: Money;
  readonly totalAmount: Money;
  readonly totalDiscountAmount: Money;
  readonly totalShippingAmount: Money;
  readonly totalTaxAmount: Money;
};

/** Customer identity snapshot captured by the order. */
export type OrderCustomerIdentity = {
  readonly __typename: 'OrderCustomerIdentity';
  readonly countryCode?: Maybe<CountryCode>;
  readonly customer?: Maybe<Customer>;
  readonly email?: Maybe<Scalars['Email']['output']>;
  readonly firstName?: Maybe<Scalars['String']['output']>;
  readonly lastName?: Maybe<Scalars['String']['output']>;
  readonly middleName?: Maybe<Scalars['String']['output']>;
  readonly phone?: Maybe<Scalars['String']['output']>;
};

/** Immutable delivery destination captured for an order. */
export type OrderDeliveryAddress = Node & {
  readonly __typename: 'OrderDeliveryAddress';
  readonly address1?: Maybe<Scalars['String']['output']>;
  readonly address2?: Maybe<Scalars['String']['output']>;
  readonly city?: Maybe<Scalars['String']['output']>;
  readonly countryCode?: Maybe<CountryCode>;
  readonly id: Scalars['ID']['output'];
  readonly postalCode?: Maybe<Scalars['String']['output']>;
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
};

/** A delivery group and its immutable order snapshot. */
export type OrderDeliveryGroup = Node & {
  readonly __typename: 'OrderDeliveryGroup';
  readonly address?: Maybe<OrderDeliveryAddress>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly lines: ReadonlyArray<OrderLine>;
  readonly method?: Maybe<OrderDeliveryMethod>;
  readonly recipient?: Maybe<OrderRecipient>;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Delivery method selected for an order delivery group. */
export type OrderDeliveryMethod = {
  readonly __typename: 'OrderDeliveryMethod';
  readonly code: Scalars['String']['output'];
  readonly paymentModel?: Maybe<Scalars['String']['output']>;
  readonly providerCode: Scalars['String']['output'];
  readonly type: OrderDeliveryMethodType;
};

/** The delivery method selected for an order delivery group. */
export type OrderDeliveryMethodType =
  | 'LOCAL'
  | 'NONE'
  | 'PICKUP_POINT'
  | 'PICK_UP'
  | 'RETAIL'
  | 'SHIPPING';

/** Aggregate customer-facing delivery state across all shipments. */
export type OrderDeliveryStatus =
  | 'CANCELLED'
  | 'DELAYED'
  | 'DELIVERED'
  | 'DELIVERY_ATTEMPTED'
  | 'EXCEPTION'
  | 'IN_TRANSIT'
  | 'NOT_SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'PARTIALLY_SHIPPED'
  | 'RETURNED_TO_SENDER'
  | 'SHIPPED';

export type OrderEdge = {
  readonly __typename: 'OrderEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Order;
};

/** Merchant fulfillment of one or more purchased line quantities. */
export type OrderFulfillment = Node & {
  readonly __typename: 'OrderFulfillment';
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly lines: ReadonlyArray<OrderFulfillmentLine>;
  readonly shipments: ReadonlyArray<OrderShipment>;
  readonly status: OrderFulfillmentOperationStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Quantity from an order line assigned to a fulfillment. */
export type OrderFulfillmentLine = {
  readonly __typename: 'OrderFulfillmentLine';
  readonly orderLine: OrderLine;
  readonly quantity: Scalars['Int']['output'];
};

/** Lifecycle state of one fulfillment operation. */
export type OrderFulfillmentOperationStatus =
  | 'CANCELLED'
  | 'FAILURE'
  | 'OPEN'
  | 'PENDING'
  | 'SUCCESS';

/** Aggregate fulfillment state across every line in an order. */
export type OrderFulfillmentStatus =
  | 'CANCELLED'
  | 'FULFILLED'
  | 'ON_HOLD'
  | 'PARTIALLY_FULFILLED'
  | 'SCHEDULED'
  | 'UNFULFILLED';

/** Immutable customer-visible snapshot of one purchased line. */
export type OrderLine = Node & {
  readonly __typename: 'OrderLine';
  readonly cost: OrderLineCost;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly imageUrl?: Maybe<Scalars['URL']['output']>;
  readonly purchasableId: Scalars['ID']['output'];
  readonly purchasableSnapshot: Scalars['JSON']['output'];
  readonly quantity: Scalars['Int']['output'];
  /** Current return eligibility after previous returns and policy limits. */
  readonly returnEligibility: OrderLineReturnEligibility;
  readonly sku?: Maybe<Scalars['String']['output']>;
  readonly title: Scalars['String']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type OrderLineCost = {
  readonly __typename: 'OrderLineCost';
  readonly discountAmount: Money;
  readonly subtotalAmount: Money;
  readonly taxAmount: Money;
  readonly totalAmount: Money;
  readonly unitCompareAtPrice: Money;
  readonly unitPrice: Money;
};

/** Return eligibility for one purchased order line. */
export type OrderLineReturnEligibility = {
  readonly __typename: 'OrderLineReturnEligibility';
  readonly eligible: Scalars['Boolean']['output'];
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly maxQuantity: Scalars['Int']['output'];
  readonly unavailableReason?: Maybe<Scalars['String']['output']>;
  readonly unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

/** Current payment aggregate and immutable payment history for an order. */
export type OrderPayment = {
  readonly __typename: 'OrderPayment';
  readonly authorizedAmount: Money;
  readonly capturedAmount: Money;
  readonly method?: Maybe<OrderPaymentMethod>;
  readonly outstandingAmount: Money;
  readonly refundedAmount: Money;
  readonly refunds: ReadonlyArray<OrderRefund>;
  readonly retry: OrderPaymentRetry;
  readonly status: OrderPaymentStatus;
  readonly transactions: ReadonlyArray<OrderPaymentTransaction>;
  readonly voids: ReadonlyArray<OrderVoid>;
};

/** Customer interaction required to continue the new payment attempt. */
export type OrderPaymentCustomerAction = {
  readonly __typename: 'OrderPaymentCustomerAction';
  readonly data?: Maybe<Scalars['JSON']['output']>;
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly instructions?: Maybe<Scalars['String']['output']>;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly type: OrderPaymentCustomerActionType;
  readonly url?: Maybe<Scalars['URL']['output']>;
};

/** Customer interaction required to continue a retried payment. */
export type OrderPaymentCustomerActionType =
  | 'INSTRUCTIONS'
  | 'REDIRECT';

/** The customer interaction model of the selected payment method. */
export type OrderPaymentFlow =
  | 'OFFLINE'
  | 'ONLINE'
  | 'ON_DELIVERY';

/** Payment method selected when the order was placed. */
export type OrderPaymentMethod = {
  readonly __typename: 'OrderPaymentMethod';
  readonly code: Scalars['String']['output'];
  readonly flow: OrderPaymentFlow;
  readonly providerCode: Scalars['String']['output'];
};

/** Availability of another customer-initiated payment attempt. */
export type OrderPaymentRetry = {
  readonly __typename: 'OrderPaymentRetry';
  readonly available: Scalars['Boolean']['output'];
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly unavailableReason?: Maybe<Scalars['String']['output']>;
  readonly unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

export type OrderPaymentRetryInput = {
  readonly expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
  readonly orderId: Scalars['ID']['input'];
  /** HTTPS URL to which an online payment provider may return the customer. */
  readonly returnUrl?: InputMaybe<Scalars['URL']['input']>;
};

export type OrderPaymentRetryPayload = {
  readonly __typename: 'OrderPaymentRetryPayload';
  readonly attemptId?: Maybe<Scalars['ID']['output']>;
  readonly customerAction?: Maybe<OrderPaymentCustomerAction>;
  readonly order?: Maybe<Order>;
  readonly status?: Maybe<OrderPaymentRetryStatus>;
  readonly userErrors: ReadonlyArray<OrderUserError>;
};

/** State returned after requesting another payment attempt. */
export type OrderPaymentRetryStatus =
  | 'AUTHORIZED'
  | 'FAILED'
  | 'PAID'
  | 'PENDING'
  | 'REQUIRES_ACTION';

/** Aggregate payment state for an order. */
export type OrderPaymentStatus =
  | 'AUTHORIZED'
  | 'EXPIRED'
  | 'FAILED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUNDED'
  | 'VOIDED';

/** One immutable payment operation recorded against an order. */
export type OrderPaymentTransaction = Node & {
  readonly __typename: 'OrderPaymentTransaction';
  readonly amount: Money;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly failureCode?: Maybe<Scalars['String']['output']>;
  readonly failureMessage?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly kind: OrderPaymentTransactionKind;
  readonly processedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly providerCode: Scalars['String']['output'];
  readonly reference?: Maybe<Scalars['String']['output']>;
  readonly status: OrderPaymentTransactionStatus;
};

/** The accounting operation represented by a payment transaction. */
export type OrderPaymentTransactionKind =
  | 'AUTHORIZATION'
  | 'CAPTURE'
  | 'REFUND'
  | 'SALE'
  | 'VOID';

/** Lifecycle state of a payment transaction. */
export type OrderPaymentTransactionStatus =
  | 'CANCELLED'
  | 'FAILURE'
  | 'PENDING'
  | 'SUCCESS';

/** A promotional code captured when the order was placed. */
export type OrderPromoCode = {
  readonly __typename: 'OrderPromoCode';
  readonly appliedAt: Scalars['DateTime']['output'];
  readonly code: Scalars['String']['output'];
  readonly conditions?: Maybe<Scalars['JSON']['output']>;
  readonly discountType: Scalars['String']['output'];
  readonly provider: Scalars['String']['output'];
  readonly value: Scalars['Decimal']['output'];
};

/** Immutable recipient details captured for an order delivery group. */
export type OrderRecipient = {
  readonly __typename: 'OrderRecipient';
  readonly email?: Maybe<Scalars['Email']['output']>;
  readonly firstName?: Maybe<Scalars['String']['output']>;
  readonly lastName?: Maybe<Scalars['String']['output']>;
  readonly middleName?: Maybe<Scalars['String']['output']>;
  readonly phone?: Maybe<Scalars['String']['output']>;
};

/** Customer-visible refund recorded against the order. */
export type OrderRefund = Node & {
  readonly __typename: 'OrderRefund';
  readonly amount: Money;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly lines: ReadonlyArray<OrderRefundLine>;
  readonly note?: Maybe<Scalars['String']['output']>;
  readonly processedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly reason?: Maybe<Scalars['String']['output']>;
  readonly status: OrderRefundStatus;
};

/** Quantity and amount returned for one purchased order line. */
export type OrderRefundLine = {
  readonly __typename: 'OrderRefundLine';
  readonly amount: Money;
  readonly orderLine: OrderLine;
  readonly quantity: Scalars['Int']['output'];
};

/** Lifecycle state of a customer-visible refund. */
export type OrderRefundStatus =
  | 'CANCELLED'
  | 'FAILED'
  | 'PENDING'
  | 'SUCCEEDED';

export type OrderReorderInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  /** Lines to copy. When omitted, every currently purchasable order line is used. */
  readonly lines?: InputMaybe<ReadonlyArray<OrderReorderLineInput>>;
  readonly orderId: Scalars['ID']['input'];
};

/** Optional quantity override for one line copied into a reorder checkout. */
export type OrderReorderLineInput = {
  readonly orderLineId: Scalars['ID']['input'];
  readonly quantity: Scalars['Int']['input'];
};

export type OrderReorderPayload = {
  readonly __typename: 'OrderReorderPayload';
  readonly checkout?: Maybe<Checkout>;
  readonly skippedLines: ReadonlyArray<OrderReorderSkippedLine>;
  readonly userErrors: ReadonlyArray<OrderUserError>;
};

/** An order line that could not be copied into the new checkout. */
export type OrderReorderSkippedLine = {
  readonly __typename: 'OrderReorderSkippedLine';
  readonly code: Scalars['String']['output'];
  readonly message: Scalars['String']['output'];
  readonly orderLine: OrderLine;
};

/** Customer-selected reason for returning an order line. */
export type OrderReturnReason =
  | 'CHANGED_MIND'
  | 'DAMAGED'
  | 'DEFECTIVE'
  | 'INCORRECT_ITEM'
  | 'NOT_AS_DESCRIBED'
  | 'OTHER'
  | 'SIZE_OR_FIT';

/** A customer-created request to return one or more order lines. */
export type OrderReturnRequest = Node & {
  readonly __typename: 'OrderReturnRequest';
  readonly canCancel: Scalars['Boolean']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly customerNote?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly lines: ReadonlyArray<OrderReturnRequestLine>;
  readonly order: Order;
  readonly requestedAt: Scalars['DateTime']['output'];
  readonly resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly revision: Scalars['Int']['output'];
  readonly status: OrderReturnRequestStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type OrderReturnRequestCancelInput = {
  readonly expectedRevision: Scalars['Int']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
  readonly returnRequestId: Scalars['ID']['input'];
};

export type OrderReturnRequestCancelPayload = {
  readonly __typename: 'OrderReturnRequestCancelPayload';
  readonly returnRequest?: Maybe<OrderReturnRequest>;
  readonly userErrors: ReadonlyArray<OrderUserError>;
};

export type OrderReturnRequestConnection = Connection & {
  readonly __typename: 'OrderReturnRequestConnection';
  readonly edges: ReadonlyArray<OrderReturnRequestEdge>;
  readonly nodes: ReadonlyArray<OrderReturnRequest>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type OrderReturnRequestCreateInput = {
  readonly customerNote?: InputMaybe<Scalars['String']['input']>;
  readonly expectedOrderUpdatedAt: Scalars['DateTime']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
  readonly lines: ReadonlyArray<OrderReturnRequestLineInput>;
  readonly orderId: Scalars['ID']['input'];
};

export type OrderReturnRequestCreatePayload = {
  readonly __typename: 'OrderReturnRequestCreatePayload';
  readonly order?: Maybe<Order>;
  readonly returnRequest?: Maybe<OrderReturnRequest>;
  readonly userErrors: ReadonlyArray<OrderUserError>;
};

export type OrderReturnRequestEdge = {
  readonly __typename: 'OrderReturnRequestEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: OrderReturnRequest;
};

/** One line requested for return. */
export type OrderReturnRequestLine = {
  readonly __typename: 'OrderReturnRequestLine';
  readonly note?: Maybe<Scalars['String']['output']>;
  readonly orderLine: OrderLine;
  readonly quantity: Scalars['Int']['output'];
  readonly reason: OrderReturnReason;
};

export type OrderReturnRequestLineInput = {
  readonly note?: InputMaybe<Scalars['String']['input']>;
  readonly orderLineId: Scalars['ID']['input'];
  readonly quantity: Scalars['Int']['input'];
  readonly reason: OrderReturnReason;
};

/** Customer-visible lifecycle of a return request. */
export type OrderReturnRequestStatus =
  | 'APPROVED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'IN_TRANSIT'
  | 'RECEIVED'
  | 'REJECTED'
  | 'REQUESTED';

/** Post-order capabilities evaluated for the authenticated customer. */
export type OrderSelfService = {
  readonly __typename: 'OrderSelfService';
  readonly cancel: OrderSelfServiceAction;
  readonly reorder: OrderSelfServiceAction;
  readonly requestReturn: OrderSelfServiceAction;
  readonly retryPayment: OrderSelfServiceAction;
};

/** Availability of one post-order action in the current order state. */
export type OrderSelfServiceAction = {
  readonly __typename: 'OrderSelfServiceAction';
  readonly available: Scalars['Boolean']['output'];
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly unavailableReason?: Maybe<Scalars['String']['output']>;
  /** Stable machine-readable explanation when the action is unavailable. */
  readonly unavailableReasonCode?: Maybe<Scalars['String']['output']>;
};

/** One physical shipment created for an order fulfillment. */
export type OrderShipment = Node & {
  readonly __typename: 'OrderShipment';
  readonly carrierCode?: Maybe<Scalars['String']['output']>;
  readonly carrierName?: Maybe<Scalars['String']['output']>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  readonly estimatedDeliveryAt?: Maybe<Scalars['DateTime']['output']>;
  readonly events: ReadonlyArray<OrderTrackingEvent>;
  readonly id: Scalars['ID']['output'];
  readonly serviceCode?: Maybe<Scalars['String']['output']>;
  readonly shippedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: OrderShipmentStatus;
  readonly tracking: ReadonlyArray<OrderTrackingInfo>;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Customer-facing lifecycle state of one physical shipment. */
export type OrderShipmentStatus =
  | 'CANCELLED'
  | 'DELAYED'
  | 'DELIVERED'
  | 'DELIVERY_ATTEMPTED'
  | 'EXCEPTION'
  | 'IN_TRANSIT'
  | 'LABEL_CREATED'
  | 'OUT_FOR_DELIVERY'
  | 'PICKED_UP'
  | 'READY_FOR_PICKUP'
  | 'RETURNED_TO_SENDER';

/** The lifecycle state of an order visible to its customer. */
export type OrderStatus =
  | 'ACTIVE'
  | 'CANCELLED'
  | 'CLOSED'
  | 'DRAFT';

/** Carrier scan or merchant-provided progress event for a shipment. */
export type OrderTrackingEvent = Node & {
  readonly __typename: 'OrderTrackingEvent';
  readonly happenedAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly location?: Maybe<Scalars['String']['output']>;
  readonly message?: Maybe<Scalars['String']['output']>;
  readonly status: OrderShipmentStatus;
};

/** Carrier tracking identity. A shipment may expose multiple tracking numbers. */
export type OrderTrackingInfo = {
  readonly __typename: 'OrderTrackingInfo';
  readonly company?: Maybe<Scalars['String']['output']>;
  readonly number: Scalars['String']['output'];
  readonly url?: Maybe<Scalars['URL']['output']>;
};

/** Customer-facing post-order mutation error. */
export type OrderUserError = DisplayableError & {
  readonly __typename: 'OrderUserError';
  readonly code: Scalars['String']['output'];
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  readonly message: Scalars['String']['output'];
  readonly retryable: Scalars['Boolean']['output'];
};

/** Customer-visible void of a previously authorized payment amount. */
export type OrderVoid = Node & {
  readonly __typename: 'OrderVoid';
  readonly amount: Money;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly processedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly reason?: Maybe<Scalars['String']['output']>;
  readonly status: OrderVoidStatus;
};

/** Lifecycle state of a payment authorization void. */
export type OrderVoidStatus =
  | 'CANCELLED'
  | 'FAILED'
  | 'PENDING'
  | 'SUCCEEDED';

/** Returns information about pagination in a connection. */
export type PageInfo = {
  readonly __typename: 'PageInfo';
  readonly endCursor?: Maybe<Scalars['Cursor']['output']>;
  readonly hasNextPage: Scalars['Boolean']['output'];
  readonly hasPreviousPage: Scalars['Boolean']['output'];
  readonly startCursor?: Maybe<Scalars['Cursor']['output']>;
};

/** Input data for requesting a password recovery email. */
export type PasswordRecoveryInput = {
  /** Unique identifier for the client mutation. */
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  readonly email: Scalars['Email']['input'];
};

/** Payload returned after requesting password recovery. */
export type PasswordRecoveryPayload = {
  readonly __typename: 'PasswordRecoveryPayload';
  /** Unique identifier echoed from the input. */
  readonly clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  readonly errors?: Maybe<ReadonlyArray<FieldError>>;
  /** True if the recovery email was sent successfully. */
  readonly success: Scalars['Boolean']['output'];
};

/** Input data for signing in with email and password. */
export type PasswordSignInInput = {
  /** Unique identifier for the client mutation. */
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  readonly email: Scalars['Email']['input'];
  /** User's password. */
  readonly password: Scalars['String']['input'];
};

/** Payload returned after signing in. */
export type PasswordSignInPayload = {
  readonly __typename: 'PasswordSignInPayload';
  /** Unique identifier echoed from the input. */
  readonly clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  readonly errors?: Maybe<ReadonlyArray<FieldError>>;
  /** Newly created session. */
  readonly session?: Maybe<Session>;
};

/** Input data for registering a new user. */
export type PasswordSignUpInput = {
  /** Unique identifier for the client mutation. */
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  readonly email: Scalars['Email']['input'];
  /** User's password. */
  readonly password: Scalars['String']['input'];
};

/** Payload returned after signing up. */
export type PasswordSignUpPayload = {
  readonly __typename: 'PasswordSignUpPayload';
  /** Unique identifier echoed from the input. */
  readonly clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  readonly errors?: Maybe<ReadonlyArray<FieldError>>;
  /** Newly created session. */
  readonly session?: Maybe<Session>;
};

/** Payment flow for the method. */
export type PaymentFlow =
  /** Customer pays offline via provider (QR code, display code, etc). */
  | 'OFFLINE'
  /** Customer pays online via provider (redirect/app flow handled externally). */
  | 'ONLINE'
  /** Customer pays later/on delivery or by invoice (offline instructions). */
  | 'ON_DELIVERY';

/** Customer interaction required to continue payment. */
export type PlaceOrderCustomerAction = {
  readonly __typename: 'PlaceOrderCustomerAction';
  readonly data?: Maybe<Scalars['JSON']['output']>;
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly instructions?: Maybe<Scalars['String']['output']>;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly type: PlaceOrderCustomerActionType;
  readonly url?: Maybe<Scalars['String']['output']>;
};

export type PlaceOrderCustomerActionType =
  | 'INSTRUCTIONS'
  | 'REDIRECT';

/** Input used to place one immutable checkout snapshot. */
export type PlaceOrderInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Optimistic concurrency version returned by Checkout.version. */
  readonly expectedCheckoutVersion: Scalars['Int']['input'];
  /** Pipeline revision returned by Checkout.resultRevision. */
  readonly expectedResultRevision: Scalars['String']['input'];
  /** Client-generated opaque key used to replay placement safely. */
  readonly idempotencyKey: Scalars['String']['input'];
  /** HTTPS URL to which an online payment provider may return the customer. */
  readonly returnUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Result of the durable place-order workflow. */
export type PlaceOrderPayload = {
  readonly __typename: 'PlaceOrderPayload';
  /** Checkout snapshot committed by this placement. */
  readonly checkoutId?: Maybe<Scalars['ID']['output']>;
  /** Checkout.version captured by this placement. */
  readonly checkoutVersion?: Maybe<Scalars['Int']['output']>;
  readonly customerAction?: Maybe<PlaceOrderCustomerAction>;
  readonly orderId?: Maybe<Scalars['ID']['output']>;
  readonly paymentCollectionId?: Maybe<Scalars['ID']['output']>;
  readonly paymentFailure?: Maybe<PlaceOrderPaymentFailure>;
  readonly paymentOperationId?: Maybe<Scalars['ID']['output']>;
  readonly paymentSessionId?: Maybe<Scalars['ID']['output']>;
  /** Durable placement identifier used by Query.checkoutPlacement. */
  readonly placementId?: Maybe<Scalars['ID']['output']>;
  /** Checkout.resultRevision captured by this placement. */
  readonly resultRevision?: Maybe<Scalars['String']['output']>;
  readonly status?: Maybe<PlaceOrderStatus>;
  /** Validation, stale-snapshot, and business errors produced before placement. */
  readonly userErrors: ReadonlyArray<CheckoutUserError>;
};

/** Normalized terminal or retryable payment failure. */
export type PlaceOrderPaymentFailure = {
  readonly __typename: 'PlaceOrderPaymentFailure';
  readonly category: PlaceOrderPaymentFailureCategory;
  readonly code: Scalars['String']['output'];
  readonly message: Scalars['String']['output'];
  readonly providerCode?: Maybe<Scalars['String']['output']>;
  readonly retryable: Scalars['Boolean']['output'];
};

export type PlaceOrderPaymentFailureCategory =
  | 'AUTHENTICATION'
  | 'CONFIGURATION'
  | 'CONFLICT'
  | 'DECLINED'
  | 'FRAUD_SUSPECTED'
  | 'INVALID_REQUEST'
  | 'NOT_SUPPORTED'
  | 'PROVIDER_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type PlaceOrderStatus =
  | 'AUTHORIZED'
  | 'PAID'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_NOT_REQUIRED'
  | 'PAYMENT_PENDING'
  | 'REQUIRES_ACTION'
  | 'REQUIRES_CONFIRMATION';

/** Direction in which a price adjustment changes the base price. */
export type PriceAdjustmentOperation =
  /** Subtract the calculated value from the base price. */
  | 'DECREASE'
  /** Add the calculated value to the base price. */
  | 'INCREASE';

/** Representation used to calculate a price adjustment. */
export type PriceAdjustmentValueType =
  /** Use a monetary value expressed in minor currency units. */
  | 'FIXED_AMOUNT'
  /** Calculate the value from basis points where 10000 equals 100%. */
  | 'PERCENTAGE';

/**
 * Price bounds in decimal major units and in the storefront context currency.
 * For example, 19.99 represents nineteen currency units and ninety-nine cents.
 */
export type PriceRangeFilterInput = {
  readonly max?: InputMaybe<Scalars['Decimal']['input']>;
  readonly min?: InputMaybe<Scalars['Decimal']['input']>;
};

/** A published item offered for sale in the storefront catalog. */
export type Product = Node & {
  readonly __typename: 'Product';
  readonly availableForSale: Scalars['Boolean']['output'];
  readonly categories: CategoryConnection;
  readonly compareAtPriceRange?: Maybe<ProductPriceRange>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly description?: Maybe<RichText>;
  readonly excerpt?: Maybe<RichText>;
  readonly featureGroups: ReadonlyArray<ProductFeatureGroup>;
  readonly featuredMedia?: Maybe<Media>;
  readonly features: ReadonlyArray<ProductFeature>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly media: ProductMediaConnection;
  readonly options: ReadonlyArray<ProductOption>;
  readonly priceRange?: Maybe<ProductPriceRange>;
  readonly primaryCategory?: Maybe<Category>;
  readonly publishedAt: Scalars['DateTime']['output'];
  /** Published question and answer aggregates for this product. */
  readonly questionSummary: ProductQuestionSummary;
  /** Published questions for this product. */
  readonly questions: ProductQuestionConnection;
  /** Rating criteria applicable to this product in display order. */
  readonly reviewRatingCriteria: ReviewRatingCriterionConnection;
  /** Published review aggregates for this product. */
  readonly reviewSummary: ProductReviewSummary;
  /** Published reviews for this product. */
  readonly reviews: ReviewConnection;
  readonly selectedOrFirstAvailableVariant?: Maybe<ProductVariant>;
  readonly seo: Seo;
  readonly tags: ReadonlyArray<Tag>;
  readonly title: Scalars['String']['output'];
  readonly totalInventory?: Maybe<Scalars['Int']['output']>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly variantBySelectedOptions?: Maybe<ProductVariant>;
  readonly variants: ProductVariantConnection;
  readonly vendor?: Maybe<Vendor>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  answered?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductReviewRatingCriteriaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductReviewsArgs = {
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
export type ProductSelectedOrFirstAvailableVariantArgs = {
  selectedOptions?: InputMaybe<ReadonlyArray<SelectedOptionInput>>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductVariantBySelectedOptionsArgs = {
  selectedOptions: ReadonlyArray<SelectedOptionInput>;
};


/** A published item offered for sale in the storefront catalog. */
export type ProductVariantsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ProductComponentConfiguration = {
  readonly __typename: 'ProductComponentConfiguration';
  readonly componentsSubtotal: Money;
  readonly displayStyle: ProductComponentDisplayStyle;
  readonly groups: ReadonlyArray<ProductComponentGroup>;
  readonly id: Scalars['ID']['output'];
  readonly totalPrice: Money;
};

export type ProductComponentDisplayStyle =
  | 'ACCORDION'
  | 'FLAT'
  | 'TABS'
  | 'WIZARD';

export type ProductComponentGroup = {
  readonly __typename: 'ProductComponentGroup';
  readonly id: Scalars['ID']['output'];
  readonly items: ReadonlyArray<ProductComponentItem>;
  readonly maxSelection?: Maybe<Scalars['Int']['output']>;
  readonly minSelection?: Maybe<Scalars['Int']['output']>;
  readonly required: Scalars['Boolean']['output'];
  readonly title: Scalars['String']['output'];
};

export type ProductComponentItem = {
  readonly __typename: 'ProductComponentItem';
  readonly availableForSale: Scalars['Boolean']['output'];
  readonly featuredMedia?: Maybe<Media>;
  readonly id: Scalars['ID']['output'];
  readonly maxQuantity?: Maybe<Scalars['Int']['output']>;
  readonly minQuantity: Scalars['Int']['output'];
  readonly product: Product;
  readonly quantity: Scalars['Int']['output'];
  readonly required: Scalars['Boolean']['output'];
  readonly selected: Scalars['Boolean']['output'];
  readonly title: Scalars['String']['output'];
  readonly totalPrice: Money;
  readonly unitPrice: Money;
  readonly variant: ProductVariant;
};

export type ProductComponentSelectionInput = {
  readonly itemId: Scalars['ID']['input'];
  readonly quantity: Scalars['Int']['input'];
  readonly variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** A Relay connection containing products from one canonical listing request. */
export type ProductConnection = Connection & {
  readonly __typename: 'ProductConnection';
  /**
   * Sorts valid for this context. MANUAL is category-only. RELEVANCE is returned
   * only when a non-empty query is active.
   */
  readonly availableSorts: ReadonlyArray<ListingSort>;
  /** A list of product edges. */
  readonly edges: ReadonlyArray<ProductEdge>;
  /**
   * Filters calculated over the complete matched result set, not only this page.
   *
   * Each count uses target-filter isolation: selections from the filter being
   * counted are excluded while every other filter remains active.
   */
  readonly filters: ReadonlyArray<Filter>;
  /** The products contained in the returned edges. */
  readonly nodes: ReadonlyArray<Product>;
  /** Information to aid in pagination. */
  readonly pageInfo: PageInfo;
  /** The effective sort selected for this request. */
  readonly sort: ListingSort;
  /** The exact number of products matching every active filter. */
  readonly totalCount: Scalars['Int']['output'];
};

export type ProductEdge = {
  readonly __typename: 'ProductEdge';
  /** An opaque cursor for this product in the current listing. */
  readonly cursor: Scalars['Cursor']['output'];
  /** The product at the end of the edge. */
  readonly node: Product;
};

/** A localized product specification such as material or screen size. */
export type ProductFeature = Node & {
  readonly __typename: 'ProductFeature';
  readonly group?: Maybe<ProductFeatureGroup>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly position: Scalars['Int']['output'];
  readonly values: ReadonlyArray<ProductFeatureValue>;
};

/** A presentation group containing related product specifications. */
export type ProductFeatureGroup = Node & {
  readonly __typename: 'ProductFeatureGroup';
  readonly features: ReadonlyArray<ProductFeature>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly position: Scalars['Int']['output'];
};

/** A localized value assigned to a product specification. */
export type ProductFeatureValue = Node & {
  readonly __typename: 'ProductFeatureValue';
  readonly feature: ProductFeature;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly position: Scalars['Int']['output'];
};

/** A Relay connection to the media registered on a product. */
export type ProductMediaConnection = Connection & {
  readonly __typename: 'ProductMediaConnection';
  readonly edges: ReadonlyArray<ProductMediaEdge>;
  readonly nodes: ReadonlyArray<Media>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a product. */
export type ProductMediaEdge = {
  readonly __typename: 'ProductMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Media;
};

/** A configurable product dimension such as size, color, or material. */
export type ProductOption = Node & {
  readonly __typename: 'ProductOption';
  readonly displayType: ProductOptionDisplayType;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly optionValues: ReadonlyArray<ProductOptionValue>;
  readonly position: Scalars['Int']['output'];
};

/** How an option should be presented by a product option picker. */
export type ProductOptionDisplayType =
  | 'BUTTONS'
  | 'DROPDOWN'
  | 'SWATCH';

/** The visual representation used for an option value. */
export type ProductOptionSwatchType =
  | 'COLOR'
  | 'GRADIENT'
  | 'IMAGE';

/** One customer-selectable value of a product option. */
export type ProductOptionValue = Node & {
  readonly __typename: 'ProductOptionValue';
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly position: Scalars['Int']['output'];
  readonly swatch?: Maybe<ProductOptionValueSwatch>;
};

export type ProductOptionValueSwatch = {
  readonly __typename: 'ProductOptionValueSwatch';
  readonly color?: Maybe<Scalars['Color']['output']>;
  readonly image?: Maybe<Media>;
  readonly metadata?: Maybe<Scalars['JSON']['output']>;
  readonly secondaryColor?: Maybe<Scalars['Color']['output']>;
  readonly type: ProductOptionSwatchType;
};

/** The lowest and highest current variant prices for a product. */
export type ProductPriceRange = {
  readonly __typename: 'ProductPriceRange';
  readonly maxVariantPrice: Money;
  readonly minVariantPrice: Money;
};

export type ProductQuestion = Node & ReviewContent & {
  readonly __typename: 'ProductQuestion';
  readonly answers: ProductQuestionAnswerConnection;
  readonly author: ReviewContentAuthor;
  readonly body: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly kind: ReviewContentKind;
  readonly locale: LocaleCode;
  readonly metrics: ReviewContentMetrics;
  readonly product: Product;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly revision: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly translations: ReadonlyArray<ReviewContentTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly variant?: Maybe<ProductVariant>;
  readonly viewerCapabilities: ReviewContentViewerCapabilities;
  readonly viewerEngagement: ReviewContentViewerEngagement;
  readonly viewerSubscription?: Maybe<ProductQuestionSubscription>;
};


export type ProductQuestionAnswersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionAnswerSort>;
};

export type ProductQuestionAnswer = Node & ReviewContent & {
  readonly __typename: 'ProductQuestionAnswer';
  readonly author: ReviewContentAuthor;
  readonly body: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isAccepted: Scalars['Boolean']['output'];
  readonly isOfficial: Scalars['Boolean']['output'];
  readonly kind: ReviewContentKind;
  readonly locale: LocaleCode;
  readonly metrics: ReviewContentMetrics;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly question: ProductQuestion;
  readonly revision: Scalars['Int']['output'];
  readonly sortIndex: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly translations: ReadonlyArray<ReviewContentTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly viewerCapabilities: ReviewContentViewerCapabilities;
  readonly viewerEngagement: ReviewContentViewerEngagement;
};

export type ProductQuestionAnswerConnection = Connection & {
  readonly __typename: 'ProductQuestionAnswerConnection';
  readonly edges: ReadonlyArray<ProductQuestionAnswerEdge>;
  readonly nodes: ReadonlyArray<ProductQuestionAnswer>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** Input for an authenticated customer answer to a product question. */
export type ProductQuestionAnswerCreateInput = {
  /**
   * Shared text, locale, and idempotency metadata. Guest author data is rejected
   * because storefront question answers require an authenticated customer.
   */
  readonly content: ReviewContentSubmissionInput;
  /** Revision returned by ProductQuestion.revision. */
  readonly expectedRevision: Scalars['Int']['input'];
  readonly productQuestionId: Scalars['ID']['input'];
};

/** Result of adding a customer answer to a product question. */
export type ProductQuestionAnswerCreatePayload = {
  readonly __typename: 'ProductQuestionAnswerCreatePayload';
  readonly answer?: Maybe<ProductQuestionAnswer>;
  readonly productQuestion?: Maybe<ProductQuestion>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionAnswerDeletePayload = {
  readonly __typename: 'ProductQuestionAnswerDeletePayload';
  readonly deletedAnswerId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionAnswerEdge = {
  readonly __typename: 'ProductQuestionAnswerEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ProductQuestionAnswer;
};

/** Customer-facing orderings supported by question-answer connections. */
export type ProductQuestionAnswerSort =
  | 'MOST_HELPFUL'
  | 'NEWEST'
  | 'OLDEST';

/** Customer-editable fields of an existing question answer. */
export type ProductQuestionAnswerUpdateInput = {
  readonly answerId: Scalars['ID']['input'];
  readonly content: ReviewContentEditInput;
  readonly expectedRevision: Scalars['Int']['input'];
};

export type ProductQuestionAnswerUpdatePayload = {
  readonly __typename: 'ProductQuestionAnswerUpdatePayload';
  readonly answer?: Maybe<ProductQuestionAnswer>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionConnection = Connection & {
  readonly __typename: 'ProductQuestionConnection';
  readonly edges: ReadonlyArray<ProductQuestionEdge>;
  readonly nodes: ReadonlyArray<ProductQuestion>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** Input for a customer or guest product-question submission. */
export type ProductQuestionCreateInput = {
  /** Shared text, locale, guest identity, and idempotency metadata. */
  readonly content: ReviewContentSubmissionInput;
  readonly productId: Scalars['ID']['input'];
  readonly variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Result of submitting a product question. */
export type ProductQuestionCreatePayload = {
  readonly __typename: 'ProductQuestionCreatePayload';
  readonly productQuestion?: Maybe<ProductQuestion>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionDeletePayload = {
  readonly __typename: 'ProductQuestionDeletePayload';
  readonly deletedProductQuestionId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionEdge = {
  readonly __typename: 'ProductQuestionEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ProductQuestion;
};

/** Customer-facing orderings supported by product-question connections. */
export type ProductQuestionSort =
  | 'MOST_ANSWERED'
  | 'MOST_HELPFUL'
  | 'NEWEST'
  | 'OLDEST';

export type ProductQuestionSubscription = Node & {
  readonly __typename: 'ProductQuestionSubscription';
  readonly channel: ReviewNotificationChannel;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly lastNotifiedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly locale: LocaleCode;
  readonly question: ProductQuestion;
  readonly status: ProductQuestionSubscriptionStatus;
  readonly subscriberCustomer?: Maybe<Customer>;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/**
 * Desired notification state for the current customer's product-question
 * subscription. The operation creates or updates the viewer's subscription.
 */
export type ProductQuestionSubscriptionSetInput = {
  readonly channel?: InputMaybe<ReviewNotificationChannel>;
  readonly locale?: InputMaybe<LocaleCode>;
  readonly productQuestionId: Scalars['ID']['input'];
  readonly subscribed: Scalars['Boolean']['input'];
};

export type ProductQuestionSubscriptionSetPayload = {
  readonly __typename: 'ProductQuestionSubscriptionSetPayload';
  readonly subscription?: Maybe<ProductQuestionSubscription>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductQuestionSubscriptionStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'UNSUBSCRIBED';

/** Published question and answer aggregates for one product. */
export type ProductQuestionSummary = {
  readonly __typename: 'ProductQuestionSummary';
  readonly answerCount: Scalars['Int']['output'];
  readonly answeredQuestionCount: Scalars['Int']['output'];
  readonly lastAnsweredAt?: Maybe<Scalars['DateTime']['output']>;
  readonly lastQuestionAt?: Maybe<Scalars['DateTime']['output']>;
  readonly officialAnswerCount: Scalars['Int']['output'];
  readonly product: Product;
  readonly questionCount: Scalars['Int']['output'];
  readonly unansweredQuestionCount: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Customer-editable fields of an existing product question. */
export type ProductQuestionUpdateInput = {
  readonly content: ReviewContentEditInput;
  readonly expectedRevision: Scalars['Int']['input'];
  readonly productQuestionId: Scalars['ID']['input'];
};

export type ProductQuestionUpdatePayload = {
  readonly __typename: 'ProductQuestionUpdatePayload';
  readonly productQuestion?: Maybe<ProductQuestion>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ProductRatingCriterionSummary = {
  readonly __typename: 'ProductRatingCriterionSummary';
  readonly averageRating: Scalars['Float']['output'];
  readonly criterion: ReviewRatingCriterion;
  readonly ratingBreakdown: ReviewRatingBreakdown;
  readonly reviewCount: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** Published review aggregates for one product. */
export type ProductReviewSummary = {
  readonly __typename: 'ProductReviewSummary';
  readonly averageRating: Scalars['Float']['output'];
  readonly criteria: ReadonlyArray<ProductRatingCriterionSummary>;
  readonly lastReviewedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly mediaReviewCount: Scalars['Int']['output'];
  readonly product: Product;
  readonly ratingBreakdown: ReviewRatingBreakdown;
  readonly reviewCount: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly verifiedReviewCount: Scalars['Int']['output'];
};

/** A purchasable combination of product option values. */
export type ProductVariant = Node & {
  readonly __typename: 'ProductVariant';
  readonly availableForSale: Scalars['Boolean']['output'];
  readonly compareAtPrice?: Maybe<Money>;
  readonly componentConfiguration?: Maybe<ProductComponentConfiguration>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly currentlyNotInStock: Scalars['Boolean']['output'];
  readonly dimensions?: Maybe<Dimensions>;
  readonly featuredMedia?: Maybe<Media>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly inventoryItem?: Maybe<InventoryItem>;
  readonly isDefault: Scalars['Boolean']['output'];
  readonly media: ProductVariantMediaConnection;
  readonly price?: Maybe<Money>;
  readonly product: Product;
  readonly quantityAvailable?: Maybe<Scalars['Int']['output']>;
  readonly questions: ProductQuestionConnection;
  readonly requiresShipping: Scalars['Boolean']['output'];
  readonly reviews: ReviewConnection;
  readonly selectedOptions: ReadonlyArray<SelectedOption>;
  readonly sku?: Maybe<Scalars['String']['output']>;
  readonly title: Scalars['String']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly weight?: Maybe<Weight>;
};


/** A purchasable combination of product option values. */
export type ProductVariantComponentConfigurationArgs = {
  selections?: InputMaybe<ReadonlyArray<ProductComponentSelectionInput>>;
};


/** A purchasable combination of product option values. */
export type ProductVariantMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A purchasable combination of product option values. */
export type ProductVariantQuestionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductQuestionSort>;
};


/** A purchasable combination of product option values. */
export type ProductVariantReviewsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ReviewSort>;
};

/** A Relay connection to product variants. */
export type ProductVariantConnection = Connection & {
  readonly __typename: 'ProductVariantConnection';
  readonly edges: ReadonlyArray<ProductVariantEdge>;
  readonly nodes: ReadonlyArray<ProductVariant>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ProductVariantEdge = {
  readonly __typename: 'ProductVariantEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ProductVariant;
};

/** The policy applied when a tracked variant has no sellable inventory. */
export type ProductVariantInventoryPolicy =
  /** The variant can be purchased when inventory is unavailable. */
  | 'CONTINUE'
  /** The variant cannot be purchased when inventory is unavailable. */
  | 'DENY';

/** A Relay connection to media selected for a particular product variant. */
export type ProductVariantMediaConnection = Connection & {
  readonly __typename: 'ProductVariantMediaConnection';
  readonly edges: ReadonlyArray<ProductVariantMediaEdge>;
  readonly nodes: ReadonlyArray<Media>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item selected for a particular product variant. */
export type ProductVariantMediaEdge = {
  readonly __typename: 'ProductVariantMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Media;
};

/** The catalog entity purchased by a checkout line. */
export type Purchasable = ProductVariant;

/** Public Catalog entry points for the active storefront context. */
export type Query = {
  readonly __typename: 'Query';
  readonly _media?: Maybe<Scalars['Boolean']['output']>;
  /** Returns published categories using Relay cursor pagination. */
  readonly categories: CategoryConnection;
  /** Returns a published category by its globally unique Relay ID. */
  readonly category?: Maybe<Category>;
  /** Returns a published category by its stable storefront handle. */
  readonly categoryByHandle?: Maybe<Category>;
  /** Get a checkout by its ID. */
  readonly checkout?: Maybe<Checkout>;
  /**
   * Returns the latest durable result of a checkout placement.
   *
   * This query is suitable for restoring state after a payment-provider redirect
   * and for polling asynchronous payment completion.
   */
  readonly checkoutPlacement?: Maybe<PlaceOrderPayload>;
  /**
   * Returns the customer associated with the authenticated storefront session.
   * The customer identity is resolved from trusted request context rather than
   * from a customer ID or access token supplied as a GraphQL argument.
   */
  readonly customer?: Maybe<Customer>;
  /** Confirms that the request carries verified Headless storefront access. */
  readonly headlessStorefrontAccess: Scalars['Boolean']['output'];
  /** Localization resolved for the current storefront request. */
  readonly localization: Localization;
  /** An active storefront market by its stable handle. */
  readonly market?: Maybe<Market>;
  /** Returns any catalog object by its globally unique Relay ID. */
  readonly node?: Maybe<Node>;
  /** Returns catalog objects in the same order as the supplied Relay IDs. */
  readonly nodes: ReadonlyArray<Maybe<Node>>;
  /** Returns an Online Store navigation menu by its global Relay ID. */
  readonly onlineStoreNavigationMenu?: Maybe<OnlineStoreNavigationMenu>;
  /** Returns an Online Store navigation menu by its stable handle. */
  readonly onlineStoreNavigationMenuByHandle?: Maybe<OnlineStoreNavigationMenu>;
  /** Returns Online Store navigation menus using Relay cursor pagination. */
  readonly onlineStoreNavigationMenus: OnlineStoreNavigationMenuConnection;
  /** Returns a published Online Store page by its global Relay ID. */
  readonly onlineStorePage?: Maybe<OnlineStorePage>;
  /** Returns a published Online Store page by its stable URL handle. */
  readonly onlineStorePageByHandle?: Maybe<OnlineStorePage>;
  /** Returns published Online Store pages using Relay cursor pagination. */
  readonly onlineStorePages: OnlineStorePageConnection;
  /**
   * Returns an order owned by the authenticated customer.
   *
   * Customer ownership and store scope are resolved from trusted storefront
   * context. An inaccessible order is returned as null.
   */
  readonly order?: Maybe<Order>;
  /** Returns a return request owned by the authenticated customer. */
  readonly orderReturnRequest?: Maybe<OrderReturnRequest>;
  /** Returns a published product by its globally unique Relay ID. */
  readonly product?: Maybe<Product>;
  /** Returns a published product by its stable storefront handle. */
  readonly productByHandle?: Maybe<Product>;
  /** Returns a product question visible in the current storefront context. */
  readonly productQuestion?: Maybe<ProductQuestion>;
  /** Returns a published product-question answer by its global ID. */
  readonly productQuestionAnswer?: Maybe<ProductQuestionAnswer>;
  /** Returns a published product variant by its globally unique Relay ID. */
  readonly productVariant?: Maybe<ProductVariant>;
  /**
   * Returns published products from the GLOBAL listing scope.
   *
   * The result uses the locale, currency, market, channel, and publication rules
   * from the active storefront context. Facets configured for SEARCH scope are
   * exposed because this request has no category context. The default sort is
   * NEWEST; MANUAL and RELEVANCE are not valid for this entry point.
   */
  readonly products: ProductConnection;
  /** Returns a review visible in the current storefront context. */
  readonly review?: Maybe<Review>;
  /** Returns a published review reply by its global ID. */
  readonly reviewReply?: Maybe<ReviewReply>;
  /** Returns a review request owned by the authenticated customer. */
  readonly reviewRequest?: Maybe<ReviewRequest>;
  /** Storefront capabilities and limits for reviews and product questions. */
  readonly reviewStoreConfiguration?: Maybe<ReviewStoreConfiguration>;
  /**
   * Search published products.
   *
   * Search uses the locale and currency from the active storefront context. The
   * query must contain 1-128 Unicode code points after whitespace normalization.
   * The contextual default sort is RELEVANCE.
   */
  readonly searchProducts: ProductConnection;
  /** Retrieves the current authentication session. */
  readonly session?: Maybe<Session>;
  /** The store selected by the trusted storefront request context. */
  readonly store: Store;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCategoryByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCheckoutArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCheckoutPlacementArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryMarketArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryNodesArgs = {
  ids: ReadonlyArray<Scalars['ID']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStoreNavigationMenuArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStoreNavigationMenuByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStoreNavigationMenusArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStorePageArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStorePageByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOnlineStorePagesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryOrderReturnRequestArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductByHandleArgs = {
  handle: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductQuestionArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductQuestionAnswerArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductVariantArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ListingSort>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryReviewArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryReviewReplyArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryReviewRequestArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QuerySearchProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  sort?: InputMaybe<ListingSort>;
};

/** Input data for resetting a password using a token. */
export type ResetPasswordInput = {
  /** Unique identifier for the client mutation. */
  readonly clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** User's email address. */
  readonly email: Scalars['Email']['input'];
  /** New password. */
  readonly password: Scalars['String']['input'];
  /** Password reset token sent to the email. */
  readonly token: Scalars['String']['input'];
};

/** Payload returned after resetting the password. */
export type ResetPasswordPayload = {
  readonly __typename: 'ResetPasswordPayload';
  /** Unique identifier echoed from the input. */
  readonly clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  readonly errors?: Maybe<ReadonlyArray<FieldError>>;
  /** True if the password was reset successfully. */
  readonly success: Scalars['Boolean']['output'];
};

export type Review = Node & ReviewContent & {
  readonly __typename: 'Review';
  readonly author: ReviewContentAuthor;
  readonly body: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly incentiveDisclosure?: Maybe<Scalars['String']['output']>;
  readonly isIncentivized: Scalars['Boolean']['output'];
  readonly isVerifiedPurchase: Scalars['Boolean']['output'];
  readonly kind: ReviewContentKind;
  readonly locale: LocaleCode;
  readonly media: ReadonlyArray<ReviewMedia>;
  readonly metrics: ReviewContentMetrics;
  readonly product: Product;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly rating: Scalars['Int']['output'];
  readonly ratings: ReadonlyArray<ReviewRating>;
  readonly replies: ReviewReplyConnection;
  readonly revision: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly translations: ReadonlyArray<ReviewContentTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly variant?: Maybe<ProductVariant>;
  readonly verificationStatus: ReviewVerificationStatus;
  readonly viewerCapabilities: ReviewContentViewerCapabilities;
  readonly viewerEngagement: ReviewContentViewerEngagement;
};


export type ReviewRepliesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A Relay connection to product reviews. */
export type ReviewConnection = Connection & {
  readonly __typename: 'ReviewConnection';
  readonly edges: ReadonlyArray<ReviewEdge>;
  readonly nodes: ReadonlyArray<Review>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** Shared storefront contract for reviews, replies, questions, and answers. */
export type ReviewContent = {
  readonly author: ReviewContentAuthor;
  readonly body: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly kind: ReviewContentKind;
  readonly locale: LocaleCode;
  readonly metrics: ReviewContentMetrics;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly revision: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly translations: ReadonlyArray<ReviewContentTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly viewerCapabilities: ReviewContentViewerCapabilities;
  readonly viewerEngagement: ReviewContentViewerEngagement;
};

/** Privacy-safe author snapshot rendered with storefront content. */
export type ReviewContentAuthor = {
  readonly __typename: 'ReviewContentAuthor';
  readonly customer?: Maybe<Customer>;
  readonly displayName: Scalars['String']['output'];
  readonly type: ReviewContentAuthorType;
};

/** The identity class used to present a content author. */
export type ReviewContentAuthorType =
  | 'CUSTOMER'
  | 'EXTERNAL'
  | 'GUEST'
  | 'SELLER'
  | 'STAFF'
  | 'SYSTEM';

export type ReviewContentConnection = Connection & {
  readonly __typename: 'ReviewContentConnection';
  readonly edges: ReadonlyArray<ReviewContentEdge>;
  readonly nodes: ReadonlyArray<ReviewContent>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** Optimistic input used to delete content owned by the current customer. */
export type ReviewContentDeleteInput = {
  readonly expectedRevision: Scalars['Int']['input'];
  readonly id: Scalars['ID']['input'];
};

export type ReviewContentEdge = {
  readonly __typename: 'ReviewContentEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewContent;
};

/** Customer-editable text fields shared by reviews, questions, and answers. */
export type ReviewContentEditInput = {
  readonly body?: InputMaybe<Scalars['String']['input']>;
  readonly locale?: InputMaybe<LocaleCode>;
  readonly title?: InputMaybe<Scalars['String']['input']>;
};

export type ReviewContentExternalReference = Node & {
  readonly __typename: 'ReviewContentExternalReference';
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly direction: ReviewExternalSyncDirection;
  readonly externalId: Scalars['String']['output'];
  readonly externalSystem: Scalars['String']['output'];
  readonly externalType: Scalars['String']['output'];
  readonly externalUrl?: Maybe<Scalars['URL']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly lastSyncedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly metadata: Scalars['JSON']['output'];
  readonly syncStatus: ReviewExternalSyncStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type ReviewContentExternalReferenceConnection = Connection & {
  readonly __typename: 'ReviewContentExternalReferenceConnection';
  readonly edges: ReadonlyArray<ReviewContentExternalReferenceEdge>;
  readonly nodes: ReadonlyArray<ReviewContentExternalReference>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewContentExternalReferenceEdge = {
  readonly __typename: 'ReviewContentExternalReferenceEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewContentExternalReference;
};

/** The concrete Reviews aggregate represented by a content node. */
export type ReviewContentKind =
  | 'PRODUCT_QUESTION'
  | 'QUESTION_ANSWER'
  | 'REVIEW'
  | 'REVIEW_REPLY';

/** Counters maintained for fast storefront rendering. */
export type ReviewContentMetrics = {
  readonly __typename: 'ReviewContentMetrics';
  readonly acceptedChildCount: Scalars['Int']['output'];
  readonly childCount: Scalars['Int']['output'];
  readonly dislikeCount: Scalars['Int']['output'];
  readonly lastChildAt?: Maybe<Scalars['DateTime']['output']>;
  readonly likeCount: Scalars['Int']['output'];
  readonly mediaCount: Scalars['Int']['output'];
  readonly officialChildCount: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type ReviewContentPublication = Node & {
  readonly __typename: 'ReviewContentPublication';
  readonly channel: Scalars['String']['output'];
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly locale?: Maybe<LocaleCode>;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly scheduledAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: ReviewPublicationStatus;
  readonly unpublishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** A report submitted against storefront content. */
export type ReviewContentReport = Node & {
  readonly __typename: 'ReviewContentReport';
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly details?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly reason: ReviewContentReportReason;
  readonly reporterCustomer?: Maybe<Customer>;
  readonly resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: ReviewContentReportStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type ReviewContentReportConnection = Connection & {
  readonly __typename: 'ReviewContentReportConnection';
  readonly edges: ReadonlyArray<ReviewContentReportEdge>;
  readonly nodes: ReadonlyArray<ReviewContentReport>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** Input for reporting storefront review content to moderation. */
export type ReviewContentReportCreateInput = {
  /** Review, reply, product question, or question answer being reported. */
  readonly contentId: Scalars['ID']['input'];
  /**
   * Additional customer-provided context, limited to 2,000 characters. Details
   * are required when reason is OTHER.
   */
  readonly details?: InputMaybe<Scalars['String']['input']>;
  readonly reason: ReviewContentReportReason;
};

/** Result of submitting a storefront content report. */
export type ReviewContentReportCreatePayload = {
  readonly __typename: 'ReviewContentReportCreatePayload';
  /** Reported content with refreshed viewer engagement. */
  readonly content?: Maybe<ReviewContent>;
  /**
   * The viewer's active report. An existing active report is returned when the
   * same logical submission is safely retried.
   */
  readonly report?: Maybe<ReviewContentReport>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ReviewContentReportEdge = {
  readonly __typename: 'ReviewContentReportEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewContentReport;
};

export type ReviewContentReportReason =
  | 'CONFLICT_OF_INTEREST'
  | 'FRAUD_OR_SCAM'
  | 'HARASSMENT'
  | 'HATE_SPEECH'
  | 'ILLEGAL_CONTENT'
  | 'INTELLECTUAL_PROPERTY'
  | 'NOT_RELEVANT'
  | 'OFFENSIVE'
  | 'OTHER'
  | 'PERSONAL_INFORMATION'
  | 'SPAM';

export type ReviewContentReportStatus =
  | 'ACTIONED'
  | 'DISMISSED'
  | 'OPEN'
  | 'UNDER_REVIEW';

/** A revision of content owned by the current customer. */
export type ReviewContentRevision = Node & {
  readonly __typename: 'ReviewContentRevision';
  readonly changeReason?: Maybe<Scalars['String']['output']>;
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly revision: Scalars['Int']['output'];
};

export type ReviewContentRevisionConnection = Connection & {
  readonly __typename: 'ReviewContentRevisionConnection';
  readonly edges: ReadonlyArray<ReviewContentRevisionEdge>;
  readonly nodes: ReadonlyArray<ReviewContentRevision>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewContentRevisionEdge = {
  readonly __typename: 'ReviewContentRevisionEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewContentRevision;
};

/** The public lifecycle state of customer-authored content. */
export type ReviewContentStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'REJECTED';

/** Shared text and request metadata for customer-authored content. */
export type ReviewContentSubmissionInput = {
  /**
   * Guest author details. Required for a guest request and optional for an
   * authenticated customer request.
   */
  readonly author?: InputMaybe<ReviewSubmissionAuthorInput>;
  /** Customer-authored body text, limited to 5,000 characters. */
  readonly body: Scalars['String']['input'];
  /**
   * Client-generated opaque key used to safely replay the submission.
   * The key must be unique within the active store.
   */
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * Submission locale. When omitted, the locale from trusted storefront context
   * is used.
   */
  readonly locale?: InputMaybe<LocaleCode>;
};

export type ReviewContentTranslation = Node & {
  readonly __typename: 'ReviewContentTranslation';
  readonly body: Scalars['String']['output'];
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly locale: LocaleCode;
  readonly revision: Scalars['Int']['output'];
  readonly source: ReviewTranslationSource;
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/**
 * Actions the current storefront viewer may perform on this content.
 *
 * Ownership, moderation state, and the configured edit window are already
 * applied, so storefront clients do not need to reproduce authorization rules.
 */
export type ReviewContentViewerCapabilities = {
  readonly __typename: 'ReviewContentViewerCapabilities';
  readonly canDelete: Scalars['Boolean']['output'];
  readonly canUpdate: Scalars['Boolean']['output'];
  readonly editableUntil?: Maybe<Scalars['DateTime']['output']>;
};

/** Request-scoped engagement state for the current storefront visitor. */
export type ReviewContentViewerEngagement = {
  readonly __typename: 'ReviewContentViewerEngagement';
  readonly hasReported: Scalars['Boolean']['output'];
  readonly vote?: Maybe<ReviewContentVoteType>;
};

export type ReviewContentVote = Node & {
  readonly __typename: 'ReviewContentVote';
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly type: ReviewContentVoteType;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly voterCustomer?: Maybe<Customer>;
};

export type ReviewContentVoteConnection = Connection & {
  readonly __typename: 'ReviewContentVoteConnection';
  readonly edges: ReadonlyArray<ReviewContentVoteEdge>;
  readonly nodes: ReadonlyArray<ReviewContentVote>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewContentVoteEdge = {
  readonly __typename: 'ReviewContentVoteEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewContentVote;
};

/** Input for removing the current viewer's reaction from review content. */
export type ReviewContentVoteRemoveInput = {
  readonly contentId: Scalars['ID']['input'];
};

/** Result of removing the current viewer's reaction. */
export type ReviewContentVoteRemovePayload = {
  readonly __typename: 'ReviewContentVoteRemovePayload';
  readonly content?: Maybe<ReviewContent>;
  readonly removedVoteId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

/** Input for setting the current viewer's reaction to review content. */
export type ReviewContentVoteSetInput = {
  /** Review, reply, product question, or question answer to vote on. */
  readonly contentId: Scalars['ID']['input'];
  readonly type: ReviewContentVoteType;
};

/** Result of setting or replacing the current viewer's vote. */
export type ReviewContentVoteSetPayload = {
  readonly __typename: 'ReviewContentVoteSetPayload';
  /** Updated content with refreshed metrics and viewer engagement. */
  readonly content?: Maybe<ReviewContent>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
  /** The current viewer's resulting vote. */
  readonly vote?: Maybe<ReviewContentVote>;
};

export type ReviewContentVoteType =
  | 'DISLIKE'
  | 'LIKE';

/** Input for a customer or guest product-review submission. */
export type ReviewCreateInput = {
  /** Shared text, locale, guest identity, and idempotency metadata. */
  readonly content: ReviewContentSubmissionInput;
  /** Review media in storefront display order. */
  readonly media?: InputMaybe<ReadonlyArray<ReviewMediaCreateInput>>;
  /**
   * Order associated with the review. Ownership and eligibility are validated by
   * the service and cannot be used to self-assign verified-purchase status.
   */
  readonly orderId?: InputMaybe<Scalars['ID']['input']>;
  /** Order line associated with the reviewed product or variant. */
  readonly orderLineId?: InputMaybe<Scalars['ID']['input']>;
  readonly productId: Scalars['ID']['input'];
  /** Overall rating from 1 through 5. */
  readonly rating: Scalars['Int']['input'];
  /** Detailed values for the product's active rating criteria. */
  readonly ratings?: InputMaybe<ReadonlyArray<ReviewRatingValueInput>>;
  /** Optional review title, limited to 150 characters. */
  readonly title?: InputMaybe<Scalars['String']['input']>;
  readonly variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** Result of submitting a product review. */
export type ReviewCreatePayload = {
  readonly __typename: 'ReviewCreatePayload';
  readonly review?: Maybe<Review>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ReviewDeletePayload = {
  readonly __typename: 'ReviewDeletePayload';
  readonly deletedReviewId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

export type ReviewDuplicatePolicy =
  | 'ALLOW_MULTIPLE'
  | 'ONE_PER_ORDER_LINE'
  | 'ONE_PER_PRODUCT';

export type ReviewEdge = {
  readonly __typename: 'ReviewEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: Review;
};

export type ReviewExternalSyncDirection =
  | 'BIDIRECTIONAL'
  | 'EXPORT'
  | 'IMPORT';

export type ReviewExternalSyncStatus =
  | 'DISABLED'
  | 'FAILED'
  | 'PENDING'
  | 'SYNCED';

export type ReviewMedia = Node & {
  readonly __typename: 'ReviewMedia';
  readonly caption?: Maybe<Scalars['String']['output']>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly media: Media;
  readonly review: Review;
  readonly sortIndex: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

/** One media attachment submitted with a review. */
export type ReviewMediaCreateInput = {
  readonly caption?: InputMaybe<Scalars['String']['input']>;
  readonly mediaId: Scalars['ID']['input'];
  /** Zero-based display position. Defaults to the input list position. */
  readonly sortIndex?: InputMaybe<Scalars['Int']['input']>;
};

export type ReviewModerationAction =
  | 'ASSIGNED'
  | 'AUTO_FLAGGED'
  | 'DELETED'
  | 'EDITED'
  | 'PUBLISHED'
  | 'REDACTED'
  | 'REJECTED'
  | 'RESTORED'
  | 'SUBMITTED';

/** A moderation case associated with content owned by the current customer. */
export type ReviewModerationCase = Node & {
  readonly __typename: 'ReviewModerationCase';
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly dueAt?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly priority: Scalars['Int']['output'];
  readonly reasonCode: Scalars['String']['output'];
  readonly resolutionCode?: Maybe<Scalars['String']['output']>;
  readonly resolvedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: ReviewModerationCaseStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type ReviewModerationCaseConnection = Connection & {
  readonly __typename: 'ReviewModerationCaseConnection';
  readonly edges: ReadonlyArray<ReviewModerationCaseEdge>;
  readonly nodes: ReadonlyArray<ReviewModerationCase>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewModerationCaseEdge = {
  readonly __typename: 'ReviewModerationCaseEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewModerationCase;
};

export type ReviewModerationCaseStatus =
  | 'CANCELLED'
  | 'IN_REVIEW'
  | 'OPEN'
  | 'RESOLVED';

/** An append-only public lifecycle event for moderated content. */
export type ReviewModerationEvent = Node & {
  readonly __typename: 'ReviewModerationEvent';
  readonly action: ReviewModerationAction;
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly fromStatus?: Maybe<ReviewContentStatus>;
  readonly id: Scalars['ID']['output'];
  readonly isAutomated: Scalars['Boolean']['output'];
  readonly moderationCase?: Maybe<ReviewModerationCase>;
  readonly reasonCode?: Maybe<Scalars['String']['output']>;
  readonly toStatus?: Maybe<ReviewContentStatus>;
};

export type ReviewModerationEventConnection = Connection & {
  readonly __typename: 'ReviewModerationEventConnection';
  readonly edges: ReadonlyArray<ReviewModerationEventEdge>;
  readonly nodes: ReadonlyArray<ReviewModerationEvent>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewModerationEventEdge = {
  readonly __typename: 'ReviewModerationEventEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewModerationEvent;
};

export type ReviewModerationMode =
  | 'AUTOMATED'
  | 'POSTMODERATION'
  | 'PREMODERATION';

/** Automated moderation evidence associated with customer-owned content. */
export type ReviewModerationSignal = Node & {
  readonly __typename: 'ReviewModerationSignal';
  readonly content: ReviewContent;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly modelVersion?: Maybe<Scalars['String']['output']>;
  readonly provider: Scalars['String']['output'];
  readonly score?: Maybe<Scalars['Float']['output']>;
  readonly signalType: Scalars['String']['output'];
  readonly verdict: ReviewModerationVerdict;
};

export type ReviewModerationSignalConnection = Connection & {
  readonly __typename: 'ReviewModerationSignalConnection';
  readonly edges: ReadonlyArray<ReviewModerationSignalEdge>;
  readonly nodes: ReadonlyArray<ReviewModerationSignal>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewModerationSignalEdge = {
  readonly __typename: 'ReviewModerationSignalEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewModerationSignal;
};

export type ReviewModerationVerdict =
  | 'BLOCK'
  | 'PASS'
  | 'REVIEW';

export type ReviewNotificationChannel =
  | 'EMAIL'
  | 'IN_APP'
  | 'PUSH'
  | 'SMS';

export type ReviewPublicationStatus =
  | 'DRAFT'
  | 'FAILED'
  | 'PUBLISHED'
  | 'SCHEDULED'
  | 'UNPUBLISHED';

export type ReviewRating = {
  readonly __typename: 'ReviewRating';
  readonly createdAt: Scalars['DateTime']['output'];
  readonly criterion: ReviewRatingCriterion;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly value: Scalars['Int']['output'];
};

/** Distribution of reviews across the five supported rating values. */
export type ReviewRatingBreakdown = {
  readonly __typename: 'ReviewRatingBreakdown';
  readonly rating1Count: Scalars['Int']['output'];
  readonly rating2Count: Scalars['Int']['output'];
  readonly rating3Count: Scalars['Int']['output'];
  readonly rating4Count: Scalars['Int']['output'];
  readonly rating5Count: Scalars['Int']['output'];
};

/** A localized rating dimension such as quality, fit, or value. */
export type ReviewRatingCriterion = Node & {
  readonly __typename: 'ReviewRatingCriterion';
  readonly appliesToAllProducts: Scalars['Boolean']['output'];
  readonly assignments: ReadonlyArray<ReviewRatingCriterionAssignment>;
  readonly code: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly defaultDescription?: Maybe<Scalars['String']['output']>;
  readonly defaultTitle: Scalars['String']['output'];
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly isActive: Scalars['Boolean']['output'];
  readonly isRequired: Scalars['Boolean']['output'];
  readonly sortIndex: Scalars['Int']['output'];
  readonly title: Scalars['String']['output'];
  readonly translations: ReadonlyArray<ReviewRatingCriterionTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly weight: Scalars['Float']['output'];
};

export type ReviewRatingCriterionAssignment = Node & {
  readonly __typename: 'ReviewRatingCriterionAssignment';
  readonly createdAt: Scalars['DateTime']['output'];
  readonly criterion: ReviewRatingCriterion;
  readonly id: Scalars['ID']['output'];
  readonly isRequired: Scalars['Boolean']['output'];
  readonly sortIndex: Scalars['Int']['output'];
  readonly target: ReviewRatingCriterionTarget;
  readonly targetType: ReviewRatingCriterionTargetType;
};

/** A Relay connection to rating criteria applicable in the current context. */
export type ReviewRatingCriterionConnection = Connection & {
  readonly __typename: 'ReviewRatingCriterionConnection';
  readonly edges: ReadonlyArray<ReviewRatingCriterionEdge>;
  readonly nodes: ReadonlyArray<ReviewRatingCriterion>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewRatingCriterionEdge = {
  readonly __typename: 'ReviewRatingCriterionEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewRatingCriterion;
};

export type ReviewRatingCriterionTarget = Category | Product;

export type ReviewRatingCriterionTargetType =
  | 'CATEGORY'
  | 'PRODUCT';

export type ReviewRatingCriterionTranslation = {
  readonly __typename: 'ReviewRatingCriterionTranslation';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly locale: LocaleCode;
  readonly title: Scalars['String']['output'];
};

/** One detailed rating value supplied for an active product criterion. */
export type ReviewRatingValueInput = {
  readonly criterionId: Scalars['ID']['input'];
  /** Rating from 1 through 5. */
  readonly value: Scalars['Int']['input'];
};

export type ReviewReply = Node & ReviewContent & {
  readonly __typename: 'ReviewReply';
  readonly author: ReviewContentAuthor;
  readonly body: Scalars['String']['output'];
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly isOfficial: Scalars['Boolean']['output'];
  readonly kind: ReviewContentKind;
  readonly locale: LocaleCode;
  readonly metrics: ReviewContentMetrics;
  readonly publishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly review: Review;
  readonly revision: Scalars['Int']['output'];
  readonly sortIndex: Scalars['Int']['output'];
  readonly status: ReviewContentStatus;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly translations: ReadonlyArray<ReviewContentTranslation>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly viewerCapabilities: ReviewContentViewerCapabilities;
  readonly viewerEngagement: ReviewContentViewerEngagement;
};

export type ReviewReplyConnection = Connection & {
  readonly __typename: 'ReviewReplyConnection';
  readonly edges: ReadonlyArray<ReviewReplyEdge>;
  readonly nodes: ReadonlyArray<ReviewReply>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewReplyEdge = {
  readonly __typename: 'ReviewReplyEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewReply;
};

/** A customer-facing invitation to review a purchased product. */
export type ReviewRequest = Node & {
  readonly __typename: 'ReviewRequest';
  readonly attemptCount: Scalars['Int']['output'];
  readonly channel: ReviewNotificationChannel;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly customer: Customer;
  readonly deliveredAt?: Maybe<Scalars['DateTime']['output']>;
  readonly events: ReviewRequestEventConnection;
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly locale: LocaleCode;
  readonly openedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly product: Product;
  readonly review?: Maybe<Review>;
  readonly scheduledAt: Scalars['DateTime']['output'];
  readonly sentAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: ReviewRequestStatus;
  readonly submittedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly variant?: Maybe<ProductVariant>;
};


/** A customer-facing invitation to review a purchased product. */
export type ReviewRequestEventsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type ReviewRequestConnection = Connection & {
  readonly __typename: 'ReviewRequestConnection';
  readonly edges: ReadonlyArray<ReviewRequestEdge>;
  readonly nodes: ReadonlyArray<ReviewRequest>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewRequestEdge = {
  readonly __typename: 'ReviewRequestEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewRequest;
};

export type ReviewRequestEvent = Node & {
  readonly __typename: 'ReviewRequestEvent';
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly occurredAt: Scalars['DateTime']['output'];
  readonly reviewRequest: ReviewRequest;
  readonly type: ReviewRequestEventType;
};

export type ReviewRequestEventConnection = Connection & {
  readonly __typename: 'ReviewRequestEventConnection';
  readonly edges: ReadonlyArray<ReviewRequestEventEdge>;
  readonly nodes: ReadonlyArray<ReviewRequestEvent>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type ReviewRequestEventEdge = {
  readonly __typename: 'ReviewRequestEventEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ReviewRequestEvent;
};

export type ReviewRequestEventType =
  | 'BOUNCED'
  | 'CANCELLED'
  | 'CLICKED'
  | 'COMPLAINED'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'FAILED'
  | 'OPENED'
  | 'SCHEDULED'
  | 'SENT'
  | 'SUBMITTED';

export type ReviewRequestStatus =
  | 'CANCELLED'
  | 'DELIVERED'
  | 'EXPIRED'
  | 'FAILED'
  | 'OPENED'
  | 'SCHEDULED'
  | 'SENT'
  | 'SUBMITTED';

/** Customer-facing orderings supported by review connections. */
export type ReviewSort =
  | 'HIGHEST_RATING'
  | 'LOWEST_RATING'
  | 'MOST_HELPFUL'
  | 'NEWEST'
  | 'OLDEST';

export type ReviewStoreConfiguration = Node & {
  readonly __typename: 'ReviewStoreConfiguration';
  readonly answerEditWindowHours: Scalars['Int']['output'];
  readonly answerModerationMode: ReviewModerationMode;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly customerAnswersEnabled: Scalars['Boolean']['output'];
  readonly guestQuestionsEnabled: Scalars['Boolean']['output'];
  readonly guestReviewsEnabled: Scalars['Boolean']['output'];
  readonly id: Scalars['ID']['output'];
  readonly maxAnswersPerQuestion: Scalars['Int']['output'];
  readonly maxReviewMediaCount: Scalars['Int']['output'];
  readonly questionEditWindowHours: Scalars['Int']['output'];
  readonly questionModerationMode: ReviewModerationMode;
  readonly questionsEnabled: Scalars['Boolean']['output'];
  readonly reviewDuplicatePolicy: ReviewDuplicatePolicy;
  readonly reviewEditWindowHours: Scalars['Int']['output'];
  readonly reviewModerationMode: ReviewModerationMode;
  readonly reviewRequestDelayDays: Scalars['Int']['output'];
  readonly reviewRequestExpiryDays: Scalars['Int']['output'];
  readonly reviewRequestsEnabled: Scalars['Boolean']['output'];
  readonly reviewsEnabled: Scalars['Boolean']['output'];
  readonly revision: Scalars['Int']['output'];
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly verifiedPurchaseRequired: Scalars['Boolean']['output'];
};

/**
 * Guest identity supplied for a storefront content submission.
 *
 * Authenticated customer identity is always taken from trusted request context;
 * when a customer is authenticated this input is ignored.
 */
export type ReviewSubmissionAuthorInput = {
  /** Public display name shown alongside the submitted content. */
  readonly displayName: Scalars['String']['input'];
  /** Contact email required for guest submissions and never exposed publicly. */
  readonly email?: InputMaybe<Scalars['Email']['input']>;
};

export type ReviewTranslationSource =
  | 'HUMAN'
  | 'IMPORT'
  | 'MACHINE';

/** Customer-editable fields of an existing review. */
export type ReviewUpdateInput = {
  readonly content?: InputMaybe<ReviewContentEditInput>;
  readonly expectedRevision: Scalars['Int']['input'];
  /** Complete media replacement when supplied. An empty list removes media. */
  readonly media?: InputMaybe<ReadonlyArray<ReviewMediaCreateInput>>;
  /** New overall rating from 1 through 5. */
  readonly rating?: InputMaybe<Scalars['Int']['input']>;
  /** Complete detailed criterion rating replacement when supplied. */
  readonly ratings?: InputMaybe<ReadonlyArray<ReviewRatingValueInput>>;
  readonly reviewId: Scalars['ID']['input'];
};

export type ReviewUpdatePayload = {
  readonly __typename: 'ReviewUpdatePayload';
  readonly review?: Maybe<Review>;
  readonly userErrors: ReadonlyArray<ReviewUserError>;
};

/** A customer-facing mutation error safe to display in a storefront. */
export type ReviewUserError = DisplayableError & {
  readonly __typename: 'ReviewUserError';
  /** Stable machine-readable error code. */
  readonly code?: Maybe<Scalars['String']['output']>;
  /** Path to the invalid input field, when available. */
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  /** Human-readable error message. */
  readonly message: Scalars['String']['output'];
};

export type ReviewVerificationStatus =
  | 'REVOKED'
  | 'UNVERIFIED'
  | 'VERIFIED';

/** Localized rich text in plain text, HTML, and structured JSON formats. */
export type RichText = {
  readonly __typename: 'RichText';
  readonly html: Scalars['HTML']['output'];
  readonly json: Scalars['JSON']['output'];
  readonly text: Scalars['String']['output'];
};

/** Search-engine and social-sharing metadata. */
export type Seo = {
  readonly __typename: 'SEO';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly openGraph: OpenGraphMetadata;
  readonly title?: Maybe<Scalars['String']['output']>;
};

/** A resolved option/value pair selected by a product variant. */
export type SelectedOption = {
  readonly __typename: 'SelectedOption';
  readonly name: Scalars['String']['output'];
  readonly option: ProductOption;
  readonly optionValue: ProductOptionValue;
  readonly value: Scalars['String']['output'];
};

/** Stable option and value handles used to resolve a product variant. */
export type SelectedOptionInput = {
  readonly option: Scalars['String']['input'];
  readonly value: Scalars['String']['input'];
};

/** Represents an authentication session. */
export type Session = {
  readonly __typename: 'Session';
  /** JWT access token for authenticating subsequent requests. */
  readonly accessToken?: Maybe<Scalars['String']['output']>;
  /** The authenticated user. */
  readonly user: User;
};

export type Store = Node & {
  readonly __typename: 'Store';
  readonly address?: Maybe<StoreAddress>;
  readonly brand: StoreBrand;
  readonly contact?: Maybe<StoreContact>;
  readonly defaultCurrency: CurrencyCode;
  readonly defaultLocale: LocaleCode;
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly email?: Maybe<Scalars['String']['output']>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly markets: MarketConnection;
  readonly name: Scalars['String']['output'];
  readonly timezone: Scalars['String']['output'];
};


export type StoreMarketsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type StoreAddress = {
  readonly __typename: 'StoreAddress';
  readonly address1?: Maybe<Scalars['String']['output']>;
  readonly address2?: Maybe<Scalars['String']['output']>;
  readonly city?: Maybe<Scalars['String']['output']>;
  readonly companyName?: Maybe<Scalars['String']['output']>;
  readonly countryCode: CountryCode;
  readonly postalCode?: Maybe<Scalars['String']['output']>;
  readonly province?: Maybe<Scalars['String']['output']>;
};

export type StoreBrand = {
  readonly __typename: 'StoreBrand';
  readonly coverImage?: Maybe<MediaImage>;
  readonly logo?: Maybe<MediaImage>;
  readonly primaryColor: Scalars['Color']['output'];
  readonly secondaryColor: Scalars['Color']['output'];
  readonly shortDescription?: Maybe<Scalars['String']['output']>;
  readonly slogan?: Maybe<Scalars['String']['output']>;
  readonly socialLinks: ReadonlyArray<StoreSocialLink>;
  readonly squareLogo?: Maybe<MediaImage>;
};

export type StoreContact = {
  readonly __typename: 'StoreContact';
  readonly email?: Maybe<Scalars['String']['output']>;
  readonly name: Scalars['String']['output'];
  readonly phoneNumbers: ReadonlyArray<Scalars['String']['output']>;
};

export type StoreSocialLink = {
  readonly __typename: 'StoreSocialLink';
  readonly platform: Scalars['String']['output'];
  readonly url: Scalars['URL']['output'];
};

export type SwatchType =
  | 'COLOR'
  | 'GRADIENT';

/** A localized, stable label used to organize and filter products. */
export type Tag = Node & {
  readonly __typename: 'Tag';
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

/** Represents a user in the system. */
export type User = Node & {
  readonly __typename: 'User';
  /** User's email address. */
  readonly email: Scalars['Email']['output'];
  /** Global unique identifier for the address. */
  readonly id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  readonly iid: Scalars['Uuid']['output'];
  /** Whether the user's email has been verified. */
  readonly isVerified: Scalars['Boolean']['output'];
  /** Preferred interface language (locale code). */
  readonly language?: Maybe<LocaleCode>;
  /** Full name of the user. */
  readonly name: UserName;
  /** List of the user's orders. */
  readonly orders: ReadonlyArray<Order>;
  /** Phone number in E.164 format. */
  readonly phone?: Maybe<Scalars['Phone']['output']>;
};

/** Represents a generic error in the input of a mutation. */
export type UserError = DisplayableError & {
  readonly __typename: 'UserError';
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  readonly message: Scalars['String']['output'];
};

/** Customer's first, middle, and last name. */
export type UserName = {
  readonly __typename: 'UserName';
  /** First name. */
  readonly first: Scalars['String']['output'];
  /** Last name. */
  readonly last: Scalars['String']['output'];
  /** Middle name (optional). */
  readonly middle?: Maybe<Scalars['String']['output']>;
};

/** The brand, manufacturer, or supplier associated with a product. */
export type Vendor = Node & {
  readonly __typename: 'Vendor';
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

/** A video hosted on the platform's servers. */
export type Video = Media & Node & {
  readonly __typename: 'Video';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly presentation?: Maybe<MediaPresentation>;
  readonly previewImage?: Maybe<Image>;
  readonly sources: ReadonlyArray<VideoSource>;
};

/** A source for a hosted video. */
export type VideoSource = {
  readonly __typename: 'VideoSource';
  readonly format: Scalars['String']['output'];
  readonly height: Scalars['Int']['output'];
  readonly mimeType: Scalars['String']['output'];
  readonly url: Scalars['String']['output'];
  readonly width: Scalars['Int']['output'];
};

/** A weight measurement expressed in a supported unit. */
export type Weight = {
  readonly __typename: 'Weight';
  readonly unit: WeightUnit;
  readonly value: Scalars['Float']['output'];
};

/** Weight measurement units */
export type WeightUnit =
  /** Gram */
  | 'g'
  /** Kilogram */
  | 'kg'
  /** Pound */
  | 'lb'
  /** Ounce */
  | 'oz';

export type Join__Graph =
  | 'APPS_HEADLESS_STOREFRONT'
  | 'APPS_ONLINE_STORE_STOREFRONT'
  | 'CATALOG_STOREFRONT'
  | 'CHECKOUT_STOREFRONT'
  | 'CUSTOMERS_STOREFRONT'
  | 'LISTING_STOREFRONT'
  | 'MEDIA_STOREFRONT'
  | 'ORDERS_STOREFRONT'
  | 'PROJECT_STOREFRONT'
  | 'REVIEWS_STOREFRONT';

export type Link__Purpose =
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  | 'EXECUTION'
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  | 'SECURITY';

export type SdkCartFragment_CartFragment = { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> };

export type SdkCartLineFragment_LineFragment = { readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null };

export type SdkAddToCartMutationVariables = Exact<{
  input: CheckoutLinesAddInput;
}>;


export type SdkAddToCartMutation = { readonly __typename: 'Mutation', readonly checkoutLinesAdd: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkClearCartMutationVariables = Exact<{
  input: CheckoutLinesClearInput;
}>;


export type SdkClearCartMutation = { readonly __typename: 'Mutation', readonly checkoutLinesClear: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkCreateCartMutationVariables = Exact<{
  input: CheckoutCreateInput;
}>;


export type SdkCreateCartMutation = { readonly __typename: 'Mutation', readonly checkoutCreate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkRemoveFromCartMutationVariables = Exact<{
  input: CheckoutLinesDeleteInput;
}>;


export type SdkRemoveFromCartMutation = { readonly __typename: 'Mutation', readonly checkoutLinesDelete: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkReplaceCartItemMutationVariables = Exact<{
  input: CheckoutLinesReplaceInput;
}>;


export type SdkReplaceCartItemMutation = { readonly __typename: 'Mutation', readonly checkoutLinesReplace: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkUpdateCartLineQuantityMutationVariables = Exact<{
  input: CheckoutLinesUpdateInput;
}>;


export type SdkUpdateCartLineQuantityMutation = { readonly __typename: 'Mutation', readonly checkoutLinesUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type SdkLoadCartQueryVariables = Exact<{
  checkoutId: Scalars['ID']['input'];
}>;


export type SdkLoadCartQuery = { readonly __typename: 'Query', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly version: number, readonly resultRevision: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }>, readonly tags: ReadonlyArray<{ readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean }>, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly subtotalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any }, readonly totalAmount: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } }, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> }, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly quantity: number }>, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null } | null, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }> } | null };

export type SdkCollectionListingFragment = { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly presentation?: FilterPresentation | null, readonly selectionMode?: FacetSelectionMode | null, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
          | { readonly __typename: 'ExternalVideo' }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d' }
          | { readonly __typename: 'Video' }
         | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
              | { readonly __typename: 'ExternalVideo', readonly id: string }
              | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
              | { readonly __typename: 'Model3d', readonly id: string }
              | { readonly __typename: 'Video', readonly id: string }
             }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> } };

export type SdkCollectionProductCardFragment = { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
    | { readonly __typename: 'ExternalVideo' }
    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
    | { readonly __typename: 'Model3d' }
    | { readonly __typename: 'Video' }
   | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null };

export type SdkCollectionQueryVariables = Exact<{
  handle: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['Cursor']['input']>;
  sort?: InputMaybe<ListingSort>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
}>;


export type SdkCollectionQuery = { readonly __typename: 'Query', readonly category?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any, readonly json: object } | null, readonly listing: { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly presentation?: FilterPresentation | null, readonly selectionMode?: FacetSelectionMode | null, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
            | { readonly __typename: 'ExternalVideo' }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d' }
            | { readonly __typename: 'Video' }
           | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
                  | { readonly __typename: 'ExternalVideo', readonly id: string }
                  | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                  | { readonly __typename: 'Model3d', readonly id: string }
                  | { readonly __typename: 'Video', readonly id: string }
                 | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> } } | null };

export type SdkCategoryFragment_CategoryFragment = { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly featuredMedia?:
          | { readonly __typename: 'ExternalVideo' }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d' }
          | { readonly __typename: 'Video' }
         | null, readonly selectedOrFirstAvailableVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null } }> } };

export type SdkHomePageQueryVariables = Exact<{ [key: string]: never; }>;


export type SdkHomePageQuery = { readonly __typename: 'Query', readonly electronics?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly featuredMedia?:
            | { readonly __typename: 'ExternalVideo' }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d' }
            | { readonly __typename: 'Video' }
           | null, readonly selectedOrFirstAvailableVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null } }> } } | null, readonly toys?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly featuredMedia?:
            | { readonly __typename: 'ExternalVideo' }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d' }
            | { readonly __typename: 'Video' }
           | null, readonly selectedOrFirstAvailableVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null } }> } } | null, readonly sport?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly featuredMedia?:
            | { readonly __typename: 'ExternalVideo' }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d' }
            | { readonly __typename: 'Video' }
           | null, readonly selectedOrFirstAvailableVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null } }> } } | null, readonly homeAndGarden?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly children: { readonly __typename: 'CategoryConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'CategoryEdge', readonly node: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly featuredMedia?:
                  | { readonly __typename: 'ExternalVideo' }
                  | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                  | { readonly __typename: 'Model3d' }
                  | { readonly __typename: 'Video' }
                 | null, readonly selectedOrFirstAvailableVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null } }> } } }> } } | null };

export type SdkProductComponentConfigurationFragment = { readonly __typename: 'ProductVariant', readonly id: string, readonly componentConfiguration?: { readonly __typename: 'ProductComponentConfiguration', readonly id: string, readonly displayStyle: ProductComponentDisplayStyle, readonly componentsSubtotal: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly groups: ReadonlyArray<{ readonly __typename: 'ProductComponentGroup', readonly id: string, readonly title: string, readonly required: boolean, readonly minSelection?: number | null, readonly maxSelection?: number | null, readonly isRequired: boolean, readonly items: ReadonlyArray<{ readonly __typename: 'ProductComponentItem', readonly id: string, readonly title: string, readonly selected: boolean, readonly required: boolean, readonly availableForSale: boolean, readonly quantity: number, readonly minQuantity: number, readonly maxQuantity?: number | null, readonly unitPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly featuredMedia?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null, readonly cover?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly variant: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isDefault: boolean, readonly availableForSale: boolean, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly requiresShipping: boolean, readonly createdAt: string, readonly updatedAt: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly weight?: { readonly __typename: 'Weight', readonly value: number, readonly unit: WeightUnit } | null, readonly dimensions?: { readonly __typename: 'Dimensions', readonly width: number, readonly height: number, readonly length: number, readonly unit: DimensionUnit } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }>, readonly featuredMedia?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly media: { readonly __typename: 'ProductVariantMediaConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantMediaEdge', readonly cursor: string, readonly node:
                | { readonly __typename: 'ExternalVideo', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                | { readonly __typename: 'Model3d', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
                | { readonly __typename: 'Video', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
               }> } }, readonly node: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null } }> }> } | null };

export type SdkProductComponentGroupFragment = { readonly __typename: 'ProductComponentGroup', readonly id: string, readonly title: string, readonly required: boolean, readonly minSelection?: number | null, readonly maxSelection?: number | null, readonly isRequired: boolean, readonly items: ReadonlyArray<{ readonly __typename: 'ProductComponentItem', readonly id: string, readonly title: string, readonly selected: boolean, readonly required: boolean, readonly availableForSale: boolean, readonly quantity: number, readonly minQuantity: number, readonly maxQuantity?: number | null, readonly unitPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly featuredMedia?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null, readonly cover?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly variant: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isDefault: boolean, readonly availableForSale: boolean, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly requiresShipping: boolean, readonly createdAt: string, readonly updatedAt: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly weight?: { readonly __typename: 'Weight', readonly value: number, readonly unit: WeightUnit } | null, readonly dimensions?: { readonly __typename: 'Dimensions', readonly width: number, readonly height: number, readonly length: number, readonly unit: DimensionUnit } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }>, readonly featuredMedia?:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       | null, readonly media: { readonly __typename: 'ProductVariantMediaConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantMediaEdge', readonly cursor: string, readonly node:
            | { readonly __typename: 'ExternalVideo', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
            | { readonly __typename: 'Model3d', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
            | { readonly __typename: 'Video', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
           }> } }, readonly node: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       | null } }> };

export type SdkProductComponentItemFragment = { readonly __typename: 'ProductComponentItem', readonly id: string, readonly title: string, readonly selected: boolean, readonly required: boolean, readonly availableForSale: boolean, readonly quantity: number, readonly minQuantity: number, readonly maxQuantity?: number | null, readonly unitPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly featuredMedia?:
    | { readonly __typename: 'ExternalVideo', readonly id: string }
    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
    | { readonly __typename: 'Model3d', readonly id: string }
    | { readonly __typename: 'Video', readonly id: string }
   | null, readonly cover?:
    | { readonly __typename: 'ExternalVideo', readonly id: string }
    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
    | { readonly __typename: 'Model3d', readonly id: string }
    | { readonly __typename: 'Video', readonly id: string }
   | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly variant: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isDefault: boolean, readonly availableForSale: boolean, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly requiresShipping: boolean, readonly createdAt: string, readonly updatedAt: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly weight?: { readonly __typename: 'Weight', readonly value: number, readonly unit: WeightUnit } | null, readonly dimensions?: { readonly __typename: 'Dimensions', readonly width: number, readonly height: number, readonly length: number, readonly unit: DimensionUnit } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }>, readonly featuredMedia?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null, readonly media: { readonly __typename: 'ProductVariantMediaConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantMediaEdge', readonly cursor: string, readonly node:
          | { readonly __typename: 'ExternalVideo', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
          | { readonly __typename: 'Model3d', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
          | { readonly __typename: 'Video', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
         }> } }, readonly node: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null } };

export type SdkProductReviewsFragment = { readonly __typename: 'Product', readonly id: string, readonly reviews: { readonly __typename: 'ReviewConnection', readonly totalCount: number, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ReviewEdge', readonly cursor: string, readonly node: { readonly __typename: 'Review', readonly id: string, readonly kind: ReviewContentKind, readonly rating: number, readonly title?: string | null, readonly locale: LocaleCode, readonly status: ReviewContentStatus, readonly revision: number, readonly verificationStatus: ReviewVerificationStatus, readonly createdAt: string, readonly publishedAt?: string | null, readonly message: string, readonly verifiedPurchase: boolean, readonly editedAt: string, readonly author: { readonly __typename: 'ReviewContentAuthor', readonly type: ReviewContentAuthorType, readonly displayName: string }, readonly metrics: { readonly __typename: 'ReviewContentMetrics', readonly mediaCount: number, readonly helpfulYes: number, readonly helpfulNo: number }, readonly viewerEngagement: { readonly __typename: 'ReviewContentViewerEngagement', readonly hasReported: boolean, readonly meHelpful?: ReviewContentVoteType | null }, readonly media: ReadonlyArray<{ readonly __typename: 'ReviewMedia', readonly id: string, readonly media:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           }> } }> } };

export type SdkProductQueryVariables = Exact<{
  handle: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['Cursor']['input']>;
  sort?: InputMaybe<ReviewSort>;
  componentSelections?: InputMaybe<ReadonlyArray<ProductComponentSelectionInput>>;
}>;


export type SdkProductQuery = { readonly __typename: 'Query', readonly product?: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly availableForSale: boolean, readonly totalInventory?: number | null, readonly createdAt: string, readonly updatedAt: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any, readonly json: object } | null, readonly excerpt?: { readonly __typename: 'RichText', readonly text: string, readonly html: any, readonly json: object } | null, readonly seo: { readonly __typename: 'SEO', readonly title?: string | null, readonly description?: string | null }, readonly vendor?: { readonly __typename: 'Vendor', readonly id: string, readonly name: string } | null, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly position: number, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly position: number, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null } | null }> }>, readonly category?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly breadcrumbs: ReadonlyArray<{ readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string }> } | null, readonly featuredMedia?:
      | { readonly __typename: 'ExternalVideo', readonly id: string }
      | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
      | { readonly __typename: 'Model3d', readonly id: string }
      | { readonly __typename: 'Video', readonly id: string }
     | null, readonly media: { readonly __typename: 'ProductMediaConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly cursor: string, readonly node:
          | { readonly __typename: 'ExternalVideo', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType, readonly image?: { readonly __typename: 'Image', readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
          | { readonly __typename: 'Model3d', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
          | { readonly __typename: 'Video', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
         }> }, readonly variants: { readonly __typename: 'ProductVariantConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantEdge', readonly cursor: string, readonly node: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly title: string, readonly sku?: string | null, readonly isDefault: boolean, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly isAvailable: boolean, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }>, readonly featuredMedia?:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           | null, readonly media: { readonly __typename: 'ProductVariantMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantMediaEdge', readonly node:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               }> }, readonly price?: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly currencyCode: CurrencyCode, readonly amount: any } | null, readonly componentConfiguration?: { readonly __typename: 'ProductComponentConfiguration', readonly id: string, readonly displayStyle: ProductComponentDisplayStyle, readonly componentsSubtotal: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly groups: ReadonlyArray<{ readonly __typename: 'ProductComponentGroup', readonly id: string, readonly title: string, readonly required: boolean, readonly minSelection?: number | null, readonly maxSelection?: number | null, readonly isRequired: boolean, readonly items: ReadonlyArray<{ readonly __typename: 'ProductComponentItem', readonly id: string, readonly title: string, readonly selected: boolean, readonly required: boolean, readonly availableForSale: boolean, readonly quantity: number, readonly minQuantity: number, readonly maxQuantity?: number | null, readonly unitPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly totalPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly featuredMedia?:
                  | { readonly __typename: 'ExternalVideo', readonly id: string }
                  | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                  | { readonly __typename: 'Model3d', readonly id: string }
                  | { readonly __typename: 'Video', readonly id: string }
                 | null, readonly cover?:
                  | { readonly __typename: 'ExternalVideo', readonly id: string }
                  | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                  | { readonly __typename: 'Model3d', readonly id: string }
                  | { readonly __typename: 'Video', readonly id: string }
                 | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly variant: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isDefault: boolean, readonly availableForSale: boolean, readonly currentlyNotInStock: boolean, readonly quantityAvailable?: number | null, readonly requiresShipping: boolean, readonly createdAt: string, readonly updatedAt: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly weight?: { readonly __typename: 'Weight', readonly value: number, readonly unit: WeightUnit } | null, readonly dimensions?: { readonly __typename: 'Dimensions', readonly width: number, readonly height: number, readonly length: number, readonly unit: DimensionUnit } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }>, readonly featuredMedia?:
                    | { readonly __typename: 'ExternalVideo', readonly id: string }
                    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                    | { readonly __typename: 'Model3d', readonly id: string }
                    | { readonly __typename: 'Video', readonly id: string }
                   | null, readonly media: { readonly __typename: 'ProductVariantMediaConnection', readonly totalCount: number, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductVariantMediaEdge', readonly cursor: string, readonly node:
                        | { readonly __typename: 'ExternalVideo', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
                        | { readonly __typename: 'MediaImage', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                        | { readonly __typename: 'Model3d', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
                        | { readonly __typename: 'Video', readonly id: string, readonly alt?: string | null, readonly mediaContentType: MediaContentType }
                       }> } }, readonly node: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string }, readonly cover?:
                    | { readonly __typename: 'ExternalVideo', readonly id: string }
                    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly id?: string | null, readonly url: any, readonly width?: number | null, readonly height?: number | null, readonly altText?: string | null } | null }
                    | { readonly __typename: 'Model3d', readonly id: string }
                    | { readonly __typename: 'Video', readonly id: string }
                   | null } }> }> } | null } }> }, readonly tags: ReadonlyArray<{ readonly __typename: 'Tag', readonly id: string, readonly handle: string, readonly title: string }>, readonly features: ReadonlyArray<{ readonly __typename: 'ProductFeature', readonly id: string, readonly handle: string, readonly position: number, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductFeatureValue', readonly id: string, readonly handle: string, readonly title: string }> }>, readonly priceRange?: { readonly __typename: 'ProductPriceRange', readonly minVariantPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly maxVariantPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } } | null, readonly compareAtPriceRange?: { readonly __typename: 'ProductPriceRange', readonly minVariantPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly maxVariantPrice: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly verifiedReviewCount: number, readonly mediaReviewCount: number, readonly count: number, readonly rating: number, readonly breakdown: { readonly __typename: 'ReviewRatingBreakdown', readonly rating1Count: number, readonly rating2Count: number, readonly rating3Count: number, readonly rating4Count: number, readonly rating5Count: number } }, readonly reviews: { readonly __typename: 'ReviewConnection', readonly totalCount: number, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ReviewEdge', readonly cursor: string, readonly node: { readonly __typename: 'Review', readonly id: string, readonly kind: ReviewContentKind, readonly rating: number, readonly title?: string | null, readonly locale: LocaleCode, readonly status: ReviewContentStatus, readonly revision: number, readonly verificationStatus: ReviewVerificationStatus, readonly createdAt: string, readonly publishedAt?: string | null, readonly message: string, readonly verifiedPurchase: boolean, readonly editedAt: string, readonly author: { readonly __typename: 'ReviewContentAuthor', readonly type: ReviewContentAuthorType, readonly displayName: string }, readonly metrics: { readonly __typename: 'ReviewContentMetrics', readonly mediaCount: number, readonly helpfulYes: number, readonly helpfulNo: number }, readonly viewerEngagement: { readonly __typename: 'ReviewContentViewerEngagement', readonly hasReported: boolean, readonly meHelpful?: ReviewContentVoteType | null }, readonly media: ReadonlyArray<{ readonly __typename: 'ReviewMedia', readonly id: string, readonly media:
              | { readonly __typename: 'ExternalVideo', readonly id: string }
              | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
              | { readonly __typename: 'Model3d', readonly id: string }
              | { readonly __typename: 'Video', readonly id: string }
             }> } }> } } | null };

export type SdkSearchProductCardFragment = { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
    | { readonly __typename: 'ExternalVideo' }
    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
    | { readonly __typename: 'Model3d' }
    | { readonly __typename: 'Video' }
   | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null };

export type SdkSearchProductsFragment = { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
        | { readonly __typename: 'ExternalVideo' }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
        | { readonly __typename: 'Model3d' }
        | { readonly __typename: 'Video' }
       | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
              | { readonly __typename: 'ExternalVideo', readonly id: string }
              | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
              | { readonly __typename: 'Model3d', readonly id: string }
              | { readonly __typename: 'Video', readonly id: string }
             | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> };

export type SdkSearchQueryVariables = Exact<{
  query: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['Cursor']['input']>;
  sort?: InputMaybe<ListingSort>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
}>;


export type SdkSearchQuery = { readonly __typename: 'Query', readonly searchProducts: { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
          | { readonly __typename: 'ExternalVideo' }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d' }
          | { readonly __typename: 'Video' }
         | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
              | { readonly __typename: 'ExternalVideo', readonly id: string }
              | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
              | { readonly __typename: 'Model3d', readonly id: string }
              | { readonly __typename: 'Video', readonly id: string }
             }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> } };

export type SdkForgotPasswordMutationVariables = Exact<{
  input: PasswordRecoveryInput;
}>;


export type SdkForgotPasswordMutation = { readonly __typename: 'Mutation', readonly requestPasswordRecovery: { readonly __typename: 'PasswordRecoveryPayload', readonly success: boolean, readonly clientMutationId?: string | null, readonly errors?: ReadonlyArray<{ readonly __typename: 'FieldError', readonly message: string }> | null } };

export type SdkResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type SdkResetPasswordMutation = { readonly __typename: 'Mutation', readonly resetPassword: { readonly __typename: 'ResetPasswordPayload', readonly success: boolean, readonly clientMutationId?: string | null, readonly errors?: ReadonlyArray<{ readonly __typename: 'FieldError', readonly message: string }> | null } };

export type SdkSignInMutationVariables = Exact<{
  input: PasswordSignInInput;
}>;


export type SdkSignInMutation = { readonly __typename: 'Mutation', readonly passwordSignIn: { readonly __typename: 'PasswordSignInPayload', readonly session?: { readonly __typename: 'Session', readonly accessToken?: string | null, readonly user: { readonly __typename: 'User', readonly id: string, readonly iid: string, readonly email: string } } | null, readonly errors?: ReadonlyArray<{ readonly __typename: 'FieldError', readonly message: string }> | null } };

export type SdkSignOutMutationVariables = Exact<{ [key: string]: never; }>;


export type SdkSignOutMutation = { readonly __typename: 'Mutation', readonly signOut: boolean };

export type SdkSignUpMutationVariables = Exact<{
  input: PasswordSignUpInput;
}>;


export type SdkSignUpMutation = { readonly __typename: 'Mutation', readonly passwordSignUp: { readonly __typename: 'PasswordSignUpPayload', readonly session?: { readonly __typename: 'Session', readonly accessToken?: string | null, readonly user: { readonly __typename: 'User', readonly id: string, readonly iid: string, readonly email: string } } | null, readonly errors?: ReadonlyArray<{ readonly __typename: 'FieldError', readonly message: string }> | null } };

export type SdkLoadSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type SdkLoadSessionQuery = { readonly __typename: 'Query', readonly session?: { readonly __typename: 'Session', readonly accessToken?: string | null, readonly user: { readonly __typename: 'User', readonly id: string, readonly iid: string, readonly email: string } } | null };

export type SdkUseGetSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type SdkUseGetSessionQuery = { readonly __typename: 'Query', readonly session?: { readonly __typename: 'Session', readonly accessToken?: string | null, readonly user: { readonly __typename: 'User', readonly id: string, readonly iid: string, readonly email: string } } | null };

export type SdkCategoryQueryVariables = Exact<{
  handle: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['Cursor']['input']>;
  sort?: InputMaybe<ListingSort>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
}>;


export type SdkCategoryQuery = { readonly __typename: 'Query', readonly category?: { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any, readonly json: object } | null, readonly listing: { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
            | { readonly __typename: 'ExternalVideo' }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d' }
            | { readonly __typename: 'Video' }
           | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
                  | { readonly __typename: 'ExternalVideo', readonly id: string }
                  | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                  | { readonly __typename: 'Model3d', readonly id: string }
                  | { readonly __typename: 'Video', readonly id: string }
                 | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> } } | null };

export type SdkListingFragment = { readonly __typename: 'Category', readonly id: string, readonly handle: string, readonly title: string, readonly listing: { readonly __typename: 'ProductConnection', readonly totalCount: number, readonly sort: ListingSort, readonly availableSorts: ReadonlyArray<ListingSort>, readonly filters: ReadonlyArray<{ readonly __typename: 'Filter', readonly id: string, readonly label: string, readonly type: FilterType, readonly handle: string, readonly title: string, readonly priceRange?: { readonly __typename: 'FilterPriceRange', readonly min: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly max: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode }, readonly selectedMin?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedMax?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null } | null, readonly values: ReadonlyArray<{ readonly __typename: 'FilterValue', readonly id: string, readonly label: string, readonly count: number, readonly selected: boolean, readonly input: object, readonly handle: string, readonly title: string }> }>, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ProductEdge', readonly cursor: string, readonly node: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
          | { readonly __typename: 'ExternalVideo' }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d' }
          | { readonly __typename: 'Video' }
         | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
              | { readonly __typename: 'ExternalVideo', readonly id: string }
              | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
              | { readonly __typename: 'Model3d', readonly id: string }
              | { readonly __typename: 'Video', readonly id: string }
             }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
                | { readonly __typename: 'ExternalVideo', readonly id: string }
                | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
                | { readonly __typename: 'Model3d', readonly id: string }
                | { readonly __typename: 'Video', readonly id: string }
               | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null } }> } };

export type SdkReviewsFragment = { readonly __typename: 'Product', readonly id: string, readonly reviews: { readonly __typename: 'ReviewConnection', readonly totalCount: number, readonly pageInfo: { readonly __typename: 'PageInfo', readonly hasNextPage: boolean, readonly endCursor?: string | null }, readonly edges: ReadonlyArray<{ readonly __typename: 'ReviewEdge', readonly cursor: string, readonly node: { readonly __typename: 'Review', readonly id: string, readonly kind: ReviewContentKind, readonly rating: number, readonly title?: string | null, readonly locale: LocaleCode, readonly status: ReviewContentStatus, readonly revision: number, readonly verificationStatus: ReviewVerificationStatus, readonly createdAt: string, readonly publishedAt?: string | null, readonly message: string, readonly verifiedPurchase: boolean, readonly editedAt: string, readonly author: { readonly __typename: 'ReviewContentAuthor', readonly type: ReviewContentAuthorType, readonly displayName: string }, readonly metrics: { readonly __typename: 'ReviewContentMetrics', readonly mediaCount: number, readonly helpfulYes: number, readonly helpfulNo: number }, readonly viewerEngagement: { readonly __typename: 'ReviewContentViewerEngagement', readonly hasReported: boolean, readonly meHelpful?: ReviewContentVoteType | null }, readonly media: ReadonlyArray<{ readonly __typename: 'ReviewMedia', readonly id: string, readonly media:
            | { readonly __typename: 'ExternalVideo', readonly id: string }
            | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
            | { readonly __typename: 'Model3d', readonly id: string }
            | { readonly __typename: 'Video', readonly id: string }
           }> } }> } };

export type SdkUseListingProductCardFragment_ProductFragment = { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string, readonly description?: { readonly __typename: 'RichText', readonly text: string, readonly html: any } | null, readonly rating: { readonly __typename: 'ProductReviewSummary', readonly rating: number, readonly count: number }, readonly cover?:
    | { readonly __typename: 'ExternalVideo' }
    | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
    | { readonly __typename: 'Model3d' }
    | { readonly __typename: 'Video' }
   | null, readonly gallery: { readonly __typename: 'ProductMediaConnection', readonly edges: ReadonlyArray<{ readonly __typename: 'ProductMediaEdge', readonly node:
        | { readonly __typename: 'ExternalVideo', readonly id: string }
        | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
        | { readonly __typename: 'Model3d', readonly id: string }
        | { readonly __typename: 'Video', readonly id: string }
       }> }, readonly options: ReadonlyArray<{ readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly displayType: ProductOptionDisplayType, readonly title: string, readonly values: ReadonlyArray<{ readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly title: string, readonly swatch?: { readonly __typename: 'ProductOptionValueSwatch', readonly color?: any | null, readonly color2?: any | null, readonly displayType: ProductOptionSwatchType, readonly image?:
          | { readonly __typename: 'ExternalVideo', readonly id: string }
          | { readonly __typename: 'MediaImage', readonly id: string, readonly image?: { readonly __typename: 'Image', readonly url: any } | null }
          | { readonly __typename: 'Model3d', readonly id: string }
          | { readonly __typename: 'Video', readonly id: string }
         | null } | null }> }>, readonly selectedVariant?: { readonly __typename: 'ProductVariant', readonly id: string, readonly title: string, readonly handle: string, readonly sku?: string | null, readonly isAvailable: boolean, readonly price?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly compareAtPrice?: { readonly __typename: 'Money', readonly amount: any, readonly currencyCode: CurrencyCode } | null, readonly selectedOptions: ReadonlyArray<{ readonly __typename: 'SelectedOption', readonly name: string, readonly value: string, readonly option: { readonly __typename: 'ProductOption', readonly id: string, readonly handle: string, readonly name: string }, readonly optionValue: { readonly __typename: 'ProductOptionValue', readonly id: string, readonly handle: string, readonly name: string } }> } | null };

export const SdkCartLineFragment_LineFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}}]} as unknown as DocumentNode<SdkCartLineFragment_LineFragment, unknown>;
export const SdkCartFragment_CartFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}}]} as unknown as DocumentNode<SdkCartFragment_CartFragment, unknown>;
export const SdkCollectionProductCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCollectionProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkCollectionProductCardFragment, unknown>;
export const SdkCollectionListingFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCollectionListingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"presentation"}},{"kind":"Field","name":{"kind":"Name","value":"selectionMode"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCollectionProductCardFragment"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCollectionProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkCollectionListingFragment, unknown>;
export const SdkCategoryFragment_CategoryFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCategoryFragment_category"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkCategoryFragment_CategoryFragment, unknown>;
export const SdkProductComponentItemFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"requiresShipping"}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"mediaContentType"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"node"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkProductComponentItemFragment, unknown>;
export const SdkProductComponentGroupFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","alias":{"kind":"Name","value":"isRequired"},"name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"minSelection"}},{"kind":"Field","name":{"kind":"Name","value":"maxSelection"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"requiresShipping"}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"mediaContentType"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"node"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkProductComponentGroupFragment, unknown>;
export const SdkProductComponentConfigurationFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentConfigurationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"componentConfiguration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"selections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"componentSelections"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayStyle"}},{"kind":"Field","name":{"kind":"Name","value":"componentsSubtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentGroupFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"requiresShipping"}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"mediaContentType"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"node"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","alias":{"kind":"Name","value":"isRequired"},"name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"minSelection"}},{"kind":"Field","name":{"kind":"Name","value":"maxSelection"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentItemFragment"}}]}}]}}]} as unknown as DocumentNode<SdkProductComponentConfigurationFragment, unknown>;
export const SdkProductReviewsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductReviewsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","alias":{"kind":"Name","value":"message"},"name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","alias":{"kind":"Name","value":"verifiedPurchase"},"name":{"kind":"Name","value":"isVerifiedPurchase"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"helpfulYes"},"name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","alias":{"kind":"Name","value":"helpfulNo"},"name":{"kind":"Name","value":"dislikeCount"}},{"kind":"Field","name":{"kind":"Name","value":"mediaCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerEngagement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"meHelpful"},"name":{"kind":"Name","value":"vote"}},{"kind":"Field","name":{"kind":"Name","value":"hasReported"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","alias":{"kind":"Name","value":"editedAt"},"name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkProductReviewsFragment, unknown>;
export const SdkSearchProductCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkSearchProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkSearchProductCardFragment, unknown>;
export const SdkSearchProductsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkSearchProductsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkSearchProductCardFragment"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkSearchProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkSearchProductsFragment, unknown>;
export const SdkUseListingProductCardFragment_ProductFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkUseListingProductCardFragment_product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkUseListingProductCardFragment_ProductFragment, unknown>;
export const SdkListingFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkUseListingProductCardFragment_product"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkUseListingProductCardFragment_product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkListingFragment, unknown>;
export const SdkReviewsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkReviews"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","alias":{"kind":"Name","value":"message"},"name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","alias":{"kind":"Name","value":"verifiedPurchase"},"name":{"kind":"Name","value":"isVerifiedPurchase"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"helpfulYes"},"name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","alias":{"kind":"Name","value":"helpfulNo"},"name":{"kind":"Name","value":"dislikeCount"}},{"kind":"Field","name":{"kind":"Name","value":"mediaCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerEngagement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"meHelpful"},"name":{"kind":"Name","value":"vote"}},{"kind":"Field","name":{"kind":"Name","value":"hasReported"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","alias":{"kind":"Name","value":"editedAt"},"name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkReviewsFragment, unknown>;
export const SdkAddToCartMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkAddToCartMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLinesAddInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkAddToCartMutation, SdkAddToCartMutationVariables>;
export const SdkClearCartMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkClearCartMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLinesClearInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesClear"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkClearCartMutation, SdkClearCartMutationVariables>;
export const SdkCreateCartMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkCreateCartMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutCreateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutCreate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkCreateCartMutation, SdkCreateCartMutationVariables>;
export const SdkRemoveFromCartMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkRemoveFromCartMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLinesDeleteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesDelete"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkRemoveFromCartMutation, SdkRemoveFromCartMutationVariables>;
export const SdkReplaceCartItemMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkReplaceCartItemMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLinesReplaceInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesReplace"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkReplaceCartItemMutation, SdkReplaceCartItemMutationVariables>;
export const SdkUpdateCartLineQuantityMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkUpdateCartLineQuantityMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLinesUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLinesUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkUpdateCartLineQuantityMutation, SdkUpdateCartLineQuantityMutationVariables>;
export const SdkLoadCartQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkLoadCartQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartFragment_cart"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartLineFragment_line"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCartFragment_cart"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCartLineFragment_line"}}]}}]}}]} as unknown as DocumentNode<SdkLoadCartQuery, SdkLoadCartQueryVariables>;
export const SdkCollectionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkCollectionQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"24"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingSort"}},"defaultValue":{"kind":"EnumValue","value":"MANUAL"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingFilterInput"}}}},"defaultValue":{"kind":"ListValue","values":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"category"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"json"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCollectionListingFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCollectionProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCollectionListingFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"presentation"}},{"kind":"Field","name":{"kind":"Name","value":"selectionMode"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCollectionProductCardFragment"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkCollectionQuery, SdkCollectionQueryVariables>;
export const SdkHomePageQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkHomePageQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"electronics"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"StringValue","value":"electronics","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCategoryFragment_category"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"toys"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"StringValue","value":"toys-kids","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCategoryFragment_category"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"sport"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"StringValue","value":"sport-i-otdyh","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCategoryFragment_category"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"homeAndGarden"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"StringValue","value":"home-garden","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkCategoryFragment_category"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkCategoryFragment_category"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkHomePageQuery, SdkHomePageQueryVariables>;
export const SdkProductQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkProductQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"3"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewSort"}},"defaultValue":{"kind":"EnumValue","value":"MOST_HELPFUL"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"componentSelections"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentSelectionInput"}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"product"},"name":{"kind":"Name","value":"productByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkReviews"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"json"}}]}},{"kind":"Field","name":{"kind":"Name","value":"excerpt"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"json"}}]}},{"kind":"Field","name":{"kind":"Name","value":"seo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"vendor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"category"},"name":{"kind":"Name","value":"primaryCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"breadcrumbs"},"name":{"kind":"Name","value":"ancestors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"mediaContentType"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentConfigurationFragment"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"features"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minVariantPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxVariantPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPriceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"minVariantPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"maxVariantPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"totalInventory"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","name":{"kind":"Name","value":"verifiedReviewCount"}},{"kind":"Field","name":{"kind":"Name","value":"mediaReviewCount"}},{"kind":"Field","alias":{"kind":"Name","value":"breakdown"},"name":{"kind":"Name","value":"ratingBreakdown"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rating1Count"}},{"kind":"Field","name":{"kind":"Name","value":"rating2Count"}},{"kind":"Field","name":{"kind":"Name","value":"rating3Count"}},{"kind":"Field","name":{"kind":"Name","value":"rating4Count"}},{"kind":"Field","name":{"kind":"Name","value":"rating5Count"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentItemFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"minQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"maxQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"isDefault"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"currentlyNotInStock"}},{"kind":"Field","name":{"kind":"Name","value":"quantityAvailable"}},{"kind":"Field","name":{"kind":"Name","value":"requiresShipping"}},{"kind":"Field","name":{"kind":"Name","value":"weight"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"length"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"alt"}},{"kind":"Field","name":{"kind":"Name","value":"mediaContentType"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"node"},"name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"altText"}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentGroupFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductComponentGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","alias":{"kind":"Name","value":"isRequired"},"name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"minSelection"}},{"kind":"Field","name":{"kind":"Name","value":"maxSelection"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentItemFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkReviews"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","alias":{"kind":"Name","value":"message"},"name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"revision"}},{"kind":"Field","alias":{"kind":"Name","value":"verifiedPurchase"},"name":{"kind":"Name","value":"isVerifiedPurchase"}},{"kind":"Field","name":{"kind":"Name","value":"verificationStatus"}},{"kind":"Field","name":{"kind":"Name","value":"metrics"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"helpfulYes"},"name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","alias":{"kind":"Name","value":"helpfulNo"},"name":{"kind":"Name","value":"dislikeCount"}},{"kind":"Field","name":{"kind":"Name","value":"mediaCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"viewerEngagement"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"meHelpful"},"name":{"kind":"Name","value":"vote"}},{"kind":"Field","name":{"kind":"Name","value":"hasReported"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","alias":{"kind":"Name","value":"editedAt"},"name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"media"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkProductComponentConfigurationFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"componentConfiguration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"selections"},"value":{"kind":"Variable","name":{"kind":"Name","value":"componentSelections"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayStyle"}},{"kind":"Field","name":{"kind":"Name","value":"componentsSubtotal"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkProductComponentGroupFragment"}}]}}]}}]}}]} as unknown as DocumentNode<SdkProductQuery, SdkProductQueryVariables>;
export const SdkSearchQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkSearchQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"12"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingSort"}},"defaultValue":{"kind":"EnumValue","value":"RELEVANCE"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingFilterInput"}}}},"defaultValue":{"kind":"ListValue","values":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkSearchProductsFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkSearchProductCardFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkSearchProductsFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductConnection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkSearchProductCardFragment"}}]}}]}}]}}]} as unknown as DocumentNode<SdkSearchQuery, SdkSearchQueryVariables>;
export const SdkForgotPasswordMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkForgotPasswordMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PasswordRecoveryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordRecovery"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"clientMutationId"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SdkForgotPasswordMutation, SdkForgotPasswordMutationVariables>;
export const SdkResetPasswordMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkResetPasswordMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"clientMutationId"}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SdkResetPasswordMutation, SdkResetPasswordMutationVariables>;
export const SdkSignInMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkSignInMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PasswordSignInInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passwordSignIn"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"iid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SdkSignInMutation, SdkSignInMutationVariables>;
export const SdkSignOutMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkSignOutMutation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signOut"}}]}}]} as unknown as DocumentNode<SdkSignOutMutation, SdkSignOutMutationVariables>;
export const SdkSignUpMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SdkSignUpMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PasswordSignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"passwordSignUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"iid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"errors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]}}]} as unknown as DocumentNode<SdkSignUpMutation, SdkSignUpMutationVariables>;
export const SdkLoadSessionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkLoadSessionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"iid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<SdkLoadSessionQuery, SdkLoadSessionQueryVariables>;
export const SdkUseGetSessionQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkUseGetSessionQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"session"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"iid"}},{"kind":"Field","name":{"kind":"Name","value":"email"}}]}},{"kind":"Field","name":{"kind":"Name","value":"accessToken"}}]}}]}}]} as unknown as DocumentNode<SdkUseGetSessionQuery, SdkUseGetSessionQueryVariables>;
export const SdkCategoryQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SdkCategoryQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"handle"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"24"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Cursor"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingSort"}},"defaultValue":{"kind":"EnumValue","value":"MANUAL"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ListingFilterInput"}}}},"defaultValue":{"kind":"ListValue","values":[]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"category"},"name":{"kind":"Name","value":"categoryByHandle"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"handle"},"value":{"kind":"Variable","name":{"kind":"Name","value":"handle"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}},{"kind":"Field","name":{"kind":"Name","value":"json"}}]}},{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkListing"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkUseListingProductCardFragment_product"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"description"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"html"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"reviewSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","alias":{"kind":"Name","value":"rating"},"name":{"kind":"Name","value":"averageRating"}},{"kind":"Field","alias":{"kind":"Name","value":"count"},"name":{"kind":"Name","value":"reviewCount"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"cover"},"name":{"kind":"Name","value":"featuredMedia"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"gallery"},"name":{"kind":"Name","value":"media"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"displayType"}},{"kind":"Field","alias":{"kind":"Name","value":"values"},"name":{"kind":"Name","value":"optionValues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"swatch"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","alias":{"kind":"Name","value":"color2"},"name":{"kind":"Name","value":"secondaryColor"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"MediaImage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"displayType"},"name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","alias":{"kind":"Name","value":"selectedVariant"},"name":{"kind":"Name","value":"selectedOrFirstAvailableVariant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"isAvailable"},"name":{"kind":"Name","value":"availableForSale"}},{"kind":"Field","name":{"kind":"Name","value":"selectedOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"optionValue"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"SdkListing"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","alias":{"kind":"Name","value":"listing"},"name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"availableSorts"}},{"kind":"Field","name":{"kind":"Name","value":"filters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"min"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"max"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selectedMax"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","alias":{"kind":"Name","value":"handle"},"name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","alias":{"kind":"Name","value":"title"},"name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"selected"}},{"kind":"Field","name":{"kind":"Name","value":"input"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"SdkUseListingProductCardFragment_product"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SdkCategoryQuery, SdkCategoryQueryVariables>;