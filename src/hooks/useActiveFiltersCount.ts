import { useMemo } from "react";

interface UseActiveFiltersCountProps {
  selectedFilters: Record<
    string,
    { values: string[] | [number, number]; inputs?: string[] }
  >;
}

/**
 * Hook that returns the count of active filters and whether any filters are active
 */
export const useActiveFiltersCount = ({ selectedFilters }: UseActiveFiltersCountProps) => {
  const activeFiltersCount = useMemo(() => {
    return Object.keys(selectedFilters).length;
  }, [selectedFilters]);

  const hasActiveFilters = useMemo(() => {
    return activeFiltersCount > 0;
  }, [activeFiltersCount]);

  return {
    activeFiltersCount,
    hasActiveFilters,
  };
};
