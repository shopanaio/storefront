'use client';

import { useState, useMemo, useCallback } from 'react';
import { Flex, Spin } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroller';
import { useSearchData } from '@shopana/storefront-sdk/modules/search/react/hooks/useSearchData';
import { ListingSort, ApiFilter, ApiFilterInput } from '@codegen/schema-client';
import { ListingTitleAndBtn } from '@src/templates/collection/blocks/ListingTitleAndBtn';
import { PageLayout } from '@src/layouts/theme/PageLayout';
import { ProductsGrid } from '@src/templates/collection/blocks/ProductsGrid';
import { useFiltersStore } from '@src/store/appStore';

export default function SearchPageSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('Header');
  const { styles } = useStyles();
  const { selectedFilters } = useFiltersStore();

  const currentSort = (searchParams?.get('sort') as ListingSort) || ListingSort.MostRelevant;
  const [sort, setSort] = useState<ListingSort>(currentSort);

  // Get search data from SDK context
  const searchData = useSearchData();
  const query = searchData.query;
  const results = searchData.results;

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

  // Get filters from results
  const filters: ApiFilter[] = useMemo(() => {
    if (!results?.filters) return [];
    return results.filters.map((f) => ({
      id: f.id,
      iid: f.iid,
      handle: f.handle,
      title: f.title,
      ...(f.type === 'price_range' && {
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
      }),
      ...(f.type === 'rating_range' && {
        minRate: f.minRate,
        maxRate: f.maxRate,
      }),
      ...(f.type === 'list' && {
        values: f.values,
      }),
    })) as ApiFilter[];
  }, [results?.filters]);

  const products = results?.products ?? [];
  const totalCount = results?.totalCount ?? 0;

  const handleSortChange = useCallback((newSort: ListingSort) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams?.toString());
    params.set('sort', newSort);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // Create localized title
  const localizedTitle = query?.trim()
    ? t('search-results-with-term', { searchTerm: query })
    : t('search-result');

  if (!results) {
    return (
      <PageLayout>
        <div className={styles.spinnerContainer}>
          <Spin />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Flex gap={16} vertical className="container">
        <ListingTitleAndBtn
          filters={filters}
          title={localizedTitle}
          productsCount={totalCount}
          sort={sort}
          setSort={handleSortChange}
        />
        <div className={styles.container}>
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              {t('no-results')}
            </div>
          ) : (
            <ProductsGrid products={products} />
          )}
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
    emptyState: css`
      display: flex;
      justify-content: center;
      padding: ${token.paddingXL}px 0;
      color: ${token.colorTextSecondary};
    `,
  };
});
