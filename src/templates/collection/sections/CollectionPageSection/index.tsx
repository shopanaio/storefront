'use client';

import { useState, useMemo } from 'react';
import { Flex, Spin, Typography } from 'antd';
import { usePaginationFragment } from 'react-relay';
import { useCollectionData } from '@shopana/storefront-sdk/modules/collection/react/hooks/useCollectionData';
import { CollectionListingFragment$key } from '@shopana/storefront-sdk/modules/collection/core/types';
import CollectionListingFragmentNode from '@shopana/storefront-sdk/modules/collection/core/graphql/fragments/__generated__/CollectionListingFragment.graphql';
import { ListingSort, ApiFilterInput, ApiFilter } from '@codegen/schema-client';
import { ListingTitleAndBtn } from '@src/templates/collection/blocks/ListingTitleAndBtn';
import { ListingPagination } from '@src/templates/collection/atoms/ListingPagination';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { useFiltersStore } from '@src/store/appStore';
import { useRoutes } from '@src/hooks/useRoutes';
import { useTranslations } from 'next-intl';
import { PAGINATION_PAGE_SIZE } from '@src/config';
import { createStyles } from 'antd-style';
import useCategoryRefetch from '@src/hooks/category/useCategoryRefetch';
import { CollectionProductsGrid } from './CollectionProductsGrid';

const { Text } = Typography;

export default function CollectionPageSection() {
  const routes = useRoutes();
  const t = useTranslations('Listing');
  const { styles } = useStyles();
  const [sort, setSort] = useState<ListingSort>(ListingSort.MostRelevant);
  const { selectedFilters } = useFiltersStore();

  const { raw, collection } = useCollectionData();

  // Use pagination fragment on the raw category data
  const { data, loadNext, hasNext, isLoadingNext, refetch } =
    usePaginationFragment<any, CollectionListingFragment$key>(
      CollectionListingFragmentNode,
      raw.category as CollectionListingFragment$key
    );

  // Convert zustand filters to API format
  const apiFilters: ApiFilterInput[] = useMemo(
    () =>
      Object.entries(selectedFilters).map(([handle, filterData]) => ({
        handle,
        values: filterData.values.map(String),
        ...(filterData.inputs &&
          filterData.inputs.length > 0 && {
            inputs: filterData.inputs,
          }),
      })),
    [selectedFilters]
  );

  // Use hook for category refetch when filters or sort change
  useCategoryRefetch(sort, apiFilters, refetch);

  if (!collection) {
    return <Text>Collection loading error</Text>;
  }

  // Get filters from pagination fragment data (data.listing contains filters from GraphQL fragment)
  const filters: ApiFilter[] = (data?.listing?.filters ?? []).map((f: any) => ({
    id: f.id,
    iid: f.iid,
    handle: f.handle,
    title: f.title,
    ...('minPrice' in f && 'maxPrice' in f && {
      minPrice: f.minPrice,
      maxPrice: f.maxPrice,
    }),
    ...('minRate' in f && 'maxRate' in f && {
      minRate: f.minRate,
      maxRate: f.maxRate,
    }),
    ...('values' in f && {
      values: f.values,
    }),
  })) as ApiFilter[];

  // Get products from pagination data
  const products = data?.listing?.edges?.map((edge: any) => edge.node) ?? [];
  const totalCount = data?.listing?.totalCount ?? collection.listing?.totalCount ?? 0;
  const currentCount = products.length;

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(PAGINATION_PAGE_SIZE);
    }
  };

  return (
    <PageLayout
      breadcrumbs={{
        items: [
          { href: routes.home.path(), title: 'Home' },
          { title: collection.title },
        ],
      }}
    >
      <Flex gap={16} vertical className="container">
        <ListingTitleAndBtn
          filters={filters}
          title={collection.title || 'Collection'}
          productsCount={totalCount}
          sort={sort}
          setSort={setSort}
        />
        <div className={styles.container}>
          {products.length === 0 && isLoadingNext ? (
            <div className={styles.spinnerContainer}>
              <Spin />
            </div>
          ) : (
            <CollectionProductsGrid products={products} />
          )}
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
      </Flex>
    </PageLayout>
  );
}

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
