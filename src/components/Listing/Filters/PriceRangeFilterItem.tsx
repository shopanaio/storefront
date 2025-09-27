import React from "react";
import type { ApiPriceRangeFilter } from "@codegen/schema-client";
import { SliderFilter } from "./SliderFilter";
import { FiltersProvider } from "./FiltersProvider";

interface PriceRangeFilterItemProps {
  filter: ApiPriceRangeFilter;
  value: [number, number];
  onUpdate: (handle: string, value: { values: [number, number] }) => void;
}

/**
 * Renders a price range filter with slider component
 */
export const PriceRangeFilterItem: React.FC<PriceRangeFilterItemProps> = ({
  filter,
  value,
  onUpdate,
}) => {
  const handleChange = (vals: [number, number]) => {
    onUpdate(filter.handle, { values: vals });
  };

  return (
    <FiltersProvider handle={filter.handle}>
      <SliderFilter
        min={parseFloat(filter.minPrice.amount)}
        max={parseFloat(filter.maxPrice.amount)}
        value={value}
        onChange={handleChange}
      />
    </FiltersProvider>
  );
};
