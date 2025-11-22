'use client';

import type { SectionProps } from '../../core/types';
import type { ProductPageData } from '../../sdk/types';
import { useShop } from '../../shop';

interface ProductHeroSettings {
  headline?: string;
}

export default function ProductHero({ settings, data }: SectionProps<ProductHeroSettings, ProductPageData>) {
  const shop = useShop();
  const { product } = data;

  return (
    <section style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #222' }}>
      <p style={{ marginBottom: '0.25rem', color: '#555', textTransform: 'uppercase' }}>
        {shop.name}
      </p>
      <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{settings.headline ?? product.title}</h1>
      {product.description && (
        <p style={{ marginTop: '1rem', color: '#666', maxWidth: 640 }}>{product.description}</p>
      )}
      <strong style={{ display: 'block', marginTop: '1.5rem', fontSize: '1.5rem' }}>
        {shop.formatMoney(product.price)}
      </strong>
    </section>
  );
}
