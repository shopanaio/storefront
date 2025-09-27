import type { ApiFilter, ApiPriceRangeFilter, ApiListFilter } from "@codegen/schema-client";

/**
 * Type guard to check if filter is a price range filter
 */
export const isPriceRangeFilter = (filter: ApiFilter): filter is ApiPriceRangeFilter => {
  return (
    (filter as ApiPriceRangeFilter).minPrice !== undefined &&
    (filter as ApiPriceRangeFilter).maxPrice !== undefined
  );
};

/**
 * Type guard to check if filter is a list filter
 */
export const isListFilter = (filter: ApiFilter): filter is ApiListFilter => {
  return (filter as ApiListFilter).values !== undefined;
};

/**
 * Type guard to check if values are a valid price range tuple
 */
export const isPriceRangeTuple = (values: unknown): values is [number, number] => {
  return (
    Array.isArray(values) &&
    values.length === 2 &&
    typeof values[0] === "number" &&
    typeof values[1] === "number"
  );
};

/**
 * Gets price value from filter value, with fallback to filter defaults
 */
export const getPriceValue = (
  filter: ApiPriceRangeFilter,
  filterValue: any
): [number, number] => {
  if (filterValue?.values && isPriceRangeTuple(filterValue.values)) {
    return filterValue.values;
  }

  // Fallback to filter defaults
  return [
    parseFloat(filter.minPrice.amount),
    parseFloat(filter.maxPrice.amount),
  ];
};

/**
 * Extracts inputs for selected values from list filter
 */
export const getFilterInputs = (
  filter: ApiListFilter,
  selectedValues: string[]
): string[] => {
  if (!selectedValues.length) return [];

  const inputs = selectedValues
    .map((selectedValue) => {
      const filterValue = filter.values.find(
        (v) => v.handle === selectedValue
      );
      return filterValue?.input || "";
    })
    .filter((input) => input !== "");

  return inputs;
};
