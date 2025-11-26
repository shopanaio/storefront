import React, { useState, useEffect, useRef, useMemo } from "react";
import { Flex } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/ui-kit/Theme/breakpoints";
import { ListingFilter } from "@src/templates/collection/blocks/ListingFilter";
import { ListingTitleAndBtn } from "@src/templates/collection/blocks/ListingTitleAndBtn";
import { ListingSort } from "@codegen/schema-client";
import { SearchListingProducts } from "../SearchListingProducts";
import { useSearchParams, useRouter } from "next/navigation";
import useSearchProductsFragment from "@src/hooks/search/useSearchProductsFragment";
import useFilters from "@src/hooks/category/useFilters";
import useSearchRefetch from "@src/hooks/search/useSearchRefetch";
import { useTranslations } from "next-intl";
import { useFiltersStore } from "@src/store/appStore";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

export function SearchPageContent({
  searchTitle,
  searchData,
  refetch,
}: {
  searchTitle: string;
  searchData: {
    readonly " $fragmentSpreads": any;
  };
  refetch: (variables: any) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Header");
  const { selectedFilters } = useFiltersStore();

  const currentSort = (searchParams?.get("sort") as ListingSort) || ListingSort.MostRelevant;
  const [sort, setSort] = useState<ListingSort>(currentSort);

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

  // Convert zustand filters to API format
  const apiFilters: ExtendedFilterInput[] = useMemo(() =>
    Object.entries(selectedFilters).map(
      ([handle, filterData]) => ({
        handle,
        values: filterData.values.map(String),
        ...(filterData.inputs &&
          filterData.inputs.length > 0 && {
            inputs: filterData.inputs,
          }),
      })
    ), [selectedFilters]
  );

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

  console.log("selectedFilters", selectedFilters);
  console.log("apiFilters", apiFilters);


  if (!searchData) {
    return null;
  }

  // Create localized title
  const localizedTitle = searchTitle.trim()
    ? t("search-results-with-term", { searchTerm: searchTitle })
    : t("search-result");

  return (
    <Flex gap={16} vertical className="container">
      <ListingTitleAndBtn
        filters={originalFilters.length > 0 ? originalFilters : filters}
        title={localizedTitle}
        productsCount={totalCount}
        sort={sort}
        setSort={handleSortChange}
      />
      <SearchListingProducts
        searchData={searchData}
        sort={sort}
        filters={apiFilters}
      />
    </Flex>
  );
}
