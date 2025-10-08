import type * as Entity from "@src/entity/namespace";
import { useMemo } from "react";
import { useFlattenProductOptions } from "./useFlattenProductOptions";

/**
 * Hook for getting product color options
 *
 * Uses the main useFlattenProductOptions hook and extracts from it
 * the first option group with display type "Swatch" (color swatches)
 */
export const useProductSwatches = (
  options: Entity.ProductOption[],
  variants: Entity.ProductVariant[],
  currentVariant: Entity.ProductVariant
) => {
  // Get all processed option groups
  const allOptions = useFlattenProductOptions(
    options,
    variants,
    currentVariant
  );

  return useMemo(() => {
    // Find first group with display type Swatch (color swatches)
    const colorGroup = allOptions.find(
      (group) => group.displayType === 'SWATCH'
    );

    // If group not found, return empty array
    if (!colorGroup) {
      return [];
    }

    // Return color group values
    return colorGroup.values;
  }, [allOptions]);
};
