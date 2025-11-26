'use client';

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { usePreloadedQuery, useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '../../../../graphql/relay/useSerializablePreloadedQuery';
import type { SerializablePreloadedQuery } from '../../../../graphql/relay/loadSerializableQuery';
import { ProductDataContext } from '../context/ProductDataContext';
import type {
  Product,
  ProductTemplateData,
  ProductVariant,
  ProductOption,
  ProductTag,
  ProductGroup,
  ProductImage,
} from '../../core/types';
import ProductQueryNode, {
  ProductQuery,
} from '../../core/graphql/queries/__generated__/ProductQuery.graphql';

interface ProductDataProviderProps {
  children: ReactNode;
  preloadedQuery: SerializablePreloadedQuery<
    typeof ProductQueryNode,
    ProductQuery
  >;
}

function transformProduct(rawProduct: ProductQuery['response']['product']): Product | null {
  if (!rawProduct) {
    return null;
  }

  const variants: ProductVariant[] = (rawProduct.variants ?? []).map((v) => ({
    id: v.id,
    handle: v.handle,
    title: v.title,
    selectedOptions: v.selectedOptions,
    cover: v.cover ? { id: v.cover.id, url: v.cover.url } : null,
    gallery: (v.gallery?.edges ?? [])
      .map((e) => e?.node)
      .filter((n): n is ProductImage => Boolean(n?.id && n?.url))
      .map((n) => ({ id: n.id, url: n.url })),
    price: {
      amount: v.price.amount,
      currencyCode: v.price.currencyCode,
    },
    compareAtPrice: v.compareAtPrice
      ? {
          amount: v.compareAtPrice.amount,
          currencyCode: v.compareAtPrice.currencyCode,
        }
      : null,
    sku: v.sku,
    stockStatus: v.stockStatus
      ? { isAvailable: v.stockStatus.isAvailable }
      : null,
  }));

  const options: ProductOption[] = (rawProduct.options ?? []).map((o) => ({
    id: o.id,
    handle: o.handle,
    title: o.title,
    displayType: o.displayType,
    values: (o.values ?? []).map((v) => ({
      id: v.id,
      title: v.title,
      handle: v.handle,
      swatch: v.swatch
        ? {
            id: v.swatch.id,
            color: v.swatch.color,
            displayType: v.swatch.displayType,
            image: v.swatch.image
              ? { id: v.swatch.image.id, url: v.swatch.image.url }
              : null,
          }
        : null,
    })),
  }));

  const tags: ProductTag[] = (rawProduct.tags?.edges ?? [])
    .map((e) => e?.node)
    .filter((n): n is { id: string; handle: string; title: string } =>
      Boolean(n?.id && n?.handle && n?.title)
    )
    .map((n) => ({
      id: n.id,
      handle: n.handle,
      title: n.title,
    }));

  const groups: ProductGroup[] = (rawProduct.groups ?? []).map((g) => ({
    id: g.id,
    title: g.title,
    isRequired: g.isRequired,
    isMultiple: g.isMultiple,
    items: (g.items ?? []).map((item) => {
      const nodeId = item.node?.id;
      const nodeTitle = item.node?.title;
      const nodeHandle = item.node?.handle;

      return {
        node: (nodeId && nodeTitle && nodeHandle)
          ? {
              id: nodeId,
              title: nodeTitle,
              handle: nodeHandle,
              product: {
                title: item.node?.product?.title ?? '',
                handle: item.node?.product?.handle ?? '',
              },
              price: {
                amount: String(item.node?.price?.amount ?? '0'),
                currencyCode: String(item.node?.price?.currencyCode ?? 'USD'),
              },
              cover: item.node?.cover
                ? { id: item.node.cover.id, url: item.node.cover.url }
                : null,
            }
          : null,
        maxQuantity: item.maxQuantity,
        price: item.price
          ? {
              amount: {
                amount: String(item.price.amount?.amount ?? '0'),
                currencyCode: String(item.price.amount?.currencyCode ?? 'USD'),
              },
              percentage: item.price.percentage,
            }
          : null,
      };
    }),
  }));

  return {
    id: rawProduct.id,
    title: rawProduct.title,
    handle: rawProduct.handle,
    description: rawProduct.description,
    excerpt: rawProduct.excerpt,
    options,
    category: rawProduct.category
      ? {
          id: rawProduct.category.id,
          title: rawProduct.category.title,
          handle: rawProduct.category.handle,
          breadcrumbs: (rawProduct.category.breadcrumbs ?? []).map((b) => ({
            id: b.id,
            title: b.title,
            handle: b.handle,
          })),
        }
      : null,
    variants,
    tags,
    groups,
    seoTitle: rawProduct.seoTitle,
    seoDescription: rawProduct.seoDescription,
    createdAt: rawProduct.createdAt,
    updatedAt: rawProduct.updatedAt,
    rating: rawProduct.rating
      ? {
          id: rawProduct.rating.id,
          count: rawProduct.rating.count,
          rating: rawProduct.rating.rating,
          breakdown: (rawProduct.rating.breakdown ?? []).map((b) => ({
            star: b.star,
            count: b.count,
            percentage: b.percentage,
          })),
        }
      : null,
  };
}

function transformQueryData(data: ProductQuery['response']): ProductTemplateData {
  return {
    pageType: 'product',
    raw: data,
    product: transformProduct(data.product),
  };
}

export function ProductDataProvider({
  children,
  preloadedQuery,
}: ProductDataProviderProps) {
  const environment = useRelayEnvironment();

  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery,
  );

  const rawData = usePreloadedQuery<ProductQuery>(
    ProductQueryNode,
    queryReference,
  );

  const data = useMemo(() => transformQueryData(rawData), [rawData]);

  return (
    <ProductDataContext.Provider value={{ data }}>
      {children}
    </ProductDataContext.Provider>
  );
}
