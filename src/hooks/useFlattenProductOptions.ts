import { useMemo } from "react";
import _ from "lodash";
import type { Entity } from "@shopana/entity";

/**
 * Hook for processing and structuring product options
 *
 * Transforms complex product variants structure into a UI-friendly format,
 * where each option contains metadata about state (active/inactive/unavailable)
 * and a reference to the corresponding product variant
 */

/**
 * Extended option value with metadata for UI
 */
export type UiOptionValue = Entity.ProductOptionValue & {
  isActive: boolean;
  variant?: Entity.ProductVariant; // Reference to product variant with this value
  amount?: Entity.Money; // Additional cost if exists
};

/**
 * Option group with metadata and enriched values
 */
export type UiOption = {
  id: string;
  handle: string;
  title: string;
  values: UiOptionValue[];
  displayType?: Entity.ProductOptionDisplayType;
};

export const useFlattenProductOptions = (
  options: Entity.ProductOption[], // All product options, grouped in array
  variants: Entity.ProductVariant[], // Variants with selectedOptions: string[]
  currentVariant: Entity.ProductVariant
): UiOption[] => {
  return useMemo(() => {
    if (!variants?.length || !options?.length) {
      return [];
    }

    /**
     * Creates a map of selected values for a specific product variant
     * Returns object like: { [group_handle]: value_handle }
     */
    const buildVariantMap = (variant: Entity.ProductVariant): Record<string, string> => {
      if (!variant.selectedOptions?.length) return {};

      const mapping: Record<string, string> = {};

      // Iterate through all option groups
      for (const optionGroup of options) {
        const { handle: groupHandle, values } = optionGroup;

        if (!groupHandle || !values?.length) continue;

        // Find the value from this group that is selected in the variant
        const selectedValue = values.find((val: Entity.ProductOptionValue) =>
          variant.selectedOptions?.includes(val.handle)
        );

        if (selectedValue) {
          mapping[groupHandle] = selectedValue.handle;
        }
      }

      return mapping;
    };

    /**
     * Generates unique key for option combination
     * Used for fast variant lookup by set of selected values
     */
    const buildKey = (map: Record<string, string>): string =>
      Object.entries(map)
        .map(([groupHandle, valueHandle]) => `${groupHandle}:${valueHandle}`)
        .sort()
        .join("|");

    // Create index of all variants by combination key for O(1) lookup
    const variantIndex = new Map<string, Entity.ProductVariant>();
    for (const variant of variants) {
      const key = buildKey(buildVariantMap(variant));
      if (key) variantIndex.set(key, variant);
    }

    // Get map of selected values for current variant
    const currentSelection = buildVariantMap(currentVariant);

    /**
     * Convert option groups to format with metadata
     */
    const optionsWithMeta: UiOption[] = options.map((optionGroup) => {
      const {
        id,
        handle: groupHandle,
        title,
        values,
        displayType,
      } = optionGroup;

      if (!groupHandle || !values?.length) {
        return {
          id,
          handle: groupHandle || "",
          title,
          values: [],
          displayType,
        };
      }

      /**
       * Enrich each value with metadata:
       * - variant: reference to product variant with this value
       */
      const enrichedValues: UiOptionValue[] = values.map((value) => {
        // Create new combination with selected value
        const newSelection = {
          ...currentSelection,
          [groupHandle]: value.handle,
        };

        const key = buildKey(newSelection);
        const matchedVariant = variantIndex.get(key);

        return {
          ...value,
          isActive: currentVariant.selectedOptions?.includes(value.handle) || false,
          variant: matchedVariant,
        };
      });

      // Remove duplicates by id, keeping first occurrence
      const uniqueValues = _.uniqBy(enrichedValues, "id");

      return {
        id,
        handle: groupHandle,
        title,
        values: uniqueValues,
        displayType,
      };
    });

    return optionsWithMeta;
  }, [options, variants, currentVariant]);
};
