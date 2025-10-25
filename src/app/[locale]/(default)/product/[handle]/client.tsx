'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageLayout } from '@src/components/Layout/PageLayout';
import { Product } from '@src/components/Product/Product';
import { useRelayEnvironment } from 'react-relay';
import useSerializablePreloadedQuery from '@src/relay/useSerializablePreloadedQuery';
import { useQuery } from '@src/providers/relay-query-provider';
import type { Entity } from '@shopana/entity';
import { Reviews$key } from '@src/queries/Reviews/__generated__/Reviews.graphql';
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
  const product = usePreloadedProduct(queryReference as any);

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

  // Find current variant for breadcrumb title
  const { currentVariant, title } = useCurrentVariant({
    product,
    variantHandle: selectedVariantHandle,
  });

  if (!product) {
    return null;
  }

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
        product={product as Entity.Product & Reviews$key}
        currentVariant={currentVariant}
        title={title}
        onChangeVariant={handleChangeVariant}
      />
    </PageLayout>
  );
};
