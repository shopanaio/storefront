import React from "react";
import type { ApiFilter } from "@codegen/schema-client";
import { isPriceRangeFilter, isListFilter, getPriceValue } from "./filterUtils";
import { PriceRangeFilterItem } from "./PriceRangeFilterItem";
import { ListFilterItem } from "./ListFilterItem";

interface FilterItemProps {
  filter: ApiFilter;
  value: any;
  onUpdate: (handle: string, value: any) => void;
}

/**
 * Universal filter item component that renders appropriate filter type
 * based on the filter configuration
 */
export const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  value,
  onUpdate,
}) => {
  // Handle price range filter
  if (isPriceRangeFilter(filter)) {
    const priceValue = getPriceValue(filter, value);

    return (
      <PriceRangeFilterItem
        filter={filter}
        value={priceValue}
        onUpdate={onUpdate}
      />
    );
  }

  // Handle list filter
  if (isListFilter(filter)) {
    // Extract string values from filter value, excluding number arrays (price ranges)
    const currentValues = Array.isArray(value?.values) &&
      typeof value?.values[0] === "number"
        ? []
        : (value?.values as string[]) || [];

    return (
      <ListFilterItem
        filter={filter}
        value={currentValues}
        onUpdate={onUpdate}
      />
    );
  }

  // Unknown filter type - return null
  return null;
};
