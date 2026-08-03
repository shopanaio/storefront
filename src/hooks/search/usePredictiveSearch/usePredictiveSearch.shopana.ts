import { useEffect, useState } from "react";
import {
  fetchQuery,
  useRelayEnvironment,
} from "react-relay";
import { graphql } from "relay-runtime";
import type { usePredictiveSearchQuery as UsePredictiveSearchQueryType } from "./__generated__/usePredictiveSearchQuery.graphql";

export const usePredictiveSearchQuery = graphql`
  query usePredictiveSearchQuery($query: String!) {
    predictiveSearch: searchProducts(query: $query, first: 8, sort: RELEVANCE) {
      products: nodes {
        id
        title
        handle
        cover: featuredMedia {
          ... on MediaImage { image { url } }
        }
        selectedVariant: selectedOrFirstAvailableVariant {
          id
          title
          handle
          price { amount currencyCode }
          compareAtPrice { amount currencyCode }
        }
      }
      totalCount
    }
  }
`;

export interface PredictiveSearchProduct {
  id: string;
  title: string;
  handle: string;
  variantHandle?: string;
  cover?: { id: string; url: string } | null;
  gallery: { edges: Array<{ node: { id: string; url: string } }> };
  price?: { amount: number; currencyCode: string } | null;
  compareAtPrice?: { amount: number; currencyCode: string } | null;
}

type UseSearchResult = {
  products: PredictiveSearchProduct[];
  categories: [];
  articles: [];
  loading: boolean;
  error: Error | null;
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

    const subscription = fetchQuery<UsePredictiveSearchQueryType>(
      environment,
      usePredictiveSearchQuery,
      { query: searchTerm }
    ).subscribe({
      next: (data) => {
        const maxLength = 5;
        const rawProducts = data?.predictiveSearch?.products?.slice(0, maxLength) ?? [];

        const products = rawProducts.map((product) => {
          const variant = product.selectedVariant;
          const concatenatedTitle = [product.title, variant?.title]
            .filter(Boolean)
            .join(' ');
          const cover = product.cover?.image?.url
            ? {
                id: product.cover.id ?? product.id,
                url: String(product.cover.image.url),
              }
            : null;

          return {
            id: variant?.id ?? product.id,
            title: concatenatedTitle,
            handle: product.handle,
            variantHandle: variant?.handle,
            cover,
            gallery: {
              edges: cover ? [{ node: cover }] : [],
            },
            price: variant?.price
              ? {
                  amount: Number(variant.price.amount),
                  currencyCode: variant.price.currencyCode,
                }
              : null,
            compareAtPrice: variant?.compareAtPrice
              ? {
                  amount: Number(variant.compareAtPrice.amount),
                  currencyCode: variant.compareAtPrice.currencyCode,
                }
              : null,
          };
        });

        setState({
          products,
          categories: [],
          articles: [],
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

  return state;
};

export default usePredictiveSearch;
