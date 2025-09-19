"use client";

import { Flex, Spin } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { ActivityComponentType } from "@stackflow/react";
import Layout from "../stackflow/Layout";
import BoxBuilderGrid from "../BoxBuilderGrid";
import { ProductCardRelay } from "@src/components/Listing/ProductCard.shopana";
import { StepHeader } from "../StepHeader";
import { Activity, useFlow } from "../stackflow/Stack";
import { usePaginationFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { useCategory } from "@src/components/BoxBuilder/hooks/useCategory";
import InfiniteScroll from "react-infinite-scroller";
import React, { Suspense } from "react";
import { BoxBuilderCategorySectionSkeleton } from "../skeletons/CategorySectionSkeleton";
import type { Listing$key } from "@src/relay/queries/__generated__/Listing.graphql";
import type { ProductCardRelay_product$key } from "@src/components/Listing/__generated__/ProductCardRelay_product.graphql";
import { ProductType } from "@src/components/BoxBuilder/ProductCard";
import ProductsOnlyFooterButton from "@src/components/BoxBuilder/ProductsOnlyFooterButton";

const CategoryProducts: React.FC<{ categoryHandle: string }> = ({
  categoryHandle,
}) => {
  const { styles, theme } = useStyles();
  const t = useTranslations("BoxBuilder");
  const { category } = useCategory(categoryHandle);
  const categoryKey = category as unknown as Listing$key;
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    Listing,
    categoryKey
  );

  const products: ProductCardRelay_product$key[] =
    (
      data as unknown as {
        listing?: { edges?: { node: ProductCardRelay_product$key }[] };
      }
    )?.listing?.edges?.map((edge) => edge.node) ?? [];

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(25);
    }
  };

  return (
    <Flex vertical className={styles.container} gap={theme.margin}>
      <StepHeader
        subtitle={t("step2.subtitle")}
        title={category?.title ?? ""}
      />
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
      </InfiniteScroll>
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
  const t = useTranslations("BoxBuilder");

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
      <Suspense fallback={<BoxBuilderCategorySectionSkeleton items={12} />}>
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
  };
});
