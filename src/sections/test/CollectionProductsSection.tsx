'use client';

import { useCollectionProducts } from '@shopana/storefront-sdk/modules/collection/react/hooks/useCollectionProducts';

export function CollectionProductsSection() {
  const products = useCollectionProducts();

  return (
    <div style={{ padding: 20, background: '#eff', marginBottom: 10 }}>
      <h2>CollectionProductsSection (test)</h2>
      <p><strong>Products on page:</strong> {products.length}</p>
      <ul>
        {products.slice(0, 5).map((p) => (
          <li key={p.id}>
            {p.title} - {p.price.amount} {p.price.currencyCode}
          </li>
        ))}
      </ul>
    </div>
  );
}
