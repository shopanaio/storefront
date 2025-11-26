'use client';

import { useSearchData } from '@shopana/storefront-sdk/modules/search/react/hooks/useSearchData';

export function SearchResultsSection() {
  const data = useSearchData();

  return (
    <div style={{ padding: 20, background: '#ffe', marginBottom: 10 }}>
      <h2>SearchResultsSection (test)</h2>
      <p><strong>Query:</strong> {data.query}</p>
      <p><strong>Total count:</strong> {data.results?.totalCount ?? 0}</p>
      <p><strong>Products found:</strong> {data.results?.products.length ?? 0}</p>
      <p><strong>Filters count:</strong> {data.results?.filters.length ?? 0}</p>
      <ul>
        {data.results?.products.slice(0, 5).map((p) => (
          <li key={p.id}>
            {p.title} - {p.price.amount} {p.price.currencyCode}
          </li>
        ))}
      </ul>
    </div>
  );
}
