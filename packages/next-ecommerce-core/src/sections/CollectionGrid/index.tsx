'use client';

import type { SectionProps } from '../../core/types';
import type { CollectionPageData } from '../../sdk/types';

interface CollectionGridSettings {
  title?: string;
}

export default function CollectionGrid({ settings, data }: SectionProps<
  CollectionGridSettings,
  CollectionPageData
>) {
  return (
    <section style={{ padding: '2rem 1.5rem' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>
        {settings.title ?? data.collection.title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        {data.products.map((product) => (
          <article key={product.id} style={{ border: '1px solid #ddd', padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>{product.title}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>{product.description}</p>
            <span style={{ fontWeight: 600 }}>{product.price} {product.currencyCode}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
