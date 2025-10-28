import React from "react";
import { ListingPageClient } from "./client";
import { QueryProvider } from "@src/providers/relay-query-provider";
import loadCategoryServerQuery from "@src/hooks/category/loadCategoryServerQuery";
import { ListingSort } from "@codegen/schema-client";

interface ListingPageProps {
  params: Promise<{
    locale: string;
    handle: string;
  }>;
}

export default async function ListingPage(props: ListingPageProps) {
  const params = await props.params;
  const { handle } = params;

  const preloadedQuery = await loadCategoryServerQuery({
    handle,
    first: 12,
    sort: ListingSort.MostRelevant,
    filters: [],
  });

  // Output result to console for debugging
  console.log("Category Server Query Result:", preloadedQuery);

  return (
    <QueryProvider preloadedQuery={preloadedQuery}>
      <ListingPageClient />
    </QueryProvider>
  );
}
