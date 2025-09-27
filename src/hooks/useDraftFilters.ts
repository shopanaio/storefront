import { useState, useEffect } from "react";

type FilterValue = {
  values: string[] | [number, number];
  inputs?: string[];
};

type FiltersState = Record<string, FilterValue>;

interface UseDraftFiltersResult {
  draftFilters: FiltersState;
  setDraftFilters: (filters: FiltersState | ((prev: FiltersState) => FiltersState)) => void;
  getFilterValue: (handle: string) => FilterValue;
  updateFilter: (
    handle: string,
    value: FilterValue,
    setSelectedFilters: (filters: FiltersState | ((prev: FiltersState) => FiltersState)) => void
  ) => void;
  resetFilters: (resetAllCallback?: () => void) => void;
}

/**
 * Custom hook for managing draft filters in drawer mode
 * and immediate filters in sidebar mode
 */
export const useDraftFilters = (
  mode: "sidebar" | "drawer",
  selectedFilters: FiltersState
): UseDraftFiltersResult => {
  const [draftFilters, setDraftFilters] = useState<FiltersState>(selectedFilters);

  // Initialize draft filters when drawer mode or selectedFilters change
  useEffect(() => {
    if (mode === "drawer") {
      setDraftFilters(selectedFilters);
    }
  }, [mode, selectedFilters]);

  /**
   * Gets current filter value based on mode
   * In drawer mode: use draft filters
   * In sidebar mode: use selected filters from store
   */
  const getFilterValue = (handle: string): FilterValue => {
    if (mode === "drawer") {
      return draftFilters[handle] || { values: [], inputs: undefined };
    }
    return selectedFilters[handle] || { values: [], inputs: undefined };
  };

  /**
   * Updates filter value based on mode
   * In sidebar mode: apply immediately to store
   * In drawer mode: update draft only
   */
  const updateFilter = (
    handle: string,
    value: FilterValue,
    setSelectedFilters: (filters: FiltersState | ((prev: FiltersState) => FiltersState)) => void
  ) => {
    if (mode === "sidebar") {
      setSelectedFilters((prev) => ({ ...prev, [handle]: value }));
    } else {
      setDraftFilters((prev) => ({ ...prev, [handle]: value }));
    }
  };

  /**
   * Resets filters based on mode
   */
  const resetFilters = (resetAllCallback?: () => void) => {
    if (mode === "drawer") {
      setDraftFilters({});
    } else if (resetAllCallback) {
      resetAllCallback();
    }
  };

  return {
    draftFilters,
    setDraftFilters,
    getFilterValue,
    updateFilter,
    resetFilters,
  };
};
