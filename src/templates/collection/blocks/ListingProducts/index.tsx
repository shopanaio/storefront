'use client';

import type { ListingData } from '@shopana/storefront-sdk/queries/Listing';
import {
  CategoryPagination,
  usePaginationQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
import { ApiFilterInput, ListingSort } from 'codegen/schema-client';
import { ProductsGrid } from '@src/templates/collection/blocks/ProductsGrid';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import React from 'react';
import useCategoryRefetch from '@src/hooks/category/useCategoryRefetch';
import { PAGINATION_PAGE_SIZE } from '@src/config';
import { ListingPagination } from '@src/templates/collection/atoms/ListingPagination';

interface ListingProductsProps {
  category: ListingData | null;
  sort: ListingSort;
  filters: ApiFilterInput[];
}
export const ListingProducts: React.FC<ListingProductsProps> = ({
  category,
  sort,
  filters,
}) => {
  const { styles } = useStyles();
  const t = useTranslations('Listing');

  const {
    data: queryData,
    loadNext,
    hasNext,
    isLoadingNext,
    refetch,
  } = usePaginationQuery(CategoryPagination, {
    handle: category?.handle ?? '',
    first: PAGINATION_PAGE_SIZE,
    sort,
    filters,
  });
  const data = queryData?.category;

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
  return (
    <div className={styles.container}>
      <ProductsGrid products={products} />
      <ListingPagination
        currentCount={currentCount}
        totalCount={totalCount}
        hasNext={hasNext}
        isLoadingNext={isLoadingNext}
        onLoadMore={handleLoadMore}
        summaryLabel={t('showing-of-total', {
          current: currentCount,
          total: totalCount,
        })}
        loadMoreLabel={t('load-more')}
      />
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
    spinnerContainer: css`
      display: flex;
      justify-content: center;
      padding: ${token.paddingLG}px 0;
    `,
  };
});
