'use client';

import { useProduct } from '@shopana/storefront-sdk/modules/product/react/hooks/useProduct';

export function ProductInfoSection() {
  const product = useProduct();

  if (!product) {
    return <div style={{ padding: 20, background: '#fee' }}>Product not found</div>;
  }

  return (
    <div style={{ padding: 20, background: '#efe', marginBottom: 10 }}>
      <h2>ProductInfoSection (test)</h2>
      <p><strong>ID:</strong> {product.id}</p>
      <p><strong>Title:</strong> {product.title}</p>
      <p><strong>Handle:</strong> {product.handle}</p>
      <p><strong>Description:</strong> {product.description?.slice(0, 100)}...</p>
      <p><strong>Category:</strong> {product.category?.title ?? 'N/A'}</p>
      <p><strong>Rating:</strong> {product.rating?.rating ?? 'N/A'} ({product.rating?.count ?? 0} reviews)</p>
    </div>
  );
}
