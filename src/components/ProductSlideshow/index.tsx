'use client';

import type { HomeProduct } from '@shopana/storefront-sdk/modules/home/core/types';

export interface ProductSlideShowProps {
  title: string;
  products: HomeProduct[];
}

const MAX_PRODUCTS = 8;

function formatPrice(price: HomeProduct['price']) {
  const amount = Number(price.amount);

  if (Number.isNaN(amount)) {
    return `${price.amount} ${price.currencyCode}`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currencyCode,
  }).format(amount);
}

export function ProductSlideShow({ title, products }: ProductSlideShowProps) {
  const visibleProducts = products.slice(0, MAX_PRODUCTS);

  return (
    <section className="py-12">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-emerald-600">
            Curated selection
          </p>
          <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        <span className="text-sm text-gray-500">
          Showing {visibleProducts.length} of {products.length} items
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            {product.image?.url ? (
              <img
                src={product.image.url}
                alt={product.title}
                loading="lazy"
                className="h-56 w-full rounded-t-xl object-cover"
              />
            ) : (
              <div className="h-56 w-full rounded-t-xl bg-gray-100" />
            )}

            <div className="flex flex-1 flex-col gap-3 px-4 py-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-400">
                  {product.product.title}
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {product.title}
                </p>
              </div>

              <div className="mt-auto">
                <p className="text-lg font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </p>
                {product.compareAtPrice ? (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
