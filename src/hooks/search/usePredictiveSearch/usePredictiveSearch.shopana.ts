import { StorefrontUsePredictiveSearchQueryDocument } from '../../../../codegen/apollo/storefront-operations';
import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { fetchQuery } from '@shopana/storefront-sdk/graphql/apollo';
export const usePredictiveSearchQuery =
  StorefrontUsePredictiveSearchQueryDocument;
export interface PredictiveSearchProduct {
  id: string;
  title: string;
  handle: string;
  variantHandle?: string;
  cover?: {
    id: string;
    url: string;
  } | null;
  gallery: {
    edges: Array<{
      node: {
        id: string;
        url: string;
      };
    }>;
  };
  price?: {
    amount: number;
    currencyCode: string;
  } | null;
  compareAtPrice?: {
    amount: number;
    currencyCode: string;
  } | null;
}
type UseSearchResult = {
  products: PredictiveSearchProduct[];
  categories: [];
  articles: [];
  loading: boolean;
  error: Error | null;
};
const usePredictiveSearch = (searchTerm: string): UseSearchResult => {
  const client = useApolloClient();
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    let active = true;
    void fetchQuery(client, usePredictiveSearchQuery, { query: searchTerm })
      .then((data) => {
        if (!active) return;
        const maxLength = 5;
        const rawProducts =
          data?.predictiveSearch?.products?.slice(0, maxLength) ?? [];
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
      })
      .catch((error: Error) => {
        if (active) {
          setState({
            products: [],
            categories: [],
            articles: [],
            loading: false,
            error: error as Error,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [searchTerm, client]);
  return state;
};
export default usePredictiveSearch;
