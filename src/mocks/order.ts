import {
  ApiOrder,
  CountryCode,
  CurrencyCode,
  OrderStatus,
} from "@codegen/schema-client";

export const mockOrder: ApiOrder = {
  __typename: "Order",

  id: "1",
  iid: "uuid-1",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  billingAddress: {
    __typename: "Address",
    id: "1",
    iid: "iid-1",
    addressLine1: "123 Test St",
    city: "Chicago",
    countryCode: CountryCode.Us,
    email: "example@io.com",
    firstName: "First",
    lastName: "Last",
    latitude: null,
    longitude: null,
    metadata: {},
    middleName: "",
    phone: "1 (999)-99-99-99",
    postalCode: "60601",
    provinceCode: "IL",
  },

  shippingAddress: {
    __typename: "Address",
    id: "1",
    iid: "iid-1",
    addressLine1: "123 Test St",
    city: "Chicago",
    countryCode: CountryCode.Us,
    email: "example@io.com",
    firstName: "First",
    lastName: "Last",
    latitude: null,
    longitude: null,
    metadata: {},
    middleName: "",
    phone: "1 (999)-99-99-99",
    postalCode: "60601",
    provinceCode: "IL",
  },

  customerDetails: {
    __typename: "OrderCustomerDetails",
    email: "example@io.com",
    metadata: {},
    name: {
      __typename: "UserName",
      first: "First",
      last: "Last",
    },
    phone: "+1 (999)-99-99-99",
  },

  items: {
    __typename: "OrderItemConnection",
    totalCount: 1,
    pageInfo: {
      __typename: "PageInfo",
      startCursor: "",
      endCursor: "",
      hasNextPage: false,
      hasPreviousPage: false,
    },
    edges: [
      {
        __typename: "OrderItemEdge",
        cursor: "cursor-1",
        node: {
          __typename: "OrderItem",
          id: "1",
          iid: "iid-1",
          quantity: 1,
          title: "Mock Product",
          unitPrice: {
            amount: 2400,
            currencyCode: CurrencyCode.Usd,
          },
          subtotal: {
            amount: 2400,
            currencyCode: CurrencyCode.Usd,
          },
          discount: {
            amount: 50,
            currencyCode: CurrencyCode.Usd,
          },
          tax: {
            amount: 0,
            currencyCode: CurrencyCode.Usd,
          },
          total: {
            amount: 2350,
            currencyCode: CurrencyCode.Usd,
          },
          taxLines: [
            {
              __typename: "TaxLine",
              id: "1",
              iid: "iid-1",
              price: {
                amount: 24,
                currencyCode: CurrencyCode.Usd,
              },
              rate: 0.1,
              title: "Sales Tax",
            },
          ],
          target: {
            __typename: "Product",
            id: "prod-1",
            iid: "prod-uuid-1",
            title: "Mock Product",
            description: "This is a mock product.",
            excerpt: "Short description",
            price: {
              amount: 2400,
              currencyCode: CurrencyCode.Usd,
            },
            stockStatus: {
              __typename: "StockStatus",

              handle: "",

              isAvailable: true,
            },
            tags: [],
            categories: [],
            breadcrumbs: [],
            cover: null,
            compareAtPrice: null,
            features: [],
            gallery: {
              __typename: "GalleryConnection",
              edges: [],
              totalCount: 1,
              pageInfo: {
                __typename: "PageInfo",
                hasNextPage: false,
                hasPreviousPage: false,
                startCursor: null,
                endCursor: null,
              },
            },
            groups: [],
            handle: "mock-product",
            options: [],
            productType: null,
            rating: null,
            seoDescription: null,
            seoTitle: null,
            sku: null,
            variants: [],
          },
        },
      },
    ],
  },

  fulfillments: [
    {
      __typename: "Fulfillment",
      id: "1",
      iid: "iid-1",
      createdAt: new Date().toISOString(),
      status: "Delivered",
      trackingNumber: "",
      trackingUrl: "",
      lines: [
        {
          __typename: "FulfillmentLine",
          id: "1",
          iid: "iid-1",
          orderItemId: "1",
          quantity: 1,
        },
      ],
    },
  ],

  shippingMethod: {
    __typename: "ShippingMethod",
    id: "1",
    iid: "uuid-ship-1",
    handle: "standard",
    title: "Shipping-1",
  },

  shippingCost: {
    amount: 15,
    currencyCode: CurrencyCode.Usd,
  },

  discount: {
    amount: 2400,
    currencyCode: CurrencyCode.Usd,
  },

  tax: {
    amount: 24,
    currencyCode: CurrencyCode.Usd,
  },

  taxLines: [
    {
      __typename: "TaxLine",
      id: "1",
      iid: "iid-1",
      price: {
        amount: 24,
        currencyCode: CurrencyCode.Usd,
      },
      rate: 0.1,
      title: "Sales Tax",
    },
  ],

  subtotal: {
    amount: 2400,
    currencyCode: CurrencyCode.Usd,
  },

  total: {
    amount: 39,
    currencyCode: CurrencyCode.Usd,
  },

  paymentMethod: {
    __typename: "PaymentMethod",
    id: "1",
    iid: "uuid-1",
    handle: "paymentMethod-1",
    title: "PaymentMethod 1",
  },

  refunds: [
    {
      __typename: "Refund",
      id: "1",
      iid: "iid-1",
      amount: {
        amount: 24,
        currencyCode: CurrencyCode.Usd,
      },
      createdAt: new Date().toISOString(),
      reason: "",
    },
  ],

  status: OrderStatus.Active,
  //financialStatus: FinancialStatus.Paid,
  fulfillmentStatus: "Delivered",
};
