import React, { useState, useEffect } from "react";
import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { ListingFilter } from "@src/components/Listing/Filters/ListingFilter";
import { ListingTitleAndBtn } from "@src/components/Listing/ListingTitleAndBtn";
import { ListingSort, ApiFilterInput } from "@codegen/schema-client";
import { ListingProducts } from "@src/components/Listing/ListingProducts";
import { useFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import useFilters from "@src/hooks/category/useFilters";

const { Text } = Typography;

export function ListingPageContent({ category }: { category: Listing$key }) {
  const { styles } = useStyles();
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
        // Add inputs if they exist
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

  /* console.log("listingData", listingData);
  console.log("normalizedFilters", normalizedFilters); */

  return (
    <div className={styles.container}>
      <ListingTitleAndBtn
        filters={normalizedFilters}
        title={listingData.title || "Category"}
        productsCount={totalCount}
        sort={sort}
        setSort={setSort}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
      />

      <Flex className={styles.contentContainer}>
        <ListingFilter
          filters={
            originalFilters.length > 0 ? originalFilters : normalizedFilters
          }
          mode="sidebar"
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
        />
        <ListingProducts category={category} sort={sort} filters={apiFilters} />
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
