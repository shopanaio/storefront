import { ApiMenu } from "@codegen/schema-client";
import { mockUrl } from "../url";

export const mockAdditionalMenu: ApiMenu = {
  __typename: 'Menu',
  handle: 'additional-menu',
  id: 'additional-menu-id',
  iid: 'additional-menu-iid',
  items: {
    __typename: 'MenuItemConnection',
    edges: [{
      __typename: 'MenuItemEdge',
      cursor: 'cursor-1',
      node: {
        __typename: 'MenuItem',
        id: 'menu-column-id-1',
        iid: 'menu-column-iid-1',
        items: {
          __typename: 'MenuItemConnection',
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        node: mockUrl,
        title: "Location",
      },
    }, {
      __typename: 'MenuItemEdge',
      cursor: 'cursor-2',
      node: {
        __typename: 'MenuItem',
        id: 'menu-column-id-2',
        iid: 'menu-column-iid-2',
        items: {
          __typename: 'MenuItemConnection',
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        node: mockUrl,
        title: "Order conditions",
      },
    }, {
      __typename: 'MenuItemEdge',
      cursor: 'cursor-3',
      node: {
        __typename: 'MenuItem',
        id: 'menu-column-id-3',
        iid: 'menu-column-iid-3',
        items: {
          __typename: 'MenuItemConnection',
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        node: mockUrl,
        title: "Delivery",
      },
    }, {
      __typename: 'MenuItemEdge',
      cursor: 'cursor-4',
      node: {
        __typename: 'MenuItem',
        id: 'menu-column-id-4',
        iid: 'menu-column-iid-4',
        items: {
          __typename: 'MenuItemConnection',
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        node: mockUrl,
        title: "Payment",
      },
    }, {
      __typename: 'MenuItemEdge',
      cursor: 'cursor-5',
      node: {
        __typename: 'MenuItem',
        id: 'menu-column-id-5',
        iid: 'menu-column-iid-5',
        items: {
          __typename: 'MenuItemConnection',
          edges: [],
          pageInfo: {
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null,
            endCursor: null,
          },
          totalCount: 0,
        },
        node: mockUrl,
        title: "Exchange and return",
      },
    }],

    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null,
    },
    totalCount: 5,
  },
  title: 'Additional information',
}
