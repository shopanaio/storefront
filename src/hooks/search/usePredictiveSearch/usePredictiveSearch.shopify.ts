import { useEffect, useState } from "react";
import {
  fetchQuery,
  useRelayEnvironment,
} from "react-relay";
import { ApiArticle, ApiCategory, ApiProduct } from "codegen/schema-client";
import { graphql } from "relay-runtime";

export const usePredictiveSearchQuery = graphql`
  query usePredictiveSearchQuery($query: String!) {
    predictiveSearch(query: $query) {
      products {
        availableForSale
        handle
        id
        title
        vendor
        images(first: 1) {
          edges {
            cursor
            node {
              altText
              height
              id
              originalSrc
              src
              thumbhash
              transformedSrc
              url
              width
            }
          }
        }
        compareAtPriceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
        priceRange {
          maxVariantPrice {
            amount
            currencyCode
          }
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
      articles {
            handle
            id
            title
            image {
              id
              url
              src
            }
        }
        collections {
            handle
            id
            title
            image {
              id
              url
              src
            }
        }
    }
  }
`;

type UseSearchResult = {
  products: ApiProduct[];
  categories: ApiCategory[];
  articles: ApiArticle[];
  loading: boolean;
  error: Error | null;
};

// Type for Shopify product - fixed for your GraphQL query
type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  vendor?: string;
  images: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        altText?: string;
        height?: number;
        originalSrc: string;
        src: string;
        thumbhash?: string;
        transformedSrc?: string;
        url: string;
        width?: number;
      };
    }>;
  };
  compareAtPriceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  priceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

// Type for response data
type PredictiveSearchData = {
  predictiveSearch: {
    products: ShopifyProduct[];
  };
};

const usePredictiveSearch = (searchTerm: string): UseSearchResult => {
  const environment = useRelayEnvironment();
  const [state, setState] = useState<UseSearchResult>({
    products: [],
    categories: [],
    articles: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!searchTerm.trim()) {
      // reset state when field is empty
      setState({
        products: [],
        categories: [],
        articles: [],
        loading: false,
        error: null,
      });
      return;
    }

    // run query
    setState((prev) => ({ ...prev, loading: true }));

    const subscription = fetchQuery(
      environment,
      usePredictiveSearchQuery,
      { query: searchTerm }
    ).subscribe({
      next: (data: PredictiveSearchData) => {
        const maxLength = 5;

        // Convert Shopify products to Shopana format
        const products: ApiProduct[] = (data?.predictiveSearch?.products?.slice(0, maxLength) ?? []).map((shopifyProduct: ShopifyProduct) => ({
          id: shopifyProduct.id,
          iid: "", // Shopify doesn't provide iid
          title: shopifyProduct.title,
          handle: shopifyProduct.handle,
          description: "",
          excerpt: "",
          cover: shopifyProduct.images?.edges?.[0]?.node ? {
            id: shopifyProduct.images.edges[0].node.id || "",
            iid: "",
            source: "URL" as const,
            url: shopifyProduct.images.edges[0].node.url || shopifyProduct.images.edges[0].node.originalSrc || shopifyProduct.images.edges[0].node.src || "",
          } : null,
          price: {
            amount: typeof shopifyProduct.priceRange?.minVariantPrice?.amount === 'string'
              ? parseFloat(shopifyProduct.priceRange.minVariantPrice.amount || "0")
              : (shopifyProduct.priceRange?.minVariantPrice?.amount || 0),
            currencyCode: (shopifyProduct.priceRange?.minVariantPrice?.currencyCode || "USD") as "USD" | "EUR" | "GBP" | "UAH",
          },
          compareAtPrice: shopifyProduct.compareAtPriceRange?.minVariantPrice ? {
            amount: typeof shopifyProduct.compareAtPriceRange.minVariantPrice.amount === 'string'
              ? parseFloat(shopifyProduct.compareAtPriceRange.minVariantPrice.amount || "0")
              : (shopifyProduct.compareAtPriceRange.minVariantPrice.amount || 0),
            currencyCode: (shopifyProduct.compareAtPriceRange.minVariantPrice.currencyCode || "USD") as "USD" | "EUR" | "GBP" | "UAH",
          } : null,
          stockStatus: {
            handle: "available",
            isAvailable: shopifyProduct.availableForSale || false,
          },
          rating: {
            id: shopifyProduct.id,
            iid: "",
            rating: 0,
            count: 0,
            breakdown: [],
          },
          options: [],
          variants: [],
          categories: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: 0,
          },
          containerId: "",
          createdAt: new Date().toISOString(),
          features: [],
          gallery: {
            edges: (shopifyProduct.images?.edges || []).map((edge) => ({
              cursor: edge.cursor,
              node: {
                id: edge.node.id || "",
                iid: "",
                source: "URL" as const,
                url: edge.node.url || edge.node.originalSrc || edge.node.src || "",
              },
            })),
            pageInfo: {
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: null,
              endCursor: null,
            },
            totalCount: shopifyProduct.images?.edges?.length || 0,
          },
          groups: [],
          selectedOptions: [],
          seoDescription: null,
          seoTitle: null,
          sku: null,
          updatedAt: new Date().toISOString(),
        }));

        // future-proof placeholders
        const categories = (data?.predictiveSearch?.collections ?? []) as unknown as ApiCategory[];
        const articles = (data?.predictiveSearch?.articles ?? []) as unknown as ApiArticle[];

        setState({
          products,
          categories,
          articles,
          loading: false,
          error: null,
        });
      },
      error: (error: Error) => {
        setState({
          products: [],
          categories: [],
          articles: [],
          loading: false,
          error: error as Error,
        });
      },
    });

    return () => {
      // cancel subscription on term change/unmount
      subscription.unsubscribe();
    };
  }, [searchTerm, environment]);

  console.log("state", state);

  return state;
};

export default usePredictiveSearch;
