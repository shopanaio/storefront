import { useLazyLoadQuery } from "react-relay";
import { ListingSort } from "@codegen/schema-client";
import { cmsPick } from "@src/cms/pick";

// Import separate queries for each provider
import SearchQueryShopana from "@src/hooks/search/SearchQuery/SearchQuery.shopana";
import SearchQueryShopify from "@src/hooks/search/SearchQuery/SearchQuery.shopify";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

interface UseSearchPaginationParams {
  query: string;
  after: string | null;
  sort: ListingSort;
  filters: ExtendedFilterInput[];
}

// Create hooks for each provider
const useSearchPaginationShopana = ({ query, after, sort, filters }: UseSearchPaginationParams) => {
  // For Shopana use any since we have no generated types for Shopana
  const data = useLazyLoadQuery<any>(
    SearchQueryShopana,
    {
      query,
      first: 12,
      after,
      sort,
      filters,
    },
    {
      fetchPolicy: "network-only",
      fetchKey: `${query}-${sort}-${JSON.stringify(filters)}-${after}`,
    }
  );

  return {
    products: data?.search?.products ?? null,
    loading: false,
    error: null,
  };
};

const useSearchPaginationShopify = ({ query, after, sort, filters }: UseSearchPaginationParams) => {
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
          // Process array inputs for other filters
          try {
            const parsedInput = JSON.parse(filter.inputs[0]);
            return parsedInput;
          } catch (error) {
            console.warn("Failed to parse filter input:", filter.inputs[0], error);
          }
        }
        return undefined;
      })
      .filter(
        (filter): filter is NonNullable<typeof filter> => filter !== undefined
      );
  };

  // For Shopify use any since we have no generated types for Shopify
  const data = useLazyLoadQuery<any>(
    SearchQueryShopify,
    {
      query,
      first: 12,
      after,
      sortKey: "RELEVANCE" as const,
      productFilters: transformFiltersForShopify(filters),
    },
    {
      fetchPolicy: "network-only",
      fetchKey: `${query}-${sort}-${JSON.stringify(filters)}-${after}`,
    }
  );

  return {
    products: data?.search?.products ?? null,
    loading: false,
    error: null,
  };
};

// Export hook through cmsPick
export const useSearchPagination = cmsPick({
  shopana: useSearchPaginationShopana,
  shopify: useSearchPaginationShopify,
});
