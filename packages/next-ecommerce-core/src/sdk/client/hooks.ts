'use client';

import { useMemo } from 'react';
import { usePageData } from '../../core/usePageData';
import type {
  CartPageData,
  CollectionPageData,
  PageDataMap,
  ProductPageData,
  StaticPageData,
} from '../types';

function assertPageType(current: string, expected: string) {
  if (current !== expected) {
    throw new Error(`Hook can only be used on ${expected} pages (current: ${current})`);
  }
}

export function usePageDataByType<TType extends keyof PageDataMap>(expectedType: TType) {
  const ctx = usePageData<PageDataMap[TType]>();
  assertPageType(ctx.pageType, expectedType);
  return ctx.data;
}

export function useProduct(): ProductPageData['product'] {
  const data = usePageDataByType('product');
  return data.product;
}

export function useCollection(): CollectionPageData['collection'] {
  const data = usePageDataByType('collection');
  return data.collection;
}

export function useCart(): CartPageData['cart'] {
  const data = usePageDataByType('cart');
  return data.cart;
}

export function useStaticPage(): StaticPageData['page'] {
  const data = usePageDataByType('page');
  return data.page;
}

export function useRelatedProducts() {
  const data = usePageData<ProductPageData>();
  assertPageType(data.pageType, 'product');
  return useMemo(() => data.data.relatedProducts, [data.data.relatedProducts]);
}
