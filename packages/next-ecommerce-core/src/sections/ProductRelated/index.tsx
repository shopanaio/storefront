'use client';

import type { SectionProps } from '../../core/types';
import type { ProductPageData } from '../../sdk/types';

interface ProductRelatedSettings {
  title?: string;
}

export default function ProductRelated({ settings, data }: SectionProps<
  ProductRelatedSettings,
  ProductPageData
>) {
  return (
    <section style={{ padding: '2rem 1.5rem', background: '#f7f7f7' }}>
      <h2 style={{ marginBottom: '1rem' }}>{settings.title ?? 'Related products'}</h2>
      <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
        {data.relatedProducts.map((product) => (
          <article key={product.id} style={{ minWidth: 240 }}>
            <strong style={{ display: 'block' }}>{product.title}</strong>
            <span style={{ color: '#555' }}>
              {product.currencyCode} {product.price}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
