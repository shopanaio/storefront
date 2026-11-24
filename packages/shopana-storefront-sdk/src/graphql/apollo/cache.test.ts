import { parse } from 'graphql';
import { type NormalizedCacheObject } from '@apollo/client';
import { describe, expect, it, vi } from 'vitest';
import { cachedProductCardId, createApolloCache } from './cache';
import { SdkNavigationTargetFragmentDoc } from './generated/operations';

vi.mock('@apollo/client-integration-nextjs', async () => {
  const { InMemoryCache } = await import('@apollo/client');
  return { InMemoryCache };
});

const CATEGORY_LISTING = parse(`
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
`);

const PRODUCT_TITLE = parse(`
  query ProductTitle($handle: String!) {
    productByHandle(handle: $handle) {
      __typename
      id
      title
    }
  }
`);

const PRODUCT_PAGE = parse(`
  query ProductPage($handle: String!) {
    productByHandle(handle: $handle) {
      __typename
      id
      title
      description
    }
  }
`);

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
  it('answers home category names from the navigation target without another query', () => {
    const cache = createApolloCache();
    cache.writeFragment({
      id: 'navigation-target:dogs',
      fragment: SdkNavigationTargetFragmentDoc,
      data: {
        __typename: 'OnlineStoreNavigationTarget',
        type: 'CATEGORY',
        resourceId: 'category-1',
        url: '/categories/dogs',
        resource: {
          __typename: 'Category',
          id: 'category-1',
          handle: 'dogs',
          name: 'Dogs',
        },
      },
    });
    expect(
      cache.readQuery({
        query: parse(`query($handle: String!) {
          categoryByHandle(handle: $handle) { __typename id name handle }
        }`),
        variables: { handle: 'dogs' },
      })
    ).toEqual({
      categoryByHandle: {
        __typename: 'Category',
        id: 'category-1',
        name: 'Dogs',
        handle: 'dogs',
      },
    });
  });

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
      productByHandle: {
        __typename: 'Product',
        id: 'product-1',
        title: 'Bone',
      },
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
      productByHandle: {
        __typename: 'Product',
        id: 'product-1',
        title: 'Bone',
      },
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
      productByHandle: {
        __typename: 'Product',
        id: 'product-1',
        title: 'Bone',
      },
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
    const query = parse(`
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
    `);
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

describe('objects without id', () => {
  const PAGE_SUMMARY = parse(`
    query PageSummary($handle: String!) {
      productByHandle(handle: $handle) {
        __typename
        id
        reviewSummary {
          __typename
          criteria {
            __typename
            reviewCount
          }
          ratingBreakdown {
            __typename
            rating5Count
          }
        }
        featuredMedia {
          __typename
          id
          image {
            __typename
            url
            width
          }
        }
      }
    }
  `);
  const CARD_SUMMARY = parse(`
    query CardSummary($handle: String!) {
      productByHandle(handle: $handle) {
        __typename
        id
        reviewSummary {
          __typename
          reviewCount
          averageRating
        }
        featuredMedia {
          __typename
          id
          image {
            __typename
            url
          }
        }
      }
    }
  `);
  const page = (id: string, url: string) => ({
    productByHandle: {
      __typename: 'Product',
      id,
      reviewSummary: {
        __typename: 'ProductReviewSummary',
        criteria: [
          { __typename: 'ProductReviewCriterionSummary', reviewCount: 2 },
        ],
        ratingBreakdown: {
          __typename: 'ProductReviewRatingBreakdown',
          rating5Count: 2,
        },
      },
      featuredMedia: {
        __typename: 'MediaImage',
        id: `${id}-media`,
        image: { __typename: 'Image', url, width: 1200 },
      },
    },
  });
  const card = (id: string, url: string) => ({
    productByHandle: {
      __typename: 'Product',
      id,
      reviewSummary: {
        __typename: 'ProductReviewSummary',
        reviewCount: 2,
        averageRating: 5,
      },
      featuredMedia: {
        __typename: 'MediaImage',
        id: `${id}-media`,
        image: { __typename: 'Image', url },
      },
    },
  });

  it('merge what another query writes into the same field instead of losing fields', () => {
    const cache = createApolloCache();
    const variables = { handle: 'bone' };
    cache.writeQuery({
      query: PAGE_SUMMARY,
      variables,
      data: page('p1', 'a.jpg'),
    });
    cache.writeQuery({
      query: CARD_SUMMARY,
      variables,
      data: card('p1', 'a.jpg'),
    });

    expect(cache.readQuery({ query: PAGE_SUMMARY, variables })).toEqual(
      page('p1', 'a.jpg')
    );
    expect(cache.readQuery({ query: CARD_SUMMARY, variables })).toEqual(
      card('p1', 'a.jpg')
    );
  });

  it('stay with their own parent', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: PAGE_SUMMARY,
      variables: { handle: 'bone' },
      data: page('p1', 'a.jpg'),
    });
    cache.writeQuery({
      query: CARD_SUMMARY,
      variables: { handle: 'ball' },
      data: card('p2', 'b.jpg'),
    });

    expect(
      cache.readQuery({ query: CARD_SUMMARY, variables: { handle: 'bone' } })
    ).toBeNull();
    expect(
      cache.readQuery({ query: PAGE_SUMMARY, variables: { handle: 'ball' } })
    ).toBeNull();
  });
});

