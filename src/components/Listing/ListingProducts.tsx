"use client";

import { usePaginationFragment } from "react-relay";
import { Listing$key } from "src/relay/queries/__generated__/Listing.graphql";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { ApiFilterInput, ListingSort } from "codegen/schema-client";
import { ProductsGrid } from "./ProductsGrid ";
import { Spin, Button, Progress, Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import React from "react";
import useCategoryRefetch from "@src/hooks/category/useCategoryRefetch";
import { PAGINATION_PAGE_SIZE } from "@src/config";

interface ListingProductsProps {
  category: Listing$key | null;
  sort: ListingSort;
  filters: ApiFilterInput[];
}

const { Text } = Typography;

export const ListingProducts: React.FC<ListingProductsProps> = ({
  category,
  sort,
  filters,
}) => {
  const { styles } = useStyles();
  const t = useTranslations("Listing");

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

  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(PAGINATION_PAGE_SIZE);
    }
  };

  // Calculate progress data
  const currentCount = products.length;
  const totalCount = data.listing.totalCount;
  const progressPercent =
    totalCount > 0 ? (currentCount / totalCount) * 100 : 0;

  return (
    <div className={styles.container}>
      <ProductsGrid products={products} />
      <div className={styles.progressContainer}>
        <Text>
          {t("showing-of-total", {
            current: currentCount,
            total: totalCount,
          })}
        </Text>
        <Progress
          percent={progressPercent}
          showInfo={false}
          className={styles.progressBar}
          strokeWidth={6}
        />
        {hasNext && (
          <div className={styles.loadMoreContainer}>
            <Button
              type="primary"
              size="large"
              loading={isLoadingNext}
              onClick={handleLoadMore}
              className={styles.loadMoreButton}
            >
              {t("load-more")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${token.marginLG}px;
    `,
    progressContainer: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 400px;
      width: 100%;
      flex-grow: 1;
    `,
    progressBar: css`
      & .ant-progress-outer {
        padding: 0 !important;
      }
    `,
    loadMoreContainer: css`
      display: flex;
      justify-content: center;
      padding: ${token.padding}px 0;
    `,
    loadMoreButton: css`
      min-width: 200px;
    `,
    spinnerContainer: css`
      display: flex;
      justify-content: center;
      padding: ${token.paddingLG}px 0;
    `,
  };
});
