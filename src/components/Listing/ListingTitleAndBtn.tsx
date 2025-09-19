"use client";

import { Badge, Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { FilterDrawer } from "./Filters/FilterDrawer";
import { mq } from "@src/components/Theme/breakpoints";
import { ApiFilter, ListingSort } from "@codegen/schema-client";
import { SortPopover, SortOption } from "../Product/Rate/SortPopover";
import { useTranslations } from "next-intl";
import { useIsDesktop } from "@src/hooks/useIsDesktop";
import { ListingSortMenu } from "./ListingSortMenu";
import { TbArrowsUpDown } from "react-icons/tb";

interface Props {
  title: string;
  filters: ApiFilter[];
  productsCount: number | undefined;
  sort: ListingSort;
  setSort: (sort: ListingSort) => void;
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

export const ListingTitleAndBtn = ({
  title,
  productsCount,
  filters,
  sort,
  setSort,
  selectedFilters,
  setSelectedFilters,
}: Props) => {
  const { styles, theme } = useStyles();
  const t = useTranslations("Sort");
  const isDesktop = useIsDesktop();

  const handleSortChange = (value: ListingSort) => {
    setSort(value);
  };

  const sortOptions: SortOption<ListingSort>[] = [
    { value: ListingSort.CreatedAtAsc, label: t("newest-first") },
    { value: ListingSort.CreatedAtDesc, label: t("oldest-first") },
    { value: ListingSort.PriceAsc, label: t("price-ascending") },
    { value: ListingSort.PriceDesc, label: t("price-descending") },
    { value: ListingSort.TitleAsc, label: t("title-ascending") },
    { value: ListingSort.TitleDesc, label: t("title-descending") },
    { value: ListingSort.MostRelevant, label: t("recommended") },
  ];

  return (
    <Flex className={styles.titleSection}>
      <Flex className={styles.titleWrapper}>
        <Typography.Text className={styles.pageTitle}>{title}</Typography.Text>
        {productsCount && (
          <Badge
            count={productsCount}
            color={theme.colorPrimary}
            offset={[5, 5]}
          />
        )}
      </Flex>

      {!isDesktop && (
        <Flex gap={16} className={styles.actions}>
          <FilterDrawer
            filters={filters}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
          />
          <ListingSortMenu
            options={sortOptions}
            value={sort}
            onChange={handleSortChange}
          />
        </Flex>
      )}
      {isDesktop && (
        <SortPopover
          options={sortOptions}
          value={sort}
          onChange={handleSortChange}
          buttonClassName={styles.drawerBtn}
          title={t("sort-by")}
          icon={<TbArrowsUpDown />}
        />
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    titleSection: css`
      justify-content: space-between;
      gap: ${token.margin}px;
      ${mq.max.lg} {
        flex-direction: column;
      }
      ${mq.lg} {
        padding: 0;
      }
    `,
    titleWrapper: css`
      width: max-content;
    `,
    pageTitle: css`
      font-size: ${token.fontSizeHeading3}px;
    `,
    sortBtn: css`
      padding: 0;
      font-size: ${token.fontSize}px;
      font-weight: 500;
      color: ${token.colorTextSecondary};

      &:hover {
        color: ${token.colorPrimary};
      }
    `,
    actions: css`
      min-width: 200px;
    `,
    drawerBtn: css`
      display: flex;
      justify-content: start;
      width: max-content;
      border-radius: ${token.borderRadius}px;
      border-color: ${token.colorBorder};
    `,
  };
});
