"use client";

import { ListingSort } from "codegen/schema-client";
import InfiniteScroll from "react-infinite-scroller";
import { ProductsGrid } from "../Listing/ProductsGrid ";
import { Spin, Alert } from "antd";
import { createStyles } from "antd-style";
import React, { useState, useEffect, useCallback } from "react";
import {
  SearchProductsFragment$key,
  SearchProductsFragment$data,
} from "@src/relay/queries/__generated__/SearchProductsFragment.graphql";
import { useSearchParams } from "next/navigation";
import { useSearchPagination } from "@src/hooks/useSearchPagination";
import useSearchProductsFragment from "@src/hooks/search/useSearchProductsFragment";

// Extend filter type to support inputs
interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

type ProductNode = SearchProductsFragment$data["edges"][0]["node"];

interface Props {
  searchData: SearchProductsFragment$key;
  sort: ListingSort;
  filters: ExtendedFilterInput[];
}

export const SearchListingProducts: React.FC<Props> = ({
  searchData,
  sort,
  filters,
}) => {
  const { styles } = useStyles();
  const searchParams = useSearchParams();
  const query = searchParams?.get("q") || "";

  const [allProducts, setAllProducts] = useState<ProductNode[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get data from fragment
  const fragmentData = useSearchProductsFragment(searchData);

  // Use hook for loading additional data
  const {
    products: paginatedProducts,
    loading,
    error: paginationError,
  } = useSearchPagination({
    query,
    after: endCursor,
    sort,
    filters,
  });

  // Reset state only when search query changes
  useEffect(() => {
    setAllProducts([]);
    setHasNext(false);
    setEndCursor(null);
    setError(null);
  }, [query]); // Removed sort and filters from dependencies

  // Initialize data on first render
  useEffect(() => {
    if (fragmentData && allProducts.length === 0) {
      const initialProducts =
        fragmentData.edges?.map(
          (edge: SearchProductsFragment$data["edges"][0]) => edge.node
        ) ?? [];
      setAllProducts(initialProducts);
      setHasNext(fragmentData.pageInfo?.hasNextPage ?? false);
      setEndCursor(fragmentData.pageInfo?.endCursor ?? null);
    }
  }, [fragmentData, allProducts.length]);

  // Process loaded additional data
  useEffect(() => {
    if (paginatedProducts && endCursor) {
      const newProducts =
        paginatedProducts.edges?.map(
          (edge: SearchProductsFragment$data["edges"][0]) => edge.node
        ) ?? [];
      setAllProducts((prev) => [...prev, ...newProducts]);
      setHasNext(paginatedProducts.pageInfo?.hasNextPage ?? false);
      setEndCursor(paginatedProducts.pageInfo?.endCursor ?? null);
      setIsLoading(false);
    }
  }, [paginatedProducts, endCursor]);

  // Process pagination errors
  useEffect(() => {
    if (paginationError) {
      setError("Failed to load additional products");
      setIsLoading(false);
    }
  }, [paginationError]);

  // Process filter and sort changes - update data without resetting state
  useEffect(() => {
    if (fragmentData) {
      const updatedProducts =
        fragmentData.edges?.map(
          (edge: SearchProductsFragment$data["edges"][0]) => edge.node
        ) ?? [];

      // Update state only if data actually changed
      if (JSON.stringify(updatedProducts) !== JSON.stringify(allProducts)) {
        setAllProducts(updatedProducts);
        setHasNext(fragmentData.pageInfo?.hasNextPage ?? false);
        setEndCursor(fragmentData.pageInfo?.endCursor ?? null);
      }
    }
  }, [fragmentData, sort, filters]); // Added sort and filters to dependencies

  const handleLoadMore = useCallback(() => {
    if (!hasNext || isLoading || !endCursor) return;

    setIsLoading(true);
    setError(null);
  }, [hasNext, isLoading, endCursor]);

  if (!fragmentData) {
    return (
      <div className={styles.spinnerContainer}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Alert
          message="Loading error"
          description={error}
          type="warning"
          showIcon
          closable
          onClose={() => setError(null)}
        />

        <ProductsGrid products={allProducts} />
      </div>
    );
  }

  return (
    <InfiniteScroll
      className={styles.scroll}
      pageStart={0}
      loadMore={handleLoadMore}
      hasMore={hasNext && !isLoading}
      useWindow={true}
      threshold={250}
      loader={
        <div className={styles.spinnerContainer} key={0}>
          <Spin />
        </div>
      }
    >
      <ProductsGrid products={allProducts} />
    </InfiniteScroll>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      gap: ${token.margin}px;
    `,
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
