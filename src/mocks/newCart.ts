import { ApiCart, CountryCode, CurrencyCode } from "@codegen/schema-client";
import { mockCartProducts } from "./cartProducts";
import { newMockCartProducts } from "./newCartProducts";


export const newMockCart: ApiCart = {
  __typename: 'Cart',
  /** List of all discounts applied at the cart level. */
  appliedDiscounts: [{
    __typename: 'AppliedDiscount',
    /** Amount by which the cost was reduced. */
    amount: {
      __typename: 'Money',
      amount: 10,
      currencyCode: CurrencyCode.Usd,
    },
    /** Coupon code used (if this is a coupon). */
    code: 'cart-sale-10',
    /** ID of the promotion or coupon in the system (if applicable). */
    id: 'cart-discount-1',
  }],
  /** Details of all tax components applied at the cart level. */
  appliedTaxLines: [{
    __typename: 'TaxLine',
    /** Tax amount. */
    amountCollected: {
      __typename: 'Money',
      amount: 20,
      currencyCode: CurrencyCode.Usd,
    },
    /** Global unique identifier for the address. */
    id: 'cart-tax-id-1',
    /** Object identifier (Internal). */
    iid: 'cart-tax-iid-1',
    /** Tax rate (decimal value, e.g., 0.20). */
    rate: 0.2,
    /** Tax type name, e.g., VAT. */
    title: 'VAT',
  }],
  /** Billing address, if provided. */

  /* billingAddress?: Maybe<ApiAddress>, */

  /** All cost calculations for the cart. */
  cost: {
    __typename: 'CartCost',
    /** Shipping cost including taxes (if selected). */
    shippingCost: {
      __typename: 'Money',
      amount: 3,
      currencyCode: CurrencyCode.Usd,
    },
    /** Total value of items before any discounts. */
    subtotalAmount: {
      __typename: 'Money',
      amount: 10,
      currencyCode: CurrencyCode.Usd,
    },
    /** Final amount to be paid, including item cost, shipping, and taxes. */
    totalAmount: {
      __typename: 'Money',
      amount: 10,
      currencyCode: CurrencyCode.Usd,
    },
    /** Total discount from both item-level and cart-level promotions. */
    totalDiscountAmount: {
      __typename: 'Money',
      amount: 10,
      currencyCode: CurrencyCode.Usd,
    },
    /** Total tax amount applied to the cart. */
    totalTaxAmount: {
      __typename: 'Money',
      amount: 10,
      currencyCode: CurrencyCode.Usd,
    },
  },
  /** When this cart was first created. */
  id: "1",
  iid: "uuid-1",
  /** List of items in the cart (paginated). */
  lines: {
    __typename: 'CartLineConnection',
    /** List of CartLine edges. */
    edges: [{
      __typename: 'CartLineEdge',
      /** Cursor for pagination. */
      cursor: "cursor-1",
      /** The CartLine at this edge. */
      node: newMockCartProducts[0],
    }],
    /** Pagination information. */
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "cursor-1",
      endCursor: `cursor-1`,
    },
    totalCount: mockCartProducts.length,
  },
  /** Notifications for the user regarding the cart. */
  notifications: [],
  /** Shipping address, if provided. */
  shippingAddress: {
    __typename: 'Address',
    addressLine1: "Deribasovskaya street",
    addressLine2: "3",
    city: "Odessa",
    countryCode: CountryCode.Ua,
    email: 'example@io.com',
    firstName: 'Gomer',
    id: "address-id-1",
    iid: "address-iid-1",
    lastName: "Simpson",
    latitude: 0,
    longitude: 0,
    metadata: {},
    middleName: "J.",
    phone: '+19991111111',
    postalCode: '65000',
    provinceCode: 'OD',
  },
  shippingDetails: {
    __typename: 'CartShippingDetails',
    availableMethods: [{
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'nova-poshta-warehouse',
      id: 'ShippingMethod-id-1',
      iid: 'ShippingMethod-iid-1',
      title: "Nova Poshta [Warehouse]",
      type: 'warehouse'
    }, {
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'nova-poshta-address',
      id: 'ShippingMethod-id-2',
      iid: 'ShippingMethod-iid-2',
      title: "Nova Poshta [Address]",
      type: 'address'

    }, {
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'meest-express-address',
      id: 'ShippingMethod-id-3',
      iid: 'ShippingMethod-iid-3',
      title: "Meest express [Address]",
      type: 'address'
    }],
    estimatedDeliveryDate: '',
    selectedMethod: {
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'nova-poshta-warehouse',
      id: 'ShippingMethod-id-1',
      iid: 'ShippingMethod-iid-1',
      title: "Nova Poshta [Warehouse]",
      type: 'warehouse'
    },
  },

  paymentDetails: {
    __typename: 'CartPaymentDetails',

    availableMethods: [{
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'card',
      id: 'PaymentMethod-id-1',
      iid: 'PaymentMethod-iid-1',
      title: "Credit or debit card",
      type: 'card'
    }, {
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'cache',
      id: 'PaymentMethod-id-2',
      iid: 'PaymentMethod-iid-2',
      title: "Cache on delivery",
      type: 'cache'
    },],
    selectedMethod: {
      __typename: 'ShippingMethod',
      estimatedDeliveryTime: '',
      handle: 'card',
      id: 'PaymentMethod-id-1',
      iid: 'PaymentMethod-iid-1',
      title: "Credit or debit card",
    },
  },
  /** Quantity of the item being purchased. */
  totalQuantity: mockCartProducts.length,
  createdAt: "2025-05-20T12:00:00.000Z",
  updatedAt: "2025-05-20T12:00:00.000Z",
};
