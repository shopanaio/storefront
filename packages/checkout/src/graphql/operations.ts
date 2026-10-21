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
  BigInt: { input: string; output: string; }
  /** A CSS color represented as a hexadecimal string. */
  Color: { input: any; output: any; }
  /** An opaque cursor used for pagination. */
  Cursor: { input: string; output: string; }
  /** An ISO 8601 calendar date in YYYY-MM-DD form. */
  Date: { input: any; output: any; }
  /** An ISO 8601-encoded date and time string. */
  DateTime: { input: string; output: string; }
  /** An arbitrary-precision signed decimal number. */
  Decimal: { input: string; output: string; }
  /** An email address. */
  Email: { input: string; output: string; }
  /** A string containing HTML code. */
  HTML: { input: any; output: any; }
  /** An ISO 8601-encoded date and time string. */
  ISO8601DateTime: { input: any; output: any; }
  /** A JSON-serializable value. */
  JSON: { input: object; output: object; }
  TransportOptions: { input: any; output: any; }
  /** An RFC 3986 and RFC 3987 compliant URI string. */
  URL: { input: any; output: any; }
  /** An unsigned 64-bit integer serialized as a decimal string. */
  UnsignedInt64: { input: string; output: string; }
  join__FieldSet: { input: any; output: any; }
  link__Import: { input: any; output: any; }
};

/**
 * ProductVariant-witness availability used by the canonical listing algebra.
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
  readonly nodes: ReadonlyArray<Maybe<Media>>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a category. */
export type CategoryMediaEdge = {
  readonly __typename: 'CategoryMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node?: Maybe<Media>;
};

/** A checkout with multiple items. */
export type Checkout = Node & {
  readonly __typename: 'Checkout';
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
  /** Deadline after which an OPEN or READY checkout becomes EXPIRED. */
  readonly expiresAt: Scalars['DateTime']['output'];
  /**
   * Whether the current buyer may fill in and place this checkout. False for a buyer who is not
   * signed in while the store requires an account; such a buyer signs in first.
   */
  readonly guestCheckoutAllowed: Scalars['Boolean']['output'];
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
  /**
   * Points and cashback that placing this order is expected to earn, by the same calculation as the
   * order earning. Null without an active program, when nothing is earned, or when Loyalty did not
   * answer; the estimate never blocks placement.
   */
  readonly loyaltyEarning?: Maybe<CheckoutLoyaltyEarning>;
  /** Loyalty points selected as tender after the final Pricing quote. */
  readonly loyaltyRedemption?: Maybe<CheckoutLoyaltyRedemption>;
  /**
   * Loyalty reward selected and validated for this checkout. Uses the same global ID as
   * `Customer.loyaltyAccount.availableRewards`.
   */
  readonly loyaltyRewardId?: Maybe<Scalars['ID']['output']>;
  /**
   * Loyalty choice the buyer saved for this checkout, kept whether or not the latest calculation
   * could apply it; null when nothing is chosen. `loyaltyRedemption` and `loyaltyRewardId` show
   * what was applied; a choice that was not applied is explained by a checkout issue.
   */
  readonly loyaltySelection?: Maybe<CheckoutLoyaltySelection>;
  /** Notifications for the user regarding the checkout. */
  readonly notifications: ReadonlyArray<CheckoutNotification>;
  /** Payment aggregate for this checkout. */
  readonly payment: CheckoutPayment;
  /**
   * Every promo code the buyer entered, in entry order, with its state. A code stays here until the
   * buyer removes it, and a pending or rejected code applies again once its condition is met.
   */
  readonly promoCodes: ReadonlyArray<CheckoutPromoCode>;
  /** Revision of the last complete checkout pipeline result. */
  readonly resultRevision: Scalars['String']['output'];
  /** Lifecycle state persisted by checkout, not inferred by the client. */
  readonly status: CheckoutLifecycleStatus;
  /** Tags that can be used to organize checkout lines. */
  readonly tags: ReadonlyArray<CheckoutTag>;
  /** Quantity of the item being purchased. */
  readonly totalQuantity: Scalars['Int']['output'];
  /** When this checkout was last updated. */
  readonly updatedAt: Scalars['DateTime']['output'];
  /** Whether the committed checkout is ready according to validation. */
  readonly valid: Scalars['Boolean']['output'];
};

export type CheckoutAddressField =
  | 'ADDRESS1'
  | 'ADDRESS2'
  | 'CITY'
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'PHONE'
  | 'POSTAL_CODE'
  | 'PROVINCE';

/**
 * How a delivery address is written in a country. Labels are codes for the storefront
 * to localize.
 */
export type CheckoutAddressFormat = {
  readonly __typename: 'CheckoutAddressFormat';
  readonly postalCodeExample?: Maybe<Scalars['String']['output']>;
  readonly postalCodeLabel?: Maybe<CheckoutPostalCodeLabel>;
  /** Case-insensitive pattern of a valid postal code, anchored at both ends. */
  readonly postalCodePattern?: Maybe<Scalars['String']['output']>;
  /** Label of the PROVINCE field; null when the form has no province. */
  readonly provinceLabel?: Maybe<CheckoutProvinceLabel>;
  /**
   * Provinces to choose from; empty when the province is free text. When delivery zones
   * cover only some provinces, only those are listed. Names are written as the country's own
   * addresses write them and are not localized.
   */
  readonly provinces: ReadonlyArray<CheckoutAddressProvince>;
  readonly required: ReadonlyArray<CheckoutAddressField>;
  /** Rows of the address form in display order; fields of one row share a line. */
  readonly rows: ReadonlyArray<ReadonlyArray<CheckoutAddressField>>;
};

export type CheckoutAddressProvince = {
  readonly __typename: 'CheckoutAddressProvince';
  /** ISO 3166-2 subdivision code without the country prefix; sent as provinceCode. */
  readonly code: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
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
  readonly postalCode?: Maybe<Scalars['String']['output']>;
  readonly province?: Maybe<Scalars['String']['output']>;
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
};

/**
 * Portable international postal fields for a checkout billing address.
 * Payment-provider-specific fields belong to data.
 */
export type CheckoutBillingAddressInput = {
  readonly address1?: InputMaybe<Scalars['String']['input']>;
  readonly address2?: InputMaybe<Scalars['String']['input']>;
  readonly city?: InputMaybe<Scalars['String']['input']>;
  readonly countryCode?: InputMaybe<CountryCode>;
  /** Payment-provider-specific billing-address extension data. */
  readonly data?: InputMaybe<Scalars['JSON']['input']>;
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  readonly postalCode?: InputMaybe<Scalars['String']['input']>;
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
};

/** Input for replacing or clearing the checkout billing address. */
export type CheckoutBillingAddressUpdateInput = {
  /** New address. Passing null clears the current billing address. */
  readonly billingAddress?: InputMaybe<CheckoutBillingAddressInput>;
  readonly checkoutId: Scalars['ID']['input'];
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

/** Input data for passing the guest checkout of this browser to the signed-in customer. */
export type CheckoutClaimInput = {
  /** The guest checkout of this browser, usually the cart kept before signing in. */
  readonly checkoutId: Scalars['ID']['input'];
};

/** Result of passing a guest checkout to the signed-in customer. */
export type CheckoutClaimPayload = {
  readonly __typename: 'CheckoutClaimPayload';
  /**
   * The account cart the buyer continues with: the claimed checkout, or the existing account cart
   * the guest checkout was merged into.
   */
  readonly checkout?: Maybe<Checkout>;
  /** The guest checkout that was merged into the existing account cart and closed, if any. */
  readonly mergedFromCheckoutId?: Maybe<Scalars['ID']['output']>;
  /** Validation, ownership, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CheckoutUserError>;
};

/** All monetary calculations related to the checkout. */
export type CheckoutCost = {
  readonly __typename: 'CheckoutCost';
  /** Amount paid with loyalty points or store credit; zero without a redemption. */
  readonly loyaltyAmount: Money;
  /** Total value of items before any discounts. */
  readonly subtotalAmount: Money;
  /** Final amount to be paid, including item cost, shipping, and taxes. */
  readonly totalAmount: Money;
  /** Total reduction from promotions on items and delivery; loyalty is in `loyaltyAmount`. */
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
  /** Display currency code for all items. ISO 4217 (3 letters, e.g., "USD", "EUR"). */
  readonly currencyCode: CurrencyCode;
  /** ID of the external source for the checkout. */
  readonly externalId?: InputMaybe<Scalars['String']['input']>;
  /** Source of sales for the checkout. */
  readonly externalSource?: InputMaybe<Scalars['String']['input']>;
  /** Initial items to add to the new checkout. */
  readonly items: ReadonlyArray<CheckoutLineAddInput>;
  /** Locale code for the checkout. ISO 639-1 (2 letters, e.g., "en", "ru"). */
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
  /** First name of the customer. */
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
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
  /** Postal or ZIP code. */
  readonly postalCode?: Maybe<Scalars['String']['output']>;
  /** Localized region, state, or province name. */
  readonly province?: Maybe<Scalars['String']['output']>;
  /** Province code. */
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
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
  /** Postal or ZIP code. */
  readonly postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Province code. */
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
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
};

/** Input data for removing one or more delivery addresses from the checkout. */
export type CheckoutDeliveryAddressesRemoveInput = {
  /** Identifiers of delivery addresses to be removed. */
  readonly addressIds: ReadonlyArray<Scalars['ID']['input']>;
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
};

/** Input data for batch updating previously added delivery addresses. */
export type CheckoutDeliveryAddressesUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** List of updates for delivery addresses. */
  readonly updates: ReadonlyArray<CheckoutDeliveryAddressUpdateInput>;
};

/** A country the store delivers to. */
export type CheckoutDeliveryCountry = {
  readonly __typename: 'CheckoutDeliveryCountry';
  readonly addressFormat: CheckoutAddressFormat;
  readonly code: CountryCode;
  /** Country name localized for the requested locale. */
  readonly name: Scalars['String']['output'];
};

/** Input data for forgetting the delivery data saved for one delivery method of a group. */
export type CheckoutDeliveryCustomerInputClearInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Identifier of the delivery group whose saved data is cleared. */
  readonly deliveryGroupId: Scalars['ID']['input'];
  /** Handle of the delivery option whose method's saved data is cleared. */
  readonly optionHandle: Scalars['String']['input'];
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
  /**
   * Earlier identifiers of this group, newest first. A group gets a new identifier when its lines
   * change; mutations naming a replaced identifier apply to this group.
   */
  readonly replacesGroupIds: ReadonlyArray<Scalars['ID']['output']>;
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
   * Customer-provided data for the selected delivery method. Omitted or null keeps the data
   * already saved for this method; use checkoutDeliveryCustomerInputClear to forget it.
   */
  readonly customerInput?: InputMaybe<Scalars['JSON']['input']>;
  /** Identifier of the delivery group for which the delivery method is selected. */
  readonly deliveryGroupId: Scalars['ID']['input'];
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
  readonly paymentModel: CheckoutShippingPaymentModel;
  readonly phoneRequired: Scalars['Boolean']['output'];
  readonly publicData: Scalars['JSON']['output'];
  readonly title: Scalars['String']['output'];
};

export type CheckoutDeliveryOptionSelection = {
  readonly __typename: 'CheckoutDeliveryOptionSelection';
  /**
   * Delivery data the buyer saved for the selected (or reset) method of this group, for example
   * the chosen branch. Returned only to whoever may read this checkout.
   */
  readonly customerInput?: Maybe<Scalars['JSON']['output']>;
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
  /** List of recipients to be added for delivery groups. */
  readonly recipients: ReadonlyArray<CheckoutDeliveryRecipientUpdateInput>;
};

/** Input data for removing recipients associated with delivery groups. */
export type CheckoutDeliveryRecipientsRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Identifiers of delivery groups whose recipients should be removed. */
  readonly deliveryGroupIds: ReadonlyArray<Scalars['ID']['input']>;
};

/** Input data for batch updating recipients for delivery groups. */
export type CheckoutDeliveryRecipientsUpdateInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
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
  /**
   * Language/locale code (ISO 639-1, BCP 47 if necessary), e.g. "en", "ru", "uk".
   * Affects localization and formatting.
   */
  readonly localeCode: Scalars['String']['input'];
};

export type CheckoutLifecycleStatus =
  | 'ABANDONED'
  | 'EXPIRED'
  | 'OPEN'
  | 'PLACED'
  | 'READY';

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

/** Detailed breakdown of costs for a checkout line item. */
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
  /** List of checkout items to add. */
  readonly lines: ReadonlyArray<CheckoutLineAddInput>;
};

/** Input data for clearing all items from a checkout. */
export type CheckoutLinesClearInput = {
  /** ID of the checkout to clear. */
  readonly checkoutId: Scalars['ID']['input'];
};

/** Input data for removing one or more items from the checkout. */
export type CheckoutLinesDeleteInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
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
  /** List of replacement operations to apply. */
  readonly lines: ReadonlyArray<CheckoutLineReplaceInput>;
};

/** Input data for updating the quantity of a specific checkout item. */
export type CheckoutLinesUpdateInput = {
  /** ID of the checkout. */
  readonly checkoutId: Scalars['ID']['input'];
  /** List of checkout items to update. */
  readonly lines: ReadonlyArray<CheckoutLineUpdateInput>;
};

export type CheckoutLoyaltyEarning = {
  readonly __typename: 'CheckoutLoyaltyEarning';
  /** Cashback credited to the store credit balance; null without a monetary award. */
  readonly amount?: Maybe<Money>;
  /** Purchase points plus rule awards in points. */
  readonly points: Scalars['BigInt']['output'];
  readonly presentation: CheckoutLoyaltyEarningPresentation;
  readonly state: CheckoutLoyaltyEarningState;
};

export type CheckoutLoyaltyEarningPresentation = {
  readonly __typename: 'CheckoutLoyaltyEarningPresentation';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly headline: Scalars['String']['output'];
};

export type CheckoutLoyaltyEarningState =
  /** A guest would earn this amount after signing in; the tier multiplier is not applied. */
  | 'AUTHENTICATION_REQUIRED'
  /** The signed-in buyer earns this amount. */
  | 'AVAILABLE';

export type CheckoutLoyaltyRedemption = {
  readonly __typename: 'CheckoutLoyaltyRedemption';
  readonly accountId: Scalars['ID']['output'];
  /** Available balance of the selected source in money. */
  readonly availableAmount: Money;
  /** Available points; null for STORE_CREDIT. */
  readonly availablePoints?: Maybe<Scalars['BigInt']['output']>;
  readonly discount: Money;
  readonly expiresAt: Scalars['DateTime']['output'];
  readonly payableAfterLoyalty: Money;
  /** Points spent by this redemption; null for STORE_CREDIT. */
  readonly points?: Maybe<Scalars['BigInt']['output']>;
  readonly programCode: Scalars['String']['output'];
  readonly programId: Scalars['ID']['output'];
  readonly programVersion: Scalars['Int']['output'];
  readonly quoteId: Scalars['String']['output'];
  /** Store credit the buyer asked for; null for POINTS or when the maximum was requested. */
  readonly requestedAmount?: Maybe<Money>;
  /** Points the buyer asked for; null for STORE_CREDIT or when the maximum was requested. */
  readonly requestedPoints?: Maybe<Scalars['BigInt']['output']>;
  readonly revision: Scalars['String']['output'];
  readonly source: LoyaltyRedemptionSource;
};

export type CheckoutLoyaltyRedemptionRemoveInput = {
  readonly checkoutId: Scalars['ID']['input'];
};

export type CheckoutLoyaltyRedemptionUpdateInput = {
  /**
   * Store credit amount with STORE_CREDIT in the checkout currency; null uses the most the order
   * allows.
   */
  readonly amount?: InputMaybe<Scalars['Decimal']['input']>;
  readonly checkoutId: Scalars['ID']['input'];
  /** Points to redeem with POINTS; null redeems the most the order allows. */
  readonly points?: InputMaybe<Scalars['BigInt']['input']>;
  /** Loyalty reward from `Customer.loyaltyAccount.availableRewards` to reserve for this checkout. */
  readonly rewardId?: InputMaybe<Scalars['ID']['input']>;
  /**
   * Source the buyer pays with. Selecting a source replaces the previous one; null keeps only
   * the reward.
   */
  readonly source?: InputMaybe<LoyaltyRedemptionSource>;
};

/** Loyalty choice of the buyer as saved, independent of the latest calculation. */
export type CheckoutLoyaltySelection = {
  readonly __typename: 'CheckoutLoyaltySelection';
  /**
   * Store credit asked for with STORE_CREDIT in the checkout currency; null for POINTS or when
   * the maximum is asked for.
   */
  readonly amount?: Maybe<Money>;
  /** Points asked for with POINTS; null for STORE_CREDIT or when the maximum is asked for. */
  readonly points?: Maybe<Scalars['BigInt']['output']>;
  /**
   * Reward chosen for this checkout. Uses the same global ID as
   * `Customer.loyaltyAccount.availableRewards`.
   */
  readonly rewardId?: Maybe<Scalars['ID']['output']>;
  /** Source the buyer pays with; null when only a reward is chosen. */
  readonly source?: Maybe<LoyaltyRedemptionSource>;
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
  /** Opaque handle returned by the current checkout snapshot. */
  readonly methodHandle: Scalars['String']['input'];
};

export type CheckoutPlacementState =
  | 'CLAIMED'
  | 'FAILED'
  | 'ORDER_CREATED'
  | 'PAYMENT_CREATED'
  | 'PLACED'
  | 'RESOURCES_RESERVED';

export type CheckoutPostalCodeLabel =
  | 'POSTAL_CODE'
  | 'POSTCODE'
  | 'ZIP_CODE';

