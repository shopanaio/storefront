import { headers } from "next/headers";
import React from "react";
import loadSerializableQuery from "@src/relay/loadSerializableQuery";
import SearchQueryNode, {
  SearchQuery,
} from "@src/hooks/search/SearchQuery/__generated__/SearchQuery.graphql";
import { QueryProvider } from "@src/providers/relay-query-provider";
import { SearchPageClient } from "@src/app/[locale]/search/client";
import { ListingSort } from "@codegen/schema-client";

interface SearchPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    q?: string;
    sort?: string;
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { q, sort } = searchParams;
  const cookie = headers().get("cookie") ?? undefined;

  // If no search query, show empty page
  if (!q || !q.trim()) {
    return (
      <div>
        <h1>Search</h1>
        <p>Enter search query</p>
      </div>
    );
  }

  // Load data on server
  const preloadedQuery = await loadSerializableQuery<
    typeof SearchQueryNode,
    SearchQuery
  >(
    SearchQueryNode.params,
    {
      query: q.trim(),
      first: 12,
      after: null,
      sort: (sort as ListingSort) || ListingSort.MostRelevant,
      filters: [], // For now use empty filters, they will be updated on client
    },
    cookie
  );

  // Check data availability
  let hasSearchResults = false;
  if (Array.isArray(preloadedQuery.response)) {
    const single = preloadedQuery.response.find(
      (r): r is { data: { search?: { products?: unknown } } } =>
        !!r && "data" in r
    );
    hasSearchResults = !!single?.data?.search?.products;
  } else if ("data" in preloadedQuery.response) {
    hasSearchResults = !!preloadedQuery.response.data?.search?.products;
  }

  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <SearchPageClient />
    </QueryProvider>
  );
}
