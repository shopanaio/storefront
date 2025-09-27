import { useCallback } from "react";
import { ApiFilter } from "@codegen/schema-client";

interface UseFilterActionsProps {
  filters: ApiFilter[];
  selectedFilters: Record<
    string,
    { values: string[] | [number, number]; inputs?: string[] }
  >;
  setSelectedFilters: (
    value: React.SetStateAction<
      Record<string, { values: string[] | [number, number]; inputs?: string[] }>
    >
  ) => void;
}

export const useFilterActions = ({
  filters,
  selectedFilters,
  setSelectedFilters,
}: UseFilterActionsProps) => {
  /**
   * Checks if filter values are a valid price range tuple
   */
  const isPriceRangeTuple = (values: unknown): values is [number, number] => {
    return (
      Array.isArray(values) &&
      values.length === 2 &&
      typeof values[0] === "number" &&
      typeof values[1] === "number"
    );
  };

  /**
   * Function for getting inputs from normalizedFilters
   */
  const getInputsForFilter = useCallback(
    (filterHandle: string, selectedValues: string[]): string[] => {
      const filter = filters.find((f) => f.handle === filterHandle);
      if (filter && (filter as any).values) {
        return selectedValues
          .map((selectedValue) => {
            const filterValue = (filter as any).values.find(
              (v: any) => v.handle === selectedValue
            );
            return filterValue?.input || "";
          })
          .filter((input) => input !== "");
      }
      return [];
    },
    [filters]
  );

  /**
   * Remove value from selected filter
   */
  const handleCloseTag = useCallback(
    (handle: string, value?: string) => {
      setSelectedFilters((prev) => {
        const current = prev[handle];
        if (handle === "PRICE" || handle === "Price") {
          const rest = { ...prev };
          delete rest[handle];
          return rest;
        }
        if (
          current &&
          Array.isArray(current.values) &&
          !isPriceRangeTuple(current.values)
        ) {
          const stringValues = current.values as string[];
          const newValues = stringValues.filter((v) => v !== value);
          if (newValues.length === 0) {
            const rest = { ...prev };
            delete rest[handle];
            return rest;
          }
          // Update inputs according to new values
          const newInputs = getInputsForFilter(handle, newValues);
          return {
            ...prev,
            [handle]: {
              ...current,
              values: newValues,
              inputs: newInputs.length > 0 ? newInputs : undefined,
            },
          };
        }
        return prev;
      });
    },
    [setSelectedFilters, getInputsForFilter]
  );

  /**
   * Reset all selected filters
   */
  const handleResetAll = useCallback(() => {
    if (Object.keys(selectedFilters).length > 0) {
      setSelectedFilters({});
    }
  }, [selectedFilters, setSelectedFilters]);

  return {
    handleCloseTag,
    handleResetAll,
  };
};
