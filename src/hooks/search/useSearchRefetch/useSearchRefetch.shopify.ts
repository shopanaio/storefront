import { useEffect, useRef } from "react";
import { ListingSort } from "@codegen/schema-client";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

const useSearchRefetch = (
  sort: ListingSort,
  filters: ExtendedFilterInput[],
  refetch: (variables: {
    query: string;
    first: number;
    after?: string;
    productFilters: any[];
  }) => void,
  query: string
) => {
  const prevFiltersRef = useRef<ExtendedFilterInput[]>([]);
  const prevSortRef = useRef<ListingSort>(sort);

  useEffect(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    const sortChanged = sort !== prevSortRef.current;

    if (filtersChanged || sortChanged) {
      console.log("Shopify search refetch - sort:", sort, "filters:", filters, "query:", query);

      // Convert filters for Shopify
      const shopifyFilters = filters.map(filter => {
        if (filter.handle === "Price") {
          // For price filter in Shopify use price
          if (filter.values && filter.values.length >= 2) {
            const minPrice = parseFloat(filter.values[0]);
            const maxPrice = parseFloat(filter.values[1]);

            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
              return {
                price: {
                  min: minPrice,
                  max: maxPrice
                }
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
        } else if (filter.handle === "productType") {
          if (filter.values && filter.values.length > 0) {
            return {
              productType: filter.values[0]
            };
          }
        } else if (filter.handle === "productVendor") {
          if (filter.values && filter.values.length > 0) {
            return {
              productVendor: filter.values[0]
            };
          }
        } else if (filter.handle === "tag") {
          if (filter.values && filter.values.length > 0) {
            return {
              tag: filter.values[0]
            };
          }
        } else if (filter.handle === "available") {
          if (filter.values && filter.values.length > 0) {
            return {
              available: filter.values[0] === "true"
            };
          }
        }

        return null;
      }).filter(Boolean);

      console.log("Transformed Shopify filters:", shopifyFilters);

      refetch({
        query,
        first: 12,
        after: undefined,
        productFilters: shopifyFilters,
      });

      // Updating refs
      prevFiltersRef.current = [...filters];
      prevSortRef.current = sort;
    }
  }, [sort, filters, refetch, query]);
};

export default useSearchRefetch;
