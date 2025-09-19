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
  Cursor: { input: string; output: string; }
  DateTime: { input: string; output: string; }
  Decimal: { input: number; output: number; }
  Email: { input: string; output: string; }
  JSON: { input: object; output: object; }
  Phone: { input: string; output: string; }
  Uuid: { input: string; output: string; }
};

/** Input data for adding an item to an existing cart. */
export type ApiAddCartLineInput = {
  /** ID of the cart. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * ID of the product to add.
   * Error if the product is not found or already exists in the cart.
   */
  productId: Scalars['ID']['input'];
  /** Quantity to add; must be greater than 0. */
  quantity: Scalars['Int']['input'];
};

/** Payload returned after adding an item to the cart. */
export type ApiAddCartLinePayload = {
  __typename?: 'AddCartLinePayload';
  /** The updated cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

/**
 * A postal address.
 * Implements the Node interface.
 */
export type ApiAddress = ApiNode & {
  __typename?: 'Address';
  /** The first line of the street address (e.g., house number and street name). */
  addressLine1: Scalars['String']['output'];
  /** The second line of the street address (e.g., apartment, suite, unit). */
  addressLine2?: Maybe<Scalars['String']['output']>;
  /** City where the address is located. */
  city: Scalars['String']['output'];
  /** ISO 3166-1 alpha-2 country code (e.g., "US" for United States). */
  countryCode: CountryCode;
  /** Contact email for this address. */
  email?: Maybe<Scalars['String']['output']>;
  /** Recipient’s first name. */
  firstName?: Maybe<Scalars['String']['output']>;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Recipient’s last name. */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Latitude coordinate of the address location. */
  latitude?: Maybe<Scalars['Float']['output']>;
  /** Longitude coordinate of the address location. */
  longitude?: Maybe<Scalars['Float']['output']>;
  /** Arbitrary metadata as JSON (e.g., delivery instructions). */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Recipient’s middle name. */
  middleName?: Maybe<Scalars['String']['output']>;
  /** Contact phone number for this address. */
  phone?: Maybe<Scalars['String']['output']>;
  /** Postal or ZIP code. */
  postalCode?: Maybe<Scalars['String']['output']>;
  /** Province, state or region code (e.g., "CA" for California). */
  provinceCode?: Maybe<Scalars['String']['output']>;
};

/**
 * Input type for creating or updating an Address.
 * Maps to Go model portal/project/storage/address/dto.Input.
 */
export type ApiAddressInput = {
  /** The first line of the street address (e.g., house number and street name). */
  addressLine1: Scalars['String']['input'];
  /** The second line of the street address (e.g., apartment, suite, unit). */
  addressLine2?: InputMaybe<Scalars['String']['input']>;
  /** City where the address is located. */
  city: Scalars['String']['input'];
  /** ISO 3166-1 alpha-2 country code (e.g., "US" for United States). */
  countryCode: CountryCode;
  /** Contact email for this address. */
  email?: InputMaybe<Scalars['String']['input']>;
  /** Recipient’s first name. */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Recipient’s last name. */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Latitude coordinate of the address location. */
  latitude?: InputMaybe<Scalars['Float']['input']>;
  /** Longitude coordinate of the address location. */
  longitude?: InputMaybe<Scalars['Float']['input']>;
  /** Arbitrary metadata as JSON (e.g., delivery instructions). */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Recipient’s middle name. */
  middleName?: InputMaybe<Scalars['String']['input']>;
  /** Contact phone number for this address. */
  phone?: InputMaybe<Scalars['String']['input']>;
  /** Postal or ZIP code. */
  postalCode?: InputMaybe<Scalars['String']['input']>;
  /** Province, state or region code (e.g., "CA" for California). */
  provinceCode?: InputMaybe<Scalars['String']['input']>;
};

/** Information about an applied discount or promotion. */
export type ApiAppliedDiscount = {
  __typename?: 'AppliedDiscount';
  /** Amount by which the cost was reduced. */
  amount: ApiMoney;
  /** Coupon code used (if this is a coupon). */
  code?: Maybe<Scalars['String']['output']>;
  /** ID of the promotion or coupon in the system (if applicable). */
  id?: Maybe<Scalars['ID']['output']>;
};

/** A content article. */
export type ApiArticle = ApiNode & {
  __typename?: 'Article';
  /** The type of the article. */
  articleType: Scalars['String']['output'];
  /** The cover image for the article. */
  cover?: Maybe<ApiFile>;
  /** The date and time when the article was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The full description of the article. */
  description: Scalars['String']['output'];
  /** A short excerpt of the article. */
  excerpt: Scalars['String']['output'];
  /** Gallery of additional images with cursor-based pagination. */
  gallery: ApiGalleryConnection;
  /** Unique human-readable slug. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The article’s title. */
  title: Scalars['String']['output'];
  /** The date and time when the article was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A content article. */
export type ApiArticleGalleryArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Connection type for articles. */
export type ApiArticleConnection = {
  __typename?: 'ArticleConnection';
  /** List of article edges. */
  edges: Array<ApiArticleEdge>;
  /** Pagination details. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in the paginated list of articles. */
export type ApiArticleEdge = {
  __typename?: 'ArticleEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The article node. */
  node: ApiArticle;
};

export enum ArticleSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** A shopping cart with multiple items. */
export type ApiCart = ApiNode & {
  __typename?: 'Cart';
  /** List of all discounts applied at the cart level. */
  appliedDiscounts: Array<ApiAppliedDiscount>;
  /** Details of all tax components applied at the cart level. */
  appliedTaxLines: Array<ApiTaxLine>;
  /** Billing address, if provided. */
  billingAddress?: Maybe<ApiAddress>;
  /** All cost calculations for the cart. */
  cost: ApiCartCost;
  /** When this cart was first created. */
  createdAt: Scalars['DateTime']['output'];
  /** A globally-unique ID. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** List of items in the cart (paginated). */
  lines: ApiCartLineConnection;
  /** Notifications for the user regarding the cart. */
  notifications: Array<ApiCartNotification>;
  /** Shipping address, if provided. */
  shippingAddress?: Maybe<ApiAddress>;
  /** Shipping information including available and selected methods. */
  shippingDetails: ApiCartShippingDetails;
  /** Quantity of the item being purchased. */
  totalQuantity: Scalars['Int']['output'];
  /** When this cart was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A shopping cart with multiple items. */
export type ApiCartLinesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** All monetary calculations related to the cart. */
export type ApiCartCost = {
  __typename?: 'CartCost';
  /** Shipping cost including taxes (if selected). */
  shippingCost?: Maybe<ApiMoney>;
  /** Total value of items before any discounts. */
  subtotalAmount: ApiMoney;
  /** Final amount to be paid, including item cost, shipping, and taxes. */
  totalAmount: ApiMoney;
  /** Total discount from both item-level and cart-level promotions. */
  totalDiscountAmount: ApiMoney;
  /** Total tax amount applied to the cart. */
  totalTaxAmount: ApiMoney;
};

/** A single item in a shopping cart. */
export type ApiCartLine = ApiNode & {
  __typename?: 'CartLine';
  /** List of discounts applied specifically to this cart item. */
  appliedDiscounts: Array<ApiAppliedDiscount>;
  /** Details of all taxes applied to this cart item. */
  appliedTaxLines: Array<ApiTaxLine>;
  /** A list of components that make up this cart line, such as individual products in a bundle. */
  children: Array<Maybe<ApiCartLine>>;
  /** Cost calculations for this cart item. */
  cost: ApiCartLineCost;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The purchasable item added to the cart, such as a product or bundle. */
  purchasable: ApiPurchasable;
  /** Quantity of the item being purchased. */
  quantity: Scalars['Int']['output'];
};

/** A paginated list of CartLines. */
export type ApiCartLineConnection = {
  __typename?: 'CartLineConnection';
  /** List of CartLine edges. */
  edges: Array<ApiCartLineEdge>;
  /** Pagination information. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** Detailed breakdown of costs for a cart line item */
export type ApiCartLineCost = {
  __typename?: 'CartLineCost';
  /** The original list price per unit before any discounts. */
  compareAtUnitPrice: ApiMoney;
  /** Discount amount applied to a single unit. */
  discountAmount: ApiMoney;
  /** Total cost of all units before discounts. */
  subtotalAmount: ApiMoney;
  /** Total tax amount applied to the cart line. */
  taxAmount: ApiMoney;
  /** Final total cost for the cart line, including all discounts, taxes, and any additional fees. */
  totalAmount: ApiMoney;
  /** The current price per unit before discounts are applied (may differ from compareAt price if on sale). */
  unitPrice: ApiMoney;
};

/** An edge in a paginated list of CartLines. */
export type ApiCartLineEdge = {
  __typename?: 'CartLineEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The CartLine at this edge. */
  node: ApiCartLine;
};

/** Input data for a single item in the cart. */
export type ApiCartLineInput = {
  /** ID of the product to add or update. */
  productId: Scalars['ID']['input'];
  /** Quantity of the product in the cart. */
  quantity: Scalars['Int']['input'];
};

/** A non-blocking warning generated by cart operations. */
export type ApiCartNotification = {
  __typename?: 'CartNotification';
  /** Code categorizing the warning. */
  code: CartNotificationCode;
  /** A globally-unique ID. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Whether the warning has been acknowledged by the user. */
  isDismissed: Scalars['Boolean']['output'];
  /** Importance level of the warning. */
  severity: NotificationSeverity;
};

/**
 * Codes for warnings that may be returned with Cart mutations,
 * indicating non-blocking adjustments or issues in the cart.
 */
export enum CartNotificationCode {
  /** An item in the cart is no longer available for sale. */
  ItemUnavailable = 'ITEM_UNAVAILABLE',
  /**
   * The requested quantity exceeds available stock;
   * quantity was automatically reduced to the maximum available.
   */
  NotEnoughStock = 'NOT_ENOUGH_STOCK',
  /** The requested item is completely out of stock and has been removed from the cart. */
  OutOfStock = 'OUT_OF_STOCK',
  /** The price of one or more items has changed since they were added to the cart. */
  PriceChanged = 'PRICE_CHANGED'
}

/** Details about shipping methods at the cart level. */
export type ApiCartShippingDetails = {
  __typename?: 'CartShippingDetails';
  /** List of available shipping methods. */
  availableMethods: Array<ApiShippingMethod>;
  /** Estimated delivery date based on the selected shipping method. */
  estimatedDeliveryDate?: Maybe<Scalars['DateTime']['output']>;
  /** Currently selected shipping method, if any. */
  selectedMethod?: Maybe<ApiShippingMethod>;
};

export type ApiCategory = ApiNode & {
  __typename?: 'Category';
  /** Breadcrumbs from the root category to this category (inclusive). */
  breadcrumbs: Array<ApiCategory>;
  /** Child categories using Relay-style pagination. */
  children: ApiCategoryConnection;
  /** The cover image file for the category. */
  cover?: Maybe<ApiFile>;
  /** DateTime when the category was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The category description in the language specified by the Accept-Language header. */
  description: Scalars['String']['output'];
  /** A short excerpt of the category in the language specified by the Accept-Language header. */
  excerpt: Scalars['String']['output'];
  /** Gallery images using Relay-style pagination. */
  gallery: ApiGalleryConnection;
  /** A unique human-readable identifier for the category. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** A preview listing with filters, sorting, and pagination. */
  listing: ApiListingConnection;
  /** The listing mode for this category (SMART, STANDARD, CONTAINER). */
  listingType: ListingType;
  /** SEO description for the category page. */
  seoDescription?: Maybe<Scalars['String']['output']>;
  /** SEO title for the category page. */
  seoTitle?: Maybe<Scalars['String']['output']>;
  /** The category title in the language specified by the Accept-Language header. */
  title: Scalars['String']['output'];
  /** DateTime when the category was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};


export type ApiCategoryChildrenArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CategorySort>;
};


export type ApiCategoryGalleryArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type ApiCategoryListingArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<Array<ApiFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ListingSort>;
};

export type ApiCategoryConnection = {
  __typename?: 'CategoryConnection';
  /** List of category edges (each contains a node and a cursor). */
  edges: Array<ApiCategoryEdge>;
  /** Pagination metadata (hasNextPage, endCursor, etc.). */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

export type ApiCategoryEdge = {
  __typename?: 'CategoryEdge';
  /** Cursor for Relay-style pagination. */
  cursor: Scalars['Cursor']['output'];
  /** Node containing the category data. */
  node: ApiCategory;
};

export enum CategorySort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** Input data for placing an order (checkout). */
export type ApiCheckoutInput = {
  /** Billing address. */
  billingAddress: ApiAddressInput;
  /** Cart ID. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Customer contact details. */
  customerDetails: ApiOrderCustomerDetailsInput;
  /** Unique key for idempotency. */
  idempotencyKey: Scalars['String']['input'];
  /** Payment method ID. */
  paymentMethod: Scalars['ID']['input'];
  /** Shipping address. */
  shippingAddress: ApiAddressInput;
  /** Shipping method ID. */
  shippingMethod: Scalars['ID']['input'];
};

/** Payload returned after performing checkout (placing an order). */
export type ApiCheckoutPayload = {
  __typename?: 'CheckoutPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** The newly created order. */
  order?: Maybe<ApiOrder>;
};

/** Input data for clearing all items from a cart. */
export type ApiClearCartLinesInput = {
  /** ID of the cart to clear. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

/** Payload returned after clearing all items from the cart. */
export type ApiClearCartLinesPayload = {
  __typename?: 'ClearCartLinesPayload';
  /** The updated (now empty) cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

export enum CountryCode {
  /** Andorra */
  Ad = 'AD',
  /** United Arab Emirates */
  Ae = 'AE',
  /** Afghanistan */
  Af = 'AF',
  /** Antigua and Barbuda */
  Ag = 'AG',
  /** Albania */
  Al = 'AL',
  /** Armenia */
  Am = 'AM',
  /** Angola */
  Ao = 'AO',
  /** Argentina */
  Ar = 'AR',
  /** Austria */
  At = 'AT',
  /** Australia */
  Au = 'AU',
  /** Aruba */
  Aw = 'AW',
  /** Åland Islands */
  Ax = 'AX',
  /** Azerbaijan */
  Az = 'AZ',
  /** Bosnia and Herzegovina */
  Ba = 'BA',
  /** Barbados */
  Bb = 'BB',
  /** Bangladesh */
  Bd = 'BD',
  /** Belgium */
  Be = 'BE',
  /** Burkina Faso */
  Bf = 'BF',
  /** Bulgaria */
  Bg = 'BG',
  /** Bahrain */
  Bh = 'BH',
  /** Burundi */
  Bi = 'BI',
  /** Benin */
  Bj = 'BJ',
  /** Bermuda */
  Bm = 'BM',
  /** Brunei */
  Bn = 'BN',
  /** Bolivia */
  Bo = 'BO',
  /** Brazil */
  Br = 'BR',
  /** Bahamas */
  Bs = 'BS',
  /** Bhutan */
  Bt = 'BT',
  /** Botswana */
  Bw = 'BW',
  /** Belarus */
  By = 'BY',
  /** Belize */
  Bz = 'BZ',
  /** Canada */
  Ca = 'CA',
  /** Democratic Republic of the Congo */
  Cd = 'CD',
  /** Central African Republic */
  Cf = 'CF',
  /** Republic of the Congo */
  Cg = 'CG',
  /** Switzerland */
  Ch = 'CH',
  /** Ivory Coast */
  Ci = 'CI',
  /** Chile */
  Cl = 'CL',
  /** Cameroon */
  Cm = 'CM',
  /** China */
  Cn = 'CN',
  /** Colombia */
  Co = 'CO',
  /** Costa Rica */
  Cr = 'CR',
  /** Cuba */
  Cu = 'CU',
  /** Cape Verde */
  Cv = 'CV',
  /** Curaçao */
  Cw = 'CW',
  /** Cyprus */
  Cy = 'CY',
  /** Czech Republic */
  Cz = 'CZ',
  /** Germany */
  De = 'DE',
  /** Djibouti */
  Dj = 'DJ',
  /** Denmark */
  Dk = 'DK',
  /** Dominica */
  Dm = 'DM',
  /** Dominican Republic */
  Do = 'DO',
  /** Algeria */
  Dz = 'DZ',
  /** Ecuador */
  Ec = 'EC',
  /** Estonia */
  Ee = 'EE',
  /** Egypt */
  Eg = 'EG',
  /** Western Sahara */
  Eh = 'EH',
  /** Eritrea */
  Er = 'ER',
  /** Spain */
  Es = 'ES',
  /** Ethiopia */
  Et = 'ET',
  /** Finland */
  Fi = 'FI',
  /** Fiji */
  Fj = 'FJ',
  /** Micronesia */
  Fm = 'FM',
  /** Faroe Islands */
  Fo = 'FO',
  /** France */
  Fr = 'FR',
  /** Gabon */
  Ga = 'GA',
  /** United Kingdom */
  Gb = 'GB',
  /** Grenada */
  Gd = 'GD',
  /** Georgia */
  Ge = 'GE',
  /** Guernsey */
  Gg = 'GG',
  /** Ghana */
  Gh = 'GH',
  /** Greenland */
  Gl = 'GL',
  /** Gambia */
  Gm = 'GM',
  /** Guinea */
  Gn = 'GN',
  /** Equatorial Guinea */
  Gq = 'GQ',
  /** Greece */
  Gr = 'GR',
  /** Guatemala */
  Gt = 'GT',
  /** Guinea-Bissau */
  Gw = 'GW',
  /** Guyana */
  Gy = 'GY',
  /** Honduras */
  Hn = 'HN',
  /** Croatia */
  Hr = 'HR',
  /** Haiti */
  Ht = 'HT',
  /** Hungary */
  Hu = 'HU',
  /** Indonesia */
  Id = 'ID',
  /** Ireland */
  Ie = 'IE',
  /** Israel */
  Il = 'IL',
  /** Isle of Man */
  Im = 'IM',
  /** India */
  In = 'IN',
  /** Iraq */
  Iq = 'IQ',
  /** Iran */
  Ir = 'IR',
  /** Iceland */
  Is = 'IS',
  /** Italy */
  It = 'IT',
  /** Jersey */
  Je = 'JE',
  /** Jamaica */
  Jm = 'JM',
  /** Jordan */
  Jo = 'JO',
  /** Japan */
  Jp = 'JP',
  /** Kenya */
  Ke = 'KE',
  /** Kyrgyzstan */
  Kg = 'KG',
  /** Cambodia */
  Kh = 'KH',
  /** Comoros */
  Km = 'KM',
  /** Saint Kitts and Nevis */
  Kn = 'KN',
  /** North Korea */
  Kp = 'KP',
  /** South Korea */
  Kr = 'KR',
  /** Kuwait */
  Kw = 'KW',
  /** Kazakhstan */
  Kz = 'KZ',
  /** Laos */
  La = 'LA',
  /** Lebanon */
  Lb = 'LB',
  /** Saint Lucia */
  Lc = 'LC',
  /** Liechtenstein */
  Li = 'LI',
  /** Sri Lanka */
  Lk = 'LK',
  /** Liberia */
  Lr = 'LR',
  /** Lesotho */
  Ls = 'LS',
  /** Lithuania */
  Lt = 'LT',
  /** Luxembourg */
  Lu = 'LU',
  /** Latvia */
  Lv = 'LV',
  /** Morocco */
  Ma = 'MA',
  /** Monaco */
  Mc = 'MC',
  /** Moldova */
  Md = 'MD',
  /** Montenegro */
  Me = 'ME',
  /** Madagascar */
  Mg = 'MG',
  /** Marshall Islands */
  Mh = 'MH',
  /** North Macedonia */
  Mk = 'MK',
  /** Mali */
  Ml = 'ML',
  /** Myanmar */
  Mm = 'MM',
  /** Mongolia */
  Mn = 'MN',
  /** Mauritania */
  Mr = 'MR',
  /** Malta */
  Mt = 'MT',
  /** Mauritius */
  Mu = 'MU',
  /** Maldives */
  Mv = 'MV',
  /** Malawi */
  Mw = 'MW',
  /** Mexico */
  Mx = 'MX',
  /** Malaysia */
  My = 'MY',
  /** Mozambique */
  Mz = 'MZ',
  /** Namibia */
  Na = 'NA',
  /** New Caledonia */
  Nc = 'NC',
  /** Niger */
  Ne = 'NE',
  /** Nigeria */
  Ng = 'NG',
  /** Nicaragua */
  Ni = 'NI',
  /** Netherlands */
  Nl = 'NL',
  /** Norway */
  No = 'NO',
  /** Nepal */
  Np = 'NP',
  /** New Zealand */
  Nz = 'NZ',
  /** Oman */
  Om = 'OM',
  /** Panama */
  Pa = 'PA',
  /** Peru */
  Pe = 'PE',
  /** Papua New Guinea */
  Pg = 'PG',
  /** Philippines */
  Ph = 'PH',
  /** Pakistan */
  Pk = 'PK',
  /** Poland */
  Pl = 'PL',
  /** Palestine */
  Ps = 'PS',
  /** Portugal */
  Pt = 'PT',
  /** Palau */
  Pw = 'PW',
  /** Paraguay */
  Py = 'PY',
  /** Qatar */
  Qa = 'QA',
  /** Romania */
  Ro = 'RO',
  /** Serbia */
  Rs = 'RS',
  /** Russia */
  Ru = 'RU',
  /** Rwanda */
  Rw = 'RW',
  /** Saudi Arabia */
  Sa = 'SA',
  /** Solomon Islands */
  Sb = 'SB',
  /** Seychelles */
  Sc = 'SC',
  /** Sudan */
  Sd = 'SD',
  /** Sweden */
  Se = 'SE',
  /** Singapore */
  Sg = 'SG',
  /** Slovenia */
  Si = 'SI',
  /** Slovakia */
  Sk = 'SK',
  /** Sierra Leone */
  Sl = 'SL',
  /** San Marino */
  Sm = 'SM',
  /** Senegal */
  Sn = 'SN',
  /** Suriname */
  Sr = 'SR',
  /** South Sudan */
  Ss = 'SS',
  /** El Salvador */
  Sv = 'SV',
  /** Syria */
  Sy = 'SY',
  /** Swaziland (Eswatini) */
  Sz = 'SZ',
  /** Chad */
  Td = 'TD',
  /** Togo */
  Tg = 'TG',
  /** Thailand */
  Th = 'TH',
  /** Tajikistan */
  Tj = 'TJ',
  /** Timor-Leste (East Timor) */
  Tl = 'TL',
  /** Turkmenistan */
  Tm = 'TM',
  /** Tunisia */
  Tn = 'TN',
  /** Tonga */
  To = 'TO',
  /** Turkey */
  Tr = 'TR',
  /** Trinidad and Tobago */
  Tt = 'TT',
  /** Tanzania */
  Tz = 'TZ',
  /** Ukraine */
  Ua = 'UA',
  /** Uganda */
  Ug = 'UG',
  /** United States */
  Us = 'US',
  /** Uruguay */
  Uy = 'UY',
  /** Uzbekistan */
  Uz = 'UZ',
  /** Vatican City */
  Va = 'VA',
  /** Saint Vincent and the Grenadines */
  Vc = 'VC',
  /** Venezuela */
  Ve = 'VE',
  /** British Virgin Islands */
  Vg = 'VG',
  /** US Virgin Islands */
  Vi = 'VI',
  /** Vietnam */
  Vn = 'VN',
  /** Vanuatu */
  Vu = 'VU',
  /** Samoa */
  Ws = 'WS',
  /** Kosovo */
  Xk = 'XK',
  /** Yemen */
  Ye = 'YE',
  /** South Africa */
  Za = 'ZA',
  /** Zambia */
  Zm = 'ZM',
  /** Zimbabwe */
  Zw = 'ZW'
}

/** Input data for creating a new cart. */
export type ApiCreateCartInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Currency code for all items (e.g., "USD"). */
  currencyCode: CurrencyCode;
  /** Initial items to add to the new cart. */
  items: Array<ApiCartLineInput>;
};

/** Payload returned after creating a cart. */
export type ApiCreateCartPayload = {
  __typename?: 'CreateCartPayload';
  /** The newly created cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

/** Input type for submitting a new product review. */
export type ApiCreateReviewInput = {
  /**
   * A summary of key negative points noted by the reviewer.
   * Use commas or semicolons to separate multiple cons.
   */
  cons?: InputMaybe<Scalars['String']['input']>;
  /**
   * The publicly displayed name of the reviewer.
   * This may be a username, nickname, or real name, depending on your policy.
   */
  displayName: Scalars['String']['input'];
  /**
   * An optional list of image IDs uploaded by the reviewer.
   * Images should illustrate product features or usage.
   */
  images?: InputMaybe<Array<Scalars['ID']['input']>>;
  /** The locale or language code. */
  locale?: InputMaybe<LocaleCode>;
  /**
   * The main body of the review.
   * Should capture the reviewer's overall experience and opinions.
   */
  message: Scalars['String']['input'];
  /** The unique identifier of the product to which this review belongs. */
  productId: Scalars['ID']['input'];
  /**
   * A summary of key positive points noted by the reviewer.
   * Use commas or semicolons to separate multiple pros.
   */
  pros?: InputMaybe<Scalars['String']['input']>;
  /**
   * The numerical rating given by the reviewer.
   * Valid values typically range from 1.0 (worst) to 5.0 (best).
   */
  rating: Scalars['Float']['input'];
  /**
   * A brief, descriptive title summarizing the review.
   * For example: "Excellent quality, highly recommend".
   */
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Currency codes according to ISO 4217 */
export enum CurrencyCode {
  /** 2 decimals — UAE Dirham (United Arab Emirates) */
  Aed = 'AED',
  /** 2 decimals — Afghan Afghani (Afghanistan) */
  Afn = 'AFN',
  /** 2 decimals — Albanian Lek (Albania) */
  All = 'ALL',
  /** 2 decimals — Armenian Dram (Armenia) */
  Amd = 'AMD',
  /** 2 decimals — Netherlands Antillean Guilder (Netherlands Antilles) */
  Ang = 'ANG',
  /** 2 decimals — Angolan Kwanza (Angola) */
  Aoa = 'AOA',
  /** 2 decimals — Argentine Peso (Argentina) */
  Ars = 'ARS',
  /** 2 decimals — Australian Dollar (Australia) */
  Aud = 'AUD',
  /** 2 decimals — Aruban Florin (Aruba) */
  Awg = 'AWG',
  /** 2 decimals — Azerbaijani Manat (Azerbaijan) */
  Azn = 'AZN',
  /** 2 decimals — Bosnia-Herzegovina Convertible Mark (Bosnia and Herzegovina) */
  Bam = 'BAM',
  /** 2 decimals — Barbadian Dollar (Barbados) */
  Bbd = 'BBD',
  /** 2 decimals — Bangladeshi Taka (Bangladesh) */
  Bdt = 'BDT',
  /** 2 decimals — Bulgarian Lev (Bulgaria) */
  Bgn = 'BGN',
  /** 3 decimals — Bahraini Dinar (Bahrain) */
  Bhd = 'BHD',
  /** 0 decimals — Burundian Franc (Burundi) */
  Bif = 'BIF',
  /** 2 decimals — Bermudian Dollar (Bermuda) */
  Bmd = 'BMD',
  /** 2 decimals — Brunei Dollar (Brunei) */
  Bnd = 'BND',
  /** 2 decimals — Bolivian Boliviano (Bolivia) */
  Bob = 'BOB',
  /** 2 decimals — Brazilian Real (Brazil) */
  Brl = 'BRL',
  /** 2 decimals — Bahamian Dollar (Bahamas) */
  Bsd = 'BSD',
  /** 2 decimals — Bhutanese Ngultrum (Bhutan) */
  Btn = 'BTN',
  /** 2 decimals — Botswana Pula (Botswana) */
  Bwp = 'BWP',
  /** 2 decimals — Belarusian Ruble (Belarus) */
  Byn = 'BYN',
  /** 2 decimals — Belize Dollar (Belize) */
  Bzd = 'BZD',
  /** 2 decimals — Canadian Dollar (Canada) */
  Cad = 'CAD',
  /** 2 decimals — Congolese Franc (Democratic Republic of the Congo) */
  Cdf = 'CDF',
  /** 2 decimals — Swiss Franc (Switzerland) */
  Chf = 'CHF',
  /** 0 decimals — Chilean Peso (Chile) */
  Clp = 'CLP',
  /** 2 decimals — Chinese Yuan (China) */
  Cny = 'CNY',
  /** 2 decimals — Colombian Peso (Colombia) */
  Cop = 'COP',
  /** 2 decimals — Costa Rican Colon (Costa Rica) */
  Crc = 'CRC',
  /** 2 decimals — Cuban Peso (Cuba) */
  Cup = 'CUP',
  /** 2 decimals — Cape Verdean Escudo (Cape Verde) */
  Cve = 'CVE',
  /** 2 decimals — Czech Koruna (Czech Republic) */
  Czk = 'CZK',
  /** 0 decimals — Djiboutian Franc (Djibouti) */
  Djf = 'DJF',
  /** 2 decimals — Danish Krone (Denmark) */
  Dkk = 'DKK',
  /** 2 decimals — Dominican Peso (Dominican Republic) */
  Dop = 'DOP',
  /** 2 decimals — Algerian Dinar (Algeria) */
  Dzd = 'DZD',
  /** 2 decimals — Egyptian Pound (Egypt) */
  Egp = 'EGP',
  /** 2 decimals — Eritrean Nakfa (Eritrea) */
  Ern = 'ERN',
  /** 2 decimals — Ethiopian Birr (Ethiopia) */
  Etb = 'ETB',
  /** 2 decimals — Euro (European Union) */
  Eur = 'EUR',
  /** 2 decimals — Fijian Dollar (Fiji) */
  Fjd = 'FJD',
  /** 2 decimals — Falkland Islands Pound (Falkland Islands) */
  Fkp = 'FKP',
  /** 2 decimals — Faroese Króna (Faroe Islands) */
  Fok = 'FOK',
  /** 2 decimals — Pound Sterling (United Kingdom) */
  Gbp = 'GBP',
  /** 2 decimals — Georgian Lari (Georgia) */
  Gel = 'GEL',
  /** 2 decimals — Guernsey Pound (Guernsey) */
  Ggp = 'GGP',
  /** 2 decimals — Ghanaian Cedi (Ghana) */
  Ghs = 'GHS',
  /** 2 decimals — Gibraltar Pound (Gibraltar) */
  Gip = 'GIP',
  /** 2 decimals — Gambian Dalasi (Gambia) */
  Gmd = 'GMD',
  /** 0 decimals — Guinean Franc (Guinea) */
  Gnf = 'GNF',
  /** 2 decimals — Guatemalan Quetzal (Guatemala) */
  Gtq = 'GTQ',
  /** 2 decimals — Guyanese Dollar (Guyana) */
  Gyd = 'GYD',
  /** 2 decimals — Hong Kong Dollar (Hong Kong) */
  Hkd = 'HKD',
  /** 2 decimals — Honduran Lempira (Honduras) */
  Hnl = 'HNL',
  /** 2 decimals — Croatian Kuna (Croatia) */
  Hrk = 'HRK',
  /** 2 decimals — Haitian Gourde (Haiti) */
  Htg = 'HTG',
  /** 2 decimals — Hungarian Forint (Hungary) */
  Huf = 'HUF',
  /** 0 decimals — Indonesian Rupiah (Indonesia) */
  Idr = 'IDR',
  /** 2 decimals — Israeli New Shekel (Israel) */
  Ils = 'ILS',
  /** 2 decimals — Isle of Man Pound (Isle of Man) */
  Imp = 'IMP',
  /** 2 decimals — Indian Rupee (India) */
  Inr = 'INR',
  /** 3 decimals — Iraqi Dinar (Iraq) */
  Iqd = 'IQD',
  /** 2 decimals — Iranian Rial (Iran) */
  Irr = 'IRR',
  /** 0 decimals — Icelandic Króna (Iceland) */
  Isk = 'ISK',
  /** 2 decimals — Jersey Pound (Jersey) */
  Jep = 'JEP',
  /** 2 decimals — Jamaican Dollar (Jamaica) */
  Jmd = 'JMD',
  /** 3 decimals — Jordanian Dinar (Jordan) */
  Jod = 'JOD',
  /** 0 decimals — Japanese Yen (Japan) */
  Jpy = 'JPY',
  /** 2 decimals — Kenyan Shilling (Kenya) */
  Kes = 'KES',
  /** 2 decimals — Kyrgyzstani Som (Kyrgyzstan) */
  Kgs = 'KGS',
  /** 2 decimals — Cambodian Riel (Cambodia) */
  Khr = 'KHR',
  /** 2 decimals — Comorian Franc (Comoros) */
  Kmf = 'KMF',
  /** 2 decimals — North Korean Won (North Korea) */
  Kpw = 'KPW',
  /** 2 decimals — South Korean Won (South Korea) */
  Krw = 'KRW',
  /** 3 decimals — Kuwaiti Dinar (Kuwait) */
  Kwd = 'KWD',
  /** 2 decimals — Cayman Islands Dollar (Cayman Islands) */
  Kyd = 'KYD',
  /** 2 decimals — Kazakhstani Tenge (Kazakhstan) */
  Kzt = 'KZT',
  /** 2 decimals — Lao Kip (Laos) */
  Lak = 'LAK',
  /** 2 decimals — Lebanese Pound (Lebanon) */
  Lbp = 'LBP',
  /** 2 decimals — Sri Lankan Rupee (Sri Lanka) */
  Lkr = 'LKR',
  /** 3 decimals — Liberian Dollar (Liberia) */
  Lrd = 'LRD',
  /** 3 decimals — Libyan Dinar (Libya) */
  Lyd = 'LYD',
  /** 2 decimals — Moroccan Dirham (Morocco) */
  Mad = 'MAD',
  /** 2 decimals — Moldovan Leu (Moldova) */
  Mdl = 'MDL',
  /** 2 decimals — Malagasy Ariary (Madagascar) */
  Mga = 'MGA',
  /** 2 decimals — Macedonian Denar (North Macedonia) */
  Mkd = 'MKD',
  /** 2 decimals — Burmese Kyat (Myanmar) */
  Mmk = 'MMK',
  /** 2 decimals — Mongolian Tögrög (Mongolia) */
  Mnt = 'MNT',
  /** 2 decimals — Macanese Pataca (Macau) */
  Mop = 'MOP',
  /** 2 decimals — Mauritanian Ouguiya (Mauritania) */
  Mru = 'MRU',
  /** 2 decimals — Mauritian Rupee (Mauritius) */
  Mur = 'MUR',
  /** 2 decimals — Maldivian Rufiyaa (Maldives) */
  Mvr = 'MVR',
  /** 2 decimals — Malawian Kwacha (Malawi) */
  Mwk = 'MWK',
  /** 2 decimals — Mexican Peso (Mexico) */
  Mxn = 'MXN',
  /** 2 decimals — Malaysian Ringgit (Malaysia) */
  Myr = 'MYR',
  /** 2 decimals — Mozambican Metical (Mozambique) */
  Mzn = 'MZN',
  /** 2 decimals — Namibian Dollar (Namibia) */
  Nad = 'NAD',
  /** 2 decimals — Nigerian Naira (Nigeria) */
  Ngn = 'NGN',
  /** 2 decimals — Nicaraguan Córdoba (Nicaragua) */
  Nio = 'NIO',
  /** 2 decimals — Norwegian Krone (Norway) */
  Nok = 'NOK',
  /** 2 decimals — Nepalese Rupee (Nepal) */
  Npr = 'NPR',
  /** 2 decimals — New Zealand Dollar (New Zealand) */
  Nzd = 'NZD',
  /** 2 decimals — Omani Rial (Oman) */
  Omr = 'OMR',
  /** 2 decimals — Panamanian Balboa (Panama) */
  Pab = 'PAB',
  /** 2 decimals — Peruvian Sol (Peru) */
  Pen = 'PEN',
  /** 0 decimals — Papua New Guinean Kina (Papua New Guinea) */
  Pgk = 'PGK',
  /** 2 decimals — Philippine Peso (Philippines) */
  Php = 'PHP',
  /** 2 decimals — Pakistani Rupee (Pakistan) */
  Pkr = 'PKR',
  /** 0 decimals — Polish Zloty (Poland) */
  Pln = 'PLN',
  /** 2 decimals — Paraguayan Guaraní (Paraguay) */
  Pyg = 'PYG',
  /** 2 decimals — Qatari Riyal (Qatar) */
  Qar = 'QAR',
  /** 2 decimals — Romanian Leu (Romania) */
  Ron = 'RON',
  /** 2 decimals — Serbian Dinar (Serbia) */
  Rsd = 'RSD',
  /** 2 decimals — Russian Ruble (Russia) */
  Rub = 'RUB',
  /** 2 decimals — Rwandan Franc (Rwanda) */
  Rwf = 'RWF',
  /** 2 decimals — Saudi Riyal (Saudi Arabia) */
  Sar = 'SAR',
  /** 2 decimals — Solomon Islands Dollar (Solomon Islands) */
  Sbd = 'SBD',
  /** 2 decimals — Seychelles Rupee (Seychelles) */
  Scr = 'SCR',
  /** 2 decimals — Sudanese Pound (Sudan) */
  Sdg = 'SDG',
  /** 2 decimals — Swedish Krona (Sweden) */
  Sek = 'SEK',
  /** 2 decimals — Singapore Dollar (Singapore) */
  Sgd = 'SGD',
  /** 0 decimals — Saint Helena Pound (Saint Helena) */
  Shp = 'SHP',
  /** 2 decimals — Sierra Leonean Leone (Sierra Leone) */
  Sle = 'SLE',
  /** 2 decimals — Somali Shilling (Somalia) */
  Sos = 'SOS',
  /** 2 decimals — Surinamese Dollar (Suriname) */
  Srd = 'SRD',
  /** 2 decimals — South Sudanese Pound (South Sudan) */
  Ssp = 'SSP',
  /** 2 decimals — São Tomé and Príncipe Dobra (São Tomé and Príncipe) */
  Stn = 'STN',
  /** 2 decimals — Salvadoran Colón (El Salvador) */
  Svc = 'SVC',
  /** 2 decimals — Syrian Pound (Syria) */
  Syp = 'SYP',
  /** 2 decimals — Eswatini Lilangeni (Eswatini) */
  Szl = 'SZL',
  /** 2 decimals — Thai Baht (Thailand) */
  Thb = 'THB',
  /** 2 decimals — Tajikistani Somoni (Tajikistan) */
  Tjs = 'TJS',
  /** 2 decimals — Turkmenistani Manat (Turkmenistan) */
  Tmt = 'TMT',
  /** 2 decimals — Tunisian Dinar (Tunisia) */
  Tnd = 'TND',
  /** 2 decimals — Tongan Paʻanga (Tonga) */
  Top = 'TOP',
  /** 2 decimals — Turkish Lira (Türkiye) */
  Try = 'TRY',
  /** 2 decimals — Trinidad and Tobago Dollar (Trinidad and Tobago) */
  Ttd = 'TTD',
  /** 2 decimals — New Taiwan Dollar (Taiwan) */
  Twd = 'TWD',
  /** 0 decimals — Tanzanian Shilling (Tanzania) */
  Tzs = 'TZS',
  /** 2 decimals — Ukrainian Hryvnia (Ukraine) */
  Uah = 'UAH',
  /** 2 decimals — Ugandan Shilling (Uganda) */
  Ugx = 'UGX',
  /** 2 decimals — United States Dollar (United States) */
  Usd = 'USD',
  /** 2 decimals — Uruguayan Peso (Uruguay) */
  Uyu = 'UYU',
  /** 2 decimals — Uzbekistan Som (Uzbekistan) */
  Uzs = 'UZS',
  /** 2 decimals — Venezuelan Bolívar (Venezuela) */
  Ves = 'VES',
  /** 0 decimals — Vietnamese Dong (Vietnam) */
  Vnd = 'VND',
  /** 2 decimals — Vanuatu Vatu (Vanuatu) */
  Vuv = 'VUV',
  /** 2 decimals — Samoan Tala (Samoa) */
  Wst = 'WST',
  /** 2 decimals — Central African CFA Franc (CEMAC) */
  Xaf = 'XAF',
  /** 0 decimals — East Caribbean Dollar (OECS) */
  Xcd = 'XCD',
  /** 0 decimals — Special Drawing Rights (IMF) */
  Xdr = 'XDR',
  /** 0 decimals — West African CFA Franc (UEMOA) */
  Xof = 'XOF',
  /** 0 decimals — CFP Franc (French overseas territories) */
  Xpf = 'XPF',
  /** 2 decimals — Yemeni Rial (Yemen) */
  Yer = 'YER',
  /** 2 decimals — South African Rand (South Africa) */
  Zar = 'ZAR',
  /** 2 decimals — Zambian Kwacha (Zambia) */
  Zmw = 'ZMW',
  /** 2 decimals — Zimbabwean Dollar (Zimbabwe) */
  Zwl = 'ZWL'
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

/** Represents a file or media resource in the system. */
export type ApiFile = ApiNode & {
  __typename?: 'File';
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The origin of the media (e.g., URL, YouTube). */
  source: MediaSource;
  /** Direct link to the resource or identifier (for YouTube, the video ID). */
  url: Scalars['String']['output'];
};

export type ApiFilter = {
  /** The handle of the Filter. */
  handle: Scalars['String']['output'];
  /** Global unique identifier. */
  id: Scalars['String']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Display title for the Filter. */
  title: Scalars['String']['output'];
};

/** Input type for applying a Filter to a listing. */
export type ApiFilterInput = {
  /** The handle of the Filter. */
  handle: Scalars['String']['input'];
  /** The value handles of the Filter. Ranges accept min, max values. */
  values: Array<Scalars['String']['input']>;
};

/** Fulfillment information for the order. */
export type ApiFulfillment = ApiNode & {
  __typename?: 'Fulfillment';
  /** Fulfillment creation date. */
  createdAt: Scalars['DateTime']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Fulfillment lines. */
  lines: Array<ApiFulfillmentLine>;
  /** Fulfillment status. */
  status: FulfillmentStatus;
  /** Tracking number. */
  trackingNumber?: Maybe<Scalars['String']['output']>;
  /** Tracking URL. */
  trackingUrl?: Maybe<Scalars['String']['output']>;
};

/** Fulfillment line within a fulfillment. */
export type ApiFulfillmentLine = ApiNode & {
  __typename?: 'FulfillmentLine';
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Order item ID. */
  orderItemId: Scalars['ID']['output'];
  /** Quantity shipped. */
  quantity: Scalars['Int']['output'];
};

export enum FulfillmentStatus {
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  Fulfilled = 'FULFILLED',
  OnHold = 'ON_HOLD',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Returned = 'RETURNED',
  Shipped = 'SHIPPED'
}

/** Result of cursor-based pagination for a gallery of files. */
export type ApiGalleryConnection = {
  __typename?: 'GalleryConnection';
  /** List of edges (file nodes with cursors). */
  edges: Array<ApiGalleryEdge>;
  /** Pagination information (hasNextPage, hasPreviousPage, start/end cursors). */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in the gallery connection, containing a file and its cursor. */
export type ApiGalleryEdge = {
  __typename?: 'GalleryEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The file node. */
  node: ApiFile;
};

export type ApiListFilter = ApiFilter & {
  __typename?: 'ListFilter';
  handle: Scalars['String']['output'];
  id: Scalars['String']['output'];
  iid: Scalars['Uuid']['output'];
  title: Scalars['String']['output'];
  /** List of available categories for filtering. */
  values: Array<ApiListFilterValue>;
};

export type ApiListFilterValue = {
  __typename?: 'ListFilterValue';
  /** Number of products associated with this Filter value. */
  count: Scalars['Int']['output'];
  /** The handle of the Filter. */
  handle: Scalars['String']['output'];
  /** Global unique identifier. */
  id: Scalars['String']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The swatch of the Filter value. Usually used for color filters. */
  swatch?: Maybe<ApiSwatch>;
  /** Display title for the Filter. */
  title: Scalars['String']['output'];
};

/** A connection object for listings, following the cursor-based pattern. */
export type ApiListingConnection = {
  __typename?: 'ListingConnection';
  /** Show available products first. */
  availabilitySortApplied: Scalars['Boolean']['output'];
  /** A list of edges. */
  edges: Array<ApiListingEdge>;
  /** filters of the listing. */
  filters: Array<ApiFilter>;
  /** Include nested categories. */
  nestedCategoriesIncluded: Scalars['Boolean']['output'];
  /** Information to aid in pagination. */
  pageInfo: ApiPageInfo;
  /** The sort order that was applied. */
  sort: ListingSort;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in a listing connection, with the cursor for pagination. */
export type ApiListingEdge = {
  __typename?: 'ListingEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The item at the end of this edge. */
  node: ApiListingNode;
};

/** A node in a listing. */
export type ApiListingNode = ApiProduct;

/**
 * Defines the available sorting orders for Listings.
 * Maps to Go enum portal/project/entity/listing/listingOrder.Enum.
 */
export enum ListingSort {
  /** Newest first */
  CreatedAtAsc = 'CREATED_AT_ASC',
  /** Oldest first */
  CreatedAtDesc = 'CREATED_AT_DESC',
  /** Recommended order based on the listing settings */
  MostRelevant = 'MOST_RELEVANT',
  /** Price ascending */
  PriceAsc = 'PRICE_ASC',
  /** Price descending */
  PriceDesc = 'PRICE_DESC',
  /** Title ascending */
  TitleAsc = 'TITLE_ASC',
  /** Title descending */
  TitleDesc = 'TITLE_DESC'
}

/** Defines the type of listing, determining how products are selected. */
export enum ListingType {
  /** Aggregates all products from this category and its subcategories recursively. */
  Container = 'CONTAINER',
  /** Automatically generated by applying predefined filters. */
  Smart = 'SMART',
  /** Manually curated: admin selects products and defines their order; */
  Standard = 'STANDARD'
}

/** Input data for loading a cart by its ID. */
export type ApiLoadCartInput = {
  /** ID of the cart to load. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
};

/** Payload returned after clearing all items from the cart. */
export type ApiLoadCartPayload = {
  __typename?: 'LoadCartPayload';
  /** The updated (now empty) cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

/** Language codes based on ISO 639-1 and BCP 47 */
export enum LocaleCode {
  /** Afrikaans */
  Af = 'af',
  /** Amharic */
  Am = 'am',
  /** Arabic */
  Ar = 'ar',
  /** Azerbaijani */
  Az = 'az',
  /** Bulgarian */
  Bg = 'bg',
  /** Bengali */
  Bn = 'bn',
  /** Catalan */
  Ca = 'ca',
  /** Czech */
  Cs = 'cs',
  /** Welsh */
  Cy = 'cy',
  /** Danish */
  Da = 'da',
  /** German */
  De = 'de',
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
  /** Persian (Farsi) */
  Fa = 'fa',
  /** Finnish */
  Fi = 'fi',
  /** Filipino */
  Fil = 'fil',
  /** French */
  Fr = 'fr',
  /** Irish */
  Ga = 'ga',
  /** Scottish Gaelic */
  Gd = 'gd',
  /** Galician */
  Gl = 'gl',
  /** Gujarati */
  Gu = 'gu',
  /** Hebrew */
  He = 'he',
  /** Hindi */
  Hi = 'hi',
  /** Croatian */
  Hr = 'hr',
  /** Haitian Creole */
  Ht = 'ht',
  /** Hungarian */
  Hu = 'hu',
  /** Armenian */
  Hy = 'hy',
  /** Indonesian */
  Id = 'id',
  /** Igbo */
  Ig = 'ig',
  /** Icelandic */
  Is = 'is',
  /** Italian */
  It = 'it',
  /** Japanese */
  Ja = 'ja',
  /** Georgian */
  Ka = 'ka',
  /** Kazakh */
  Kk = 'kk',
  /** Khmer */
  Km = 'km',
  /** Kannada */
  Kn = 'kn',
  /** Korean */
  Ko = 'ko',
  /** Kurdish */
  Ku = 'ku',
  /** Kyrgyz */
  Ky = 'ky',
  /** Latin */
  La = 'la',
  /** Lao */
  Lo = 'lo',
  /** Lithuanian */
  Lt = 'lt',
  /** Latvian */
  Lv = 'lv',
  /** Malagasy */
  Mg = 'mg',
  /** Maori */
  Mi = 'mi',
  /** Malayalam */
  Ml = 'ml',
  /** Mongolian */
  Mn = 'mn',
  /** Marathi */
  Mr = 'mr',
  /** Malay */
  Ms = 'ms',
  /** Burmese */
  My = 'my',
  /** Nepali */
  Ne = 'ne',
  /** Dutch */
  Nl = 'nl',
  /** Norwegian */
  No = 'no',
  /** Punjabi */
  Pa = 'pa',
  /** Polish */
  Pl = 'pl',
  /** Pashto */
  Ps = 'ps',
  /** Portuguese (Portugal/Brazil unified) */
  Pt = 'pt',
  /** Romanian */
  Ro = 'ro',
  /** Russian */
  Ru = 'ru',
  /** Sinhala */
  Si = 'si',
  /** Slovak */
  Sk = 'sk',
  /** Slovenian */
  Sl = 'sl',
  /** Samoan */
  Sm = 'sm',
  /** Serbian */
  Sr = 'sr',
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
  /** Turkmen */
  Tk = 'tk',
  /** Tongan */
  To = 'to',
  /** Turkish */
  Tr = 'tr',
  /** Ukrainian */
  Uk = 'uk',
  /** Uzbek */
  Uz = 'uz',
  /** Vietnamese */
  Vi = 'vi',
  /** Xhosa */
  Xh = 'xh',
  /** Yoruba */
  Yo = 'yo',
  /** Chinese (Simplified, China) */
  ZhCn = 'zh_CN',
  /** Chinese (Traditional, Taiwan) */
  ZhTw = 'zh_TW',
  /** Zulu */
  Zu = 'zu'
}

/** Source of the media file. */
export enum MediaSource {
  /** The file is available at an arbitrary URL. */
  Url = 'URL',
  /** YouTube video (the `url` field contains the YouTube Video ID). */
  Youtube = 'YOUTUBE'
}

/** A menu. */
export type ApiMenu = ApiNode & {
  __typename?: 'Menu';
  /** Human-friendly unique handle. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Paginated list of menu items. */
  items: ApiMenuItemConnection;
  /** The menu's title. */
  title: Scalars['String']['output'];
};


/** A menu. */
export type ApiMenuItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<MenuItemSort>;
};

/** Connection type for menus. */
export type ApiMenuConnection = {
  __typename?: 'MenuConnection';
  /** List of edges. */
  edges: Array<ApiMenuEdge>;
  /** Pagination information. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in the Menu connection. */
export type ApiMenuEdge = {
  __typename?: 'MenuEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The menu node. */
  node: ApiMenu;
};

/** A single menu item. */
export type ApiMenuItem = ApiNode & {
  __typename?: 'MenuItem';
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Paginated list of nested menu items. */
  items: ApiMenuItemConnection;
  /** The referenced node (Product, Category, Page, or URLNode). */
  node: ApiMenuNode;
  /** The item's title. */
  title: Scalars['String']['output'];
};


/** A single menu item. */
export type ApiMenuItemItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<MenuItemSort>;
};

/** Connection type for menu items. */
export type ApiMenuItemConnection = {
  __typename?: 'MenuItemConnection';
  /** List of edges. */
  edges: Array<ApiMenuItemEdge>;
  /** Pagination information. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in the MenuItem connection. */
export type ApiMenuItemEdge = {
  __typename?: 'MenuItemEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The menu item node. */
  node: ApiMenuItem;
};

export enum MenuItemSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** A menu node: Product, Category, Page, or URL. */
export type ApiMenuNode = ApiCategory | ApiPage | ApiProduct | ApiUrlNode;

export enum MenuSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

export type ApiMoney = {
  __typename?: 'Money';
  /** The amount of money */
  amount: Scalars['Decimal']['output'];
  /** The currency code */
  currencyCode: CurrencyCode;
};

export type ApiMoneyInput = {
  /** The amount of money */
  amount: Scalars['Decimal']['input'];
  /** The currency code */
  currencyCode: CurrencyCode;
};

export type ApiMutation = {
  __typename?: 'Mutation';
  /** Adds an item to an existing cart. */
  addCartLine: ApiAddCartLinePayload;
  /** Place an order (checkout). */
  checkout: ApiCheckoutPayload;
  /** Clears all items from a cart. */
  clearCartLines: ApiClearCartLinesPayload;
  /** Creates a new cart. */
  createCart: ApiCreateCartPayload;
  /** Create a review. */
  createReview: ApiProductReview;
  /** Delete own review. */
  deleteReview: Scalars['Boolean']['output'];
  /** Loads a cart by its ID. Has side effects. */
  loadCart?: Maybe<ApiLoadCartPayload>;
  /** Creates a new session using email and password. */
  passwordSignIn: ApiPasswordSignInPayload;
  /** Registers a new user and returns a session. */
  passwordSignUp: ApiPasswordSignUpPayload;
  /** Removes a single item from the cart. */
  removeCartLine: ApiRemoveCartLinePayload;
  /** Replaces all items in an existing cart. */
  replaceCartLines: ApiReplaceCartLinesPayload;
  /** Report review abuse. */
  reportReviewAbuse: Scalars['Boolean']['output'];
  /** Sends a password recovery email. */
  requestPasswordRecovery: ApiPasswordRecoveryPayload;
  /** Resets the user's password with a recovery token. */
  resetPassword: ApiResetPasswordPayload;
  /** Reply to review as seller. */
  sellerReplyToReview: Scalars['Boolean']['output'];
  /** Signs out the current user. */
  signOut: Scalars['Boolean']['output'];
  /** Updates the quantity of a specific cart item. */
  updateCartLineQuantity: ApiUpdateCartLineQuantityPayload;
  /** Updates the authenticated user's password. */
  updatePassword: ApiUpdatePasswordPayload;
  /** Edit own review. */
  updateReview: ApiProductReview;
  /** Updates the authenticated user's profile information. */
  updateUserProfile: ApiUpdateUserProfilePayload;
  /** Confirms a user's email address using a token. */
  verifyEmail: ApiVerifyEmailPayload;
  /** Mark review as helpful / not helpful. */
  voteReviewHelpful: Scalars['Boolean']['output'];
};


export type ApiMutationAddCartLineArgs = {
  input: ApiAddCartLineInput;
};


export type ApiMutationCheckoutArgs = {
  input: ApiCheckoutInput;
};


export type ApiMutationClearCartLinesArgs = {
  input: ApiClearCartLinesInput;
};


export type ApiMutationCreateCartArgs = {
  input: ApiCreateCartInput;
};


export type ApiMutationCreateReviewArgs = {
  input: ApiCreateReviewInput;
};


export type ApiMutationDeleteReviewArgs = {
  id: Scalars['ID']['input'];
};


export type ApiMutationLoadCartArgs = {
  input: ApiLoadCartInput;
};


export type ApiMutationPasswordSignInArgs = {
  input: ApiPasswordSignInInput;
};


export type ApiMutationPasswordSignUpArgs = {
  input: ApiPasswordSignUpInput;
};


export type ApiMutationRemoveCartLineArgs = {
  input: ApiRemoveCartLineInput;
};


export type ApiMutationReplaceCartLinesArgs = {
  input: ApiReplaceCartLinesInput;
};


export type ApiMutationReportReviewAbuseArgs = {
  reason: Scalars['String']['input'];
  reviewId: Scalars['ID']['input'];
};


export type ApiMutationRequestPasswordRecoveryArgs = {
  input: ApiPasswordRecoveryInput;
};


export type ApiMutationResetPasswordArgs = {
  input: ApiResetPasswordInput;
};


export type ApiMutationSellerReplyToReviewArgs = {
  input: ApiSellerReplyInput;
};


export type ApiMutationUpdateCartLineQuantityArgs = {
  input: ApiUpdateCartLineQuantityInput;
};


export type ApiMutationUpdatePasswordArgs = {
  input: ApiUpdatePasswordInput;
};


export type ApiMutationUpdateReviewArgs = {
  input: ApiUpdateReviewInput;
};


export type ApiMutationUpdateUserProfileArgs = {
  input: ApiUpdateUserProfileInput;
};


export type ApiMutationVerifyEmailArgs = {
  input: ApiVerifyEmailInput;
};


export type ApiMutationVoteReviewHelpfulArgs = {
  input: ApiVoteReviewHelpfulInput;
};

export type ApiNode = {
  id: Scalars['ID']['output'];
};

/** Severity levels for cart warnings. */
export enum NotificationSeverity {
  /** Informational notice; does not indicate any change in cart data. */
  Info = 'INFO',
  /** Notification about automatic adjustments (e.g., quantity reduced). */
  Warning = 'WARNING'
}

/** Order. */
export type ApiOrder = ApiNode & {
  __typename?: 'Order';
  /** Billing address. */
  billingAddress: ApiAddress;
  /** Creation date. */
  createdAt: Scalars['DateTime']['output'];
  /** The code of the currency used for the payment. */
  currencyCode: CurrencyCode;
  /** Customer contact details. */
  customerDetails: ApiOrderCustomerDetails;
  /** Total discount amount for the order. */
  discount: ApiMoney;
  /** Financial status (payment, refund, etc.). */
  financialStatus: OrderFinancialStatus;
  /** Fulfillment status. */
  fulfillmentStatus: FulfillmentStatus;
  /** Fulfillment information. */
  fulfillments: Array<ApiFulfillment>;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Paginated order items. */
  items: ApiOrderItemConnection;
  /** Public metadata. */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** A unique numeric identifier for the order for use by shop owner and customer. */
  orderNumber: Scalars['Int']['output'];
  /** Payment method. */
  paymentMethod: ApiPaymentMethod;
  /** Refund information. */
  refunds: Array<ApiRefund>;
  /** Shipping address. */
  shippingAddress: ApiAddress;
  /** Shipping method. */
  shippingMethod: ApiShippingMethod;
  /** Order status. */
  status: OrderStatus;
  /** Order subtotal without discounts and taxes. */
  subtotal: ApiMoney;
  /** Tax lines at the order level. */
  taxLines: Array<ApiTaxLine>;
  /** Order total including discounts and taxes. */
  total: ApiMoney;
  /** Shipping cost. */
  totalShippingAmount: ApiMoney;
  /** Total tax amount for the order. */
  totalTaxAmount: ApiMoney;
  /** Last updated date. */
  updatedAt: Scalars['DateTime']['output'];
};


/** Order. */
export type ApiOrderItemsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** A paginated list of Orders. */
export type ApiOrderConnection = {
  __typename?: 'OrderConnection';
  /** List of edges in this connection. */
  edges: Array<ApiOrderEdge>;
  /** Pagination metadata. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** Customer's contact details in the order. */
export type ApiOrderCustomerDetails = {
  __typename?: 'OrderCustomerDetails';
  /** Customer's email address. */
  email: Scalars['Email']['output'];
  /** Public metadata (plugins, notes, etc.). */
  metadata?: Maybe<Scalars['JSON']['output']>;
  /** Customer's full name. */
  name: ApiUserName;
  /** Customer's phone number in E.164 format. */
  phone: Scalars['Phone']['output'];
};

/** Input type for customer's contact details. */
export type ApiOrderCustomerDetailsInput = {
  /** Customer's email address. */
  email: Scalars['Email']['input'];
  /** Additional public metadata. */
  metadata?: InputMaybe<Scalars['JSON']['input']>;
  /** Customer's full name. */
  name: ApiUserNameInput;
  /** Customer's phone number in E.164 format. */
  phone: Scalars['Phone']['input'];
};

/** A single edge in a paginated list of Orders. */
export type ApiOrderEdge = {
  __typename?: 'OrderEdge';
  /** Cursor for this edge. */
  cursor: Scalars['Cursor']['output'];
  /** The Order at this edge. */
  node: ApiOrder;
};

export enum OrderFinancialStatus {
  Authorized = 'AUTHORIZED',
  Paid = 'PAID',
  PartiallyPaid = 'PARTIALLY_PAID',
  PartiallyRefunded = 'PARTIALLY_REFUNDED',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Voided = 'VOIDED'
}

/** Order item (line) in the order. */
export type ApiOrderItem = ApiNode & {
  __typename?: 'OrderItem';
  /** Discount amount for this item. */
  discountAmount: ApiMoney;
  /** Subtotal for this item after item level discounts. */
  discountedSubtotalAmount: ApiMoney;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Quantity of units. */
  quantity: Scalars['Int']['output'];
  /** Subtotal for this item without discounts. */
  subtotalAmount: ApiMoney;
  /** The purchasable item such as a product or bundle. */
  target: ApiPurchasable;
  /** Product title. */
  title: Scalars['String']['output'];
  /** Total amount for this item including taxes and discounts. */
  totalAmount: ApiMoney;
};

/** Connection for order items (Relay-style pagination). */
export type ApiOrderItemConnection = {
  __typename?: 'OrderItemConnection';
  /** List of item edges. */
  edges: Array<ApiOrderItemEdge>;
  /** Pagination information. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** Cursor for Relay-style pagination. */
export type ApiOrderItemEdge = {
  __typename?: 'OrderItemEdge';
  /** Cursor for Relay-style pagination. */
  cursor: Scalars['Cursor']['output'];
  /** Node containing the order item data. */
  node: ApiOrderItem;
};

/** Overall order status. */
export enum OrderStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Pending = 'PENDING'
}

/** A content page. */
export type ApiPage = ApiNode & {
  __typename?: 'Page';
  /** The cover image for the page. */
  cover?: Maybe<ApiFile>;
  /** The date and time when the page was created. */
  createdAt: Scalars['DateTime']['output'];
  /** The full description of the page. */
  description: Scalars['String']['output'];
  /** A short excerpt of the page. */
  excerpt: Scalars['String']['output'];
  /** Gallery of additional images with cursor-based pagination. */
  gallery: ApiGalleryConnection;
  /** Unique human-readable slug. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The type of the page (e.g., "page", "article"). */
  pageType: Scalars['String']['output'];
  /** The page’s title. */
  title: Scalars['String']['output'];
  /** The date and time when the page was last updated. */
  updatedAt: Scalars['DateTime']['output'];
};


/** A content page. */
export type ApiPageGalleryArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** Connection type for pages. */
export type ApiPageConnection = {
  __typename?: 'PageConnection';
  /** List of page edges. */
  edges: Array<ApiPageEdge>;
  /** Pagination details. */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

/** An edge in the paginated list of pages. */
export type ApiPageEdge = {
  __typename?: 'PageEdge';
  /** Cursor for pagination. */
  cursor: Scalars['Cursor']['output'];
  /** The page node. */
  node: ApiPage;
};

/** Pagination information according to the Relay/Shopify spec. */
export type ApiPageInfo = {
  __typename?: 'PageInfo';
  /** The cursor corresponding to the last node in edges. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** The cursor corresponding to the first node in edges. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export enum PageSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

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

export type ApiPaymentMethod = ApiNode & {
  __typename?: 'PaymentMethod';
  /** Payment method type. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Title of the payment method. */
  title: Scalars['String']['output'];
};

/** Input type for executing predictive search (autocomplete suggestions). */
export type ApiPredictiveSearchInput = {
  /** The search query string. */
  query: Scalars['String']['input'];
};

/** Result of a predictive search: arrays of matching entities for quick suggestions. */
export type ApiPredictiveSearchResult = {
  __typename?: 'PredictiveSearchResult';
  /** Top matching articles. */
  articles: Array<ApiArticle>;
  /** Top matching categories. */
  categories: Array<ApiCategory>;
  /** Top matching pages. */
  pages: Array<ApiPage>;
  /** Top matching products. */
  products: Array<ApiProduct>;
};

/** Filter representing a price range filter. */
export type ApiPriceRangeFilter = ApiFilter & {
  __typename?: 'PriceRangeFilter';
  /** Count of products in the range. */
  count: Scalars['Int']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['String']['output'];
  iid: Scalars['Uuid']['output'];
  /** Maximum price in the range. */
  maxPrice: ApiMoney;
  /** Minimum price in the range. */
  minPrice: ApiMoney;
  title: Scalars['String']['output'];
};

/** A product in the catalog. */
export type ApiProduct = ApiNode & {
  __typename?: 'Product';
  /** All categories this product [variant] belongs to. */
  categories: ApiCategoryConnection;
  /** Primary category of the product. */
  category?: Maybe<ApiCategory>;
  /** Original or list price when on sale. */
  compareAtPrice?: Maybe<ApiMoney>;
  /** Private field won't be in prod. Used for internal purposes. */
  containerId: Scalars['Uuid']['output'];
  /** Primary cover image of the product. */
  cover?: Maybe<ApiFile>;
  /** DateTime when the category was created. */
  createdAt: Scalars['DateTime']['output'];
  /** Full description of the product. */
  description: Scalars['String']['output'];
  /** Short excerpt or summary of the product. */
  excerpt: Scalars['String']['output'];
  /** Feature sections and their values. */
  features: Array<ApiProductFeature>;
  /** Gallery of additional images with cursor-based pagination. */
  gallery: ApiGalleryConnection;
  /** Groups of related products (e.g., bundles). */
  groups: Array<ApiProductGroup>;
  /** URL-friendly slug for the product. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /**
   * All option groups defined for this product—each group represents a configurable attribute
   * (for example: color, size, material) and includes the full set of possible values.
   */
  options: Array<ApiProductOption>;
  /** Current price of the product, including currency. */
  price: ApiMoney;
  /** Type of product */
  productType?: Maybe<Scalars['String']['output']>;
  /** Product rating. */
  rating: ApiProductRating;
  /** List of reviews with pagination/filters. */
  reviews: ApiProductReviewConnection;
  /**
   * The ordered list of value handles currently applied to this product configuration.
   * Each entry is the `handle` of a selected `ProductOptionValue` (for example: ["red", "m", "patterned"]).
   */
  selectedOptions: Array<Scalars['String']['output']>;
  /** Seo description for the product page. */
  seoDescription?: Maybe<Scalars['String']['output']>;
  /** Seo title for the product page. */
  seoTitle?: Maybe<Scalars['String']['output']>;
  /** Stock keeping unit identifier. */
  sku?: Maybe<Scalars['String']['output']>;
  /** Stock availability information. */
  stockStatus: ApiStockStatus;
  /** Tags associated with the product. */
  tags: ApiTagConnection;
  /** Name of the product. */
  title: Scalars['String']['output'];
  /** DateTime when the category was last updated. */
  updatedAt: Scalars['DateTime']['output'];
  /** Variants of the product (different option combinations). */
  variants: Array<ApiProduct>;
};


/** A product in the catalog. */
export type ApiProductCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CategorySort>;
};


/** A product in the catalog. */
export type ApiProductGalleryArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


/** A product in the catalog. */
export type ApiProductReviewsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ProductReviewSort>;
};


/** A product in the catalog. */
export type ApiProductTagsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<TagSort>;
};

/** A specific feature of a product, such as "Color" or "Size". */
export type ApiProductFeature = ApiNode & {
  __typename?: 'ProductFeature';
  /** Machine-friendly slug for the feature, e.g., "color" or "size". */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Human-readable name of the feature shown to users. */
  title: Scalars['String']['output'];
  /** Available values for this feature. */
  values: Array<ApiProductFeatureValue>;
};

/** A single possible value for a product feature, such as "Red" or "Large". */
export type ApiProductFeatureValue = ApiNode & {
  __typename?: 'ProductFeatureValue';
  /** Machine-friendly slug for the value, e.g., "red" or "large". */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Display name of the value shown to users. */
  title: Scalars['String']['output'];
};

/** A group of related products (e.g., bundled items). */
export type ApiProductGroup = ApiNode & {
  __typename?: 'ProductGroup';
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Whether multiple items can be selected from this group. */
  isMultiple: Scalars['Boolean']['output'];
  /** Whether at least one item from this group is required. */
  isRequired: Scalars['Boolean']['output'];
  /** List of products in this group. */
  items: Array<ApiProductGroupItem>;
  /** Human-readable title of the group. */
  title: Scalars['String']['output'];
};

/** An item within a product group, with optional quantity and custom pricing. */
export type ApiProductGroupItem = {
  __typename?: 'ProductGroupItem';
  /** Optional quantity for this item in the group. */
  maxQuantity?: Maybe<Scalars['Int']['output']>;
  /** Pricing strategy and override values for this item. */
  price: ApiProductGroupPrice;
  /** The product included in this group. */
  product: ApiProduct;
};

/** Defines how to calculate the price for a grouped item. */
export type ApiProductGroupPrice = {
  __typename?: 'ProductGroupPrice';
  /**
   * Fixed amount to add to the product’s base price.
   * Only used when `type: FIXED`.
   */
  amount?: Maybe<ApiMoney>;
  /**
   * Percentage to add to the product’s base price (e.g. 10.0 adds 10%).
   * Only used when `type: PERCENT`.
   */
  percentage?: Maybe<Scalars['Float']['output']>;
  /** Pricing mode to apply. */
  type: ProductGroupPriceType;
};

/** Available pricing modes for group items. */
export enum ProductGroupPriceType {
  /** Use the product's standard price. */
  Base = 'BASE',
  /** Add a fixed markup (the `amount` field) to the base price. */
  Fixed = 'FIXED',
  /** Include the item free of charge. */
  Free = 'FREE',
  /** Add a percentage markup (the `percentage` field) to the base price. */
  Percent = 'PERCENT'
}

/** A group of product options (e.g., "Color", "Size"). */
export type ApiProductOption = ApiNode & {
  __typename?: 'ProductOption';
  /** The display type (color swatch, image, or control). */
  displayType: ProductOptionDisplayType;
  /** The slug for this group (e.g., "color", "size"). */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The display name of the option group shown to users. */
  title: Scalars['String']['output'];
  /** The selected or available value in this group. */
  values: Array<ApiProductOptionValue>;
};

/** How a product option is displayed in the UI. */
export enum ProductOptionDisplayType {
  /** Apparel size control (e.g., S, M, L, XL). */
  ApparelSize = 'APPAREL_SIZE',
  /** Display options in a dropdown select. */
  Dropdown = 'DROPDOWN',
  /** Display options as radio buttons with text. */
  Radio = 'RADIO',
  /** Display a swatch (color or image). */
  Swatch = 'SWATCH',
  /** Display an image (e.g., picture or video). */
  VariantCover = 'VARIANT_COVER'
}

/** A single value for a product option (e.g., "Red", "XL", "Patterned"). */
export type ApiProductOptionValue = ApiNode & {
  __typename?: 'ProductOptionValue';
  /** The human-readable slug used in API/URLs. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The swatch object. For swatch display type. */
  swatch?: Maybe<ApiSwatch>;
  /** The display name of the value shown to users. */
  title: Scalars['String']['output'];
};

export type ApiProductRating = ApiNode & {
  __typename?: 'ProductRating';
  /** Rating breakdown details. */
  breakdown: Array<ApiRatingBreakdown>;
  /** Number of approved reviews. */
  count: Scalars['Int']['output'];
  /** Global ID of the rating. */
  id: Scalars['ID']['output'];
  /** Internal ID of the rating. (product container id) */
  iid: Scalars['Uuid']['output'];
  /** Average rating. */
  rating: Scalars['Float']['output'];
};

/** ProductReview — user review of a product (Relay-Node). */
export type ApiProductReview = ApiNode & {
  __typename?: 'ProductReview';
  /** Product cons. */
  cons?: Maybe<Scalars['String']['output']>;
  /** Creation date. */
  createdAt: Scalars['DateTime']['output'];
  /** Author's name. */
  displayName: Scalars['String']['output'];
  /** Last edit date. */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Total "not helpful" votes. */
  helpfulNo: Scalars['Int']['output'];
  /** Total "helpful" votes. */
  helpfulYes: Scalars['Int']['output'];
  /** Global ID of the review. */
  id: Scalars['ID']['output'];
  /** Internal ID of the review. */
  iid: Scalars['Uuid']['output'];
  /** Review language (ISO-639-1). */
  locale?: Maybe<Scalars['String']['output']>;
  /** Did the current user mark the review as helpful? */
  meHelpful: Scalars['Boolean']['output'];
  /** Attached media files. */
  media?: Maybe<Array<ApiFile>>;
  /** Main review text. */
  message: Scalars['String']['output'];
  /** Product pros. */
  pros?: Maybe<Scalars['String']['output']>;
  /** Number of stars (1–5, step 0.5). */
  rating: Scalars['Float']['output'];
  /** Seller reply (if any). */
  sellerReply?: Maybe<ApiReviewComment>;
  /** Publication status. */
  status: ReviewStatus;
  /** Review title. */
  title?: Maybe<Scalars['String']['output']>;
  /** Review author. */
  user: ApiUser;
  /** Whether the product was actually purchased by this user. */
  verifiedPurchase: Scalars['Boolean']['output'];
};

export type ApiProductReviewConnection = {
  __typename?: 'ProductReviewConnection';
  edges: Array<ApiProductReviewEdge>;
  pageInfo: ApiPageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ApiProductReviewEdge = {
  __typename?: 'ProductReviewEdge';
  cursor: Scalars['String']['output'];
  node: ApiProductReview;
};

export enum ProductReviewSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  HelpfulYesDesc = 'HELPFUL_YES_DESC',
  RatingDesc = 'RATING_DESC'
}

export type ApiPurchasable = ApiProduct;

export type ApiQuery = {
  __typename?: 'Query';
  /** Retrieve a single article by its slug. */
  article?: Maybe<ApiArticle>;
  /** Retrieve a paginated list of articles (Relay Connection). */
  articles: ApiArticleConnection;
  /** Retrieve a paginated list of categories. */
  categories: ApiCategoryConnection;
  /** Retrieve a single category by its handle. */
  category?: Maybe<ApiCategory>;
  /** Retrieve a single menu by its handle. */
  menu?: Maybe<ApiMenu>;
  /** Retrieve a paginated list of menus (Relay Connection). */
  menus: ApiMenuConnection;
  node?: Maybe<ApiNode>;
  /** Retrieve a single page by its slug. */
  page?: Maybe<ApiPage>;
  /** Retrieve a paginated list of pages (Relay Connection). */
  pages: ApiPageConnection;
  /** Performs a predictive (autocomplete) search and returns a limited list of entities. */
  predictiveSearch: ApiPredictiveSearchResult;
  /** Fetch a single product by its handle (slug). */
  product?: Maybe<ApiProduct>;
  /** Performs a full search and returns Relay‐style connections for each entity. */
  search: ApiSearchResult;
  /** Retrieves the current authentication session. */
  session?: Maybe<ApiSession>;
};


export type ApiQueryArticleArgs = {
  slug: Scalars['String']['input'];
};


export type ApiQueryArticlesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ArticleSort>;
};


export type ApiQueryCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CategorySort>;
};


export type ApiQueryCategoryArgs = {
  handle: Scalars['String']['input'];
};


export type ApiQueryMenuArgs = {
  handle: Scalars['String']['input'];
};


export type ApiQueryMenusArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<MenuSort>;
};


export type ApiQueryNodeArgs = {
  id: Scalars['ID']['input'];
};


export type ApiQueryPageArgs = {
  slug: Scalars['String']['input'];
};


export type ApiQueryPagesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<PageSort>;
};


export type ApiQueryPredictiveSearchArgs = {
  input: ApiPredictiveSearchInput;
};


export type ApiQueryProductArgs = {
  handle: Scalars['String']['input'];
};


export type ApiQuerySearchArgs = {
  input: ApiSearchInput;
};

export type ApiRatingBreakdown = {
  __typename?: 'RatingBreakdown';
  /** Number of approved reviews. */
  count: Scalars['Int']['output'];
  /** Percentage of approved reviews. */
  percentage: Scalars['Float']['output'];
  /** Number of stars (1–5, step 0.5). */
  star: Scalars['Int']['output'];
};

/** Filter representing a rating range filter. */
export type ApiRatingRangeFilter = ApiFilter & {
  __typename?: 'RatingRangeFilter';
  /** Count of products in the range. */
  count: Scalars['Int']['output'];
  handle: Scalars['String']['output'];
  id: Scalars['String']['output'];
  iid: Scalars['Uuid']['output'];
  /** Maximum rating in the range. */
  maxRate: Scalars['Float']['output'];
  /** Minimum rating in the range. */
  minRate: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

/** Refund information for the order. */
export type ApiRefund = ApiNode & {
  __typename?: 'Refund';
  /** Refund amount. */
  amount: ApiMoney;
  /** Refund creation date. */
  createdAt: Scalars['DateTime']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Reason for the refund. */
  reason?: Maybe<Scalars['String']['output']>;
};

/** Input data for removing a single item from the cart. */
export type ApiRemoveCartLineInput = {
  /** ID of the cart. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * ID of the product to remove.
   * Error if the product is not found in the cart.
   */
  productId: Scalars['ID']['input'];
};

/** Payload returned after removing an item from the cart. */
export type ApiRemoveCartLinePayload = {
  __typename?: 'RemoveCartLinePayload';
  /** The updated cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

/** Input data for replacing all items in an existing cart. */
export type ApiReplaceCartLinesInput = {
  /** ID of the cart to update. */
  cartId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * New list of items for the cart.
   * Providing an empty array clears the cart completely.
   */
  items: Array<ApiCartLineInput>;
};

/** Payload returned after replacing all items in the cart. */
export type ApiReplaceCartLinesPayload = {
  __typename?: 'ReplaceCartLinesPayload';
  /** The updated cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
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

/** Comment/reply to a review. */
export type ApiReviewComment = ApiNode & {
  __typename?: 'ReviewComment';
  /** Comment author. */
  author: ApiUser;
  /** Creation date. */
  createdAt: Scalars['DateTime']['output'];
  /** Last edit date. */
  editedAt?: Maybe<Scalars['DateTime']['output']>;
  /** Global unique identifier. */
  id: Scalars['ID']['output'];
  /** Comment message. */
  message: Scalars['String']['output'];
};

/** Review status. */
export enum ReviewStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

/** Input type for executing full search. */
export type ApiSearchInput = {
  /** The search query string. */
  query: Scalars['String']['input'];
};

/** Result of a full search: a set of Relay connections for various entity types. */
export type ApiSearchResult = {
  __typename?: 'SearchResult';
  /** Relay‐style connection for articles. */
  articles: ApiArticleConnection;
  /** Relay‐style connection for categories. */
  categories: ApiCategoryConnection;
  /** Relay‐style connection for pages. */
  pages: ApiPageConnection;
  /** Relay‐style connection for products. */
  products: ApiListingConnection;
};


/** Result of a full search: a set of Relay connections for various entity types. */
export type ApiSearchResultArticlesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ArticleSort>;
};


/** Result of a full search: a set of Relay connections for various entity types. */
export type ApiSearchResultCategoriesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CategorySort>;
};


/** Result of a full search: a set of Relay connections for various entity types. */
export type ApiSearchResultPagesArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<PageSort>;
};


/** Result of a full search: a set of Relay connections for various entity types. */
export type ApiSearchResultProductsArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  filters?: InputMaybe<Array<ApiFilterInput>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<ListingSort>;
};

export type ApiSellerReplyInput = {
  reviewId: Scalars['ID']['input'];
  text: Scalars['String']['input'];
};

/** Represents an authentication session. */
export type ApiSession = {
  __typename?: 'Session';
  /** JWT access token for authenticating subsequent requests. */
  accessToken?: Maybe<Scalars['String']['output']>;
  /** The authenticated user. */
  user: ApiUser;
};

export type ApiShippingMethod = ApiNode & {
  __typename?: 'ShippingMethod';
  /** Estimated delivery time as a textual representation. */
  estimatedDeliveryTime?: Maybe<Scalars['String']['output']>;
  /** Payment method type. */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Title of the payment method. */
  title: Scalars['String']['output'];
};

/** Stock status of the product. */
export type ApiStockStatus = {
  __typename?: 'StockStatus';
  /** Machine-readable status identifier (e.g., "IN_STOCK", "OUT_OF_STOCK"). */
  handle: Scalars['String']['output'];
  /** Indicates whether the product is available for purchase. */
  isAvailable: Scalars['Boolean']['output'];
};

export type ApiSwatch = {
  __typename?: 'Swatch';
  /** The primary color in HEX format, e.g., "#ff0000". */
  color: Scalars['String']['output'];
  /** An optional secondary color (e.g., for gradients). */
  color2?: Maybe<Scalars['String']['output']>;
  /** The type of swatch. */
  displayType: SwatchDisplayType;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The image or video file. */
  image?: Maybe<ApiFile>;
};

export enum SwatchDisplayType {
  Color = 'COLOR',
  ColorDuo = 'COLOR_DUO',
  Image = 'IMAGE'
}

export type ApiTag = ApiNode & {
  __typename?: 'Tag';
  /** Slug is a unique identifier for the Tag in the human-readable format */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The title */
  title: Scalars['String']['output'];
};

export type ApiTagConnection = {
  __typename?: 'TagConnection';
  /** List of category edges (each contains a node and a cursor). */
  edges: Array<ApiTagEdge>;
  /** Pagination metadata (hasNextPage, endCursor, etc.). */
  pageInfo: ApiPageInfo;
  /** The total number of items. */
  totalCount: Scalars['Int']['output'];
};

export type ApiTagEdge = {
  __typename?: 'TagEdge';
  /** Cursor for Relay-style pagination. */
  cursor: Scalars['Cursor']['output'];
  /** Node containing the category data. */
  node: ApiTag;
};

export enum TagSort {
  CreatedAtAsc = 'CREATED_AT_ASC',
  CreatedAtDesc = 'CREATED_AT_DESC',
  TitleAsc = 'TITLE_ASC',
  TitleDesc = 'TITLE_DESC',
  UpdatedAtAsc = 'UPDATED_AT_ASC',
  UpdatedAtDesc = 'UPDATED_AT_DESC'
}

/** Detailed tax line. */
export type ApiTaxLine = ApiNode & {
  __typename?: 'TaxLine';
  /** Tax amount. */
  amountCollected: ApiMoney;
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** Tax rate (decimal value, e.g., 0.20). */
  rate: Scalars['Float']['output'];
  /** Tax type name, e.g., VAT. */
  title: Scalars['String']['output'];
};

/** A node representing an arbitrary URL. */
export type ApiUrlNode = {
  __typename?: 'URLNode';
  /** The URL string. */
  url: Scalars['String']['output'];
};

/** Input data for updating the quantity of a specific cart item. */
export type ApiUpdateCartLineQuantityInput = {
  /** ID of the cart. */
  cartId: Scalars['ID']['input'];
  /** ID of the cart item to update. */
  cartItemId: Scalars['ID']['input'];
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /**
   * New quantity for the cart item.
   * If set to 0, the item will be removed.
   */
  quantity: Scalars['Int']['input'];
};

/** Payload returned after updating a cart item's quantity. */
export type ApiUpdateCartLineQuantityPayload = {
  __typename?: 'UpdateCartLineQuantityPayload';
  /** The updated cart. */
  cart?: Maybe<ApiCart>;
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific or general errors. */
  errors?: Maybe<Array<ApiFieldError>>;
};

/** Input data for changing the password of an authenticated user. */
export type ApiUpdatePasswordInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** New password. */
  password: Scalars['String']['input'];
};

/** Payload returned after updating the password. */
export type ApiUpdatePasswordPayload = {
  __typename?: 'UpdatePasswordPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** True if the password was updated successfully. */
  success: Scalars['Boolean']['output'];
};

export type ApiUpdateReviewInput = {
  cons?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  images?: InputMaybe<Array<Scalars['ID']['input']>>;
  message?: InputMaybe<Scalars['String']['input']>;
  pros?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Input data for updating the authenticated user's profile. */
export type ApiUpdateUserProfileInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** New email address (optional). */
  email?: InputMaybe<Scalars['Email']['input']>;
  /** Preferred interface language (locale code). */
  language?: InputMaybe<LocaleCode>;
  /** User's full name. */
  name?: InputMaybe<ApiUserNameInput>;
  /** Phone number in E.164 format. */
  phone?: InputMaybe<Scalars['Phone']['input']>;
};

/** Payload returned after updating the user profile. */
export type ApiUpdateUserProfilePayload = {
  __typename?: 'UpdateUserProfilePayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** The updated user object. */
  user?: Maybe<ApiUser>;
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
  /** Paginated list of the user's orders. */
  orders: ApiOrderConnection;
  /** Phone number in E.164 format. */
  phone?: Maybe<Scalars['Phone']['output']>;
};


/** Represents a user in the system. */
export type ApiUserOrdersArgs = {
  after?: InputMaybe<Scalars['Cursor']['input']>;
  before?: InputMaybe<Scalars['Cursor']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
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

/** Input type for customer's name. */
export type ApiUserNameInput = {
  /** First name. */
  first: Scalars['String']['input'];
  /** Last name. */
  last: Scalars['String']['input'];
  /** Middle name (optional). */
  middle?: InputMaybe<Scalars['String']['input']>;
};

export type ApiVendor = ApiNode & {
  __typename?: 'Vendor';
  /** Slug is a unique identifier for the Vendor in the human-readable format */
  handle: Scalars['String']['output'];
  /** Global unique identifier for the address. */
  id: Scalars['ID']['output'];
  /** Object identifier (Internal). */
  iid: Scalars['Uuid']['output'];
  /** The title */
  title: Scalars['String']['output'];
};

/** Input data for verifying a user's email address. */
export type ApiVerifyEmailInput = {
  /** Unique identifier for the client mutation. */
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  /** Email address to verify. */
  email: Scalars['Email']['input'];
  /** Verification token sent to the email. */
  token: Scalars['String']['input'];
};

/** Payload returned after email verification. */
export type ApiVerifyEmailPayload = {
  __typename?: 'VerifyEmailPayload';
  /** Unique identifier echoed from the input. */
  clientMutationId?: Maybe<Scalars['String']['output']>;
  /** List of field-specific errors. */
  errors?: Maybe<Array<ApiFieldError>>;
  /** Session created upon successful verification. */
  session?: Maybe<ApiSession>;
};

export type ApiVoteReviewHelpfulInput = {
  helpful: Scalars['Boolean']['input'];
  reviewId: Scalars['ID']['input'];
};
