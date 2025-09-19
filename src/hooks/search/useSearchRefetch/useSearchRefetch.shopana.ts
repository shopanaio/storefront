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
    sort: ListingSort;
    filters: ExtendedFilterInput[];
  }) => void,
  query: string
) => {
  const prevFiltersRef = useRef<ExtendedFilterInput[]>([]);
  const prevSortRef = useRef<ListingSort>(sort);

  useEffect(() => {
    // Check if filters or sorting actually changed
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFiltersRef.current);
    const sortChanged = sort !== prevSortRef.current;

    if (filtersChanged || sortChanged) {
      console.log("Shopana search refetch - sort:", sort, "filters:", filters, "query:", query);

      refetch({
        query,
        first: 12,
        after: undefined,
        sort,
        filters,
      });

      // Updating refs
      prevFiltersRef.current = [...filters];
      prevSortRef.current = sort;
    }
  }, [sort, filters, refetch, query]);
};

export default useSearchRefetch;
