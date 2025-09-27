"use client";

import React from "react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { FilterDrawer } from "./Filters/FilterDrawer";
import { ListingSortMenu } from "./ListingSortMenu";
import { ApiFilter, ListingSort } from "@codegen/schema-client";
import { SortOption } from "../Product/Rate/SortPopover";

interface ListingMobileControlsProps {
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
  sortOptions: SortOption<ListingSort>[];
  sort: ListingSort;
  onSortChange: (sort: ListingSort) => void;
}

export const ListingMobileControls: React.FC<ListingMobileControlsProps> = ({
  filters,
  selectedFilters,
  setSelectedFilters,
  sortOptions,
  sort,
  onSortChange,
}) => {
  const { styles } = useStyles();

  return (
    <Flex gap={16} className={styles.actions}>
      <FilterDrawer
        filters={filters}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
      <ListingSortMenu
        options={sortOptions}
        value={sort}
        onChange={onSortChange}
      />
    </Flex>
  );
};

const useStyles = createStyles(({ css }) => ({
  actions: css`
    min-width: 200px;
  `,
}));
