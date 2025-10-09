import { useEffect, useState } from "react";
import {
  fetchQuery,
  useRelayEnvironment,
} from "react-relay";
import { ApiArticle, ApiCategory, ApiProduct } from "codegen/schema-client";
import { graphql } from "relay-runtime";
import type { usePredictiveSearchQuery as UsePredictiveSearchQueryType } from "./__generated__/usePredictiveSearchQuery.graphql";

export const usePredictiveSearchQuery = graphql`
  query usePredictiveSearchQuery($query: String!) {
    predictiveSearch(input: { query: $query }) {
      products {
        id
        title
        handle
        product {
          title
          handle
        }
        cover {
          url
        }
        #gallery{
        #  edges{
        #    node{
        #      id
        #      url
        #    }
        #    cursor
        #  }
        #}
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
        variants {
          id
        }
      }
      categories {
        id
        title
        handle
      }
      articles {
        id
        title
        handle
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

        // Transform products to use product.handle and concatenated title
        const products = rawProducts.map((variant: any) => {
          const parentTitle = variant?.product?.title;
          const concatenatedTitle = [parentTitle, variant.title]
            .filter(Boolean)
            .join(' ');

          return {
            ...variant,
            title: concatenatedTitle,
            // Use product handle for URL building, keep variant handle separately
            handle: variant?.product?.handle ?? variant.handle,
            variantHandle: variant.handle,
          };
        }) as unknown as ApiProduct[];

        const categories = (data?.predictiveSearch?.categories ?? []) as unknown as ApiCategory[];
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

  return state;
};

export default usePredictiveSearch;