const DYNAMIC_LISTING = parse(`
  query DynamicListing($rules: JSON!, $query: String, $queryMode: ListingQueryMode) {
    dynamicCollection(rules: $rules) {
      __typename
      products(first: 2, query: $query, queryMode: $queryMode) {
        __typename
        totalCount
      }
    }
  }
`);

describe('dynamic collection products', () => {
  it('keeps the FILTER and RANK pages of one query apart', () => {
    const cache = createApolloCache();
    const rules = [{ category: { operator: 'IN', ids: ['category-1'] } }];
    const write = (queryMode: string, totalCount: number) =>
      cache.writeQuery({
        query: DYNAMIC_LISTING,
        variables: { rules, query: 'гастро', queryMode },
        data: {
          dynamicCollection: {
            __typename: 'DynamicCollection',
            products: { __typename: 'ProductConnection', totalCount },
          },
        },
      });
    write('FILTER', 3);
    write('RANK', 12);
    const read = (queryMode: string) =>
      cache.readQuery<{
        dynamicCollection: { products: { totalCount: number } };
      }>({
        query: DYNAMIC_LISTING,
        variables: { rules, query: 'гастро', queryMode },
      })?.dynamicCollection.products.totalCount;
    expect(read('FILTER')).toBe(3);
    expect(read('RANK')).toBe(12);
  });
});

const CARD_LISTING = parse(`
  query CardListing($handle: String!, $sort: ListingSort) {
    categoryByHandle(handle: $handle) {
      __typename
      id
      products(first: 1, sort: $sort) {
        edges {
          node {
            __typename
            id
            productId
            handle
            title
            variant {
              __typename
              id
              title
            }
          }
        }
      }
    }
  }
`);

type CardListingData = {
  categoryByHandle: {
    products: {
      edges: Array<{
        node: { id: string; variant: { id: string; title: string } };
      }>;
    };
  };
};

describe('product cards', () => {
  const write = (
    cache: ReturnType<typeof createApolloCache>,
    sort: string,
    card: { id: string; variant: string }
  ) =>
    cache.writeQuery({
      query: CARD_LISTING,
      variables: { handle: 'dogs', sort },
      data: {
        categoryByHandle: {
          __typename: 'Category',
          id: 'category-1',
          products: {
            __typename: 'ProductConnection',
            edges: [
              {
                __typename: 'ProductEdge',
                node: {
                  __typename: 'ProductCard',
                  id: card.id,
                  productId: 'product-1',
                  handle: 'bone',
                  title: 'Bone',
                  variant: {
                    __typename: 'ProductCardVariant',
                    id: card.variant,
                    title: card.variant,
                  },
                },
              },
            ],
          },
        },
      },
    });
  const read = (cache: ReturnType<typeof createApolloCache>, sort: string) =>
    cache.readQuery<CardListingData>({
      query: CARD_LISTING,
      variables: { handle: 'dogs', sort },
    })?.categoryByHandle.products.edges[0]?.node;

  it('keep the cards of one product with different variants apart', () => {
    const cache = createApolloCache();
    write(cache, 'NEWEST', { id: 'card-product-1', variant: 'variant-1' });
    write(cache, 'PRICE_ASC', {
      id: 'card-product-1-variant-2',
      variant: 'variant-2',
    });

    expect(read(cache, 'NEWEST')?.variant.id).toBe('variant-1');
    expect(read(cache, 'PRICE_ASC')?.variant.id).toBe('variant-2');
    const state = cache.extract();
    expect(state['ProductCard:{"id":"card-product-1"}']).toBeDefined();
    expect(
      state['ProductCard:{"id":"card-product-1-variant-2"}']
    ).toBeDefined();
    expect(state['ProductCardVariant:{"id":"variant-1"}']).toBeDefined();
    expect(state['ProductCardVariant:{"id":"variant-2"}']).toBeDefined();
  });

  it('are not the product productByHandle answers from', () => {
    const cache = createApolloCache();
    write(cache, 'NEWEST', { id: 'card-product-1', variant: 'variant-1' });

    expect(
      cache.readQuery({ query: PRODUCT_TITLE, variables: { handle: 'bone' } })
    ).toBeNull();
  });
});

