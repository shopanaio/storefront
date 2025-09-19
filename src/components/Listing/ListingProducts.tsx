"use client";

import { usePaginationFragment } from "react-relay";
import { Listing$key } from "src/relay/queries/__generated__/Listing.graphql";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { ApiFilterInput, ListingSort } from "codegen/schema-client";
import InfiniteScroll from "react-infinite-scroller";
import { ProductsGrid } from "./ProductsGrid ";
import { Spin } from "antd";
import { createStyles } from "antd-style";
import React from "react";
import useCategoryRefetch from "@src/hooks/category/useCategoryRefetch";

interface ListingProductsProps {
  category: Listing$key | null;
  sort: ListingSort;
  filters: ApiFilterInput[];
}

export const ListingProducts: React.FC<ListingProductsProps> = ({
  category,
  sort,
  filters,
}) => {
  const { styles } = useStyles();

  const { data, loadNext, hasNext, isLoadingNext, refetch } =
    usePaginationFragment(Listing, category);

  // Use hook for category refetch when filters or sort change
  useCategoryRefetch(sort, filters, refetch);

  if (!data?.listing) {
    return (
      <div className={styles.spinnerContainer}>
        <Spin />
      </div>
    );
  }

  const products = data.listing.edges?.map((edge) => edge.node) ?? [];

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(25);
    }
  };

  return (
    <InfiniteScroll
      className={styles.scroll}
      pageStart={0}
      loadMore={handleLoadMore}
      hasMore={hasNext}
      useWindow={true}
      threshold={50}
      loader={
        <div className={styles.spinnerContainer} key={0}>
          <Spin />
        </div>
      }
    >
      <ProductsGrid products={products} />
    </InfiniteScroll>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    scroll: css`
      width: 100%;
    `,
    spinnerContainer: css`
      display: flex;
      justify-content: center;
      padding: ${token.paddingLG}px 0;
    `,
  };
});