/** A promo code entered for a checkout. */
export type CheckoutPromoCode = {
  readonly __typename: 'CheckoutPromoCode';
  /** When the applied code was last confirmed. Null unless applied. */
  readonly appliedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Promo code text as the buyer entered it. */
  readonly code: Scalars['String']['output'];
  /** Discount conditions of the applied code. */
  readonly conditions?: Maybe<Scalars['JSON']['output']>;
  /** Discount type of the applied code. Null unless applied. */
  readonly discountType?: Maybe<Scalars['String']['output']>;
  /** Buyer-facing explanation of the reason. Null for an applied code. */
  readonly message?: Maybe<Scalars['String']['output']>;
  /** Discount provider of the applied code. Null unless applied. */
  readonly provider?: Maybe<Scalars['String']['output']>;
  /**
   * Why the code is not applied: AWAITING_DELIVERY for a pending code, or the rejection reason
   * (for example MINIMUM_REQUIREMENT_NOT_MET). Null for an applied code.
   */
  readonly reason?: Maybe<Scalars['String']['output']>;
  /** Whether the code is applied, pending or rejected. */
  readonly status: CheckoutPromoCodeStatus;
  /** Discount amount in minor units of the applied code. Null unless applied. */
  readonly value?: Maybe<Scalars['Int']['output']>;
};

/** Input data for applying a promo code to the checkout. */
export type CheckoutPromoCodeAddInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code. */
  readonly code: Scalars['String']['input'];
};

/** Input data for removing a previously applied promo code from the checkout. */
export type CheckoutPromoCodeRemoveInput = {
  /** Identifier of the checkout on which the operation is performed. */
  readonly checkoutId: Scalars['ID']['input'];
  /** Text code of the coupon/promo code to be cancelled. */
  readonly code: Scalars['String']['input'];
};

/** State of an entered promo code. */
export type CheckoutPromoCodeStatus =
  /** The code's discount is applied. */
  | 'APPLIED'
  /** The code waits for a condition that cannot be checked yet, such as a chosen delivery option. */
  | 'PENDING'
  /** The code is not applied; reason says why. */
  | 'REJECTED';

export type CheckoutProvinceLabel =
  | 'COUNTY'
  | 'OBLAST'
  | 'PROVINCE'
  | 'REGION'
  | 'STATE';

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

/**
 * Input fields for recipient details. A field left out keeps the recipient's current value;
 * an explicit null or an empty string clears it.
 */
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

/** Checkout settings of the store that a storefront needs before a checkout exists. */
export type CheckoutSettings = {
  readonly __typename: 'CheckoutSettings';
  /**
   * Whether buyers without an account can fill in and place a checkout. When false, a guest can
   * still build a cart, but contact, delivery, payment and placement require signing in.
   */
  readonly guestCheckoutEnabled: Scalars['Boolean']['output'];
};

/** Who collects the delivery fee. */
export type CheckoutShippingPaymentModel =
  /**
   * The recipient pays the carrier directly on delivery; the option costs zero at checkout
   * and is excluded from totalShippingAmount and the payable amount.
   */
  | 'CARRIER_DIRECT'
  /** The merchant collects the fee as part of the checkout total. */
  | 'MERCHANT_COLLECTED';

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
  /** Tag configuration. */
  readonly tag: CheckoutTagInput;
};

/** Input payload for checkoutTagDelete mutation. */
export type CheckoutTagDeleteInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
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

export type Collection = Node & {
  readonly __typename: 'Collection';
  readonly activeFrom?: Maybe<Scalars['DateTime']['output']>;
  readonly activeTo?: Maybe<Scalars['DateTime']['output']>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly defaultSort: CollectionDefaultSort;
  readonly defaultSortDirection: CollectionSortDirection;
  readonly description?: Maybe<RichText>;
  readonly excerpt?: Maybe<RichText>;
  readonly featuredMedia?: Maybe<Media>;
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly listingUpdatedAt: Scalars['DateTime']['output'];
  readonly media: CollectionMediaConnection;
  readonly name: Scalars['String']['output'];
  readonly products: ProductConnection;
  readonly publishedAt: Scalars['DateTime']['output'];
  readonly seo: Seo;
  readonly type: CollectionType;
  readonly updatedAt: Scalars['DateTime']['output'];
};


export type CollectionMediaArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type CollectionProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<ReadonlyArray<ListingFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<ListingSort>;
};

export type CollectionDefaultSort =
  | 'MANUAL'
  | 'NAME'
  | 'NEWEST'
  | 'PRICE';

