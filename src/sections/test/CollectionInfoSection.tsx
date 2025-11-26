'use client';

import { useCollection } from '@shopana/storefront-sdk/modules/collection/react/hooks/useCollection';

export function CollectionInfoSection() {
  const collection = useCollection();

  if (!collection) {
    return <div style={{ padding: 20, background: '#fee' }}>Collection not found</div>;
  }

  return (
    <div style={{ padding: 20, background: '#fef', marginBottom: 10 }}>
      <h2>CollectionInfoSection (test)</h2>
      <p><strong>ID:</strong> {collection.id}</p>
      <p><strong>Title:</strong> {collection.title}</p>
      <p><strong>Handle:</strong> {collection.handle}</p>
      <p><strong>Description:</strong> {collection.description?.slice(0, 100) ?? 'N/A'}</p>
      <p><strong>Total products:</strong> {collection.listing?.totalCount ?? 0}</p>
    </div>
  );
}
