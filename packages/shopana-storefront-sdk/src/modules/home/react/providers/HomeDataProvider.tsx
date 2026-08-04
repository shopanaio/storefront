'use client';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import type { SerializableApolloQuery } from '../../../../graphql/apollo/loadSerializableQuery';
import { HomeDataContext } from '../context/HomeDataContext';
import type {
  HomeCategory,
  HomeProduct,
  HomeTemplateData,
} from '../../core/types';
import type {
  SdkCategoryFragment_CategoryFragment,
  SdkHomePageQuery,
  SdkHomePageQueryVariables,
} from '../../../../graphql/apollo/generated/operations';
interface HomeDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializableApolloQuery<
    SdkHomePageQuery,
    SdkHomePageQueryVariables
  >;
}
function transformCategory(
  categoryRef: SdkCategoryFragment_CategoryFragment | null | undefined
): HomeCategory | null {
  if (!categoryRef) {
    return null;
  }
  const category = categoryRef;
  const listingEdges = category.listing?.edges;
  const mappedProducts: Array<HomeProduct | null> =
    listingEdges?.map((edge) => {
      const node = edge?.node;
      const variant = node?.selectedOrFirstAvailableVariant;
      if (!node || !variant?.price) {
        return null;
      }
      return {
        id: variant.id,
        title: variant.title,
        handle: variant.handle,
        price: {
          amount: String(variant.price.amount),
          currencyCode: variant.price.currencyCode,
        },
        compareAtPrice: variant.compareAtPrice
          ? {
              amount: String(variant.compareAtPrice.amount),
              currencyCode: variant.compareAtPrice.currencyCode,
            }
          : null,
        image:
          node.featuredMedia?.__typename === 'MediaImage' &&
          node.featuredMedia.image?.url
          ? { url: String(node.featuredMedia.image.url) }
          : null,
        product: {
          id: node.id,
          title: node.title,
          handle: node.handle,
        },
      };
    }) ?? [];
  const products: HomeProduct[] = mappedProducts.filter(
    (product: HomeProduct | null): product is HomeProduct => Boolean(product)
  );
  return {
    id: category.id,
    title: category.title,
    handle: category.handle,
    products,
  };
}
function transformQueryData(data: SdkHomePageQuery): HomeTemplateData {
  return {
    pageType: 'home',
    raw: data,
    categories: {
      electronics: transformCategory(data.electronics),
      toys: transformCategory(data.toys),
      sport: transformCategory(data.sport),
      homeAndGarden: data.homeAndGarden
        ? {
            id: data.homeAndGarden.id,
            title: data.homeAndGarden.title,
            handle: data.homeAndGarden.handle,
            children:
              data.homeAndGarden.children?.edges
                ?.map((edge) => transformCategory(edge.node))
                .filter((category): category is HomeCategory =>
                  Boolean(category)
                ) ?? [],
          }
        : null,
    },
  };
}
export function HomeDataProvider({
  children,
  preloadedQuery,
}: HomeDataProviderProps) {
  const rawData = preloadedQuery.data;
  const data = useMemo(() => transformQueryData(rawData), [rawData]);
  return (
    <HomeDataContext.Provider value={{ data }}>
      {children}
    </HomeDataContext.Provider>
  );
}
