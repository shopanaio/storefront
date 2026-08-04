'use client';

import type { ListingSort } from 'codegen/schema-client';
import InfiniteScroll from 'react-infinite-scroller';
import { ProductsGrid } from '@src/templates/collection/blocks/ProductsGrid';
import { Spin, Alert } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';
import type { StorefrontSearchProductsFragment } from '../../../../../codegen/apollo/storefront-operations';
import { useSearchParams } from 'next/navigation';
import {
  SearchPagination,
  usePaginationQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
import { mapListingSort } from '@src/hooks/category/useCategoryRefetch';

interface ExtendedFilterInput {
  handle: string;
  values: string[];
  inputs?: string[];
}

interface Props {
  searchData: StorefrontSearchProductsFragment;
  sort: ListingSort;
  filters: ExtendedFilterInput[];
}

export const SearchListingProducts: React.FC<Props> = ({ sort, filters }) => {
  const { styles } = useStyles();
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') ?? '';
  const pagination = usePaginationQuery(SearchPagination, {
    query,
    first: 12,
    sort: mapListingSort(sort),
    filters: filters as never,
  });
  const products =
    pagination.data?.searchProducts.edges.map((edge) => edge.node) ?? [];

  if (pagination.error) {
    return (
      <div className={styles.container}>
        <Alert
          message="Loading error"
          description={pagination.error.message}
          type="warning"
          showIcon
        />
        <ProductsGrid products={products} />
      </div>
    );
  }

  return (
    <InfiniteScroll
      className={styles.scroll}
      pageStart={0}
      loadMore={() => void pagination.loadNext(12)}
      hasMore={pagination.hasNext && !pagination.isLoadingNext}
      useWindow
      threshold={250}
      loader={
        <div className={styles.spinnerContainer} key="search-loading">
          <Spin />
        </div>
      }
    >
      <ProductsGrid products={products} />
    </InfiniteScroll>
  );
};

const useStyles = createStyles(({ token, css }) => ({
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
}));
