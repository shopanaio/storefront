"use client";

import React from "react";
import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { FilterDrawer } from "./Filters/FilterDrawer";
import { ListingSortMenu } from "./ListingSortMenu";
import { SortOption } from "../Product/Rate/SortPopover";
import { ApiFilter, ListingSort } from "@codegen/schema-client";
import { useTranslations } from "next-intl";
import { mq } from "@src/components/Theme/breakpoints";

interface ListingControlsProps {
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
  productsCount?: number;
}

export const ListingControls: React.FC<ListingControlsProps> = ({
  filters,
  selectedFilters,
  setSelectedFilters,
  sortOptions,
  sort,
  onSortChange,
  productsCount,
}) => {
  const { styles } = useStyles();
  const tListing = useTranslations("Listing");

  return (
    <Flex className={styles.container} align="center">
      {/* Products count - только на десктопе */}
      {productsCount !== undefined && (
        <Typography.Text className={styles.productsCount}>
          {tListing("found-products", { count: productsCount })}
        </Typography.Text>
      )}

      {/* Controls container */}
      <Flex className={styles.controls} gap={16} align="center">
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
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    flex-direction: column;
    gap: ${token.margin}px;
    min-width: 200px;

    ${mq.lg} {
      flex-direction: row;
      background: ${token.colorBgContainer};
      border-radius: ${token.borderRadius}px;
      gap: ${token.marginXS}px;
    }
  `,
  productsCount: css`
    display: none;
    white-space: nowrap;
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSize}px;
    min-width: max-content;

    ${mq.lg} {
      display: block;
    }
  `,
  controls: css`
    width: 100%;
    justify-content: center;

    ${mq.lg} {
      flex: 1;
      justify-content: flex-end;
      width: auto;
    }
  `,
}));
