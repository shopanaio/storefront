'use client';

import React from 'react';
import { Flex, Typography, Button } from 'antd';
import { createStyles } from 'antd-style';
import { FilterDrawer } from '@src/templates/collection/blocks/FilterDrawer';
import { SortPopover, SortOption } from '@src/templates/product/blocks/Rate/SortPopover';
import { TbArrowsUpDown } from 'react-icons/tb';
import { ApiFilter, ListingSort } from '@codegen/schema-client';
import { useTranslations } from 'next-intl';

interface ListingDesktopControlsProps {
  productsCount: number;
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

export const ListingDesktopControls: React.FC<ListingDesktopControlsProps> = ({
  productsCount,
  filters,
  sortOptions,
  sort,
  onSortChange,
}) => {
  const { styles } = useStyles();
  const t = useTranslations('Sort');
  const tListing = useTranslations('Listing');

  return (
    <Flex className={styles.desktopFiltersBar} align="center">
      <Typography.Text className={styles.productsCount}>
        {tListing('found-products', { count: productsCount })}
      </Typography.Text>
      <Flex flex={1} justify="flex-end" gap={16} align="center">
        <FilterDrawer filters={filters} />
        <SortPopover
          options={sortOptions}
          value={sort}
          onChange={onSortChange}
          buttonClassName={styles.drawerBtn}
          title={t('sort-by')}
          icon={<TbArrowsUpDown />}
        />
      </Flex>
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => ({
  desktopFiltersBar: css`
    background: ${token.colorBgContainer};
    border-radius: ${token.borderRadius}px;
    gap: ${token.margin}px;
  `,
  productsCount: css`
    white-space: nowrap;
    color: ${token.colorTextSecondary};
    font-size: ${token.fontSize}px;
    min-width: max-content;
  `,
  drawerBtn: css`
    display: flex;
    justify-content: start;
    width: max-content;
    border-radius: ${token.borderRadius}px;
    border-color: ${token.colorBorder};
  `,
}));
