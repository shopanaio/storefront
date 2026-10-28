import { gql, type NormalizedCacheObject } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { createApolloCache } from './cache';

vi.mock('@apollo/client-integration-nextjs', async () => {
  const { InMemoryCache } = await import('@apollo/client');
  return { InMemoryCache };
});

const CATEGORY_LISTING = gql`
  query CategoryListing($handle: String!) {
    categoryByHandle(handle: $handle) {
      __typename
      id
      handle
      name
      products(first: 2) {
        edges {
          node {
            __typename
            id
            handle
            title
          }
        }
      }
    }
  }
`;

const PRODUCT_TITLE = gql`
  query ProductTitle($handle: String!) {
    productByHandle(handle: $handle) {
      __typename
      id
      title
    }
  }
`;

const PRODUCT_PAGE = gql`
  query ProductPage($handle: String!) {
    productByHandle(handle: $handle) {
      __typename
      id
      title
      description
    }
  }
`;

const listing = {
  categoryByHandle: {
    __typename: 'Category',
    id: 'category-1',
    handle: 'dogs',
    name: 'Dogs',
    products: {
      __typename: 'ProductConnection',
      edges: [
        {
          __typename: 'ProductEdge',
          node: {
            __typename: 'Product',
            id: 'product-1',
            handle: 'bone',
            title: 'Bone',
          },
        },
      ],
    },
  },
};

describe('handle lookups', () => {
  it('answers productByHandle from a product another query cached', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });

    expect(
      cache.readQuery({ query: PRODUCT_TITLE, variables: { handle: 'bone' } })
    ).toEqual({
      productByHandle: { __typename: 'Product', id: 'product-1', title: 'Bone' },
    });
  });

  it('leaves fields the cached product lacks missing, so the page query still fetches', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });

    expect(
      cache.readQuery({ query: PRODUCT_PAGE, variables: { handle: 'bone' } })
    ).toBeNull();
    expect(
      cache.diff({
        query: PRODUCT_PAGE,
        variables: { handle: 'bone' },
        optimistic: false,
        returnPartialData: true,
      }).result
    ).toEqual({
      productByHandle: { __typename: 'Product', id: 'product-1', title: 'Bone' },
    });
  });

  it('finds the entities of a restored snapshot', () => {
    const source = createApolloCache();
    source.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    const cache = createApolloCache();
    cache.restore(source.extract() as NormalizedCacheObject);

    expect(
      cache.readQuery({ query: PRODUCT_TITLE, variables: { handle: 'bone' } })
    ).toEqual({
      productByHandle: { __typename: 'Product', id: 'product-1', title: 'Bone' },
    });
  });

  it('keeps an answer the query itself wrote, a missing product included', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: PRODUCT_TITLE,
      variables: { handle: 'gone' },
      data: { productByHandle: null },
    });

    expect(
      cache.readQuery({ query: PRODUCT_TITLE, variables: { handle: 'gone' } })
    ).toEqual({ productByHandle: null });
  });

  it('knows no handle it never saw', () => {
    const cache = createApolloCache();

    expect(
      cache.readQuery({ query: PRODUCT_TITLE, variables: { handle: 'bone' } })
    ).toBeNull();
  });
});

describe('entities without id', () => {
  it('keep a vendor selected without id inside its product', () => {
    const query = gql`
      query ProductVendor($handle: String!) {
        productByHandle(handle: $handle) {
          __typename
          id
          vendor {
            __typename
            name
          }
        }
      }
    `;
    const cache = createApolloCache();
    const data = {
      productByHandle: {
        __typename: 'Product',
        id: 'product-1',
        vendor: { __typename: 'Vendor', name: 'Ferplast' },
      },
    };
    cache.writeQuery({ query, variables: { handle: 'bone' }, data });

    expect(cache.readQuery({ query, variables: { handle: 'bone' } })).toEqual(
      data
    );
  });
});
