'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '../../../../graphql/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { HomeDataContext } from '../context/HomeDataContext';
import type {
  HomeCategory,
  HomeProduct,
  HomeTemplateData,
} from '../../core/types';
import HomePageQueryNode, {
  HomePageQuery,
} from '../../core/graphql/queries/__generated__/HomePageQuery.graphql';

interface HomeDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof HomePageQueryNode,
    HomePageQuery
  >;
}

function transformCategory(category: any): HomeCategory | null {
  if (!category) {
    return null;
  }

  const listingEdges = category.listing?.edges as Array<{ node: any }> | undefined;

  const mappedProducts: Array<HomeProduct | null> =
    listingEdges?.map((edge) => {
      if (!edge?.node) {
        return null;
      }

      return {
        id: edge.node.id,
        title: edge.node.title,
        handle: edge.node.handle,
        price: edge.node.price,
        compareAtPrice: edge.node.compareAtPrice,
        image: edge.node.cover,
        product: edge.node.product,
      };
    }) ?? [];

  const products: HomeProduct[] = mappedProducts.filter(
    (product: HomeProduct | null): product is HomeProduct => Boolean(product),
  );

  return {
    id: category.id,
    title: category.title,
    handle: category.handle,
    products,
  };
}

function transformQueryData(data: HomePageQuery['response']): HomeTemplateData {
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
                ?.map((edge: any) => transformCategory(edge?.node))
                .filter(
                  (category): category is HomeCategory => Boolean(category),
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
  const environment = useRelayEnvironment();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery,
  );

  const rawData = usePreloadedQuery<HomePageQuery>(
    HomePageQueryNode,
    queryReference,
  );

  const data = useMemo(() => transformQueryData(rawData), [rawData]);

  return (
    <HomeDataContext.Provider value={{ data }}>
      {children}
    </HomeDataContext.Provider>
  );
}
