'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment, readInlineData } from 'react-relay';
import useSerializablePreloadedQuery from '../../../../next/relay/useSerializablePreloadedQuery';
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
import CategoryFragmentNode, {
  CategoryFragment_category$key,
  CategoryFragment_category$data,
} from '../../core/graphql/fragments/__generated__/CategoryFragment_category.graphql';

interface HomeDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof HomePageQueryNode,
    HomePageQuery
  >;
}

function transformCategory(categoryRef: CategoryFragment_category$key | null | undefined): HomeCategory | null {
  if (!categoryRef) {
    return null;
  }

  const category = readInlineData(
    CategoryFragmentNode,
    categoryRef,
  ) as CategoryFragment_category$data | null;

  if (!category) {
    return null;
  }

  const listingEdges = category.listing?.edges;

  const mappedProducts: Array<HomeProduct | null> =
    listingEdges?.map((edge) => {
      const node = edge?.node;
      if (!node?.id || !node?.title || !node?.handle || !node?.price || !node?.product) {
        return null;
      }

      return {
        id: node.id,
        title: node.title,
        handle: node.handle,
        price: node.price,
        compareAtPrice: node.compareAtPrice,
        image: node.cover,
        product: node.product,
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
