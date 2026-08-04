'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProduct } from '@shopana/storefront-sdk/modules/product/react/hooks/useProduct';
import { useProductData } from '@shopana/storefront-sdk/modules/product/react/hooks/useProductData';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { Product } from '../../blocks/Product';
import { useRoutes } from '@src/hooks/useRoutes';
import { useCurrentVariant } from '@src/hooks/useCurrentVariant';
import type { ReviewsData } from '@shopana/storefront-sdk/queries/Reviews';
import type { model } from '@shopana/storefront-sdk';

export default function ProductPageSection() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const product = useProduct();
  const { raw } = useProductData();
  // raw.product contains the Reviews fragment spread from ProductQuery
  // TypeScript types guarantee this, runtime check is not needed
  const productReviewsRef = raw.product as ReviewsData | null;

  const selectedVariantHandle = searchParams?.get('variant') || '';

  const handleChangeVariant = useCallback(
    (handle: string) => {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (handle) {
          url.searchParams.set('variant', handle);
        } else {
          url.searchParams.delete('variant');
        }
        router.replace(`${url.pathname}${url.search}${url.hash}`, {
          scroll: false,
        });
      }
    },
    [router]
  );

  if (!product) {
    return null;
  }

  return (
    <ProductPageContent
      product={product as model.Product}
      productReviewsRef={productReviewsRef}
      selectedVariantHandle={selectedVariantHandle}
      onChangeVariant={handleChangeVariant}
    />
  );
}

interface ProductPageContentProps {
  product: model.Product;
  productReviewsRef: ReviewsData | null;
  selectedVariantHandle: string;
  onChangeVariant: (handle: string) => void;
}

function ProductPageContent({
  product,
  productReviewsRef,
  selectedVariantHandle,
  onChangeVariant,
}: ProductPageContentProps) {
  const routes = useRoutes();
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
            href: routes.collection.path(breadcrumb.handle),
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
        onChangeVariant={onChangeVariant}
      />
    </PageLayout>
  );
}
