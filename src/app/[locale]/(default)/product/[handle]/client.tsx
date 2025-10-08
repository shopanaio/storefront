'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PageLayout } from '@src/components/Layout/PageLayout';
import { Product } from '@src/components/Product/Product';
import { useRelayEnvironment } from 'react-relay';
import useSerializablePreloadedQuery from '@src/relay/useSerializablePreloadedQuery';
import { useQuery } from '@src/providers/relay-query-provider';
import { ApiProduct } from '@codegen/schema-client';
import { Reviews$key } from '@src/relay/queries/__generated__/Reviews.graphql';
import { useRoutes } from '@src/hooks/useRoutes';
import { useSearchParams } from 'next/navigation';
import usePreloadedProduct from '@src/hooks/product/usePreloadedProduct';

export const PageClient = () => {
  const environment = useRelayEnvironment();
  const preloadedQuery = useQuery();
  const routes = useRoutes();
  const searchParams = useSearchParams();

  /**
   * Selected variant handle synchronized with the URL query (?variant=...)
   * URL is updated using history.replaceState to avoid full route navigation.
   */
  const [selectedVariantHandle, setSelectedVariantHandle] = useState<
    string | undefined
  >(undefined);

  // Convert serializable query to Relay PreloadedQuery
  const queryReference = useSerializablePreloadedQuery(
    environment,
    preloadedQuery
  );

  // Use preloaded query without refetching
  const product = usePreloadedProduct(queryReference as any);

  // Initialize selected variant from URL on first render and when URL changes externally
  useEffect(() => {
    const v = searchParams?.get('variant') || undefined;
    setSelectedVariantHandle(v || undefined);
  }, [searchParams]);

  /**
   * Update the URL's `variant` query param without triggering Next navigation,
   * and keep the product data as-is (SPA-like behavior).
   */
  const handleChangeVariant = useCallback((handle: string | null) => {
    setSelectedVariantHandle(handle ?? undefined);

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
  const currentVariant = product.variants?.find(
    (v) => v.handle === selectedVariantHandle
  ) || product.variants?.[0];
  const breadcrumbTitle = currentVariant?.title || product.title;

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
          {
            title: breadcrumbTitle,
          },
        ],
      }}
    >
      <Product
        product={product as ApiProduct & Reviews$key}
        selectedVariantHandle={selectedVariantHandle}
        onChangeVariant={handleChangeVariant}
      />
    </PageLayout>
  );
};
