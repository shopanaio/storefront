"use client";

import React, { useCallback, useState, useRef } from "react";
import { PageLayout } from "@src/components/Layout/PageLayout";
import { useLazyLoadQuery } from "react-relay";
import { SearchPageContent } from "@src/components/Search/SearchPageContent";
import { ListingSort } from "@codegen/schema-client";
import { useSearchParams, useRouter } from "next/navigation";
import SearchQuery from "@src/hooks/search/SearchQuery";
import { SearchQuery as SearchQueryType } from "@src/hooks/search/SearchQuery/__generated__/SearchQuery.graphql";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

export const SearchPageClient = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams?.get("q") || "";
  const sort =
    (searchParams?.get("sort") as ListingSort) || ListingSort.MostRelevant;

  // State for filters
  const [currentFilters, setCurrentFilters] = useState<ExtendedFilterInput[]>(
    []
  );
  const prevFiltersRef = useRef<ExtendedFilterInput[]>([]);

  // Function for mapping Shopana sort to Shopify
  const mapSortToShopify = (sort: ListingSort): "RELEVANCE" | "PRICE" => {
    switch (sort) {
      case ListingSort.MostRelevant:
        return "RELEVANCE";
      case ListingSort.PriceAsc:
      case ListingSort.PriceDesc:
        return "PRICE";
      case ListingSort.CreatedAtAsc:
      case ListingSort.CreatedAtDesc:
      case ListingSort.TitleAsc:
      case ListingSort.TitleDesc:
        // Shopify search supports only RELEVANCE and PRICE
        return "RELEVANCE";
      default:
        return "RELEVANCE";
    }
  };

  // Convert filters for Shopify
  const transformFiltersForShopify = (filters: ExtendedFilterInput[]) => {
    return filters
      .map((filter) => {
        if (filter.handle === "Price") {
          if (filter.values && filter.values.length >= 2) {
            const minPrice = parseFloat(filter.values[0]);
            const maxPrice = parseFloat(filter.values[1]);

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
              return {
                price: {
                  min: minPrice,
                  max: maxPrice,
                },
              };
            }
          }
        } else if (filter.inputs && filter.inputs.length > 0) {
          try {
            const parsedInput = JSON.parse(filter.inputs[0]);
            return parsedInput;
          } catch (error) {
            console.warn(
              "Failed to parse filter input:",
              filter.inputs[0],
              error
            );
          }
        }

        return null;
      })
      .filter(Boolean);
  };

  // Create query variables depending on provider
  const getQueryVariables = () => {
    const baseVariables = {
      query: q,
      first: 12,
      after: undefined,
    };

    // Check which provider is used
    if (process.env.NEXT_PUBLIC_CMS_PROVIDER === "shopify") {
      return {
        ...baseVariables,
        sortKey: mapSortToShopify(sort), // Use correct sortKey for Shopify
        productFilters: transformFiltersForShopify(currentFilters),
      };
    } else {
      // Shopana
      return {
        ...baseVariables,
        sort,
        filters: currentFilters,
      };
    }
  };

  // Use lazy load for search
  const data = useLazyLoadQuery<SearchQueryType>(
    SearchQuery,
    getQueryVariables(),
    {
      fetchPolicy: "network-only",
      fetchKey: `${q}-${sort}-${JSON.stringify(currentFilters)}`,
    }
  );

  // Filter change handler
  const handleFiltersChange = useCallback((filters: ExtendedFilterInput[]) => {
    setCurrentFilters(filters);
  }, []);

  if (!data || !data.search) {
    return (
      <PageLayout>
        <div>Nothing found</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <SearchPageContent
        searchTitle={q}
        searchData={data.search}
        onFiltersChange={handleFiltersChange}
        sort={sort}
        filters={currentFilters}
        refetch={(variables) => {
          // Check if filters actually changed
          if (
            variables.filters &&
            JSON.stringify(variables.filters) !==
              JSON.stringify(prevFiltersRef.current)
          ) {
            prevFiltersRef.current = [...variables.filters];
            setCurrentFilters(variables.filters);
          }
        }}
      />
    </PageLayout>
  );
};
