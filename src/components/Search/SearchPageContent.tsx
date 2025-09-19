import React, { useState, useEffect, useRef } from "react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { ListingFilter } from "@src/components/Listing/Filters/ListingFilter";
import { ListingTitleAndBtn } from "@src/components/Listing/ListingTitleAndBtn";
import { ListingSort } from "@codegen/schema-client";
import { SearchListingProducts } from "./SearchListingProducts";
import { useSearchParams, useRouter } from "next/navigation";
import useSearchProductsFragment from "@src/hooks/search/useSearchProductsFragment";
import useFilters from "@src/hooks/category/useFilters";
import useSearchRefetch from "@src/hooks/search/useSearchRefetch";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

export function SearchPageContent({
  searchTitle,
  searchData,
  onFiltersChange,
  sort: initialSort,
  filters: initialFilters,
  refetch,
}: {
  searchTitle: string;
  searchData: {
    readonly " $fragmentSpreads": any;
  };
  onFiltersChange: (filters: ExtendedFilterInput[]) => void;
  sort: ListingSort;
  filters: ExtendedFilterInput[];
  refetch: (variables: any) => void;
}) {
  const { styles } = useStyles();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = (searchParams?.get("sort") as ListingSort) || initialSort;
  const [sort, setSort] = useState<ListingSort>(currentSort);

  // Use complex structure for selectedFilters, like in listing
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, { values: string[] | [number, number]; inputs?: string[] }>
  >({});

  const [apiFilters, setApiFilters] =
    useState<ExtendedFilterInput[]>(initialFilters);

  // Save original filter values
  const [originalFilters, setOriginalFilters] = useState<any[]>([]);
  const isInitialized = useRef(false);

  // Get filters from searchData - use useSearchProductsFragment to get data
  const searchProductsData = useSearchProductsFragment(searchData);
  const filters = useFilters(searchProductsData?.filters || []);

  // Save original filter values on first load
  useEffect(() => {
    if (filters.length > 0 && !isInitialized.current) {
      setOriginalFilters([...filters]);
      isInitialized.current = true;
    }
  }, [filters]);

  console.log("filters", filters);
  console.log("originalFilters", originalFilters);

  const totalCount = searchProductsData?.totalCount ?? 0;

  console.log("apiFilters in search page content", apiFilters);

  // Use hook for refetch when filters change
  useSearchRefetch(sort, apiFilters, refetch, searchTitle);

  const handleSortChange = (newSort: ListingSort) => {
    setSort(newSort);

    // Update URL with new sort parameter
    const params = new URLSearchParams(searchParams?.toString());
    params.set("sort", newSort);
    router.push(`?${params.toString()}`);

    // DON'T call refetch manually - useSearchRefetch will do it automatically
  };

  const handleFiltersChange = (
    value: React.SetStateAction<
      Record<string, { values: string[] | [number, number]; inputs?: string[] }>
    >
  ) => {
    setSelectedFilters(value);
  };

  console.log("selectedFilters", selectedFilters);

  useEffect(() => {
    const newApiFilters: ExtendedFilterInput[] = Object.entries(
      selectedFilters
    ).map(([handle, filterData]) => ({
      handle,
      values: filterData.values.map(String),
      // Add inputs if they exist
      ...(filterData.inputs &&
        filterData.inputs.length > 0 && {
          inputs: filterData.inputs,
        }),
    }));
    setApiFilters(newApiFilters);
    onFiltersChange(newApiFilters);
  }, [selectedFilters, onFiltersChange]);

  if (!searchData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <ListingTitleAndBtn
        filters={originalFilters.length > 0 ? originalFilters : filters}
        title={searchTitle}
        productsCount={totalCount}
        sort={sort}
        setSort={handleSortChange}
        selectedFilters={selectedFilters}
        setSelectedFilters={handleFiltersChange}
      />

      <Flex className={styles.contentContainer}>
        <ListingFilter
          filters={originalFilters.length > 0 ? originalFilters : filters}
          mode="sidebar"
          selectedFilters={selectedFilters}
          setSelectedFilters={handleFiltersChange}
        />
        <SearchListingProducts
          searchData={searchData}
          sort={sort}
          filters={apiFilters}
        />
      </Flex>
    </div>
  );
}

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      gap: ${token.margin}px;
      width: 100%;

      ${mq.lg} {
        padding-right: ${token.padding}px;
        padding-left: ${token.padding}px;
      }

      ${mq.xl} {
        padding: 0;
        margin-right: auto;
        margin-left: auto;

        max-width: 1280px;
      }

      ${mq.xxl} {
        max-width: 1400px;
      }
    `,
    contentContainer: css`
      ${mq.lg} {
        gap: ${token.margin}px;
      }
    `,
  };
});
