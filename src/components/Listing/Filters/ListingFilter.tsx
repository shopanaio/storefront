"use client";

import React, { useState } from "react";
import { Flex, Button, Tag, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { RxCross2 } from "react-icons/rx";
import { SliderFilter } from "./SliderFilter";
import type { ApiPriceRangeFilter } from "@codegen/schema-client";

import { mq } from "@src/components/Theme/breakpoints";
import { FiltersProvider } from "./FiltersProvider";
import { FilterWithSearch } from "./FilterWithSearch";
import { ApiFilter } from "@codegen/schema-client";
import type { ApiListFilter, ApiListFilterValue } from "@codegen/schema-client";

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
}

export const ListingFilter: React.FC<ListingFilterProps> = ({
  onClose,
  filters,
  mode = "sidebar",
  selectedFilters,
  setSelectedFilters,
}) => {
  const t = useTranslations("Listing");
  const { styles } = useStyles();

  const containerStyle =
    mode === "sidebar" ? styles.sidebarWrapper : styles.drawerWrapper;

  // For price filter: selectedFilters[handle] = { values: [min, max], inputs?: string[] }
  // For others: selectedFilters[handle] = { values: string[], inputs?: string[] }
  const [priceDraft, setPriceDraft] = useState<
    Record<string, [number, number]>
  >({});

  // Function for getting inputs from normalizedFilters
  const getInputsForFilter = (
    filterHandle: string,
    selectedValues: string[]
  ): string[] => {
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
  };

  const onReset = () => {
    if (Object.keys(selectedFilters).length > 0) {
      setSelectedFilters({});
      setPriceDraft({});
    }
  };

  // Remove value from selected filter
  const handleCloseTag = (handle: string, value?: string) => {
    setSelectedFilters((prev) => {
      const current = prev[handle];
      if (handle === "PRICE" || handle === "Price") {
        const rest = { ...prev };
        delete rest[handle];
        return rest;
      }
      if (current && Array.isArray(current.values)) {
        const newValues = current.values.filter((v) => v !== value);
        if (newValues.length === 0) {
          const rest = { ...prev };
          delete rest[handle];
          return rest;
        }
        // Update inputs according to new values
        const newInputs = getInputsForFilter(handle, newValues as string[]);
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
  };

  // Render tags for selected values
  const renderTags = () => {
    const tags: React.ReactNode[] = [];
    Object.entries(selectedFilters).forEach(([handle, filterData]) => {
      if (
        (handle === "PRICE" || handle === "Price") &&
        Array.isArray(filterData.values) &&
        filterData.values.length === 2
      ) {
        // Format price range
        const [min, max] = filterData.values as [number, number];
        const formatter = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        });
        tags.push(
          <Tag
            key={handle + min + max}
            closable
            color="processing"
            style={{ margin: 0 }}
            onClose={(e) => {
              e.preventDefault();
              handleCloseTag(handle);
            }}
          >
            {`${formatter.format(min)} - ${formatter.format(max)}`}
          </Tag>
        );
      } else if (Array.isArray(filterData.values)) {
        // Find options for current filter
        const filter = filters.find((f) => f.handle === handle);
        const isListFilter =
          filter && (filter as ApiListFilter).values !== undefined;
        const options: ApiListFilterValue[] = isListFilter
          ? (filter as ApiListFilter).values
          : [];
        // Sort options alphabetically (title)
        const sortedOptions = options
          .slice()
          .sort((a, b) => a.title.localeCompare(b.title));
        (filterData.values as string[]).forEach((value) => {
          // For ListFilter find title by handle, otherwise display handle
          let display = value;
          let isInactive = false;
          if (isListFilter) {
            const found = sortedOptions.find((opt) => opt.handle === value);
            if (found) {
              display = found.title;
            } else {
              display = value + "?";
              isInactive = true;
            }
          } else if (!filter) {
            display = value + "?";
            isInactive = true;
          }
          tags.push(
            <Tag
              key={handle + value}
              closable
              color={isInactive ? "default" : "processing"}
              style={{ margin: 0, opacity: isInactive ? 0.5 : 1 }}
              onClose={(e) => {
                e.preventDefault();
                handleCloseTag(handle, value);
              }}
            >
              {display}
            </Tag>
          );
        });
      }
    });
    return tags;
  };

  return (
    <div className={containerStyle}>
      <Flex className={styles.filterHeader} vertical>
        <Flex align="center" justify="space-between">
          <Text className={styles.filterTitle}>{t("filters")}</Text>

          <Flex align="center" gap={10}>
            <Button className={styles.resetBtn} onClick={onReset} type="link">
              {t("reset")}
            </Button>
            {mode === "drawer" && (
              <Button
                icon={<RxCross2 size={24} />}
                type="text"
                className={styles.closeBtn}
                onClick={onClose}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
      {renderTags().length > 0 && (
        <Flex wrap gap={8}>
          {renderTags()}
        </Flex>
      )}
      {filters.map((filter) => {
        // type guard for PriceRangeFilter
        const isPriceRangeFilter = (f: ApiFilter): f is ApiPriceRangeFilter => {
          return (
            (f as ApiPriceRangeFilter).minPrice !== undefined &&
            (f as ApiPriceRangeFilter).maxPrice !== undefined
          );
        };

        if (isPriceRangeFilter(filter)) {
          // Take draft if exists, otherwise from selectedFilters, otherwise default
          const priceValue =
            priceDraft[filter.handle] ||
            (selectedFilters[filter.handle]?.values &&
            Array.isArray(selectedFilters[filter.handle].values) &&
            typeof selectedFilters[filter.handle].values[0] === "number"
              ? (selectedFilters[filter.handle].values as [number, number])
              : [filter.minPrice.amount, filter.maxPrice.amount]);

          const handleApply = () => {
            setSelectedFilters((prev) => ({
              ...prev,
              [filter.handle]: {
                values: priceValue,
                // For price filter inputs are not needed
              },
            }));
          };

          return (
            <FiltersProvider handle={filter.handle} key={filter.handle}>
              <SliderFilter
                min={filter.minPrice.amount}
                max={filter.maxPrice.amount}
                value={priceValue as [number, number]}
                onChange={(vals: [number, number]) => {
                  setPriceDraft((prev) => ({ ...prev, [filter.handle]: vals }));
                }}
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

        return (
          <FiltersProvider handle={filter.handle} key={filter.handle}>
            <FilterWithSearch
              options={sortedOptions}
              value={
                Array.isArray(selectedFilters[filter.handle]?.values) &&
                typeof selectedFilters[filter.handle]?.values[0] === "number"
                  ? []
                  : (selectedFilters[filter.handle]?.values as string[]) || []
              }
              onChange={(vals: string[]) => {
                // Get inputs for all selected values
                const inputs = getInputsForFilter(filter.handle, vals);

                setSelectedFilters((prev) => ({
                  ...prev,
                  [filter.handle]: {
                    values: vals,
                    inputs: inputs.length > 0 ? inputs : undefined,
                  },
                }));
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
      padding: ${token.padding}px;
      border: 1px solid ${token.colorBorderSecondary};
      border-radius: ${token.borderRadius}px;
      height: fit-content;
    }
  `,
  drawerWrapper: css`
    display: block;
    padding: ${token.paddingMD}px;
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
