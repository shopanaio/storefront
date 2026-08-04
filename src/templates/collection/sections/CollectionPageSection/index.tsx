'use client';
import { useState, useMemo } from 'react';
import { Flex, Spin, Typography } from 'antd';
import {
  CollectionPagination,
  usePaginationQuery,
} from '@shopana/storefront-sdk/graphql/apollo';
import { useCollectionData } from '@shopana/storefront-sdk/modules/collection/react/hooks/useCollectionData';
import { ListingSort, ApiFilter } from '@codegen/schema-client';
import type { ListingFilterInput } from '../../../../../codegen/apollo/storefront-operations';
import { ListingTitleAndBtn } from '@src/templates/collection/blocks/ListingTitleAndBtn';
import { ListingPagination } from '@src/templates/collection/atoms/ListingPagination';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { useFiltersStore } from '@src/store/appStore';
import { useRoutes } from '@src/hooks/useRoutes';
import { useTranslations } from 'next-intl';
import { PAGINATION_PAGE_SIZE } from '@src/config';
import { createStyles } from 'antd-style';
import useCategoryRefetch, {
  mapListingSort,
} from '@src/hooks/category/useCategoryRefetch';
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
  const {
    data: queryData,
    loadNext,
    hasNext,
    isLoadingNext,
    refetch,
  } = usePaginationQuery(CollectionPagination, {
    handle: raw.category?.handle ?? collection?.handle ?? '',
    first: PAGINATION_PAGE_SIZE,
    sort: mapListingSort(sort),
    filters: [],
  });
  const data = queryData?.category;
  // Convert zustand filters to API format
  const apiFilters: ListingFilterInput[] = useMemo(
    () =>
      Object.values(selectedFilters).flatMap((filterData) => {
        const values = filterData.values;
        if (
          values.length === 2 &&
          typeof values[0] === 'number' &&
          typeof values[1] === 'number'
        ) {
          return [{ price: { min: values[0], max: values[1] } }];
        }
        return (filterData.inputs ?? []).filter(
          (input): input is ListingFilterInput =>
            input !== null && typeof input === 'object'
        );
      }),
    [selectedFilters]
  );
  // Use hook for category refetch when filters or sort change
  useCategoryRefetch(sort, apiFilters, refetch);
  if (!collection) {
    return <Text>Collection loading error</Text>;
  }
  // Get filters from pagination fragment data (data.listing contains filters from GraphQL fragment)
  const filters: ApiFilter[] = (data?.listing?.filters ?? []).map(
    (filter) => {
      const base = {
        id: filter.id,
        iid: filter.id,
        handle: filter.handle,
        title: filter.title,
      };
      if (filter.type === 'PRICE_RANGE' && filter.priceRange) {
        return {
          ...base,
          minPrice: {
            amount: Number(filter.priceRange.min.amount),
            currencyCode: filter.priceRange.min.currencyCode,
          },
          maxPrice: {
            amount: Number(filter.priceRange.max.amount),
            currencyCode: filter.priceRange.max.currencyCode,
          },
        };
      }
      return {
        ...base,
        values: filter.values.map((value) => ({
          id: value.id,
          iid: value.id,
          handle: value.handle,
          title: value.title,
          count: value.count,
          input: value.input,
        })),
      };
    }
  ) as ApiFilter[];
  // Get products from pagination data
  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];
  const totalCount =
    data?.listing?.totalCount ?? collection.listing?.totalCount ?? 0;
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
