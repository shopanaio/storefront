'use client';

import { Flex, Button, Progress, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslations } from 'next-intl';
import { ActivityComponentType } from '@stackflow/react';
import Layout from '@src/modules/box-builder/components/Layout';
import BoxBuilderGrid from '@src/modules/box-builder/components/BoxBuilderGrid';
import { StepHeader } from '@src/modules/box-builder/components/StepHeader';
import { Activity, useFlow } from '../Stack';
import { usePaginationFragment } from 'react-relay';
import { Listing } from '@src/relay/queries/Listing.shopana';
import { useCategory } from '@src/modules/box-builder/hooks/useCategory';
import React, { Suspense } from 'react';
import { PAGINATION_PAGE_SIZE } from '@src/config';
import { BoxBuilderCategorySectionSkeleton } from '../skeletons/CategorySectionSkeleton';
import type { Listing$key } from '@src/relay/queries/__generated__/Listing.graphql';
import { ProductType } from '@src/modules/box-builder/components/ProductCard';
import ProductsOnlyFooterButton from '@src/modules/box-builder/components/ProductsOnlyFooterButton';
import { ProductCardRelay } from '@src/modules/box-builder/components/ProductCardRelay';
import type { useListingProductCardFragment_product$key } from '@src/components/Listing/relay/__generated__/useListingProductCardFragment_product.graphql';
import useToken from 'antd/es/theme/useToken';

const { Text } = Typography;

const CategoryProducts: React.FC<{ categoryHandle: string }> = ({
  categoryHandle,
}) => {
  const { styles } = useStyles();
  const [, token] = useToken();
  const t = useTranslations('BoxBuilder');
  const tListing = useTranslations('Listing');
  const { category } = useCategory(categoryHandle);
  const categoryKey = category as unknown as Listing$key;
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    Listing,
    categoryKey
  );

  const products: useListingProductCardFragment_product$key[] =
    (
      data as unknown as {
        listing?: {
          edges?: { node: useListingProductCardFragment_product$key }[];
        };
      }
    )?.listing?.edges?.map((edge) => edge.node) ?? [];

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(PAGINATION_PAGE_SIZE);
    }
  };

  const currentCount = products.length;
  const totalCount = data?.listing?.totalCount ?? 0;
  const progressPercent =
    totalCount > 0 ? (currentCount / totalCount) * 100 : 0;

  return (
    <Flex vertical className={styles.container} gap={16}>
      <StepHeader
        subtitle={t('step2.subtitle')}
        title={category?.title ?? ''}
      />
      <BoxBuilderGrid>
        {products?.map((product, idx) => (
          <ProductCardRelay
            key={idx}
            product={product}
            allowCount={true}
            productType={ProductType.Product}
          />
        ))}
      </BoxBuilderGrid>
      <div className={styles.progressContainer}>
        <Text>
          {tListing('showing-of-total', {
            current: currentCount,
            total: totalCount,
          })}
        </Text>
        <Progress
          percent={progressPercent}
          showInfo={false}
          className={styles.progressBar}
          strokeWidth={6}
          strokeColor={token.colorPrimary}
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
              {tListing('load-more')}
            </Button>
          </div>
        )}
      </div>
    </Flex>
  );
};

type CategoryParams = {
  categoryHandle: string;
};

const Category: ActivityComponentType<CategoryParams> = ({
  params,
}: {
  params: CategoryParams;
}) => {
  useStyles();
  const { push } = useFlow();
  const { categoryHandle } = params;

  const handleFooterBtnClick = () => {
    push(Activity.Step3, {});
  };

  return (
    <Layout
      footer={
        <ProductsOnlyFooterButton onClickOverride={handleFooterBtnClick} />
      }
    >
      <Suspense fallback={<BoxBuilderCategorySectionSkeleton items={5} />}>
        <CategoryProducts categoryHandle={categoryHandle} />
      </Suspense>
    </Layout>
  );
};

export default Category;

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      padding: 0 ${token.padding}px;
    `,
    scroll: css`
      width: 100%;
    `,
    spinnerContainer: css`
      display: flex;
      justify-content: center;
      padding: ${token.paddingLG}px 0;
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
  };
});
