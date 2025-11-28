import { useEffect } from "react";
import { ListingSort, ApiFilterInput } from "@codegen/schema-client";
import { PAGINATION_PAGE_SIZE } from "@src/config";

const useCategoryRefetch = (
  sort: ListingSort,
  filters: ApiFilterInput[],
  refetch: (variables: {
    sort: ListingSort;
    filters: ApiFilterInput[];
    after?: string;
    first?: number;
  }) => void
) => {
  useEffect(() => {
    refetch({
      sort,
      filters,
      after: undefined,
      first: PAGINATION_PAGE_SIZE
    });
  }, [sort, filters, refetch]);
};

export default useCategoryRefetch;
