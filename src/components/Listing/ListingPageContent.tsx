import React, { useState, useEffect } from "react";
import { Flex, Typography } from "antd";
import { ListingTitleAndBtn } from "@src/components/Listing/ListingTitleAndBtn";
import { ListingSort, ApiFilterInput, ApiFilter } from "@codegen/schema-client";
import { ListingProducts } from "@src/components/Listing/ListingProducts";
import { useFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import useFilters from "@src/hooks/category/useFilters";

const { Text } = Typography;

export function ListingPageContent({ category }: { category: Listing$key }) {
  const [sort, setSort] = useState<ListingSort>(ListingSort.MostRelevant);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, { values: string[] | [number, number]; inputs?: string[] }>
  >({});
  const [apiFilters, setApiFilters] = useState<ApiFilterInput[]>([]);

  // Save original filter values so they don't change after refetch
  const [originalFilters, setOriginalFilters] = useState<ApiFilter[]>([]);

  const listingData = useFragment<Listing$key>(Listing, category);

  console.log("listingData filters", listingData?.listing?.filters);

  // Use hook for filter normalization
  const normalizedFilters = useFilters(listingData?.listing?.filters || []);

  // Save original filter values on first load
  useEffect(() => {
    if (normalizedFilters.length > 0 && originalFilters.length === 0) {
      setOriginalFilters(normalizedFilters);
    }
  }, [normalizedFilters, originalFilters]);

  // For Shopify totalCount doesn't exist, use edges count
  const totalCount =
    listingData?.listing?.totalCount ||
    listingData?.listing?.edges?.length ||
    0;

  useEffect(() => {
    const newApiFilters: ApiFilterInput[] = Object.entries(selectedFilters).map(
      ([handle, filterData]) => ({
        handle,
        values: filterData.values.map(String),
        ...(filterData.inputs &&
          filterData.inputs.length > 0 && {
            inputs: filterData.inputs,
          }),
      })
    );
    setApiFilters(newApiFilters);
  }, [selectedFilters]);

  if (!listingData) {
    return <Text>Category loading error</Text>;
  }

  return (
    <Flex gap={16} vertical className="container">
      <ListingTitleAndBtn
        filters={normalizedFilters}
        title={listingData.title || "Category"}
        productsCount={totalCount}
        sort={sort}
        setSort={setSort}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />
      <ListingProducts category={category} sort={sort} filters={apiFilters} />
    </Flex>
  );
}