describe('Relay node lookups', () => {
  const nodeQuery = parse(`query($id: ID!) {
    node(id: $id) { __typename id ... on Category {
      products(first: 2) { edges { node { __typename id handle title } } }
    } }
  }`);
  const filteredNodeQuery = parse(`query($id: ID!) {
    node(id: $id) { __typename id ... on Category {
      products(first: 2, filters: [{price: {min: "10"}}]) {
        edges { node { __typename id title } }
      }
    } }
  }`);

  it('reads the first connection loaded by handle through node(id) without another request', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    expect(
      cache.readQuery({ query: nodeQuery, variables: { id: 'category-1' } })
    ).toEqual({
      node: {
        __typename: 'Category',
        id: 'category-1',
        products: listing.categoryByHandle.products,
      },
    });
  });

  it('keeps the first page available through node after SSR snapshot restoration', () => {
    const server = createApolloCache();
    server.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    const browser = createApolloCache().restore(server.extract());
    expect(
      browser.readQuery({ query: nodeQuery, variables: { id: 'category-1' } })
    ).toEqual(
      server.readQuery({ query: nodeQuery, variables: { id: 'category-1' } })
    );
    expect(
      browser.diff({ query: nodeQuery, variables: { id: 'category-1' } })
        .complete
    ).toBe(true);
  });

  it('does not substitute an unfiltered page when variables request another connection', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    expect(
      cache.diff({ query: filteredNodeQuery, variables: { id: 'category-1' } })
        .complete
    ).toBe(false);
  });

  it('does not resurrect a null node from an older handle lookup', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    cache.writeQuery({
      query: nodeQuery,
      variables: { id: 'category-1' },
      data: { node: null },
    });
    expect(
      cache.readQuery({ query: nodeQuery, variables: { id: 'category-1' } })
    ).toEqual({ node: null });
  });

  it('does not return an evicted entity through the ID index', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: CATEGORY_LISTING,
      variables: { handle: 'dogs' },
      data: listing,
    });
    cache.evict({ id: cache.identify(listing.categoryByHandle) });
    expect(
      cache.diff({ query: nodeQuery, variables: { id: 'category-1' } }).complete
    ).toBe(false);
  });
});

it('appends the next vendor page through Relay without replacing or losing the first page', () => {
  const query = parse(`query($id: ID!, $after: Cursor) {
    node(id: $id) { __typename id ... on Vendor {
      products(first: 1, after: $after, sort: NEWEST) {
        __typename edges { __typename cursor node { __typename id } }
        pageInfo { __typename hasNextPage endCursor }
      }
    } }
  }`);
  const cache = createApolloCache();
  const page = (id: string, hasNextPage: boolean) => ({ node: {
    __typename: 'Vendor', id: 'vendor', products: {
      __typename: 'ProductConnection',
      edges: [{ __typename: 'ProductEdge', cursor: id, node: { __typename: 'ProductCard', id } }],
      pageInfo: { __typename: 'PageInfo', hasNextPage, endCursor: id },
    },
  } });
  cache.writeQuery({ query, variables: { id: 'vendor', after: null }, data: page('first', true) });
  cache.writeQuery({ query, variables: { id: 'vendor', after: 'first' }, data: page('second', false) });
  const result = cache.readQuery<any>({ query, variables: { id: 'vendor', after: null } });
  expect(result.node.products.edges.map((edge: any) => edge.node.id)).toEqual(['first', 'second']);
  expect(result.node.products.pageInfo.hasNextPage).toBe(false);
});

describe('cachedProductCardId', () => {
  const CARD = parse(`
    fragment Card on ProductCard { __typename id handle title }
  `);
  const card = {
    __typename: 'ProductCard',
    id: 'card-1',
    handle: 'bone',
    title: 'Bone',
  };

  it('finds the card a listing cached under the product handle', () => {
    const cache = createApolloCache();
    cache.writeFragment({ id: 'ProductCard:{"id":"card-1"}', fragment: CARD, data: card });

    const id = cachedProductCardId(cache, 'bone');
    expect(id).toBe(cache.identify(card));
    expect(cache.readFragment({ id: id!, fragment: CARD })).toEqual(card);
    expect(cachedProductCardId(cache, 'ball')).toBeNull();
  });

  it('finds a card of a restored snapshot', () => {
    const cache = createApolloCache();
    cache.restore({ 'ProductCard:{"id":"card-1"}': card } as NormalizedCacheObject);

    expect(cachedProductCardId(cache, 'bone')).toBe('ProductCard:{"id":"card-1"}');
  });
});
