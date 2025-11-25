'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageLayout } from '@src/components/Layout/PageLayout';
import { Product } from '@src/components/Product/Product';
import { useRelayEnvironment } from 'react-relay';
import { useSerializablePreloadedQuery } from '@shopana/storefront-sdk/next/relay/client';
import { useQuery } from '@src/providers/relay-query-provider';
import { useRoutes } from '@src/hooks/useRoutes';
import { useSearchParams } from 'next/navigation';
import usePreloadedProduct from '@src/hooks/product/usePreloadedProduct';
import { useCurrentVariant } from '@src/hooks/useCurrentVariant';

export const PageClient = () => {
  const environment = useRelayEnvironment();
  const preloadedQuery = useQuery();
  const routes = useRoutes();
  const searchParams = useSearchParams();

  /**
   * Selected variant handle synchronized with the URL query (?variant=...)
   * URL is updated using history.replaceState to avoid full route navigation.
   */
  const [selectedVariantHandle, setSelectedVariantHandle] =
    useState<string>('');

  // Convert serializable query to Relay PreloadedQuery
  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  // Use preloaded query without refetching
  const { product, productReviewsRef } = usePreloadedProduct(queryReference as any);

  // Initialize selected variant from URL on first render and when URL changes externally
  useEffect(() => {
    setSelectedVariantHandle(searchParams?.get('variant') || '');
  }, [searchParams]);

  /**
   * Update the URL's `variant` query param without triggering Next navigation,
   * and keep the product data as-is (SPA-like behavior).
   */
  const handleChangeVariant = useCallback((handle: string) => {
    setSelectedVariantHandle(handle);

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (handle) {
        url.searchParams.set('variant', handle);
      } else {
        url.searchParams.delete('variant');
      }
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  if (!product) {
    return null;
  }

  // Find current variant for breadcrumb title
  const { currentVariant, title } = useCurrentVariant({
    product,
    variantHandle: selectedVariantHandle,
  });

  return (
    <PageLayout
      breadcrumbs={{
        items: [
          ...[
            ...(product.category?.breadcrumbs || []),
            ...(product.category ? [product.category] : []),
          ].map((breadcrumb) => ({
            href: routes.category.path(breadcrumb.handle),
            title: breadcrumb.title,
          })),
          { title },
        ],
      }}
    >
      <Product
        product={product}
        productReviewsRef={productReviewsRef}
        currentVariant={currentVariant}
        title={title}
        onChangeVariant={handleChangeVariant}
      />
    </PageLayout>
  );
};
