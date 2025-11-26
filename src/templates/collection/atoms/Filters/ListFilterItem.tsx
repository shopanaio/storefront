import React from "react";
import type { ApiListFilter, ApiListFilterValue } from "@codegen/schema-client";
import { FilterWithSearch } from "./FilterWithSearch";
import { FiltersProvider } from "./FiltersProvider";
import { getFilterInputs } from "./filterUtils";

interface ListFilterItemProps {
  filter: ApiListFilter;
  value: string[];
  onUpdate: (handle: string, value: { values: string[]; inputs?: string[] }) => void;
}

/**
 * Renders a list filter with search functionality
 */
export const ListFilterItem: React.FC<ListFilterItemProps> = ({
  filter,
  value,
  onUpdate,
}) => {
  const options: ApiListFilterValue[] = filter.values || [];

  // Sort options alphabetically for better UX
  const sortedOptions = options
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title));

  const handleChange = (selectedValues: string[]) => {
    // Get inputs for all selected values
    const inputs = getFilterInputs(filter, selectedValues);

    const newFilterValue = {
      values: selectedValues,
      inputs: inputs.length > 0 ? inputs : undefined,
    };

    onUpdate(filter.handle, newFilterValue);
  };

  return (
    <FiltersProvider handle={filter.handle}>
      <FilterWithSearch
        options={sortedOptions}
        value={value}
        onChange={handleChange}
      />
    </FiltersProvider>
  );
};
