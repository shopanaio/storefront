import { useEffect } from "react";
import { ListingSort, ApiFilterInput } from "@codegen/schema-client";

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
    console.log("Shopana refetch - sort:", sort, "filters:", filters);

    refetch({
      sort,
      filters,
      after: undefined,
      first: 25
    });
  }, [sort, filters, refetch]);
};

export default useCategoryRefetch;