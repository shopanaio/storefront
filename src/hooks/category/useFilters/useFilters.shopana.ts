import { ApiFilter } from "@codegen/schema-client";

const useFilters = (filters: any[]): ApiFilter[] => {
  // Shopana returns filters in correct format
  return filters;
};

export default useFilters;
