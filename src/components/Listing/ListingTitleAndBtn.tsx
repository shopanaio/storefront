"use client";

import { Flex, Button } from "antd";
import { createStyles } from "antd-style";
import { FilterTags } from "./Filters/FilterTags";
import { ListingHeader } from "./ListingHeader";
import { ListingControls } from "./ListingControls";
import { ApiFilter, ListingSort } from "@codegen/schema-client";
import { SortOption } from "../Product/Rate/SortPopover";
import { useTranslations } from "next-intl";
import { useFilterActions } from "@src/hooks/useFilterActions";
import { useActiveFiltersCount } from "@src/hooks/useActiveFiltersCount";
import { RxCross2 } from "react-icons/rx";

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
  const { styles } = useStyles();
  const t = useTranslations("Sort");
  const tListing = useTranslations("Listing");

  const handleSortChange = (value: ListingSort) => {
    setSort(value);
  };

  const { handleCloseTag, handleResetAll } = useFilterActions({
    filters,
    selectedFilters,
    setSelectedFilters,
  });

  const { hasActiveFilters } = useActiveFiltersCount({ selectedFilters });

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
    <Flex vertical gap={12}>
      <Flex className={styles.titleSection}>
        <ListingHeader title={title} />
      </Flex>
      <ListingControls
        filters={filters}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        sortOptions={sortOptions}
        sort={sort}
        onSortChange={handleSortChange}
        productsCount={productsCount || 0}
      />

      {hasActiveFilters && (
        <div>
          <FilterTags
            filters={filters}
            selectedFilters={selectedFilters}
            onCloseTag={handleCloseTag}
            wrap
            resetButton={
              <Button
                color="primary"
                variant="outlined"
                onClick={handleResetAll}
                icon={<RxCross2 />}
              >
                {tListing("reset-all")}
              </Button>
            }
          />
        </div>
      )}
    </Flex>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    titleSection: css`
      flex-direction: column;
      justify-content: space-between;
    `,
  };
});
