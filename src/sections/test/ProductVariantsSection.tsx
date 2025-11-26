'use client';

import { useProduct } from '@shopana/storefront-sdk/modules/product/react/hooks/useProduct';

export function ProductVariantsSection() {
  const product = useProduct();

  if (!product) return null;

  return (
    <div style={{ padding: 20, background: '#eef', marginBottom: 10 }}>
      <h2>ProductVariantsSection (test)</h2>
      <p><strong>Variants count:</strong> {product.variants.length}</p>
      <ul>
        {product.variants.slice(0, 5).map((v) => (
          <li key={v.id}>
            {v.title} - {v.price.amount} {v.price.currencyCode}
          </li>
        ))}
      </ul>
      <p><strong>Options:</strong> {product.options.map(o => o.title).join(', ')}</p>
    </div>
  );
}
