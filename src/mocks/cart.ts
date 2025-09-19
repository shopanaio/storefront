import { ApiCart, CurrencyCode } from "@codegen/schema-client";
import { mockCartProducts } from "./cartProducts";

const subtotalAmount = mockCartProducts.reduce((acc, item) => {
  return acc + item.subtotal.amount;
}, 0);

const totalAmount = mockCartProducts.reduce((acc, item) => {
  return acc + item.total.amount;
}, 0);

export const mockCart: ApiCart = {
  id: "1",
  iid: "uuid-1",
  __typename: "Cart",
  createdAt: "2025-05-20T12:00:00.000Z",
  updatedAt: "2025-05-20T12:00:00.000Z",

  items: {
    __typename: "CartItemConnection",
    totalCount: mockCartProducts.length,
    edges: mockCartProducts.map((item, index) => ({
      __typename: "CartItemEdge",
      cursor: `cursor-${index + 1}`,
      node: item,
    })),
    pageInfo: {
      __typename: "PageInfo",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "cursor-1",
      endCursor: `cursor-${mockCartProducts.length}`,
    },
  },

  subtotal: {
    amount: subtotalAmount,
    currencyCode: CurrencyCode.Usd,
  },

  total: {
    amount: totalAmount,
    currencyCode: CurrencyCode.Usd,
  },

  warnings: [],
};
