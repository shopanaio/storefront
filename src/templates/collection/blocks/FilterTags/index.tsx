"use client";

import React from "react";
import { Flex, Button } from "antd";
import { createStyles } from "antd-style";
import { RxCross2 } from "react-icons/rx";
import { ApiFilter } from "@codegen/schema-client";
import type { ApiListFilter, ApiListFilterValue } from "@codegen/schema-client";

interface FilterTagsProps {
  filters: ApiFilter[];
  selectedFilters: Record<
    string,
    { values: string[] | [number, number]; inputs?: string[] }
  >;
  onCloseTag: (handle: string, value?: string) => void;
  gap?: number;
  wrap?: boolean;
  className?: string;
  resetButton?: React.ReactNode;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  filters,
  selectedFilters,
  onCloseTag,
  gap = 8,
  wrap = true,
  className,
  resetButton,
}) => {
  const { styles } = useStyles();

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
          <Button
            key={handle + min + max}
            type="primary"
            variant="outlined"
            size="middle"
            className={styles.filterButton}
            onClick={(e) => {
              e.preventDefault();
              onCloseTag(handle);
            }}
          >
            {`${formatter.format(min)} - ${formatter.format(max)}`}
            <RxCross2 className={styles.closeIcon} />
          </Button>
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
            <Button
              key={handle + value}
              type="primary"
              variant="outlined"
              size="middle"
              className={styles.filterButton}
              style={{ opacity: isInactive ? 0.5 : 1 }}
              onClick={(e) => {
                e.preventDefault();
                onCloseTag(handle, value);
              }}
            >
              {display}
              <RxCross2 className={styles.closeIcon} />
            </Button>
          );
        });
      }
    });
    return tags;
  };

  const tags = renderTags();

  if (tags.length === 0) {
    return null;
  }

  return (
    <Flex wrap={wrap} gap={gap} className={className} align="center">
      {tags}
      {resetButton}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  filterButton: css`
    display: flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    padding: 4px 12px;
  `,
  closeIcon: css`
    flex-shrink: 0;
    margin-left: auto;
  `,
}));
