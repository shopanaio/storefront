import {
  ApiProductOption,
  ApiProductVariant,
  ProductOptionDisplayType,
} from "@codegen/schema-client";
import { useMemo } from "react";
import { useFlattenProductOptions } from "./useFlattenProductOptions";

/**
 * Hook for getting product color options
 *
 * Uses the main useFlattenProductOptions hook and extracts from it
 * the first option group with display type "Swatch" (color swatches)
 */
export const useProductSwatches = (
  options: ApiProductOption[],
  variants: ApiProductVariant[],
  currentVariant: ApiProductVariant
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
      (group) => group.displayType === ProductOptionDisplayType.Swatch
    );

    // If group not found, return empty array
    if (!colorGroup) {
      return [];
    }

    // Return color group values
    return colorGroup.values;
  }, [allOptions]);
};
