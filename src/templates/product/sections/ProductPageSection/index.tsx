'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProduct } from '@shopana/storefront-sdk/modules/product/react/hooks/useProduct';
import { useProductData } from '@shopana/storefront-sdk/modules/product/react/hooks/useProductData';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { Product } from '../../blocks/Product';
import { useRoutes } from '@src/hooks/useRoutes';
import { useCurrentVariant } from '@src/hooks/useCurrentVariant';
import type { Reviews$key } from '@shopana/storefront-sdk/queries/Reviews';

export default function ProductPageSection() {
  const routes = useRoutes();
  const searchParams = useSearchParams();

  const product = useProduct();
  const { raw } = useProductData();
  // raw.product contains the Reviews fragment spread from ProductQuery
  // TypeScript types guarantee this, runtime check is not needed
  const productReviewsRef = raw.product as Reviews$key | null;

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