export type CollectionMediaConnection = Connection & {
  readonly __typename: 'CollectionMediaConnection';
  readonly edges: ReadonlyArray<CollectionMediaEdge>;
  readonly nodes: ReadonlyArray<Maybe<Media>>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type CollectionMediaEdge = {
  readonly __typename: 'CollectionMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node?: Maybe<Media>;
};

export type CollectionSortDirection =
  | 'ASC'
  | 'DESC';

export type CollectionType =
  | 'MANUAL'
  | 'RULE';

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
  /** Store-account enrollment state. */
  readonly accountStatus: CustomerAccountStatus;
  /** One address owned by the customer; inaccessible IDs return null. */
  readonly address?: Maybe<CustomerAddress>;
  /** Customer addresses in deterministic creation order. */
  readonly addresses: CustomerAddressConnection;
  /**
   * The open cart of the customer's account in the current store, from any device. Only the
   * signed-in customer reads it.
   */
  readonly checkout?: Maybe<Checkout>;
  readonly companyName?: Maybe<Scalars['String']['output']>;
  readonly createdAt: Scalars['DateTime']['output'];
  /** One privacy request owned by the customer; inaccessible IDs return null. */
  readonly dataRequest?: Maybe<CustomerDataRequest>;
  /** Auditable privacy requests created by the customer. */
  readonly dataRequests: CustomerDataRequestConnection;
  readonly dateOfBirth?: Maybe<Scalars['Date']['output']>;
  /** Default address used for billing and tax calculations. */
  readonly defaultBillingAddress?: Maybe<CustomerAddress>;
  /** Default address used for physical fulfillment. */
  readonly defaultShippingAddress?: Maybe<CustomerAddress>;
  /** The customer's primary wishlist, when one has been created. */
  readonly defaultWishlist?: Maybe<CustomerWishlist>;
  /** Display name derived from available profile and contact information. */
  readonly displayName: Scalars['String']['output'];
  /** Authenticated customer's email projection and verification state. */
  readonly emailAddress?: Maybe<CustomerEmailAddress>;
  readonly firstName?: Maybe<Scalars['String']['output']>;
  /** Customer-provided gender value. */
  readonly gender?: Maybe<Scalars['String']['output']>;
  /** Globally unique customer ID. */
  readonly id: Scalars['ID']['output'];
  readonly jobTitle?: Maybe<Scalars['String']['output']>;
  readonly lastName?: Maybe<Scalars['String']['output']>;
  /**
   * The authenticated customer's account in this store's active loyalty program.
   *
   * Returns null when the store has no active program or the customer has no
   * visible account. Merged accounts are never exposed.
   */
  readonly loyaltyAccount?: Maybe<LoyaltyAccount>;
  /** Current marketing preferences for every configured channel. */
  readonly marketingConsents: ReadonlyArray<CustomerMarketingConsent>;
  readonly middleName?: Maybe<Scalars['String']['output']>;
  /** Orders owned by this authenticated customer, newest first by default. */
  readonly orders: OrderConnection;
  /** Authenticated customer's phone projection and verification state. */
  readonly phoneNumber?: Maybe<CustomerPhoneNumber>;
  /** Customer-selected BCP 47 locale. */
  readonly preferredLocale?: Maybe<Scalars['String']['output']>;
  readonly prefix?: Maybe<Scalars['String']['output']>;
  /**
   * Presentation-ready comparisons for the authenticated customer.
   *
   * Catalog groups the customer's persisted variants by their current primary
   * category. Each node contains every selected variant in that category. Empty
   * categories are omitted.
   */
  readonly productComparisons: CustomerProductComparisons;
  readonly productQuestions: ProductQuestionConnection;
  readonly reviewRequests: ReviewRequestConnection;
  readonly reviews: ReviewConnection;
  /** Monotonic aggregate revision for diagnostics and change tracking. */
  readonly revision: Scalars['Int']['output'];
  readonly suffix?: Maybe<Scalars['String']['output']>;
  /** Merchant-approved tax exemptions visible to this customer. */
  readonly taxExemptions: CustomerTaxExemptionConnection;
  /** Customer-owned tax identifiers. */
  readonly taxIdentifiers: CustomerTaxIdentifierConnection;
  readonly updatedAt: Scalars['DateTime']['output'];
  /** One wishlist owned by the customer; inaccessible IDs return null. */
  readonly wishlist?: Maybe<CustomerWishlist>;
  /**
   * Wishlist collections owned by the authenticated customer.
   *
   * Results are ordered by creation time ascending and then by ID ascending.
   * Omitting all pagination arguments returns the first 20 entries. At most 100
   * entries can be requested in either direction.
   */
  readonly wishlists: CustomerWishlistConnection;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerAddressArgs = {
  id: Scalars['ID']['input'];
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerAddressesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerDataRequestArgs = {
  id: Scalars['ID']['input'];
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerDataRequestsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerTaxExemptionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerTaxIdentifiersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerWishlistArgs = {
  id: Scalars['ID']['input'];
};


/** A canonical storefront customer owned by the Customers subgraph. */
export type CustomerWishlistsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Storefront-visible state of the customer's store account. */
export type CustomerAccountStatus =
  /** A checkout-created profile that is not linked to an IAM principal. */
  | 'GUEST'
  /** A profile for which account enrollment has been initiated. */
  | 'INVITED'
  /** A profile linked to a registered IAM principal. */
  | 'REGISTERED';

/** A normalized international mailing address owned by the current customer. */
export type CustomerAddress = Node & {
  readonly __typename: 'CustomerAddress';
  readonly address1: Scalars['String']['output'];
  readonly address2?: Maybe<Scalars['String']['output']>;
  readonly city: Scalars['String']['output'];
  readonly company?: Maybe<Scalars['String']['output']>;
  readonly country?: Maybe<Scalars['String']['output']>;
  readonly countryCode: CountryCode;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly firstName?: Maybe<Scalars['String']['output']>;
  readonly formatted: ReadonlyArray<Scalars['String']['output']>;
  readonly formattedArea?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly isDefaultBilling: Scalars['Boolean']['output'];
  readonly isDefaultShipping: Scalars['Boolean']['output'];
  readonly label?: Maybe<Scalars['String']['output']>;
  readonly lastName?: Maybe<Scalars['String']['output']>;
  readonly middleName?: Maybe<Scalars['String']['output']>;
  readonly name: Scalars['String']['output'];
  readonly phone?: Maybe<Scalars['String']['output']>;
  readonly prefix?: Maybe<Scalars['String']['output']>;
  readonly province?: Maybe<Scalars['String']['output']>;
  readonly provinceCode?: Maybe<Scalars['String']['output']>;
  readonly suffix?: Maybe<Scalars['String']['output']>;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly validatedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly validationStatus: CustomerAddressValidationStatus;
  readonly zip?: Maybe<Scalars['String']['output']>;
};

export type CustomerAddressConnection = Connection & {
  readonly __typename: 'CustomerAddressConnection';
  readonly edges: ReadonlyArray<CustomerAddressEdge>;
  readonly nodes: ReadonlyArray<CustomerAddress>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type CustomerAddressCreateInput = {
  readonly address: CustomerAddressInput;
  readonly defaultBilling?: InputMaybe<Scalars['Boolean']['input']>;
  readonly defaultShipping?: InputMaybe<Scalars['Boolean']['input']>;
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CustomerAddressCreatePayload = {
  readonly __typename: 'CustomerAddressCreatePayload';
  readonly customer?: Maybe<Customer>;
  readonly customerAddress?: Maybe<CustomerAddress>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Atomically sets or clears either customer address default. */
export type CustomerAddressDefaultSetInput = {
  /** Null clears the selected default. */
  readonly addressId?: InputMaybe<Scalars['ID']['input']>;
  /** One or both defaults to assign or clear. */
  readonly defaults: ReadonlyArray<CustomerAddressDefaultType>;
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CustomerAddressDefaultSetPayload = {
  readonly __typename: 'CustomerAddressDefaultSetPayload';
  readonly customer?: Maybe<Customer>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerAddressDefaultType =
  | 'BILLING'
  | 'SHIPPING';

export type CustomerAddressDeleteInput = {
  readonly addressId: Scalars['ID']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CustomerAddressDeletePayload = {
  readonly __typename: 'CustomerAddressDeletePayload';
  readonly customer?: Maybe<Customer>;
  readonly deletedAddressId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerAddressEdge = {
  readonly __typename: 'CustomerAddressEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: CustomerAddress;
};

/** Portable international mailing-address values. */
export type CustomerAddressInput = {
  readonly address1: Scalars['String']['input'];
  readonly address2?: InputMaybe<Scalars['String']['input']>;
  readonly city: Scalars['String']['input'];
  readonly company?: InputMaybe<Scalars['String']['input']>;
  readonly countryCode: CountryCode;
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  readonly label?: InputMaybe<Scalars['String']['input']>;
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  readonly middleName?: InputMaybe<Scalars['String']['input']>;
  readonly phone?: InputMaybe<Scalars['String']['input']>;
  readonly prefix?: InputMaybe<Scalars['String']['input']>;
  readonly provinceCode?: InputMaybe<Scalars['String']['input']>;
  readonly suffix?: InputMaybe<Scalars['String']['input']>;
  readonly zip?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerAddressUpdateInput = {
  readonly address: CustomerAddressInput;
  readonly addressId: Scalars['ID']['input'];
  readonly defaultBilling?: InputMaybe<Scalars['Boolean']['input']>;
  readonly defaultShipping?: InputMaybe<Scalars['Boolean']['input']>;
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CustomerAddressUpdatePayload = {
  readonly __typename: 'CustomerAddressUpdatePayload';
  readonly customer?: Maybe<Customer>;
  readonly customerAddress?: Maybe<CustomerAddress>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Server-side normalization and validation state for an address. */
export type CustomerAddressValidationStatus =
  | 'INVALID'
  | 'UNVALIDATED'
  | 'VALID';

/** Values used to clear one category-based product comparison. */
export type CustomerComparisonCategoryClearInput = {
  /** Current Catalog category whose selected variants must be removed. */
  readonly categoryId: Scalars['ID']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Result of changing the authenticated customer's comparison selection. */
export type CustomerComparisonMutationPayload = {
  readonly __typename: 'CustomerComparisonMutationPayload';
  /**
   * Customer whose presentation models can be refetched through the Catalog-owned
   * Customer.productComparisons federation field.
   */
  readonly customer?: Maybe<Customer>;
  /** New persisted selection revision, or null when the operation failed. */
  readonly revision?: Maybe<Scalars['Int']['output']>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Values used to add one concrete variant to product comparisons. */
export type CustomerComparisonVariantAddInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  /** Published Catalog variant to add in the current storefront context. */
  readonly variantId: Scalars['ID']['input'];
};

/** Values used to remove one concrete variant from product comparisons. */
export type CustomerComparisonVariantRemoveInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  /** Catalog variant to remove from the authenticated customer's selection. */
  readonly variantId: Scalars['ID']['input'];
};

/** A customer-created, auditable privacy workflow. */
export type CustomerDataRequest = Node & {
  readonly __typename: 'CustomerDataRequest';
  /** Customer-provided details for a correction request, when applicable. */
  readonly correctionDetails?: Maybe<Scalars['JSON']['output']>;
  readonly dueAt?: Maybe<Scalars['DateTime']['output']>;
  readonly finishedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly rejectionReason?: Maybe<Scalars['String']['output']>;
  readonly requestedAt: Scalars['DateTime']['output'];
  readonly resultFile?: Maybe<GenericFile>;
  readonly startedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly status: CustomerDataRequestStatus;
  readonly type: CustomerDataRequestType;
  readonly updatedAt: Scalars['DateTime']['output'];
};

export type CustomerDataRequestCancelInput = {
  readonly dataRequestId: Scalars['ID']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
};

export type CustomerDataRequestCancelPayload = {
  readonly __typename: 'CustomerDataRequestCancelPayload';
  readonly dataRequest?: Maybe<CustomerDataRequest>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerDataRequestConnection = Connection & {
  readonly __typename: 'CustomerDataRequestConnection';
  readonly edges: ReadonlyArray<CustomerDataRequestEdge>;
  readonly nodes: ReadonlyArray<CustomerDataRequest>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type CustomerDataRequestCreateInput = {
  /** Required only for CORRECTION and rejected for all other request types. */
  readonly correctionDetails?: InputMaybe<Scalars['JSON']['input']>;
  readonly idempotencyKey: Scalars['String']['input'];
  readonly type: CustomerDataRequestType;
};

export type CustomerDataRequestCreatePayload = {
  readonly __typename: 'CustomerDataRequestCreatePayload';
  readonly dataRequest?: Maybe<CustomerDataRequest>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerDataRequestEdge = {
  readonly __typename: 'CustomerDataRequestEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: CustomerDataRequest;
};

export type CustomerDataRequestStatus =
  | 'CANCELLED'
  | 'COMPLETED'
  | 'PENDING'
  | 'PROCESSING'
  | 'REJECTED';

export type CustomerDataRequestType =
  | 'ACCESS'
  | 'CORRECTION'
  | 'ERASURE'
  | 'EXPORT';

/** The authenticated customer's email projection. */
export type CustomerEmailAddress = {
  readonly __typename: 'CustomerEmailAddress';
  readonly emailAddress: Scalars['Email']['output'];
  readonly marketingConsent?: Maybe<CustomerMarketingConsent>;
  readonly verified: Scalars['Boolean']['output'];
};

/** Current customer-selectable consent for one marketing channel. */
export type CustomerMarketingConsent = {
  readonly __typename: 'CustomerMarketingConsent';
  readonly channel: CustomerMarketingConsentChannel;
  readonly consentedAt?: Maybe<Scalars['DateTime']['output']>;
  readonly optInLevel: CustomerMarketingConsentOptInLevel;
  readonly state: CustomerMarketingConsentState;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly withdrawnAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CustomerMarketingConsentChannel =
  | 'EMAIL'
  | 'PUSH'
  | 'SMS'
  | 'WHATSAPP';

export type CustomerMarketingConsentOptInLevel =
  | 'CONFIRMED_OPT_IN'
  | 'SINGLE_OPT_IN'
  | 'UNKNOWN';

export type CustomerMarketingConsentState =
  | 'INVALID'
  | 'NOT_SUBSCRIBED'
  | 'PENDING'
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED';

/**
 * Customer-selectable target states. Pending/invalid states are produced only by
 * the server and cannot be selected directly.
 */
export type CustomerMarketingConsentTargetState =
  | 'SUBSCRIBED'
  | 'UNSUBSCRIBED';

export type CustomerMarketingConsentUpdateInput = {
  readonly channel: CustomerMarketingConsentChannel;
  readonly idempotencyKey: Scalars['String']['input'];
  readonly state: CustomerMarketingConsentTargetState;
};

export type CustomerMarketingConsentUpdatePayload = {
  readonly __typename: 'CustomerMarketingConsentUpdatePayload';
  readonly customer?: Maybe<Customer>;
  readonly marketingConsent?: Maybe<CustomerMarketingConsent>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** The authenticated customer's phone projection. */
export type CustomerPhoneNumber = {
  readonly __typename: 'CustomerPhoneNumber';
  readonly marketingConsent?: Maybe<CustomerMarketingConsent>;
  readonly phoneNumber: Scalars['String']['output'];
  readonly verified: Scalars['Boolean']['output'];
};

/** All persisted comparison matrices prepared for the current customer. */
export type CustomerProductComparisons = {
  readonly __typename: 'CustomerProductComparisons';
  /** Number of comparison columns across all returned category matrices. */
  readonly itemCount: Scalars['Int']['output'];
  /** Category matrices in deterministic server-defined order. */
  readonly nodes: ReadonlyArray<ProductComparison>;
  /** Number of returned category matrices. */
  readonly totalCount: Scalars['Int']['output'];
};

/** A merchant-approved tax exemption. Customers cannot grant exemptions. */
export type CustomerTaxExemption = Node & {
  readonly __typename: 'CustomerTaxExemption';
  readonly certificateFile?: Maybe<GenericFile>;
  readonly code: Scalars['String']['output'];
  readonly countryCode?: Maybe<CountryCode>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly reason?: Maybe<Scalars['String']['output']>;
  readonly regionCode?: Maybe<Scalars['String']['output']>;
  readonly status: CustomerTaxExemptionStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly validFrom?: Maybe<Scalars['Date']['output']>;
  readonly validTo?: Maybe<Scalars['Date']['output']>;
};

export type CustomerTaxExemptionConnection = Connection & {
  readonly __typename: 'CustomerTaxExemptionConnection';
  readonly edges: ReadonlyArray<CustomerTaxExemptionEdge>;
  readonly nodes: ReadonlyArray<CustomerTaxExemption>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type CustomerTaxExemptionEdge = {
  readonly __typename: 'CustomerTaxExemptionEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: CustomerTaxExemption;
};

export type CustomerTaxExemptionStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'REVOKED';

/** A customer-provided tax identifier whose status is controlled by Shopana. */
export type CustomerTaxIdentifier = Node & {
  readonly __typename: 'CustomerTaxIdentifier';
  readonly countryCode?: Maybe<CountryCode>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly id: Scalars['ID']['output'];
  readonly identifierType: Scalars['String']['output'];
  readonly isPrimary: Scalars['Boolean']['output'];
  readonly status: CustomerTaxIdentifierStatus;
  readonly updatedAt: Scalars['DateTime']['output'];
  readonly validFrom?: Maybe<Scalars['Date']['output']>;
  readonly validTo?: Maybe<Scalars['Date']['output']>;
  readonly value: Scalars['String']['output'];
  readonly verifiedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type CustomerTaxIdentifierConnection = Connection & {
  readonly __typename: 'CustomerTaxIdentifierConnection';
  readonly edges: ReadonlyArray<CustomerTaxIdentifierEdge>;
  readonly nodes: ReadonlyArray<CustomerTaxIdentifier>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type CustomerTaxIdentifierCreateInput = {
  readonly countryCode?: InputMaybe<CountryCode>;
  readonly idempotencyKey: Scalars['String']['input'];
  readonly identifierType: Scalars['String']['input'];
  readonly isPrimary?: InputMaybe<Scalars['Boolean']['input']>;
  readonly value: Scalars['String']['input'];
};

export type CustomerTaxIdentifierCreatePayload = {
  readonly __typename: 'CustomerTaxIdentifierCreatePayload';
  readonly customer?: Maybe<Customer>;
  readonly taxIdentifier?: Maybe<CustomerTaxIdentifier>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerTaxIdentifierDeleteInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  readonly taxIdentifierId: Scalars['ID']['input'];
};

export type CustomerTaxIdentifierDeletePayload = {
  readonly __typename: 'CustomerTaxIdentifierDeletePayload';
  readonly customer?: Maybe<Customer>;
  readonly deletedTaxIdentifierId?: Maybe<Scalars['ID']['output']>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type CustomerTaxIdentifierEdge = {
  readonly __typename: 'CustomerTaxIdentifierEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: CustomerTaxIdentifier;
};

export type CustomerTaxIdentifierStatus =
  | 'EXPIRED'
  | 'REJECTED'
  | 'UNVERIFIED'
  | 'VERIFIED';

export type CustomerTaxIdentifierUpdateInput = {
  readonly countryCode?: InputMaybe<CountryCode>;
  readonly idempotencyKey: Scalars['String']['input'];
  readonly identifierType?: InputMaybe<Scalars['String']['input']>;
  readonly isPrimary?: InputMaybe<Scalars['Boolean']['input']>;
  readonly taxIdentifierId: Scalars['ID']['input'];
  readonly value?: InputMaybe<Scalars['String']['input']>;
};

export type CustomerTaxIdentifierUpdatePayload = {
  readonly __typename: 'CustomerTaxIdentifierUpdatePayload';
  readonly customer?: Maybe<Customer>;
  readonly taxIdentifier?: Maybe<CustomerTaxIdentifier>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/**
 * Customer-editable, non-authentication profile fields. Email and phone changes
 * use IAM verification workflows and arrive here as verified projections.
 */
export type CustomerUpdateInput = {
  readonly companyName?: InputMaybe<Scalars['String']['input']>;
  readonly dateOfBirth?: InputMaybe<Scalars['Date']['input']>;
  readonly firstName?: InputMaybe<Scalars['String']['input']>;
  readonly gender?: InputMaybe<Scalars['String']['input']>;
  readonly idempotencyKey: Scalars['String']['input'];
  readonly jobTitle?: InputMaybe<Scalars['String']['input']>;
  readonly lastName?: InputMaybe<Scalars['String']['input']>;
  readonly middleName?: InputMaybe<Scalars['String']['input']>;
  readonly preferredLocale?: InputMaybe<Scalars['String']['input']>;
  readonly prefix?: InputMaybe<Scalars['String']['input']>;
  readonly suffix?: InputMaybe<Scalars['String']['input']>;
};

/** Result of updating the authenticated customer's profile. */
export type CustomerUpdatePayload = {
  readonly __typename: 'CustomerUpdatePayload';
  readonly customer?: Maybe<Customer>;
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** A customer-facing validation, ownership, dependency, or business error. */
export type CustomerUserError = DisplayableError & {
  readonly __typename: 'CustomerUserError';
  readonly code: Scalars['String']['output'];
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  readonly message: Scalars['String']['output'];
  readonly retryable: Scalars['Boolean']['output'];
};

/**
 * A named, private collection of products saved by the authenticated customer.
 *
 * Wishlist ownership is scoped to both the current store and customer. A
 * customer can have multiple wishlists, but exactly one existing wishlist is the
 * default. Wishlists are never shared between customers.
 */
export type CustomerWishlist = Node & {
  readonly __typename: 'CustomerWishlist';
  /** Date and time when the wishlist was created. */
  readonly createdAt: Scalars['DateTime']['output'];
  /** Customer who owns this wishlist. */
  readonly customer: Customer;
  /** Globally unique CustomerWishlist ID. */
  readonly id: Scalars['ID']['output'];
  /**
   * Whether this is the customer's primary wishlist.
   *
   * A default wishlist can be renamed but cannot be deleted.
   */
  readonly isDefault: Scalars['Boolean']['output'];
  /**
   * Products saved in this wishlist.
   *
   * Results are ordered by addition time descending and then by ID descending.
   * Omitting all pagination arguments returns the first 20 entries. At most 100
   * entries can be requested in either direction.
   */
  readonly items: CustomerWishlistItemConnection;
  /** Customer-visible name after surrounding whitespace has been removed. */
  readonly name: Scalars['String']['output'];
  /** Date and time when the wishlist was last renamed or otherwise updated. */
  readonly updatedAt: Scalars['DateTime']['output'];
};


/**
 * A named, private collection of products saved by the authenticated customer.
 *
 * Wishlist ownership is scoped to both the current store and customer. A
 * customer can have multiple wishlists, but exactly one existing wishlist is the
 * default. Wishlists are never shared between customers.
 */
export type CustomerWishlistItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A Relay connection containing customer wishlists. */
export type CustomerWishlistConnection = Connection & {
  readonly __typename: 'CustomerWishlistConnection';
  /** Wishlist edges in deterministic cursor order. */
  readonly edges: ReadonlyArray<CustomerWishlistEdge>;
  /** Wishlists contained in the returned page. */
  readonly nodes: ReadonlyArray<CustomerWishlist>;
  /** Information needed to request adjacent pages. */
  readonly pageInfo: PageInfo;
  /** Total number of wishlists owned by the authenticated customer. */
  readonly totalCount: Scalars['Int']['output'];
};

/** A cursor and the customer wishlist at that cursor. */
export type CustomerWishlistEdge = {
  readonly __typename: 'CustomerWishlistEdge';
  /** Opaque cursor for this wishlist in the current connection. */
  readonly cursor: Scalars['Cursor']['output'];
  /** Wishlist at the end of the edge. */
  readonly node: CustomerWishlist;
};

/** One product saved in a customer wishlist. */
export type CustomerWishlistItem = Node & {
  readonly __typename: 'CustomerWishlistItem';
  /** Date and time when the product was added to the wishlist. */
  readonly addedAt: Scalars['DateTime']['output'];
  /** Globally unique CustomerWishlistItem ID. */
  readonly id: Scalars['ID']['output'];
  /**
   * The currently published storefront product represented by this item.
   *
   * The saved item remains present when the product is unpublished. This field
   * is null when the product is unpublished, deleted, belongs to another store,
   * or its federated reference cannot be resolved.
   */
  readonly product?: Maybe<Product>;
  /** Wishlist containing this saved item. */
  readonly wishlist: CustomerWishlist;
};

/** A Relay connection containing items from one customer wishlist. */
export type CustomerWishlistItemConnection = Connection & {
  readonly __typename: 'CustomerWishlistItemConnection';
  /** Wishlist item edges in deterministic cursor order. */
  readonly edges: ReadonlyArray<CustomerWishlistItemEdge>;
  /** Wishlist items contained in the returned page. */
  readonly nodes: ReadonlyArray<CustomerWishlistItem>;
  /** Information needed to request adjacent pages. */
  readonly pageInfo: PageInfo;
  /** Total number of products saved in the wishlist. */
  readonly totalCount: Scalars['Int']['output'];
};

/** A cursor and the customer wishlist item at that cursor. */
export type CustomerWishlistItemEdge = {
  readonly __typename: 'CustomerWishlistItemEdge';
  /** Opaque cursor for this item in the current connection. */
  readonly cursor: Scalars['Cursor']['output'];
  /** Wishlist item at the end of the edge. */
  readonly node: CustomerWishlistItem;
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
  /** Embed URL when one was supplied by the external media source. */
  readonly embedUrl?: Maybe<Scalars['URL']['output']>;
  readonly host: MediaHost;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly originUrl: Scalars['URL']['output'];
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
  readonly originalFileSize: Scalars['UnsignedInt64']['output'];
  readonly previewImage?: Maybe<Image>;
  readonly url: Scalars['URL']['output'];
};

/** An image resource with URL, dimensions, and transformation options. */
export type Image = {
  readonly __typename: 'Image';
  readonly altText?: Maybe<Scalars['String']['output']>;
  readonly height?: Maybe<Scalars['Int']['output']>;
  readonly id: Scalars['ID']['output'];
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
  | 'AVIF'
  | 'JPG'
  | 'PNG'
  | 'WEBP';

/** How the image is resized to fit the requested box. */
export type ImageFitMode =
  | 'CONTAIN'
  | 'COVER'
  | 'FILL'
  | 'INSIDE'
  | 'OUTSIDE';

/** Anchor used when the selected fit mode crops or pads the image. */
export type ImageGravity =
  | 'AUTO'
  | 'BOTTOM'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_RIGHT'
  | 'CENTER'
  | 'LEFT'
  | 'RIGHT'
  | 'TOP'
  | 'TOP_LEFT'
  | 'TOP_RIGHT';

/** The available options for transforming an image. */
export type ImageTransformInput = {
  readonly fit?: InputMaybe<ImageFitMode>;
  readonly gravity?: InputMaybe<ImageGravity>;
  readonly maxHeight?: InputMaybe<Scalars['Int']['input']>;
  readonly maxWidth?: InputMaybe<Scalars['Int']['input']>;
  readonly preferredContentType?: InputMaybe<ImageContentType>;
  /** Output quality, 1-100. Bounded by the selected CdnConfiguration's minQuality/maxQuality when configured. */
  readonly quality?: InputMaybe<Scalars['Int']['input']>;
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
 * AND. Repeated values of the same filter are combined with OR. ProductVariant facets,
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

/**
 * The authenticated customer's account in the store's active loyalty program.
 *
 * The account is resolved only for the customer and store from the authenticated
 * request context. A Customer federation reference is not an authorization grant.
 */
export type LoyaltyAccount = {
  readonly __typename: 'LoyaltyAccount';
  /**
   * Issued rewards that the customer can currently use.
   *
   * Expired, revoked, redeemed, future, and otherwise unusable entitlements are
   * excluded by the server. The storefront must not reimplement entitlement state
   * or date checks.
   */
  readonly availableRewards: LoyaltyAvailableRewardConnection;
  readonly balance: LoyaltyBalance;
  readonly id: Scalars['ID']['output'];
  /**
   * Server-ranked actions through which the current customer can earn or unlock a
   * loyalty reward. Values, eligibility, limits, localization, and ordering are
   * fully resolved for the active storefront context.
   */
  readonly opportunities: LoyaltyAccountOpportunityPresentation;
  /**
   * Sources the customer can pay with in checkout: enabled in the effective program version and
   * with a positive balance, ordered POINTS then STORE_CREDIT. The per-order bound here is the
   * program limit; the bound for a specific cart comes from the checkout quote.
   */
  readonly redemptionSources: ReadonlyArray<LoyaltyRedemptionSourceOption>;
  readonly status: LoyaltyAccountStatus;
  /** The customer's store credit in the program currency. Null when no store credit was issued. */
  readonly storeCredit?: Maybe<LoyaltyStoreCredit>;
  readonly tier?: Maybe<LoyaltyTier>;
  /**
   * Customer-visible balance changes, newest first. Internal bucket transfers,
   * reservations, releases, merges, and activation events are not returned.
   */
  readonly transactions: LoyaltyTransactionConnection;
  /**
   * The nearest point expirations, ordered by expiresAt ascending.
   *
   * The projection contains at most 20 entries. Expirations with the same date may
   * be aggregated into one entry by the Loyalty service.
   */
  readonly upcomingExpirations: ReadonlyArray<LoyaltyPointsExpiration>;
};


/**
 * The authenticated customer's account in the store's active loyalty program.
 *
 * The account is resolved only for the customer and store from the authenticated
 * request context. A Customer federation reference is not an authorization grant.
 */
export type LoyaltyAccountAvailableRewardsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};


/**
 * The authenticated customer's account in the store's active loyalty program.
 *
 * The account is resolved only for the customer and store from the authenticated
 * request context. A Customer federation reference is not an authorization grant.
 */
export type LoyaltyAccountTransactionsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * Account-level opportunities selected and ranked for the authenticated customer.
 * Product-scoped opportunities remain available through Product.loyalty.
 */
export type LoyaltyAccountOpportunityPresentation = {
  readonly __typename: 'LoyaltyAccountOpportunityPresentation';
  readonly evaluatedAt: Scalars['DateTime']['output'];
  readonly opportunities: ReadonlyArray<LoyaltyOpportunity>;
  readonly primaryOpportunity?: Maybe<LoyaltyOpportunity>;
  readonly revision: Scalars['String']['output'];
  readonly validUntil?: Maybe<Scalars['DateTime']['output']>;
};

export type LoyaltyAccountStatus =
  | 'ACTIVE'
  | 'CLOSED'
  | 'SUSPENDED';

/** An issued reward that the current customer can use now. */
export type LoyaltyAvailableReward = Node & {
  readonly __typename: 'LoyaltyAvailableReward';
  /** Код связанной скидки Pricing для применения награды в checkout, если она активируется кодом. */
  readonly discountCode?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly issuedAt: Scalars['DateTime']['output'];
  /** Localized server-authored copy ready for an account or checkout surface. */
  readonly presentation: LoyaltyOpportunityCopy;
  /**
   * Opaque revision used by a later reservation or redemption mutation owned by
   * Checkout. The storefront does not interpret it.
   */
  readonly revision: Scalars['String']['output'];
  readonly reward: LoyaltyRewardPresentation;
  readonly validUntil?: Maybe<Scalars['DateTime']['output']>;
};

export type LoyaltyAvailableRewardConnection = Connection & {
  readonly __typename: 'LoyaltyAvailableRewardConnection';
  readonly edges: ReadonlyArray<LoyaltyAvailableRewardEdge>;
  readonly nodes: ReadonlyArray<LoyaltyAvailableReward>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type LoyaltyAvailableRewardEdge = {
  readonly __typename: 'LoyaltyAvailableRewardEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: LoyaltyAvailableReward;
};

/** The customer's current point balances. */
export type LoyaltyBalance = {
  readonly __typename: 'LoyaltyBalance';
  readonly availablePoints: Scalars['UnsignedInt64']['output'];
  readonly debtPoints: Scalars['UnsignedInt64']['output'];
  readonly pendingPoints: Scalars['UnsignedInt64']['output'];
  readonly reservedPoints: Scalars['UnsignedInt64']['output'];
};

export type LoyaltyFreeProductRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyFreeProductRewardPresentation';
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
  readonly product: Product;
  readonly quantity: Scalars['UnsignedInt64']['output'];
  readonly variant?: Maybe<ProductVariant>;
};

export type LoyaltyFreeShippingRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyFreeShippingRewardPresentation';
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
};

export type LoyaltyMemberBenefitRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyMemberBenefitRewardPresentation';
  readonly code?: Maybe<Scalars['String']['output']>;
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
};

/** Minimum and maximum monetary values in one storefront currency. */
export type LoyaltyMoneyRange = {
  readonly __typename: 'LoyaltyMoneyRange';
  readonly maximum: Money;
  readonly minimum: Money;
};

/** Cashback, store credit, or a fixed monetary discount. */
export type LoyaltyMoneyRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyMoneyRewardPresentation';
  readonly accuracy: LoyaltyValueAccuracy;
  readonly amount: LoyaltyMoneyRange;
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
};

export type LoyaltyNextTier = {
  readonly __typename: 'LoyaltyNextTier';
  readonly code: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
  readonly rank: Scalars['Int']['output'];
};

/** A customer-visible action through which a loyalty reward can be obtained. */
export type LoyaltyOpportunity = {
  readonly __typename: 'LoyaltyOpportunity';
  /** Stable opaque key within the returned presentation revision. */
  readonly key: Scalars['String']['output'];
  /** Localized, merchant-configurable copy ready for direct rendering. */
  readonly presentation: LoyaltyOpportunityCopy;
  /**
   * Number of additional times the viewer can currently receive this reward.
   * Null means that no finite viewer limit applies or the viewer is anonymous.
   */
  readonly remainingUses?: Maybe<Scalars['UnsignedInt64']['output']>;
  /** The fully calculated reward value. */
  readonly reward: LoyaltyRewardPresentation;
  /**
   * Viewer-specific state calculated from authentication, prior events, limits,
   * budgets, account status, segments, tier, and schedule.
   */
  readonly state: LoyaltyOpportunityState;
  /** The customer action represented by this opportunity. */
  readonly type: LoyaltyOpportunityType;
  /** End of the currently evaluated rule or entitlement window. */
  readonly validUntil?: Maybe<Scalars['DateTime']['output']>;
};

/** Localized server-authored copy for one opportunity or issued reward. */
export type LoyaltyOpportunityCopy = {
  readonly __typename: 'LoyaltyOpportunityCopy';
  /** Complete localized text for assistive technology. */
  readonly accessibilityLabel: Scalars['String']['output'];
  /** Short text suitable for a product-card badge. */
  readonly badge?: Maybe<Scalars['String']['output']>;
  /** Optional explanatory text for a detail surface. */
  readonly description?: Maybe<Scalars['String']['output']>;
  /** Primary text, for example `Earn 300 points for a review`. */
  readonly headline: Scalars['String']['output'];
  /** Already localized customer-facing terms selected by the server. */
  readonly terms: ReadonlyArray<Scalars['String']['output']>;
};

/**
 * Presentation state, not a command authorization.
 *
 * The authoritative eligibility check is repeated when the underlying action is
 * accepted by its owning service.
 */
export type LoyaltyOpportunityState =
  | 'AUTHENTICATION_REQUIRED'
  | 'AVAILABLE'
  | 'BUDGET_EXHAUSTED'
  | 'COMPLETED'
  | 'LIMIT_REACHED';

export type LoyaltyOpportunityType =
  | 'BIRTHDAY'
  | 'CUSTOM'
  | 'LOGIN'
  | 'PURCHASE'
  | 'REFERRAL'
  | 'REVIEW'
  | 'SIGNUP'
  | 'SUBSCRIPTION_RENEWAL';

export type LoyaltyPercentageRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyPercentageRewardPresentation';
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
  /** Percentage expressed as a decimal value, for example `5` for five percent. */
  readonly percentage: Scalars['Decimal']['output'];
};

/** Points scheduled to expire at the same time. */
export type LoyaltyPointsExpiration = {
  readonly __typename: 'LoyaltyPointsExpiration';
  readonly expiresAt: Scalars['DateTime']['output'];
  readonly points: Scalars['UnsignedInt64']['output'];
};

export type LoyaltyPointsRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyPointsRewardPresentation';
  readonly accuracy: LoyaltyValueAccuracy;
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
  readonly points: LoyaltyUnsignedRange;
};

export type LoyaltyRedemptionBound = {
  readonly __typename: 'LoyaltyRedemptionBound';
  readonly amount: Money;
  /** Bound in points; null for STORE_CREDIT. */
  readonly points?: Maybe<Scalars['UnsignedInt64']['output']>;
};

export type LoyaltyRedemptionSource =
  | 'POINTS'
  | 'STORE_CREDIT';

export type LoyaltyRedemptionSourceOption = {
  readonly __typename: 'LoyaltyRedemptionSourceOption';
  /** Available balance in money; points are converted at the program redemption rate. */
  readonly availableAmount: Money;
  /** Available points; null for STORE_CREDIT. */
  readonly availablePoints?: Maybe<Scalars['UnsignedInt64']['output']>;
  /** Program limit per order; null without a limit. */
  readonly maximumPerOrder?: Maybe<LoyaltyRedemptionBound>;
  readonly minimum: LoyaltyRedemptionBound;
  readonly source: LoyaltyRedemptionSource;
};

export type LoyaltyRewardKind =
  | 'CASHBACK'
  | 'FIXED_DISCOUNT'
  | 'FREE_PRODUCT'
  | 'FREE_SHIPPING'
  | 'MEMBER_BENEFIT'
  | 'PERCENTAGE_DISCOUNT'
  | 'POINTS'
  | 'STORE_CREDIT'
  | 'VOUCHER';

/**
 * A calculated reward value.
 *
 * All implementations expose common server-authored copy. Clients can render that
 * copy without inspecting the concrete reward type; typed fields are available for
 * richer native presentation and analytics.
 */
export type LoyaltyRewardPresentation = {
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
};

export type LoyaltyStoreCredit = {
  readonly __typename: 'LoyaltyStoreCredit';
  readonly availableAmount: Money;
  readonly pendingAmount: Money;
  /** The nearest store credit expirations, ordered by expiresAt ascending, at most 20 entries. */
  readonly upcomingExpirations: ReadonlyArray<LoyaltyStoreCreditExpiration>;
};

export type LoyaltyStoreCreditExpiration = {
  readonly __typename: 'LoyaltyStoreCreditExpiration';
  readonly amount: Money;
  readonly expiresAt: Scalars['DateTime']['output'];
};

/**
 * The customer's current tier. Without a membership this is the program's base tier
 * (lowest rank) when the program version defines one.
 */
export type LoyaltyTier = {
  readonly __typename: 'LoyaltyTier';
  readonly code: Scalars['String']['output'];
  /** Multiplier applied to purchase points, in basis points (`15000` = ×1.5). */
  readonly earnMultiplierBps: Scalars['Int']['output'];
  readonly effectiveFrom: Scalars['DateTime']['output'];
  readonly effectiveTo?: Maybe<Scalars['DateTime']['output']>;
  readonly name: Scalars['String']['output'];
  /**
   * Server-calculated progress to the next tier by rank. Null on the top tier or when the
   * qualification cannot be expressed as a remaining amount.
   */
  readonly progress?: Maybe<LoyaltyTierProgress>;
  readonly rank: Scalars['Int']['output'];
};

export type LoyaltyTierProgress = {
  readonly __typename: 'LoyaltyTierProgress';
  readonly nextTier: LoyaltyNextTier;
  /** Localized text such as `1 200 UAH more to reach Gold`. */
  readonly presentation: LoyaltyOpportunityCopy;
};

/** A customer-visible balance change. */
export type LoyaltyTransaction = {
  readonly __typename: 'LoyaltyTransaction';
  readonly description?: Maybe<Scalars['String']['output']>;
  readonly direction: LoyaltyTransactionDirection;
  readonly effectiveAt: Scalars['DateTime']['output'];
  readonly expiresAt?: Maybe<Scalars['DateTime']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly occurredAt: Scalars['DateTime']['output'];
  readonly points: Scalars['UnsignedInt64']['output'];
  readonly type: LoyaltyTransactionType;
};

export type LoyaltyTransactionConnection = Connection & {
  readonly __typename: 'LoyaltyTransactionConnection';
  readonly edges: ReadonlyArray<LoyaltyTransactionEdge>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

export type LoyaltyTransactionDirection =
  | 'CREDIT'
  | 'DEBIT';

export type LoyaltyTransactionEdge = {
  readonly __typename: 'LoyaltyTransactionEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: LoyaltyTransaction;
};

/** A stable customer-facing category rather than an internal ledger event kind. */
export type LoyaltyTransactionType =
  | 'ADJUSTED'
  | 'EARNED'
  | 'EXPIRED'
  | 'REDEEMED'
  | 'REFUNDED';

/** Minimum and maximum unsigned values calculated by the server. */
export type LoyaltyUnsignedRange = {
  readonly __typename: 'LoyaltyUnsignedRange';
  readonly maximum: Scalars['UnsignedInt64']['output'];
  readonly minimum: Scalars['UnsignedInt64']['output'];
};

export type LoyaltyValueAccuracy =
  /** The value can change after cart, Pricing, or final eligibility evaluation. */
  | 'ESTIMATED'
  /** The value cannot change for the evaluated subject and context. */
  | 'EXACT';

export type LoyaltyVoucherRewardPresentation = LoyaltyRewardPresentation & {
  readonly __typename: 'LoyaltyVoucherRewardPresentation';
  /**
   * Customer-visible voucher code. Null for an opportunity that has not yet issued
   * an entitlement.
   */
  readonly code?: Maybe<Scalars['String']['output']>;
  readonly copy: LoyaltyOpportunityCopy;
  readonly kind: LoyaltyRewardKind;
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
  readonly image: Image;
  readonly mediaContentType: MediaContentType;
  readonly previewImage?: Maybe<Image>;
};

/** A hosted 3D model. */
export type Model3d = Media & Node & {
  readonly __typename: 'Model3d';
  readonly alt?: Maybe<Scalars['String']['output']>;
  readonly id: Scalars['ID']['output'];
  readonly mediaContentType: MediaContentType;
  readonly previewImage?: Maybe<Image>;
  readonly sources: ReadonlyArray<Model3dSource>;
};

/** A source for a hosted 3D model. */
export type Model3dSource = {
  readonly __typename: 'Model3dSource';
  readonly filesize: Scalars['UnsignedInt64']['output'];
  readonly format: Scalars['String']['output'];
  readonly mimeType?: Maybe<Scalars['String']['output']>;
  readonly url: Scalars['URL']['output'];
};

/** A precise monetary value with its associated currency. */
export type Money = {
  readonly __typename: 'Money';
  readonly amount: Scalars['Decimal']['output'];
  readonly currencyCode: CurrencyCode;
};

/**
 * A monetary amount and its currency. Supply amount as an exact decimal string in major currency
 * units.
 */
export type MoneyInput = {
  /** Exact decimal amount serialized as a string. */
  readonly amount: Scalars['Decimal']['input'];
  /** ISO 4217 currency code. */
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
  /**
   * Passes the guest checkout of this browser to the signed-in customer after sign-in. When the
   * customer already has an open cart, the guest items and the input missing there are merged into
   * it and the guest checkout is closed. Profile contacts and the default shipping address fill only
   * empty fields. Requires a signed-in customer.
   */
  readonly checkoutClaim: CheckoutClaimPayload;
  /**
   * Creates a new checkout. For a signed-in customer who already has an open cart, the items are
   * added to that cart and it is returned instead.
   */
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
  /** Forgets the delivery data saved for one delivery method of a group. */
  readonly checkoutDeliveryCustomerInputClear: CheckoutMutationPayload;
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
  /** Removes the loyalty redemption selection from this checkout. */
  readonly checkoutLoyaltyRedemptionRemove: CheckoutMutationPayload;
  /** Selects loyalty points, an issued reward entitlement, or both. */
  readonly checkoutLoyaltyRedemptionUpdate: CheckoutMutationPayload;
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
  /** Creates a mailing address owned by the current customer. */
  readonly customerAddressCreate: CustomerAddressCreatePayload;
  /** Atomically sets or clears shipping and billing address defaults. */
  readonly customerAddressDefaultSet: CustomerAddressDefaultSetPayload;
  /** Deletes a mailing address owned by the current customer. */
  readonly customerAddressDelete: CustomerAddressDeletePayload;
  /** Updates a mailing address owned by the current customer. */
  readonly customerAddressUpdate: CustomerAddressUpdatePayload;
  /** Removes every selected variant currently grouped under one category. */
  readonly customerComparisonCategoryClear: CustomerComparisonMutationPayload;
  /** Adds one concrete Catalog variant to the customer's comparisons. */
  readonly customerComparisonVariantAdd: CustomerComparisonMutationPayload;
  /** Removes one concrete Catalog variant from the customer's comparisons. */
  readonly customerComparisonVariantRemove: CustomerComparisonMutationPayload;
  /** Cancels a pending privacy request owned by the current customer. */
  readonly customerDataRequestCancel: CustomerDataRequestCancelPayload;
  /** Creates an auditable privacy request for the current customer. */
  readonly customerDataRequestCreate: CustomerDataRequestCreatePayload;
  /** Transitions one customer-selectable marketing consent channel. */
  readonly customerMarketingConsentUpdate: CustomerMarketingConsentUpdatePayload;
  /** Creates an unverified tax identifier for the current customer. */
  readonly customerTaxIdentifierCreate: CustomerTaxIdentifierCreatePayload;
  /** Deletes a customer-owned tax identifier. */
  readonly customerTaxIdentifierDelete: CustomerTaxIdentifierDeletePayload;
  /** Updates a customer-owned tax identifier and resets its verification. */
  readonly customerTaxIdentifierUpdate: CustomerTaxIdentifierUpdatePayload;
  /** Updates non-authentication profile fields for the current customer. */
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
  /** Creates a wishlist for the authenticated customer. */
  readonly wishlistCreate: WishlistCreatePayload;
  /** Deletes a non-default wishlist owned by the authenticated customer. */
  readonly wishlistDelete: WishlistDeletePayload;
  /** Adds a published product to a customer-owned wishlist. */
  readonly wishlistProductAdd: WishlistProductAddPayload;
  /** Removes a saved product item owned by the authenticated customer. */
  readonly wishlistProductRemove: WishlistProductRemovePayload;
  /** Renames a wishlist owned by the authenticated customer. */
  readonly wishlistUpdate: WishlistUpdatePayload;
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
export type MutationCheckoutClaimArgs = {
  input: CheckoutClaimInput;
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
export type MutationCheckoutDeliveryCustomerInputClearArgs = {
  input: CheckoutDeliveryCustomerInputClearInput;
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
export type MutationCheckoutLoyaltyRedemptionRemoveArgs = {
  input: CheckoutLoyaltyRedemptionRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCheckoutLoyaltyRedemptionUpdateArgs = {
  input: CheckoutLoyaltyRedemptionUpdateInput;
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
  input: CustomerAddressCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressDefaultSetArgs = {
  input: CustomerAddressDefaultSetInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressDeleteArgs = {
  input: CustomerAddressDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerAddressUpdateArgs = {
  input: CustomerAddressUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerComparisonCategoryClearArgs = {
  input: CustomerComparisonCategoryClearInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerComparisonVariantAddArgs = {
  input: CustomerComparisonVariantAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerComparisonVariantRemoveArgs = {
  input: CustomerComparisonVariantRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerDataRequestCancelArgs = {
  input: CustomerDataRequestCancelInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerDataRequestCreateArgs = {
  input: CustomerDataRequestCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerMarketingConsentUpdateArgs = {
  input: CustomerMarketingConsentUpdateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerTaxIdentifierCreateArgs = {
  input: CustomerTaxIdentifierCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerTaxIdentifierDeleteArgs = {
  input: CustomerTaxIdentifierDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationCustomerTaxIdentifierUpdateArgs = {
  input: CustomerTaxIdentifierUpdateInput;
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


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationWishlistCreateArgs = {
  input: WishlistCreateInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationWishlistDeleteArgs = {
  input: WishlistDeleteInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationWishlistProductAddArgs = {
  input: WishlistProductAddInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationWishlistProductRemoveArgs = {
  input: WishlistProductRemoveInput;
};


/**
 * Catalog storefront mutations are intentionally empty. Catalog authoring belongs
 * to the Admin API; buyer-side mutations are owned by cart and checkout services.
 */
export type MutationWishlistUpdateArgs = {
  input: WishlistUpdateInput;
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

export type NovaPoshtaLanguage =
  | 'RU'
  | 'UA';

export type NovaPoshtaPointKind =
  | 'POSTOMAT'
  | 'WAREHOUSE';

export type NovaPoshtaScheduleDay = {
  readonly __typename: 'NovaPoshtaScheduleDay';
  /** English weekday name as the carrier returns it, for example "Monday". */
  readonly day: Scalars['String']['output'];
  /** Hours as the carrier returns them, for example "08:00-21:00" or "-". */
  readonly hours: Scalars['String']['output'];
};

/** A settlement as Nova Poshta's searchSettlements returns it. */
export type NovaPoshtaSettlement = {
  readonly __typename: 'NovaPoshtaSettlement';
  readonly addressDeliveryAllowed?: Maybe<Scalars['Boolean']['output']>;
  readonly area?: Maybe<Scalars['String']['output']>;
  /** Ref of the carrier city that serves the settlement. */
  readonly cityRef: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  /** Full name with area and region, for example "м. Київ, Київська обл.". */
  readonly present: Scalars['String']['output'];
  /** Settlement ref; `settlementRef` of the delivery customer input. */
  readonly ref: Scalars['ID']['output'];
  readonly region?: Maybe<Scalars['String']['output']>;
  readonly settlementType?: Maybe<Scalars['String']['output']>;
  readonly warehouseCount?: Maybe<Scalars['Int']['output']>;
};

export type NovaPoshtaSettlementPage = {
  readonly __typename: 'NovaPoshtaSettlementPage';
  /** Whether the next page holds more settlements. */
  readonly hasNextPage: Scalars['Boolean']['output'];
  readonly items: ReadonlyArray<NovaPoshtaSettlement>;
  readonly limit: Scalars['Int']['output'];
  readonly page: Scalars['Int']['output'];
  /** Matches across all pages, as the carrier reports it. */
  readonly totalCount: Scalars['Int']['output'];
};

/** A street as Nova Poshta's searchSettlementStreets returns it. */
export type NovaPoshtaSettlementStreet = {
  readonly __typename: 'NovaPoshtaSettlementStreet';
  readonly name: Scalars['String']['output'];
  /** Name with the street type, for example "вул. Хрещатик". */
  readonly present: Scalars['String']['output'];
  /** Settlement street ref; `streetRef` of the courier customer input. */
  readonly ref: Scalars['ID']['output'];
  readonly settlementRef: Scalars['ID']['output'];
  readonly streetType?: Maybe<Scalars['String']['output']>;
};

export type NovaPoshtaSettlementStreetPage = {
  readonly __typename: 'NovaPoshtaSettlementStreetPage';
  /** Always false: the carrier has no page parameter for streets. */
  readonly hasNextPage: Scalars['Boolean']['output'];
  readonly items: ReadonlyArray<NovaPoshtaSettlementStreet>;
  readonly limit: Scalars['Int']['output'];
  readonly page: Scalars['Int']['output'];
  /** Matches as the carrier reports it; may exceed the returned items. */
  readonly totalCount: Scalars['Int']['output'];
};

/** A branch or postomat as Nova Poshta's getWarehouses returns it. */
export type NovaPoshtaWarehouse = {
  readonly __typename: 'NovaPoshtaWarehouse';
  readonly cityName: Scalars['String']['output'];
  readonly cityRef: Scalars['ID']['output'];
  readonly description: Scalars['String']['output'];
  readonly kind: NovaPoshtaPointKind;
  readonly number: Scalars['String']['output'];
  /** Point ref; `warehouseRef` of the delivery customer input. */
  readonly ref: Scalars['ID']['output'];
  readonly regionCity?: Maybe<Scalars['String']['output']>;
  /** Opening hours by weekday, in carrier order. */
  readonly schedule: ReadonlyArray<NovaPoshtaScheduleDay>;
  /**
   * Whether the point is working and not denied for selection; only such points pass the
   * delivery customer input check.
   */
  readonly selectable: Scalars['Boolean']['output'];
  readonly settlementRef: Scalars['ID']['output'];
  readonly shortAddress: Scalars['String']['output'];
  /** Carrier status, for example "Working". */
  readonly status: Scalars['String']['output'];
  /** Carrier ref of the point type. */
  readonly typeRef: Scalars['ID']['output'];
};

export type NovaPoshtaWarehousePage = {
  readonly __typename: 'NovaPoshtaWarehousePage';
  /**
   * Whether the next page holds more points: from `totalCount`, or from a full page when the
   * carrier does not report it.
   */
  readonly hasNextPage: Scalars['Boolean']['output'];
  readonly items: ReadonlyArray<NovaPoshtaWarehouse>;
  readonly limit: Scalars['Int']['output'];
  readonly page: Scalars['Int']['output'];
  /** Matches across all pages, or null when the carrier does not report it. */
  readonly totalCount?: Maybe<Scalars['Int']['output']>;
};

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
  /** Stable handle, unique among items with the same parent. */
  readonly handle: Scalars['String']['output'];
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
  | 'COLLECTION'
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
  readonly description?: Maybe<RichText>;
  readonly excerpt?: Maybe<RichText>;
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
  /**
   * Loyalty earned by this order. Visible only to the customer who owns the earning account; null
   * before the order is eligible for earning or when it earned nothing.
   */
  readonly loyaltyEarning?: Maybe<OrderLoyaltyEarning>;
  /** Loyalty tender applied at checkout; null for orders without a redemption. */
  readonly loyaltyRedemption?: Maybe<OrderLoyaltyRedemption>;
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
  /** Amount paid with loyalty points or store credit; zero without a redemption. */
  readonly loyaltyAmount: Money;
  readonly subtotalAmount: Money;
  readonly totalAmount: Money;
  /** Promotion discounts on items and delivery; loyalty is in `loyaltyAmount`. */
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

/** What an order earned in the loyalty program. */
export type OrderLoyaltyEarning = {
  readonly __typename: 'OrderLoyaltyEarning';
  /** Cashback credited to the store credit balance; null without a monetary award. */
  readonly amount?: Maybe<Money>;
  /** When the purchase points become available; null without purchase points. */
  readonly availableAt?: Maybe<Scalars['DateTime']['output']>;
  /** Purchase points plus rule awards in points. */
  readonly points: Scalars['UnsignedInt64']['output'];
  readonly status: OrderLoyaltyEarningStatus;
};

export type OrderLoyaltyEarningStatus =
  /** Points can be spent. */
  | 'AVAILABLE'
  /** Points are awarded and wait for the program activation delay. */
  | 'PENDING'
  /** The purchase points were taken back by refunds or cancellation. */
  | 'REVERSED';

/** Loyalty tender of an order placed from checkout. */
export type OrderLoyaltyRedemption = {
  readonly __typename: 'OrderLoyaltyRedemption';
  readonly amount: Money;
  /** Points spent; null for STORE_CREDIT. */
  readonly points?: Maybe<Scalars['BigInt']['output']>;
  readonly source: OrderLoyaltyRedemptionSource;
};

export type OrderLoyaltyRedemptionSource =
  | 'POINTS'
  | 'STORE_CREDIT';

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
  readonly params?: Maybe<Scalars['JSON']['output']>;
  readonly sdk?: Maybe<Scalars['String']['output']>;
  readonly title?: Maybe<Scalars['String']['output']>;
  readonly type: PlaceOrderCustomerActionType;
  readonly url?: Maybe<Scalars['String']['output']>;
};

export type PlaceOrderCustomerActionType =
  | 'CLIENT_SDK'
  | 'INSTRUCTIONS'
  | 'REDIRECT';

/** Input used to place one immutable checkout snapshot. */
export type PlaceOrderInput = {
  /** Checkout identifier. */
  readonly checkoutId: Scalars['ID']['input'];
  /**
   * Amount the buyer confirmed: the checkout `cost.totalAmount` shown when the order is placed.
   * The checkout is recalculated before the placement; when it then pays a different amount,
   * nothing is placed and `CHECKOUT_TOTAL_CHANGED` asks the buyer to review the new total.
   */
  readonly expectedTotal: MoneyInput;
  /**
   * Client-generated key identifying this payment/order attempt. Reuse the same
   * key with identical input when retrying after a timeout or connection failure.
   */
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * HTTPS URL to which an online payment provider may return the customer.
   * A query parameter whose whole value is `{placementId}` or `{placementToken}`
   * receives the placement ID or the placement access token after the placement
   * is created; the template itself is what idempotency compares, so a retry
   * sends it unchanged.
   */
  readonly returnUrl?: InputMaybe<Scalars['String']['input']>;
};

/** Result of the durable place-order workflow. */
export type PlaceOrderPayload = {
  readonly __typename: 'PlaceOrderPayload';
  /** Checkout snapshot committed by this placement. */
  readonly checkoutId?: Maybe<Scalars['ID']['output']>;
  readonly customerAction?: Maybe<PlaceOrderCustomerAction>;
  readonly orderId?: Maybe<Scalars['ID']['output']>;
  /** Human-readable number of the placed order. */
  readonly orderNumber?: Maybe<Scalars['String']['output']>;
  readonly paymentCollectionId?: Maybe<Scalars['ID']['output']>;
  readonly paymentFailure?: Maybe<PlaceOrderPaymentFailure>;
  /** Payment flow captured at placement, including reads without a browser journal. */
  readonly paymentFlow?: Maybe<PaymentFlow>;
  readonly paymentOperationId?: Maybe<Scalars['ID']['output']>;
  readonly paymentSessionId?: Maybe<Scalars['ID']['output']>;
  /** Durable placement identifier used by Query.checkoutPlacement. */
  readonly placementId?: Maybe<Scalars['ID']['output']>;
  /** Persisted orchestration state used for recovery and reconciliation. */
  readonly placementState?: Maybe<CheckoutPlacementState>;
  /**
   * Access token of the placement for Query.checkoutPlacement. Returned only to
   * the buyer who placed the checkout; it grants reading the placement status.
   */
  readonly placementToken?: Maybe<Scalars['String']['output']>;
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
  /**
   * Fully prepared comparison for this product in the current storefront context.
   *
   * Catalog selects every product and concrete variant available for comparison,
   * applies the server-defined order and limit, and resolves the complete matrix.
   * The storefront provides no comparison inputs and only renders the result.
   */
  readonly comparison?: Maybe<ProductComparison>;
  readonly createdAt: Scalars['DateTime']['output'];
  readonly description?: Maybe<RichText>;
  readonly excerpt?: Maybe<RichText>;
  readonly featureGroups: ReadonlyArray<ProductFeatureGroup>;
  readonly featuredMedia?: Maybe<Media>;
  readonly features: ReadonlyArray<ProductFeature>;
  /**
   * Products that customers frequently bought together with this product.
   *
   * Results come from confirmed sales aggregated into the currently published
   * FREQUENTLY_BOUGHT_TOGETHER ranking snapshot. This field does not imply a
   * bundle, discount, price guarantee, compatibility claim, or cart mutation.
   * Clients choose concrete variants and use Checkout APIs for add-to-cart.
   */
  readonly frequentlyBoughtTogether: ProductRecommendationConnection;
  readonly handle: Scalars['String']['output'];
  /** Globally unique Product ID. */
  readonly id: Scalars['ID']['output'];
  /**
   * Loyalty values ready for rendering on a product card or product page.
   *
   * Purchase values use a quantity of one and span the currently purchasable
   * variants. The server batches resolution across products in a listing. Null
   * means that the store has no active customer-visible loyalty presentation.
   */
  readonly loyalty?: Maybe<ProductLoyaltyPresentation>;
  readonly media: ProductMediaConnection;
  readonly options: ReadonlyArray<ProductOption>;
  readonly priceRange?: Maybe<ProductPriceRange>;
  readonly primaryCategory?: Maybe<Category>;
  readonly publishedAt: Scalars['DateTime']['output'];
  /** Published question and answer aggregates for this product. */
  readonly questionSummary: ProductQuestionSummary;
  /** Published questions for this product. */
  readonly questions: ProductQuestionConnection;
  /**
   * Merchant-curated and automatically ranked products related to this product.
   *
   * Results come from the currently published PRODUCT_RELATED ranking snapshot.
   * The connection is already ordered for presentation, so clients should render
   * the returned order unchanged. An empty connection is a valid, cacheable
   * result and does not trigger a synchronous recommendation calculation.
   */
  readonly relatedProducts: ProductRecommendationConnection;
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
export type ProductFrequentlyBoughtTogetherArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
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
export type ProductRelatedProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
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

/**
 * A fully prepared comparison of concrete variants from one product category.
 *
 * Catalog validates publication, ownership and effective-profile compatibility,
 * then resolves product features, selected variant options, prices, availability,
 * media and localized values. The storefront renders the returned matrix without
 * grouping products or aligning cells itself.
 */
export type ProductComparison = {
  readonly __typename: 'ProductComparison';
  /** Current storefront category used to group the selected variants. */
  readonly category: Category;
  /**
   * Resolved variant columns in deterministic server-defined order.
   *
   * The connection contains row groups prepared for exactly the returned page.
   * Every row contains one cell per connection node in the same order.
   */
  readonly columns: ProductComparisonColumnConnection;
  /** Stable opaque key derived from the comparison context and category. */
  readonly key: Scalars['String']['output'];
  /** Localized comparison title, when configured by the merchant. */
  readonly title?: Maybe<Scalars['String']['output']>;
};


/**
 * A fully prepared comparison of concrete variants from one product category.
 *
 * Catalog validates publication, ownership and effective-profile compatibility,
 * then resolves product features, selected variant options, prices, availability,
 * media and localized values. The storefront renders the returned matrix without
 * grouping products or aligning cells itself.
 */
export type ProductComparisonColumnsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * One matrix cell backed by an original Catalog source.
 *
 * For VALUE, exactly one of feature or selectedOption is returned. The feature
 * contains its original values; selectedOption is the same option/value pair
 * exposed by ProductVariant.selectedOptions.
 */
export type ProductComparisonCell = {
  readonly __typename: 'ProductComparisonCell';
  readonly feature?: Maybe<ProductFeature>;
  readonly selectedOption?: Maybe<SelectedOption>;
  readonly status: ProductComparisonCellStatus;
};

/** Semantic state of a prepared comparison cell. */
export type ProductComparisonCellStatus =
  /** The property applies, but this product or variant has no configured value. */
  | 'MISSING'
  /** The merchant explicitly marked the property as inapplicable. */
  | 'NOT_APPLICABLE'
  /** A contextual source could not currently resolve the property. */
  | 'UNAVAILABLE'
  /** A product feature or selected variant option was resolved. */
  | 'VALUE';

/** One concrete variant column in the comparison matrix. */
export type ProductComparisonColumn = {
  readonly __typename: 'ProductComparisonColumn';
  /** Whether the concrete variant can currently be purchased. */
  readonly availableForSale: Scalars['Boolean']['output'];
  /** Current compare-at price of the concrete variant, when applicable. */
  readonly compareAtPrice?: Maybe<Money>;
  /**
   * Media selected by Catalog for the comparison header.
   *
   * ProductVariant media takes precedence over product media.
   */
  readonly featuredMedia?: Maybe<Media>;
  /** Stable column key derived from variant.id. */
  readonly key: Scalars['String']['output'];
  /** Zero-based position in the complete comparison. */
  readonly position: Scalars['Int']['output'];
  /** Current price of the concrete variant in the storefront currency. */
  readonly price?: Maybe<Money>;
  readonly product: Product;
  /**
   * Whether this exact variant is persisted in the authenticated customer's
   * comparison selection. Always false when no authenticated customer exists.
   */
  readonly savedForComparison: Scalars['Boolean']['output'];
  /** Concrete storefront variant represented by this comparison column. */
  readonly variant: ProductVariant;
};

/** Relay connection containing one page of comparison columns. */
export type ProductComparisonColumnConnection = Connection & {
  readonly __typename: 'ProductComparisonColumnConnection';
  readonly edges: ReadonlyArray<ProductComparisonColumnEdge>;
  /**
   * Localized row groups prepared for exactly the variants in nodes.
   *
   * Every row contains one cell per node in the same deterministic order.
   */
  readonly groups: ReadonlyArray<ProductComparisonGroup>;
  readonly nodes: ReadonlyArray<ProductComparisonColumn>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** A comparison column and its opaque position in the complete comparison. */
export type ProductComparisonColumnEdge = {
  readonly __typename: 'ProductComparisonColumnEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node: ProductComparisonColumn;
};

/** A localized section of prepared comparison rows. */
export type ProductComparisonGroup = {
  readonly __typename: 'ProductComparisonGroup';
  /** Opaque stable key suitable for storefront rendering. */
  readonly key: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
  /** Prepared rows in merchant-defined display order. */
  readonly rows: ReadonlyArray<ProductComparisonRow>;
};

/**
 * One presentation-ready property row across the current column page.
 *
 * Rows may be sourced from product-level features or from selected variant
 * options such as size, color and package. Cells expose those Catalog objects
 * directly without creating a normalized comparison value.
 */
export type ProductComparisonRow = {
  readonly __typename: 'ProductComparisonRow';
  /**
   * Prepared cells in exactly the same order as the containing column
   * connection's nodes.
   */
  readonly cells: ReadonlyArray<ProductComparisonCell>;
  readonly description?: Maybe<Scalars['String']['output']>;
  /** Opaque stable key suitable for storefront rendering. */
  readonly key: Scalars['String']['output'];
  readonly name: Scalars['String']['output'];
};

/**
 * A presentation-ready component configuration for one product variant.
 *
 * Catalog has already applied visibility, required-state, selection, and price
 * dependency rules. Storefront clients must render this projection instead of
 * interpreting component rules themselves.
 */
export type ProductComponentConfiguration = {
  readonly __typename: 'ProductComponentConfiguration';
  /** Sum of totalPrice for all selected component items. */
  readonly componentsSubtotal: Money;
  /** The presentation selected by the merchant for this configurator. */
  readonly displayStyle: ProductComponentDisplayStyle;
  /**
   * Effective groups in display order. Groups hidden by backend rules, including
   * groups without any effective visible items, are omitted.
   */
  readonly groups: ReadonlyArray<ProductComponentGroup>;
  readonly id: Scalars['ID']['output'];
  /**
   * Price of one configured parent variant including all selected components.
   * Discounts, shipping, and taxes are applied later by checkout.
   */
  readonly totalPrice: Money;
};

/** How the resolved component configurator should be presented. */
export type ProductComponentDisplayStyle =
  | 'ACCORDION'
  | 'FLAT'
  | 'TABS'
  | 'WIZARD';

/** A presentation-ready component group after backend rule evaluation. */
export type ProductComponentGroup = {
  readonly __typename: 'ProductComponentGroup';
  readonly id: Scalars['ID']['output'];
  /**
   * Effective visible items in display order. Hidden items are omitted rather
   * than returned for the storefront to evaluate.
   */
  readonly items: ReadonlyArray<ProductComponentItem>;
  /** Effective maximum number of selected items. */
  readonly maxSelection?: Maybe<Scalars['Int']['output']>;
  /** Effective minimum number of selected items. */
  readonly minSelection?: Maybe<Scalars['Int']['output']>;
  /** Whether the effective group state requires at least one selection. */
  readonly required: Scalars['Boolean']['output'];
  /** Localized display title resolved by Catalog. */
  readonly title: Scalars['String']['output'];
};

/**
 * A presentation-ready component item with a concrete merchandise variant and
 * prices already calculated in the active storefront currency.
 */
export type ProductComponentItem = {
  readonly __typename: 'ProductComponentItem';
  /** Whether the resolved merchandise variant can currently be purchased. */
  readonly availableForSale: Scalars['Boolean']['output'];
  /** Effective media after applying the item override and merchandise fallback. */
  readonly featuredMedia?: Maybe<Media>;
  readonly id: Scalars['ID']['output'];
  /** Effective maximum quantity, or null when no maximum is configured. */
  readonly maxQuantity?: Maybe<Scalars['Int']['output']>;
  /** Effective minimum quantity when the item is selected. */
  readonly minQuantity: Scalars['Int']['output'];
  /** Referenced published product. */
  readonly product: Product;
  /** Resolved quantity. Zero means the item is not selected. */
  readonly quantity: Scalars['Int']['output'];
  /** Whether backend dependency rules require this item. */
  readonly required: Scalars['Boolean']['output'];
  /** Whether this item is selected in the resolved state. */
  readonly selected: Scalars['Boolean']['output'];
  /**
   * Localized display title. Catalog applies the component title override first,
   * then falls back to the resolved variant or product title.
   */
  readonly title: Scalars['String']['output'];
  /** Final unitPrice multiplied by quantity. */
  readonly totalPrice: Money;
  /**
   * Final price for one item unit after all component price rules have been
   * evaluated in the active storefront currency.
   */
  readonly unitPrice: Money;
  /**
   * Concrete published variant resolved for this state. A product-backed item
   * uses the selected allowed variant or a backend-selected default.
   */
  readonly variant: ProductVariant;
};

/**
 * One item selected in a product component configuration.
 *
 * The list supplied to ProductVariant.componentConfiguration is the complete
 * selection state. For an item that references a product, variantId identifies
 * the concrete allowed variant selected by the buyer. For an item that already
 * references a concrete variant, variantId may be omitted.
 */
export type ProductComponentSelectionInput = {
  readonly itemId: Scalars['ID']['input'];
  readonly quantity: Scalars['Int']['input'];
  readonly variantId?: InputMaybe<Scalars['ID']['input']>;
};

/** A Relay connection containing products from one canonical listing request. */
export type ProductConnection = Connection & {
  readonly __typename: 'ProductConnection';
  /**
   * Sorts valid for this context. MANUAL is available for categories and manual
   * collections. RELEVANCE is returned only when a non-empty query is active.
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
  /**
   * Page boundaries and availability of adjacent pages. Use the returned cursors with the pagination
   * arguments.
   */
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
  readonly featured: Scalars['Boolean']['output'];
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
  readonly featured: Scalars['Boolean']['output'];
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

/**
 * Complete loyalty presentation for one product or variant in the current
 * storefront viewer context.
 *
 * An empty opportunities list means that nothing should be shown. The storefront
 * must not infer hidden or ineligible rules from the empty result.
 */
export type ProductLoyaltyPresentation = {
  readonly __typename: 'ProductLoyaltyPresentation';
  /** Server-ranked non-purchase rewards such as a verified-review reward. */
  readonly engagementOpportunities: ReadonlyArray<LoyaltyOpportunity>;
  /** When this complete presentation snapshot was calculated. */
  readonly evaluatedAt: Scalars['DateTime']['output'];
  /**
   * The single opportunity selected by server-side priority for compact surfaces.
   *
   * Null means that the product card should not render a loyalty badge. The client
   * must not select or rank another opportunity itself.
   */
  readonly primaryOpportunity?: Maybe<LoyaltyOpportunity>;
  /** Server-ranked purchase rewards applicable to this product or variant. */
  readonly purchaseOpportunities: ReadonlyArray<LoyaltyOpportunity>;
  /**
   * The purchase opportunity selected by the server for a standard product-price
   * or add-to-cart surface. Null means no purchase reward should be displayed.
   */
  readonly purchaseOpportunity?: Maybe<LoyaltyOpportunity>;
  /**
   * The review opportunity selected by the server for the product review surface.
   * Null means no review reward should be displayed.
   */
  readonly reviewOpportunity?: Maybe<LoyaltyOpportunity>;
  /** Opaque revision suitable for response caching and diagnostics. */
  readonly revision: Scalars['String']['output'];
  /**
   * Earliest time at which a schedule, price, customer state, usage limit, or
   * program version can invalidate this snapshot. Null means no known time-based
   * invalidation; normal server cache policy still applies.
   */
  readonly validUntil?: Maybe<Scalars['DateTime']['output']>;
};

/** A Relay connection to the media registered on a product. */
export type ProductMediaConnection = Connection & {
  readonly __typename: 'ProductMediaConnection';
  readonly edges: ReadonlyArray<ProductMediaEdge>;
  readonly nodes: ReadonlyArray<Maybe<Media>>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item registered on a product. */
export type ProductMediaEdge = {
  readonly __typename: 'ProductMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node?: Maybe<Media>;
};

/** A configurable product dimension such as size, color, or material. */
export type ProductOption = Node & {
  readonly __typename: 'ProductOption';
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
  readonly optionValues: ReadonlyArray<ProductOptionValue>;
  readonly position: Scalars['Int']['output'];
  readonly type?: Maybe<ProductOptionType>;
};

/** The visual representation used for an option value. */
export type ProductOptionSwatchType =
  | 'COLOR'
  | 'GRADIENT'
  | 'IMAGE';

/** A reusable product option type. */
export type ProductOptionType = Node & {
  readonly __typename: 'ProductOptionType';
  readonly handle: Scalars['String']['output'];
  readonly id: Scalars['ID']['output'];
  readonly name: Scalars['String']['output'];
};

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

/**
 * One ranked recommendation and the public provenance needed by storefront
 * presentation and analytics. Internal scores and ranking features are not part
 * of the storefront contract.
 */
export type ProductRecommendation = {
  readonly __typename: 'ProductRecommendation';
  /** Current federated Product presentation resolved by Catalog. */
  readonly product: Product;
  /** Primary source that contributed this recommendation. */
  readonly source: ProductRecommendationSource;
};

/**
 * A forward-only Relay connection over one immutable recommendation snapshot.
 *
 * The cursor pins the snapshot generation, so pagination never combines ranks
 * from two different recommendation builds. Products that are no longer
 * storefront-eligible are omitted at read time without changing the snapshot.
 */
export type ProductRecommendationConnection = Connection & {
  readonly __typename: 'ProductRecommendationConnection';
  /** Recommendation edges in their published display order. */
  readonly edges: ReadonlyArray<ProductRecommendationEdge>;
  /** Recommendations contained in the returned edges. */
  readonly nodes: ReadonlyArray<ProductRecommendation>;
  /** Whether another page is available and the cursor to pass as after when requesting it. */
  readonly pageInfo: PageInfo;
  /** Number of currently storefront-eligible items in the resolved snapshot. */
  readonly totalCount: Scalars['Int']['output'];
};

export type ProductRecommendationEdge = {
  readonly __typename: 'ProductRecommendationEdge';
  /** Opaque cursor tied to the snapshot generation and published rank. */
  readonly cursor: Scalars['Cursor']['output'];
  /** The recommendation at the end of the edge. */
  readonly node: ProductRecommendation;
};

export type ProductRecommendationSource =
  /** Similarity calculated from product content or taxonomy. */
  | 'CONTENT_SIMILARITY'
  /** Configured cold-start fallback source. */
  | 'FALLBACK'
  /** Association calculated from confirmed sales. */
  | 'FREQUENTLY_BOUGHT_TOGETHER'
  /** Explicit merchant recommendation. */
  | 'MANUAL'
  /** Store or category popularity signal. */
  | 'POPULARITY';

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
  /**
   * Loyalty values ready for rendering for this variant at quantity one. Null
   * means that the store has no active customer-visible loyalty presentation.
   */
  readonly loyalty?: Maybe<ProductLoyaltyPresentation>;
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
  readonly nodes: ReadonlyArray<Maybe<Media>>;
  readonly pageInfo: PageInfo;
  readonly totalCount: Scalars['Int']['output'];
};

/** An ordered media item selected for a particular product variant. */
export type ProductVariantMediaEdge = {
  readonly __typename: 'ProductVariantMediaEdge';
  readonly cursor: Scalars['Cursor']['output'];
  readonly node?: Maybe<Media>;
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
  /** Returns a checkout by its ID. */
  readonly checkout?: Maybe<Checkout>;
  /**
   * Countries the store delivers to, each with the address form used there. The list comes
   * from the active delivery zones; a rest-of-world zone adds every other country. Country
   * names are localized for `localeCode` (a BCP 47 tag; English when missing or invalid).
   */
  readonly checkoutDeliveryCountries: ReadonlyArray<CheckoutDeliveryCountry>;
  /**
   * Returns the latest durable result of a checkout placement.
   *
   * This query is suitable for restoring state after a payment-provider redirect
   * and for polling asynchronous payment completion. With `token` the placement is
   * read by its access token alone, from any browser or device and without
   * checkout read access; such a read never returns the customer action. Without
   * `token` only the visitor or signed-in customer who placed it reads it. An
   * inaccessible placement is returned as null.
   */
  readonly checkoutPlacement?: Maybe<PlaceOrderPayload>;
  /** Checkout settings of the current store. */
  readonly checkoutSettings: CheckoutSettings;
  /** Returns a visible collection by its globally unique Relay ID. */
  readonly collection?: Maybe<Collection>;
  /** Returns a visible collection by its stable storefront handle. */
  readonly collectionByHandle?: Maybe<Collection>;
  /**
   * Returns the customer associated with the authenticated storefront session.
   * Identity and store ownership are resolved only from trusted request context.
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
  /**
   * Searches streets of a settlement by name (carrier `searchSettlementStreets`). The carrier
   * returns one page of up to `limit` streets and has no page parameter.
   */
  readonly novaPoshtaSettlementStreets: NovaPoshtaSettlementStreetPage;
  /**
   * Searches Nova Poshta settlements by name or postal code (carrier `searchSettlements`).
   * Read from the carrier on every request; does not depend on a checkout.
   */
  readonly novaPoshtaSettlements: NovaPoshtaSettlementPage;
  /**
   * Lists Nova Poshta branches and postomats (carrier `getWarehouses`). Every carrier parameter
   * is available; only the given ones are passed, and no filter is required. Every row of the page
   * is returned, with `selectable` telling whether the point can be chosen.
   */
  readonly novaPoshtaWarehouses: NovaPoshtaWarehousePage;
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
export type QueryCheckoutDeliveryCountriesArgs = {
  localeCode?: InputMaybe<Scalars['String']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCheckoutPlacementArgs = {
  id: Scalars['ID']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCollectionArgs = {
  id: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryCollectionByHandleArgs = {
  handle: Scalars['String']['input'];
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
export type QueryNovaPoshtaSettlementStreetsArgs = {
  limit?: Scalars['Int']['input'];
  query: Scalars['String']['input'];
  settlementRef: Scalars['ID']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryNovaPoshtaSettlementsArgs = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  query: Scalars['String']['input'];
};


/** Public Catalog entry points for the active storefront context. */
export type QueryNovaPoshtaWarehousesArgs = {
  bicycleParking?: InputMaybe<Scalars['Boolean']['input']>;
  cityName?: InputMaybe<Scalars['String']['input']>;
  cityRef?: InputMaybe<Scalars['ID']['input']>;
  language?: InputMaybe<NovaPoshtaLanguage>;
  limit?: Scalars['Int']['input'];
  number?: InputMaybe<Scalars['String']['input']>;
  page?: Scalars['Int']['input'];
  posTerminal?: InputMaybe<Scalars['Boolean']['input']>;
  postFinance?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
  ref?: InputMaybe<Scalars['ID']['input']>;
  settlementRef?: InputMaybe<Scalars['ID']['input']>;
  typeRef?: InputMaybe<Scalars['ID']['input']>;
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

/** Input used to delete content owned by the current customer. */
export type ReviewContentDeleteInput = {
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
  readonly media?: Maybe<Media>;
  readonly review: Review;
  readonly revision: Scalars['Int']['output'];
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

/** Represents a generic error in the input of a mutation. */
export type UserError = DisplayableError & {
  readonly __typename: 'UserError';
  readonly field?: Maybe<ReadonlyArray<Scalars['String']['output']>>;
  readonly message: Scalars['String']['output'];
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
  readonly previewImage?: Maybe<Image>;
  readonly sources: ReadonlyArray<VideoSource>;
};

/** A source for a hosted video. */
export type VideoSource = {
  readonly __typename: 'VideoSource';
  readonly format: Scalars['String']['output'];
  readonly height?: Maybe<Scalars['Int']['output']>;
  readonly mimeType?: Maybe<Scalars['String']['output']>;
  readonly url: Scalars['URL']['output'];
  readonly width?: Maybe<Scalars['Int']['output']>;
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

/** Values used to create a customer wishlist. */
export type WishlistCreateInput = {
  /** Makes retries return the original result instead of creating a duplicate. */
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * Customer-visible wishlist name.
   *
   * Surrounding whitespace is removed before storage. The resulting value must
   * contain between 1 and 128 Unicode characters. Names are unique for the
   * authenticated customer after Unicode NFKC normalization and
   * locale-independent lowercase conversion.
   */
  readonly name: Scalars['String']['input'];
};

/** Result of creating a customer wishlist. */
export type WishlistCreatePayload = {
  readonly __typename: 'WishlistCreatePayload';
  /** Validation, ownership, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
  /** The created wishlist, or null when creation failed. */
  readonly wishlist?: Maybe<CustomerWishlist>;
};

export type WishlistDeleteInput = {
  readonly id: Scalars['ID']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
};

/** Result of deleting a non-default customer wishlist. */
export type WishlistDeletePayload = {
  readonly __typename: 'WishlistDeletePayload';
  /** Global ID of the deleted wishlist, or null when nothing was deleted. */
  readonly deletedWishlistId?: Maybe<Scalars['ID']['output']>;
  /** Validation, ownership, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

export type WishlistProductAddInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  readonly productId: Scalars['ID']['input'];
  readonly wishlistId?: InputMaybe<Scalars['ID']['input']>;
};

/** Result of adding a published product to a customer wishlist. */
export type WishlistProductAddPayload = {
  readonly __typename: 'WishlistProductAddPayload';
  /**
   * Validation, ownership, Catalog availability, and business errors produced by
   * the operation.
   */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
  /**
   * The created or previously existing wishlist item, or null when the operation
   * failed.
   */
  readonly wishlistItem?: Maybe<CustomerWishlistItem>;
};

export type WishlistProductRemoveInput = {
  readonly idempotencyKey: Scalars['String']['input'];
  readonly itemId: Scalars['ID']['input'];
};

/** Result of removing a product item from a customer wishlist. */
export type WishlistProductRemovePayload = {
  readonly __typename: 'WishlistProductRemovePayload';
  /** Global ID of the removed item, or null when nothing was removed. */
  readonly deletedWishlistItemId?: Maybe<Scalars['ID']['output']>;
  /** Validation, ownership, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
};

/** Values used to rename a customer wishlist. */
export type WishlistUpdateInput = {
  /** Global ID of the wishlist to rename. */
  readonly id: Scalars['ID']['input'];
  readonly idempotencyKey: Scalars['String']['input'];
  /**
   * New customer-visible wishlist name.
   *
   * Surrounding whitespace is removed before storage. The resulting value must
   * contain between 1 and 128 Unicode characters. Names are unique for the
   * authenticated customer after Unicode NFKC normalization and
   * locale-independent lowercase conversion.
   */
  readonly name: Scalars['String']['input'];
};

/** Result of renaming a customer wishlist. */
export type WishlistUpdatePayload = {
  readonly __typename: 'WishlistUpdatePayload';
  /** Validation, ownership, and business errors produced by the operation. */
  readonly userErrors: ReadonlyArray<CustomerUserError>;
  /** The updated wishlist, or null when the update failed. */
  readonly wishlist?: Maybe<CustomerWishlist>;
};

export type Join__Graph =
  | 'APPS_HEADLESS_STOREFRONT'
  | 'APPS_NOVA_POSHTA_STOREFRONT'
  | 'APPS_ONLINE_STORE_STOREFRONT'
  | 'CATALOG_STOREFRONT'
  | 'CHECKOUT_STOREFRONT'
  | 'CUSTOMERS_STOREFRONT'
  | 'LISTING_STOREFRONT'
  | 'LOYALTY_STOREFRONT'
  | 'MEDIA_STOREFRONT'
  | 'ORDERS_STOREFRONT'
  | 'PROJECT_STOREFRONT'
  | 'REVIEWS_STOREFRONT';

export type Link__Purpose =
  /** `EXECUTION` features provide metadata necessary for operation execution. */
  | 'EXECUTION'
  /** `SECURITY` features provide metadata necessary to securely resolve fields. */
  | 'SECURITY';

export type StorefrontPlaceOrderPayloadFragment = { readonly __typename: 'PlaceOrderPayload', readonly placementId?: string | null, readonly placementToken?: string | null, readonly placementState?: CheckoutPlacementState | null, readonly checkoutId?: string | null, readonly resultRevision?: string | null, readonly orderId?: string | null, readonly orderNumber?: string | null, readonly status?: PlaceOrderStatus | null, readonly paymentFlow?: PaymentFlow | null, readonly paymentCollectionId?: string | null, readonly paymentSessionId?: string | null, readonly paymentOperationId?: string | null, readonly customerAction?: { readonly __typename: 'PlaceOrderCustomerAction', readonly type: PlaceOrderCustomerActionType, readonly url?: string | null, readonly title?: string | null, readonly instructions?: string | null, readonly expiresAt?: string | null, readonly sdk?: string | null, readonly params?: object | null, readonly data?: object | null } | null, readonly paymentFailure?: { readonly __typename: 'PlaceOrderPaymentFailure', readonly category: PlaceOrderPaymentFailureCategory, readonly code: string, readonly message: string, readonly retryable: boolean, readonly providerCode?: string | null } | null, readonly userErrors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> };

export type StorefrontAddDeliveryAddressesMutationVariables = Exact<{
  input: CheckoutDeliveryAddressesAddInput;
}>;


export type StorefrontAddDeliveryAddressesMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryAddressesAdd: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontAddDeliveryRecipientsMutationVariables = Exact<{
  input: CheckoutDeliveryRecipientsAddInput;
}>;


export type StorefrontAddDeliveryRecipientsMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryRecipientsAdd: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontAddPromoCodeMutationVariables = Exact<{
  input: CheckoutPromoCodeAddInput;
}>;


export type StorefrontAddPromoCodeMutation = { readonly __typename: 'Mutation', readonly checkoutPromoCodeAdd: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontRemoveDeliveryAddressesMutationVariables = Exact<{
  input: CheckoutDeliveryAddressesRemoveInput;
}>;


export type StorefrontRemoveDeliveryAddressesMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryAddressesRemove: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontRemoveDeliveryRecipientsMutationVariables = Exact<{
  input: CheckoutDeliveryRecipientsRemoveInput;
}>;


export type StorefrontRemoveDeliveryRecipientsMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryRecipientsRemove: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontRemoveLoyaltyRedemptionMutationVariables = Exact<{
  input: CheckoutLoyaltyRedemptionRemoveInput;
}>;


export type StorefrontRemoveLoyaltyRedemptionMutation = { readonly __typename: 'Mutation', readonly checkoutLoyaltyRedemptionRemove: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontRemovePromoCodeMutationVariables = Exact<{
  input: CheckoutPromoCodeRemoveInput;
}>;


export type StorefrontRemovePromoCodeMutation = { readonly __typename: 'Mutation', readonly checkoutPromoCodeRemove: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontSelectDeliveryMethodMutationVariables = Exact<{
  input: CheckoutDeliveryMethodUpdateInput;
}>;


export type StorefrontSelectDeliveryMethodMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryMethodUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontSelectPaymentMethodMutationVariables = Exact<{
  input: CheckoutPaymentMethodUpdateInput;
}>;


export type StorefrontSelectPaymentMethodMutation = { readonly __typename: 'Mutation', readonly checkoutPaymentMethodUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontSubmitCheckoutMutationVariables = Exact<{
  input: PlaceOrderInput;
}>;


export type StorefrontSubmitCheckoutMutation = { readonly __typename: 'Mutation', readonly placeOrder: { readonly __typename: 'PlaceOrderPayload', readonly placementId?: string | null, readonly placementToken?: string | null, readonly placementState?: CheckoutPlacementState | null, readonly checkoutId?: string | null, readonly resultRevision?: string | null, readonly orderId?: string | null, readonly orderNumber?: string | null, readonly status?: PlaceOrderStatus | null, readonly paymentFlow?: PaymentFlow | null, readonly paymentCollectionId?: string | null, readonly paymentSessionId?: string | null, readonly paymentOperationId?: string | null, readonly customerAction?: { readonly __typename: 'PlaceOrderCustomerAction', readonly type: PlaceOrderCustomerActionType, readonly url?: string | null, readonly title?: string | null, readonly instructions?: string | null, readonly expiresAt?: string | null, readonly sdk?: string | null, readonly params?: object | null, readonly data?: object | null } | null, readonly paymentFailure?: { readonly __typename: 'PlaceOrderPaymentFailure', readonly category: PlaceOrderPaymentFailureCategory, readonly code: string, readonly message: string, readonly retryable: boolean, readonly providerCode?: string | null } | null, readonly userErrors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontUpdateCustomerIdentityMutationVariables = Exact<{
  input: CheckoutCustomerIdentityUpdateInput;
}>;


export type StorefrontUpdateCustomerIdentityMutation = { readonly __typename: 'Mutation', readonly checkoutCustomerIdentityUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontUpdateCustomerNoteMutationVariables = Exact<{
  input: CheckoutCustomerNoteUpdateInput;
}>;


export type StorefrontUpdateCustomerNoteMutation = { readonly __typename: 'Mutation', readonly checkoutCustomerNoteUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontUpdateDeliveryAddressesMutationVariables = Exact<{
  input: CheckoutDeliveryAddressesUpdateInput;
}>;


export type StorefrontUpdateDeliveryAddressesMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryAddressesUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontUpdateDeliveryRecipientsMutationVariables = Exact<{
  input: CheckoutDeliveryRecipientsUpdateInput;
}>;


export type StorefrontUpdateDeliveryRecipientsMutation = { readonly __typename: 'Mutation', readonly checkoutDeliveryRecipientsUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontUpdateLoyaltyRedemptionMutationVariables = Exact<{
  input: CheckoutLoyaltyRedemptionUpdateInput;
}>;


export type StorefrontUpdateLoyaltyRedemptionMutation = { readonly __typename: 'Mutation', readonly checkoutLoyaltyRedemptionUpdate: { readonly __typename: 'CheckoutMutationPayload', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null, readonly errors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } };

export type StorefrontCheckoutPlacementQueryVariables = Exact<{
  placementId: Scalars['ID']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
}>;


export type StorefrontCheckoutPlacementQuery = { readonly __typename: 'Query', readonly checkoutPlacement?: { readonly __typename: 'PlaceOrderPayload', readonly placementId?: string | null, readonly placementToken?: string | null, readonly placementState?: CheckoutPlacementState | null, readonly checkoutId?: string | null, readonly resultRevision?: string | null, readonly orderId?: string | null, readonly orderNumber?: string | null, readonly status?: PlaceOrderStatus | null, readonly paymentFlow?: PaymentFlow | null, readonly paymentCollectionId?: string | null, readonly paymentSessionId?: string | null, readonly paymentOperationId?: string | null, readonly customerAction?: { readonly __typename: 'PlaceOrderCustomerAction', readonly type: PlaceOrderCustomerActionType, readonly url?: string | null, readonly title?: string | null, readonly instructions?: string | null, readonly expiresAt?: string | null, readonly sdk?: string | null, readonly params?: object | null, readonly data?: object | null } | null, readonly paymentFailure?: { readonly __typename: 'PlaceOrderPaymentFailure', readonly category: PlaceOrderPaymentFailureCategory, readonly code: string, readonly message: string, readonly retryable: boolean, readonly providerCode?: string | null } | null, readonly userErrors: ReadonlyArray<{ readonly __typename: 'CheckoutUserError', readonly code: string, readonly field?: ReadonlyArray<string> | null, readonly message: string, readonly retryable: boolean }> } | null };

export type StorefrontDeliveryCountriesQueryVariables = Exact<{
  localeCode?: InputMaybe<Scalars['String']['input']>;
}>;


export type StorefrontDeliveryCountriesQuery = { readonly __typename: 'Query', readonly checkoutDeliveryCountries: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryCountry', readonly code: CountryCode, readonly name: string, readonly addressFormat: { readonly __typename: 'CheckoutAddressFormat', readonly rows: ReadonlyArray<ReadonlyArray<CheckoutAddressField>>, readonly required: ReadonlyArray<CheckoutAddressField>, readonly provinceLabel?: CheckoutProvinceLabel | null, readonly postalCodeLabel?: CheckoutPostalCodeLabel | null, readonly postalCodePattern?: string | null, readonly postalCodeExample?: string | null, readonly provinces: ReadonlyArray<{ readonly __typename: 'CheckoutAddressProvince', readonly code: string, readonly name: string }> } }> };

export type StorefrontLoadCheckoutQueryVariables = Exact<{
  checkoutId: Scalars['ID']['input'];
}>;


export type StorefrontLoadCheckoutQuery = { readonly __typename: 'Query', readonly checkout?: { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> } | null };

export type StorefrontLoyaltyAccountQueryVariables = Exact<{ [key: string]: never; }>;


export type StorefrontLoyaltyAccountQuery = { readonly __typename: 'Query', readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly loyaltyAccount?: { readonly __typename: 'LoyaltyAccount', readonly id: string, readonly status: LoyaltyAccountStatus, readonly balance: { readonly __typename: 'LoyaltyBalance', readonly availablePoints: string, readonly pendingPoints: string }, readonly tier?: { readonly __typename: 'LoyaltyTier', readonly code: string, readonly name: string, readonly earnMultiplierBps: number, readonly progress?: { readonly __typename: 'LoyaltyTierProgress', readonly nextTier: { readonly __typename: 'LoyaltyNextTier', readonly name: string }, readonly presentation: { readonly __typename: 'LoyaltyOpportunityCopy', readonly headline: string } } | null } | null, readonly upcomingExpirations: ReadonlyArray<{ readonly __typename: 'LoyaltyPointsExpiration', readonly points: string, readonly expiresAt: string }>, readonly storeCredit?: { readonly __typename: 'LoyaltyStoreCredit', readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly pendingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly upcomingExpirations: ReadonlyArray<{ readonly __typename: 'LoyaltyStoreCreditExpiration', readonly expiresAt: string, readonly amount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }> } | null, readonly redemptionSources: ReadonlyArray<{ readonly __typename: 'LoyaltyRedemptionSourceOption', readonly source: LoyaltyRedemptionSource, readonly availablePoints?: string | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly minimum: { readonly __typename: 'LoyaltyRedemptionBound', readonly points?: string | null, readonly amount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly maximumPerOrder?: { readonly __typename: 'LoyaltyRedemptionBound', readonly points?: string | null, readonly amount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null }>, readonly availableRewards: { readonly __typename: 'LoyaltyAvailableRewardConnection', readonly nodes: ReadonlyArray<{ readonly __typename: 'LoyaltyAvailableReward', readonly id: string, readonly discountCode?: string | null, readonly validUntil?: string | null, readonly presentation: { readonly __typename: 'LoyaltyOpportunityCopy', readonly headline: string, readonly description?: string | null }, readonly reward:
            | { readonly __typename: 'LoyaltyFreeProductRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyFreeShippingRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyMemberBenefitRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyMoneyRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyPercentageRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyPointsRewardPresentation', readonly kind: LoyaltyRewardKind }
            | { readonly __typename: 'LoyaltyVoucherRewardPresentation', readonly code?: string | null, readonly kind: LoyaltyRewardKind }
           }> } } | null } | null };

export type StorefrontPlacedOrderQueryVariables = Exact<{
  orderId: Scalars['ID']['input'];
}>;


export type StorefrontPlacedOrderQuery = { readonly __typename: 'Query', readonly order?: { readonly __typename: 'Order', readonly id: string, readonly number: string, readonly loyaltyRedemption?: { readonly __typename: 'OrderLoyaltyRedemption', readonly source: OrderLoyaltyRedemptionSource, readonly points?: string | null, readonly amount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltyEarning?: { readonly __typename: 'OrderLoyaltyEarning', readonly points: string, readonly status: OrderLoyaltyEarningStatus, readonly availableAt?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null } | null };

export type StorefrontCheckoutMoneyFragment = { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode };

export type StorefrontCheckoutLineFieldsFragment = { readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null };

export type StorefrontCheckoutDeliveryOptionFragment = { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } };

export type StorefrontCheckoutPaymentMethodFragment = { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow };

export type StorefrontCheckoutSelectionResetReasonFragment = { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string };

export type StorefrontUseCheckoutFragment = { readonly __typename: 'Checkout', readonly id: string, readonly channelCode: string, readonly localeCode: LocaleCode, readonly currencyCode: CurrencyCode, readonly resultRevision: string, readonly status: CheckoutLifecycleStatus, readonly guestCheckoutAllowed: boolean, readonly expiresAt: string, readonly valid: boolean, readonly createdAt: string, readonly updatedAt: string, readonly totalQuantity: number, readonly loyaltyRewardId?: string | null, readonly customerNote?: string | null, readonly issues: ReadonlyArray<{ readonly __typename: 'CheckoutIssue', readonly code: string, readonly message: string, readonly severity: CheckoutIssueSeverity, readonly effect: CheckoutIssueEffect, readonly field: ReadonlyArray<string>, readonly lineId?: string | null, readonly retryable: boolean }>, readonly cost: { readonly __typename: 'CheckoutCost', readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalDiscountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalShippingAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalTaxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly loyaltyAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly loyaltyRedemption?: { readonly __typename: 'CheckoutLoyaltyRedemption', readonly source: LoyaltyRedemptionSource, readonly requestedPoints?: string | null, readonly points?: string | null, readonly availablePoints?: string | null, readonly expiresAt: string, readonly requestedAmount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly availableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null, readonly loyaltySelection?: { readonly __typename: 'CheckoutLoyaltySelection', readonly source?: LoyaltyRedemptionSource | null, readonly points?: string | null, readonly rewardId?: string | null, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null } | null, readonly loyaltyEarning?: { readonly __typename: 'CheckoutLoyaltyEarning', readonly state: CheckoutLoyaltyEarningState, readonly points: string, readonly amount?: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } | null, readonly presentation: { readonly __typename: 'CheckoutLoyaltyEarningPresentation', readonly headline: string, readonly description?: string | null } } | null, readonly lines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly children: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string, readonly title: string, readonly sku?: string | null, readonly quantity: number, readonly purchasableId: string, readonly attributes: object, readonly componentItemId?: string | null, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly cost: { readonly __typename: 'CheckoutLineCost', readonly unitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly compareAtUnitPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly subtotalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly totalAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly discountAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly taxAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }, readonly originalPrice: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly priceConfig?: { readonly __typename: 'CheckoutLinePriceConfig', readonly type: ChildPriceType, readonly amount?: number | null, readonly percent?: number | null } | null, readonly image?: { readonly __typename: 'MediaImage', readonly id: string, readonly image: { readonly __typename: 'Image', readonly url: any } } | null, readonly purchasable: { readonly __typename: 'ProductVariant', readonly id: string, readonly handle: string, readonly sku?: string | null, readonly title: string, readonly product: { readonly __typename: 'Product', readonly id: string, readonly title: string, readonly handle: string } }, readonly purchase: { readonly __typename: 'CheckoutLinePurchase', readonly type: CheckoutLinePurchaseType }, readonly tag?: { readonly __typename: 'CheckoutTag', readonly id: string, readonly slug: string, readonly unique: boolean } | null }>, readonly promoCodes: ReadonlyArray<{ readonly __typename: 'CheckoutPromoCode', readonly code: string, readonly status: CheckoutPromoCodeStatus, readonly reason?: string | null, readonly message?: string | null, readonly appliedAt?: string | null, readonly discountType?: string | null, readonly value?: number | null, readonly provider?: string | null }>, readonly customerIdentity: { readonly __typename: 'CheckoutCustomerIdentity', readonly countryCode?: CountryCode | null, readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null, readonly customer?: { readonly __typename: 'Customer', readonly id: string, readonly displayName: string, readonly firstName?: string | null, readonly lastName?: string | null, readonly emailAddress?: { readonly __typename: 'CustomerEmailAddress', readonly emailAddress: string } | null } | null }, readonly deliveryGroups: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryGroup', readonly id: string, readonly replacesGroupIds: ReadonlyArray<string>, readonly checkoutLines: ReadonlyArray<{ readonly __typename: 'CheckoutLine', readonly id: string }>, readonly deliveryAddress?: { readonly __typename: 'CheckoutDeliveryAddress', readonly id?: string | null, readonly address1?: string | null, readonly address2?: string | null, readonly city?: string | null, readonly countryCode?: CountryCode | null, readonly data?: object | null, readonly postalCode?: string | null, readonly provinceCode?: string | null, readonly name: string, readonly phone?: string | null, readonly country?: string | null, readonly province?: string | null, readonly formatted: ReadonlyArray<string>, readonly formattedArea?: string | null } | null, readonly options: ReadonlyArray<{ readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } }>, readonly recipient?: { readonly __typename: 'CheckoutRecipient', readonly email?: string | null, readonly firstName?: string | null, readonly lastName?: string | null, readonly middleName?: string | null, readonly phone?: string | null } | null, readonly selection: { readonly __typename: 'CheckoutDeliveryOptionSelection', readonly status: CheckoutSelectionStatus, readonly previousOptionHandle?: string | null, readonly customerInput?: object | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly option?: { readonly __typename: 'CheckoutDeliveryOption', readonly handle: string, readonly code: string, readonly title: string, readonly description?: string | null, readonly deliveryMethodType: CheckoutDeliveryMethodType, readonly carrierCode?: string | null, readonly publicData: object, readonly paymentModel: CheckoutShippingPaymentModel, readonly estimatedMinDeliveryAt?: string | null, readonly estimatedMaxDeliveryAt?: string | null, readonly phoneRequired: boolean, readonly customerInputContract?: object | null, readonly cost: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode } } | null } }>, readonly payment: { readonly __typename: 'CheckoutPayment', readonly payableAmount: { readonly __typename: 'Money', readonly amount: string, readonly currencyCode: CurrencyCode }, readonly methods: ReadonlyArray<{ readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow }>, readonly selection: { readonly __typename: 'CheckoutPaymentMethodSelection', readonly status: CheckoutSelectionStatus, readonly previousMethodHandle?: string | null, readonly resetReason?: { readonly __typename: 'CheckoutSelectionResetReason', readonly code: string, readonly message: string } | null, readonly method?: { readonly __typename: 'CheckoutPaymentMethod', readonly handle: string, readonly code: string, readonly title: string, readonly providerCode: string, readonly flow: PaymentFlow } | null } }, readonly notifications: ReadonlyArray<{ readonly __typename: 'CheckoutNotification', readonly id: string, readonly code: CheckoutNotificationCode, readonly severity: NotificationSeverity, readonly isDismissed: boolean }> };

export type StorefrontNovaPoshtaSettlementFragment = { readonly __typename: 'NovaPoshtaSettlement', readonly ref: string, readonly cityRef: string, readonly name: string, readonly present: string, readonly area?: string | null, readonly region?: string | null, readonly settlementType?: string | null, readonly warehouseCount?: number | null, readonly addressDeliveryAllowed?: boolean | null };

export type StorefrontNovaPoshtaWarehouseFragment = { readonly __typename: 'NovaPoshtaWarehouse', readonly ref: string, readonly kind: NovaPoshtaPointKind, readonly number: string, readonly description: string, readonly shortAddress: string, readonly selectable: boolean, readonly settlementRef: string, readonly schedule: ReadonlyArray<{ readonly __typename: 'NovaPoshtaScheduleDay', readonly day: string, readonly hours: string }> };

export type StorefrontNovaPoshtaStreetFragment = { readonly __typename: 'NovaPoshtaSettlementStreet', readonly ref: string, readonly settlementRef: string, readonly name: string, readonly present: string, readonly streetType?: string | null };

export type StorefrontNovaPoshtaSettlementsQueryVariables = Exact<{
  query: Scalars['String']['input'];
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type StorefrontNovaPoshtaSettlementsQuery = { readonly __typename: 'Query', readonly novaPoshtaSettlements: { readonly __typename: 'NovaPoshtaSettlementPage', readonly hasNextPage: boolean, readonly items: ReadonlyArray<{ readonly __typename: 'NovaPoshtaSettlement', readonly ref: string, readonly cityRef: string, readonly name: string, readonly present: string, readonly area?: string | null, readonly region?: string | null, readonly settlementType?: string | null, readonly warehouseCount?: number | null, readonly addressDeliveryAllowed?: boolean | null }> } };

export type StorefrontNovaPoshtaWarehousesQueryVariables = Exact<{
  settlementRef: Scalars['ID']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
  page: Scalars['Int']['input'];
  limit: Scalars['Int']['input'];
}>;


export type StorefrontNovaPoshtaWarehousesQuery = { readonly __typename: 'Query', readonly novaPoshtaWarehouses: { readonly __typename: 'NovaPoshtaWarehousePage', readonly totalCount?: number | null, readonly page: number, readonly hasNextPage: boolean, readonly items: ReadonlyArray<{ readonly __typename: 'NovaPoshtaWarehouse', readonly ref: string, readonly kind: NovaPoshtaPointKind, readonly number: string, readonly description: string, readonly shortAddress: string, readonly selectable: boolean, readonly settlementRef: string, readonly schedule: ReadonlyArray<{ readonly __typename: 'NovaPoshtaScheduleDay', readonly day: string, readonly hours: string }> }> } };

export type StorefrontNovaPoshtaSettlementStreetsQueryVariables = Exact<{
  settlementRef: Scalars['ID']['input'];
  query: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
}>;


export type StorefrontNovaPoshtaSettlementStreetsQuery = { readonly __typename: 'Query', readonly novaPoshtaSettlementStreets: { readonly __typename: 'NovaPoshtaSettlementStreetPage', readonly items: ReadonlyArray<{ readonly __typename: 'NovaPoshtaSettlementStreet', readonly ref: string, readonly settlementRef: string, readonly name: string, readonly present: string, readonly streetType?: string | null }> } };

export type StorefrontNovaPoshtaWarehouseQueryVariables = Exact<{
  ref: Scalars['ID']['input'];
}>;


export type StorefrontNovaPoshtaWarehouseQuery = { readonly __typename: 'Query', readonly novaPoshtaWarehouses: { readonly __typename: 'NovaPoshtaWarehousePage', readonly items: ReadonlyArray<{ readonly __typename: 'NovaPoshtaWarehouse', readonly ref: string, readonly kind: NovaPoshtaPointKind, readonly number: string, readonly description: string, readonly shortAddress: string, readonly selectable: boolean, readonly settlementRef: string, readonly schedule: ReadonlyArray<{ readonly __typename: 'NovaPoshtaScheduleDay', readonly day: string, readonly hours: string }> }> } };

export const StorefrontPlaceOrderPayloadFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontPlaceOrderPayloadFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placementId"}},{"kind":"Field","name":{"kind":"Name","value":"placementToken"}},{"kind":"Field","name":{"kind":"Name","value":"placementState"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutId"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentFlow"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCollectionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentSessionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentOperationId"}},{"kind":"Field","name":{"kind":"Name","value":"customerAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"sdk"}},{"kind":"Field","name":{"kind":"Name","value":"params"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentFailure"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]} as unknown as DocumentNode<StorefrontPlaceOrderPayloadFragment, unknown>;
export const StorefrontCheckoutMoneyFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]} as unknown as DocumentNode<StorefrontCheckoutMoneyFragment, unknown>;
export const StorefrontCheckoutLineFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]} as unknown as DocumentNode<StorefrontCheckoutLineFieldsFragment, unknown>;
export const StorefrontCheckoutDeliveryOptionFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]} as unknown as DocumentNode<StorefrontCheckoutDeliveryOptionFragment, unknown>;
export const StorefrontCheckoutSelectionResetReasonFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]} as unknown as DocumentNode<StorefrontCheckoutSelectionResetReasonFragment, unknown>;
export const StorefrontCheckoutPaymentMethodFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}}]} as unknown as DocumentNode<StorefrontCheckoutPaymentMethodFragment, unknown>;
export const StorefrontUseCheckoutFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}}]} as unknown as DocumentNode<StorefrontUseCheckoutFragment, unknown>;
export const StorefrontNovaPoshtaSettlementFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaSettlement"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaSettlement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"cityRef"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"present"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"settlementType"}},{"kind":"Field","name":{"kind":"Name","value":"warehouseCount"}},{"kind":"Field","name":{"kind":"Name","value":"addressDeliveryAllowed"}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaSettlementFragment, unknown>;
export const StorefrontNovaPoshtaWarehouseFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaWarehouse"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortAddress"}},{"kind":"Field","name":{"kind":"Name","value":"selectable"}},{"kind":"Field","name":{"kind":"Name","value":"settlementRef"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}}]}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaWarehouseFragment, unknown>;
export const StorefrontNovaPoshtaStreetFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaStreet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaSettlementStreet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"settlementRef"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"present"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaStreetFragment, unknown>;
export const StorefrontAddDeliveryAddressesMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontAddDeliveryAddressesMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryAddressesAddInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryAddressesAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontAddDeliveryAddressesMutation, StorefrontAddDeliveryAddressesMutationVariables>;
export const StorefrontAddDeliveryRecipientsMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontAddDeliveryRecipientsMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryRecipientsAddInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryRecipientsAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontAddDeliveryRecipientsMutation, StorefrontAddDeliveryRecipientsMutationVariables>;
export const StorefrontAddPromoCodeMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontAddPromoCodeMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPromoCodeAddInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutPromoCodeAdd"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontAddPromoCodeMutation, StorefrontAddPromoCodeMutationVariables>;
export const StorefrontRemoveDeliveryAddressesMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontRemoveDeliveryAddressesMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryAddressesRemoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryAddressesRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontRemoveDeliveryAddressesMutation, StorefrontRemoveDeliveryAddressesMutationVariables>;
export const StorefrontRemoveDeliveryRecipientsMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontRemoveDeliveryRecipientsMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryRecipientsRemoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryRecipientsRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontRemoveDeliveryRecipientsMutation, StorefrontRemoveDeliveryRecipientsMutationVariables>;
export const StorefrontRemoveLoyaltyRedemptionMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontRemoveLoyaltyRedemptionMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLoyaltyRedemptionRemoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLoyaltyRedemptionRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontRemoveLoyaltyRedemptionMutation, StorefrontRemoveLoyaltyRedemptionMutationVariables>;
export const StorefrontRemovePromoCodeMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontRemovePromoCodeMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPromoCodeRemoveInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutPromoCodeRemove"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontRemovePromoCodeMutation, StorefrontRemovePromoCodeMutationVariables>;
export const StorefrontSelectDeliveryMethodMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontSelectDeliveryMethodMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryMethodUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryMethodUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontSelectDeliveryMethodMutation, StorefrontSelectDeliveryMethodMutationVariables>;
export const StorefrontSelectPaymentMethodMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontSelectPaymentMethodMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethodUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutPaymentMethodUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontSelectPaymentMethodMutation, StorefrontSelectPaymentMethodMutationVariables>;
export const StorefrontSubmitCheckoutMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontSubmitCheckoutMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontPlaceOrderPayloadFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontPlaceOrderPayloadFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placementId"}},{"kind":"Field","name":{"kind":"Name","value":"placementToken"}},{"kind":"Field","name":{"kind":"Name","value":"placementState"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutId"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentFlow"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCollectionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentSessionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentOperationId"}},{"kind":"Field","name":{"kind":"Name","value":"customerAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"sdk"}},{"kind":"Field","name":{"kind":"Name","value":"params"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentFailure"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]} as unknown as DocumentNode<StorefrontSubmitCheckoutMutation, StorefrontSubmitCheckoutMutationVariables>;
export const StorefrontUpdateCustomerIdentityMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontUpdateCustomerIdentityMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutCustomerIdentityUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutCustomerIdentityUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontUpdateCustomerIdentityMutation, StorefrontUpdateCustomerIdentityMutationVariables>;
export const StorefrontUpdateCustomerNoteMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontUpdateCustomerNoteMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutCustomerNoteUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutCustomerNoteUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontUpdateCustomerNoteMutation, StorefrontUpdateCustomerNoteMutationVariables>;
export const StorefrontUpdateDeliveryAddressesMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontUpdateDeliveryAddressesMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryAddressesUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryAddressesUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontUpdateDeliveryAddressesMutation, StorefrontUpdateDeliveryAddressesMutationVariables>;
export const StorefrontUpdateDeliveryRecipientsMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontUpdateDeliveryRecipientsMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryRecipientsUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryRecipientsUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontUpdateDeliveryRecipientsMutation, StorefrontUpdateDeliveryRecipientsMutationVariables>;
export const StorefrontUpdateLoyaltyRedemptionMutationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StorefrontUpdateLoyaltyRedemptionMutation"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLoyaltyRedemptionUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutLoyaltyRedemptionUpdate"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}},{"kind":"Field","alias":{"kind":"Name","value":"errors"},"name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontUpdateLoyaltyRedemptionMutation, StorefrontUpdateLoyaltyRedemptionMutationVariables>;
export const StorefrontCheckoutPlacementQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontCheckoutPlacementQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"placementId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutPlacement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"placementId"}}},{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontPlaceOrderPayloadFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontPlaceOrderPayloadFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderPayload"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placementId"}},{"kind":"Field","name":{"kind":"Name","value":"placementToken"}},{"kind":"Field","name":{"kind":"Name","value":"placementState"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutId"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"orderId"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentFlow"}},{"kind":"Field","name":{"kind":"Name","value":"paymentCollectionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentSessionId"}},{"kind":"Field","name":{"kind":"Name","value":"paymentOperationId"}},{"kind":"Field","name":{"kind":"Name","value":"customerAction"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"instructions"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"sdk"}},{"kind":"Field","name":{"kind":"Name","value":"params"}},{"kind":"Field","name":{"kind":"Name","value":"data"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentFailure"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"userErrors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}}]}}]} as unknown as DocumentNode<StorefrontCheckoutPlacementQuery, StorefrontCheckoutPlacementQueryVariables>;
export const StorefrontDeliveryCountriesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontDeliveryCountriesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"localeCode"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutDeliveryCountries"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"localeCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"localeCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"addressFormat"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rows"}},{"kind":"Field","name":{"kind":"Name","value":"required"}},{"kind":"Field","name":{"kind":"Name","value":"provinceLabel"}},{"kind":"Field","name":{"kind":"Name","value":"postalCodeLabel"}},{"kind":"Field","name":{"kind":"Name","value":"postalCodePattern"}},{"kind":"Field","name":{"kind":"Name","value":"postalCodeExample"}},{"kind":"Field","name":{"kind":"Name","value":"provinces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<StorefrontDeliveryCountriesQuery, StorefrontDeliveryCountriesQueryVariables>;
export const StorefrontLoadCheckoutQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontLoadCheckoutQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"checkoutId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutLine"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"compareAtUnitPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"taxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"originalPrice"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"priceConfig"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"percent"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"image"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"url"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasable"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductVariant"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"handle"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"purchasableId"}},{"kind":"Field","name":{"kind":"Name","value":"purchase"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}},{"kind":"Field","name":{"kind":"Name","value":"tag"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"unique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"componentItemId"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutDeliveryOption"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryMethodType"}},{"kind":"Field","name":{"kind":"Name","value":"carrierCode"}},{"kind":"Field","name":{"kind":"Name","value":"publicData"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paymentModel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMaxDeliveryAt"}},{"kind":"Field","name":{"kind":"Name","value":"phoneRequired"}},{"kind":"Field","name":{"kind":"Name","value":"customerInputContract"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutSelectionResetReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutPaymentMethod"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"handle"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"providerCode"}},{"kind":"Field","name":{"kind":"Name","value":"flow"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontUseCheckoutFragment"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Checkout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"channelCode"}},{"kind":"Field","name":{"kind":"Name","value":"localeCode"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}},{"kind":"Field","name":{"kind":"Name","value":"resultRevision"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"guestCheckoutAllowed"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"valid"}},{"kind":"Field","name":{"kind":"Name","value":"issues"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"effect"}},{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"lineId"}},{"kind":"Field","name":{"kind":"Name","value":"retryable"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"totalQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"cost"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalDiscountAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalShippingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalTaxAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"requestedPoints"}},{"kind":"Field","name":{"kind":"Name","value":"requestedAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"discount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRewardId"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltySelection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rewardId"}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutLineFields"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"promoCodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"discountType"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"provider"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerIdentity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"displayName"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"emailAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"emailAddress"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerNote"}},{"kind":"Field","name":{"kind":"Name","value":"deliveryGroups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"replacesGroupIds"}},{"kind":"Field","name":{"kind":"Name","value":"checkoutLines"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"deliveryAddress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"address1"}},{"kind":"Field","name":{"kind":"Name","value":"address2"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"countryCode"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"postalCode"}},{"kind":"Field","name":{"kind":"Name","value":"provinceCode"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"formatted"}},{"kind":"Field","name":{"kind":"Name","value":"formattedArea"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recipient"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"middleName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousOptionHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutDeliveryOption"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customerInput"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"payment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"methods"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}},{"kind":"Field","name":{"kind":"Name","value":"selection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"previousMethodHandle"}},{"kind":"Field","name":{"kind":"Name","value":"resetReason"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutSelectionResetReason"}}]}},{"kind":"Field","name":{"kind":"Name","value":"method"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutPaymentMethod"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"notifications"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"severity"}},{"kind":"Field","name":{"kind":"Name","value":"isDismissed"}}]}}]}}]} as unknown as DocumentNode<StorefrontLoadCheckoutQuery, StorefrontLoadCheckoutQueryVariables>;
export const StorefrontLoyaltyAccountQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontLoyaltyAccountQuery"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"balance"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"pendingPoints"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"earnMultiplierBps"}},{"kind":"Field","name":{"kind":"Name","value":"progress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nextTier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcomingExpirations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeCredit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pendingAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"upcomingExpirations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"redemptionSources"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"availablePoints"}},{"kind":"Field","name":{"kind":"Name","value":"availableAmount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"minimum"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"maximumPerOrder"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"availableRewards"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"discountCode"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}},{"kind":"Field","name":{"kind":"Name","value":"presentation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"headline"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reward"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LoyaltyVoucherRewardPresentation"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}}]}}]}}]}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]} as unknown as DocumentNode<StorefrontLoyaltyAccountQuery, StorefrontLoyaltyAccountQueryVariables>;
export const StorefrontPlacedOrderQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontPlacedOrderQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyRedemption"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"loyaltyEarning"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"points"}},{"kind":"Field","name":{"kind":"Name","value":"amount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontCheckoutMoney"}}]}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"availableAt"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontCheckoutMoney"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Money"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"currencyCode"}}]}}]} as unknown as DocumentNode<StorefrontPlacedOrderQuery, StorefrontPlacedOrderQueryVariables>;
export const StorefrontNovaPoshtaSettlementsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontNovaPoshtaSettlementsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"novaPoshtaSettlements"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontNovaPoshtaSettlement"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaSettlement"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaSettlement"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"cityRef"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"present"}},{"kind":"Field","name":{"kind":"Name","value":"area"}},{"kind":"Field","name":{"kind":"Name","value":"region"}},{"kind":"Field","name":{"kind":"Name","value":"settlementType"}},{"kind":"Field","name":{"kind":"Name","value":"warehouseCount"}},{"kind":"Field","name":{"kind":"Name","value":"addressDeliveryAllowed"}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaSettlementsQuery, StorefrontNovaPoshtaSettlementsQueryVariables>;
export const StorefrontNovaPoshtaWarehousesQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehousesQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settlementRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"novaPoshtaWarehouses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"settlementRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settlementRef"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouse"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaWarehouse"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortAddress"}},{"kind":"Field","name":{"kind":"Name","value":"selectable"}},{"kind":"Field","name":{"kind":"Name","value":"settlementRef"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}}]}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaWarehousesQuery, StorefrontNovaPoshtaWarehousesQueryVariables>;
export const StorefrontNovaPoshtaSettlementStreetsQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontNovaPoshtaSettlementStreetsQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"settlementRef"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"novaPoshtaSettlementStreets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"settlementRef"},"value":{"kind":"Variable","name":{"kind":"Name","value":"settlementRef"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontNovaPoshtaStreet"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaStreet"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaSettlementStreet"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"settlementRef"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"present"}},{"kind":"Field","name":{"kind":"Name","value":"streetType"}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaSettlementStreetsQuery, StorefrontNovaPoshtaSettlementStreetsQueryVariables>;
export const StorefrontNovaPoshtaWarehouseQueryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouseQuery"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ref"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"novaPoshtaWarehouses"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ref"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ref"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"IntValue","value":"1"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouse"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StorefrontNovaPoshtaWarehouse"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NovaPoshtaWarehouse"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ref"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"shortAddress"}},{"kind":"Field","name":{"kind":"Name","value":"selectable"}},{"kind":"Field","name":{"kind":"Name","value":"settlementRef"}},{"kind":"Field","name":{"kind":"Name","value":"schedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}}]}}]}}]} as unknown as DocumentNode<StorefrontNovaPoshtaWarehouseQuery, StorefrontNovaPoshtaWarehouseQueryVariables>;