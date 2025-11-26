'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProduct } from '@shopana/storefront-sdk/modules/product/react/hooks/useProduct';
import { useProductData } from '@shopana/storefront-sdk/modules/product/react/hooks/useProductData';
import { PageLayout } from '@src/components/Layout/PageLayout';
import { Product } from '@src/components/Product/Product';
import { useRoutes } from '@src/hooks/useRoutes';
import { useCurrentVariant } from '@src/hooks/useCurrentVariant';
import type { Reviews$key } from '@src/queries/Reviews/__generated__/Reviews.graphql';

// Helper to check if an object has valid Relay fragment spread for Reviews
function isValidReviewsKey(obj: unknown): obj is Reviews$key {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    ' $fragmentSpreads' in obj &&
    typeof (obj as Record<string, unknown>)[' $fragmentSpreads'] === 'object'
  );
}

export default function ProductPageSection() {
  const routes = useRoutes();
  const searchParams = useSearchParams();

  const product = useProduct();
  const { raw } = useProductData();
  // Only use as Reviews$key if the object has valid Relay fragment metadata
  const productReviewsRef = isValidReviewsKey(raw.product) ? raw.product : null;

  const [selectedVariantHandle, setSelectedVariantHandle] =
    useState<string>('');

  useEffect(() => {
    setSelectedVariantHandle(searchParams?.get('variant') || '');
  }, [searchParams]);

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

  const { currentVariant, title } = useCurrentVariant({
    product: product as any,
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
            href: routes.collection.path(breadcrumb.handle),
            title: breadcrumb.title,
          })),
          { title },
        ],
      }}
    >
      <Product
        product={product as any}
        productReviewsRef={productReviewsRef}
        currentVariant={currentVariant}
        title={title}
        onChangeVariant={handleChangeVariant}
      />
    </PageLayout>
  );
}
