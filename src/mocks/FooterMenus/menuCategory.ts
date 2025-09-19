import { ApiMenu } from "@codegen/schema-client";
import { mockCategory } from "../category";

export const mockCategoryMenu: ApiMenu = {
  __typename: 'Menu',
  handle: 'footer-menu',
  id: 'menu-id',
  iid: 'menu-iid',
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
        node: mockCategory,
        title: "Category 1",
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
        node: mockCategory,
        title: "Category 2",
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
        node: mockCategory,
        title: "Category 3",
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
        node: mockCategory,
        title: "Category 4",
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
        node: mockCategory,
        title: "Category 5",
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
  title: 'Menu category',
}
