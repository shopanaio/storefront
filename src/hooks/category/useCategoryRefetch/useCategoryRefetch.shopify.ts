import { useEffect } from "react";
import { ListingSort, ApiFilterInput } from "@codegen/schema-client";

const useCategoryRefetch = (
  sort: ListingSort,
  filters: ApiFilterInput[],
  refetch: (variables: {
    sortKey: string;
    filters: any[];
    after?: string;
    first?: number;
  }) => void
) => {
  useEffect(() => {
    const sortKey = mapSortToShopify(sort);

    const changedFilters = [];

    for (const filter of filters) {
      if (filter.handle === "Price") {
        if (filter.values && filter.values.length >= 2) {
          // Convert strings to numbers for Shopify
          const minPrice = parseFloat(filter.values[0]);
          const maxPrice = parseFloat(filter.values[1]);

          // Check that the conversion was successful
          if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            changedFilters.push({
              price: {
                min: minPrice,
                max: maxPrice
              }
            });
          }
        }
      } else if (filter.inputs && filter.inputs.length > 0) {
        // Process the inputs array
        filter.inputs.forEach(input => {
          try {
            // Parse JSON string to object
            const parsedInput = JSON.parse(input);
            changedFilters.push(parsedInput);
          } catch (error) {
            console.warn("Failed to parse filter input:", input, error);
          }
        });
      }
    }

    refetch({
      sortKey,
      filters: changedFilters,
      after: undefined,
      first: 25
    });
  }, [sort, filters, refetch]);
};

// Function for mapping Shopana sort to Shopify
const mapSortToShopify = (sort: ListingSort): string => {
  switch (sort) {
    case ListingSort.MostRelevant:
      return "COLLECTION_DEFAULT";
    case ListingSort.PriceAsc:
      return "PRICE";
    case ListingSort.PriceDesc:
      return "PRICE";
    case ListingSort.CreatedAtAsc:
      return "CREATED";
    case ListingSort.CreatedAtDesc:
      return "CREATED";
    case ListingSort.TitleAsc:
      return "TITLE";
    case ListingSort.TitleDesc:
      return "TITLE";
    default:
      return "COLLECTION_DEFAULT";
  }
};

export default useCategoryRefetch;
