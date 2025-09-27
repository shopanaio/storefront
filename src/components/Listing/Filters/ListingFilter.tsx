"use client";

import React, { useState, useEffect } from "react";
import { Flex, Button, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { SliderFilter } from "./SliderFilter";
import type { ApiPriceRangeFilter } from "@codegen/schema-client";

import { mq } from "@src/components/Theme/breakpoints";
import { FiltersProvider } from "./FiltersProvider";
import { FilterWithSearch } from "./FilterWithSearch";
import { ApiFilter } from "@codegen/schema-client";
import type { ApiListFilter, ApiListFilterValue } from "@codegen/schema-client";
import { useFilterActions } from "@src/hooks/useFilterActions";

const { Text } = Typography;

interface ListingFilterProps {
  onClose?: () => void;
  filters: ApiFilter[];
  mode?: "sidebar" | "drawer";
  selectedFilters: Record<
    string,
    { values: string[] | [number, number]; inputs?: string[] }
  >;
  setSelectedFilters: (
    value: React.SetStateAction<
      Record<string, { values: string[] | [number, number]; inputs?: string[] }>
    >
  ) => void;
  /** Function to apply draft filters to actual filters */
  onApplyFilters?: () => void;
  /** Callback to provide apply function to parent */
  onProvideApplyFunction?: (applyFn: () => void) => void;
}

export const ListingFilter: React.FC<ListingFilterProps> = ({
  onClose,
  filters,
  mode = "sidebar",
  selectedFilters,
  setSelectedFilters,
  onApplyFilters,
  onProvideApplyFunction,
}) => {
  const t = useTranslations("Listing");
  const { styles } = useStyles();

  const containerStyle =
    mode === "sidebar" ? styles.sidebarWrapper : styles.drawerWrapper;

  // Draft state for all filters (price and regular)
  const [draftFilters, setDraftFilters] = useState<
    Record<string, { values: string[] | [number, number]; inputs?: string[] }>
  >({});

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
   * Gets the current filter value with fallback chain:
   * 1. Draft value (user is currently editing)
   * 2. Selected filter value
   * 3. Default value
   */
  const getFilterValue = (filter: ApiFilter) => {
    const handle = filter.handle;

    // Check draft first
    if (draftFilters[handle]) {
      return draftFilters[handle];
    }

    // Check selected filters
    const selectedFilter = selectedFilters[handle];
    if (selectedFilter) {
      return selectedFilter;
    }

    // Return empty state
    return { values: [], inputs: undefined };
  };

  /**
   * Gets the current price value specifically for price filters
   */
  const getPriceValue = (
    filter: ApiPriceRangeFilter,
    handle: string
  ): [number, number] => {
    const filterValue = getFilterValue(filter);

    if (filterValue?.values && isPriceRangeTuple(filterValue.values)) {
      return filterValue.values;
    }

    // Fallback to filter defaults
    return [
      parseFloat(filter.minPrice.amount),
      parseFloat(filter.maxPrice.amount),
    ];
  };

  const { handleCloseTag, handleResetAll } = useFilterActions({
    filters,
    selectedFilters,
    setSelectedFilters,
  });

  const onReset = () => {
    setDraftFilters({});
    if (mode === "sidebar") {
      // In sidebar mode, apply reset immediately
      handleResetAll();
    }
  };

  /**
   * Applies all draft filters to actual filters
   */
  const handleApplyAllFilters = () => {
    // Apply draft filters to actual filters
    setSelectedFilters(draftFilters);

    // Call external apply handler if provided
    if (onApplyFilters) {
      onApplyFilters();
    }
  };

  // Provide apply function to parent component
  useEffect(() => {
    if (onProvideApplyFunction && mode === "drawer") {
      onProvideApplyFunction(handleApplyAllFilters);
    }
  }, [onProvideApplyFunction, mode, draftFilters]);

  return (
    <div className={containerStyle}>
      {filters.map((filter) => {
        // type guard for PriceRangeFilter
        const isPriceRangeFilter = (f: ApiFilter): f is ApiPriceRangeFilter => {
          return (
            (f as ApiPriceRangeFilter).minPrice !== undefined &&
            (f as ApiPriceRangeFilter).maxPrice !== undefined
          );
        };

        if (isPriceRangeFilter(filter)) {
          const priceValue = getPriceValue(filter, filter.handle);

          const handlePriceChange = (vals: [number, number]) => {
            setDraftFilters((prev) => ({
              ...prev,
              [filter.handle]: {
                values: vals,
              },
            }));
          };

          const handleApply = () => {
            if (mode === "sidebar") {
              // In sidebar mode, apply immediately
              setSelectedFilters((prev) => ({
                ...prev,
                [filter.handle]: {
                  values: priceValue,
                },
              }));
            }
            // In drawer mode, just update draft - will be applied by drawer button
          };

          return (
            <FiltersProvider handle={filter.handle} key={filter.handle}>
              <SliderFilter
                min={parseFloat(filter.minPrice.amount)}
                max={parseFloat(filter.maxPrice.amount)}
                value={priceValue}
                onChange={handlePriceChange}
                onApply={handleApply}
                mode={mode}
              />
            </FiltersProvider>
          );
        }

        // type guard for ListFilter
        const isListFilter = (f: ApiFilter): f is ApiListFilter => {
          return (f as ApiListFilter).values !== undefined;
        };

        const options: ApiListFilterValue[] = isListFilter(filter)
          ? filter.values
          : [];

        const sortedOptions = options
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title));

        const filterValue = getFilterValue(filter);
        const currentValues = Array.isArray(filterValue?.values) &&
          typeof filterValue?.values[0] === "number"
            ? []
            : (filterValue?.values as string[]) || [];

        return (
          <FiltersProvider handle={filter.handle} key={filter.handle}>
            <FilterWithSearch
              options={sortedOptions}
              value={currentValues}
              onChange={(vals: string[]) => {
                // Get inputs for all selected values
                const filter_ = filters.find((f) => f.handle === filter.handle);
                const inputs = filter_ && (filter_ as any).values ? vals
                  .map((selectedValue) => {
                    const filterValue = (filter_ as any).values.find(
                      (v: any) => v.handle === selectedValue
                    );
                    return filterValue?.input || "";
                  })
                  .filter((input) => input !== "") : [];

                const newFilterValue = {
                  values: vals,
                  inputs: inputs.length > 0 ? inputs : undefined,
                };

                if (mode === "sidebar") {
                  // In sidebar mode, apply immediately
                  setSelectedFilters((prev) => ({
                    ...prev,
                    [filter.handle]: newFilterValue,
                  }));
                } else {
                  // In drawer mode, update draft only
                  setDraftFilters((prev) => ({
                    ...prev,
                    [filter.handle]: newFilterValue,
                  }));
                }
              }}
            />
          </FiltersProvider>
        );
      })}
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  sidebarWrapper: css`
    display: none;
    ${mq.lg} {
      display: flex;
      flex-direction: column;
      min-width: 260px;
      max-width: 260px;
      padding: 0 ${token.padding}px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px;
      height: fit-content;
    }
  `,
  drawerWrapper: css`
    display: block;
  `,
  filterHeader: css`
    width: 100%;
    margin-bottom: ${token.marginXXS}px;
  `,
  filterTitle: css`
    font-size: ${token.fontSize}px;
    font-weight: 600;
    ${mq.lg} {
      font-size: ${token.fontSizeLG}px;
    }
  `,
  resetBtn: css`
    padding: 0;
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  divider: css`
    margin-top: 0;
    margin-bottom: 0;
  `,
}));
