"use client";

import { Flex } from "antd";
import React from "react";
import { createStyles } from "antd-style";
import SectionTitle from "./SectionTitle";
import ViewAllButton from "./ViewAllButton";
import { useCategory } from "@src/hooks/useCategory";
import { useLocale } from "next-intl";
import { usePaginationFragment } from "react-relay";
import { Listing } from "@src/relay/queries/Listing.shopana";
import { ProductsGrid } from "../Listing/ProductsGrid ";
import { LoadMoreBtn } from "./LoadMoreBtn";
import { mq } from "../Theme/breakpoints";
import clsx from "clsx";

interface HomeGridProps {
  categoryHandle: string;
  paginationCount?: number;
}

export const HomeProductGrid = ({
  categoryHandle,
  paginationCount = 24,
}: HomeGridProps) => {
  const { styles } = useStyles();
  const locale = useLocale();

  const { category } = useCategory(categoryHandle);

  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    Listing,
    category
  );

  const products = data.listing.edges?.map((edge) => edge.node) ?? [];

  console.log("Products:", products);
  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(paginationCount);
    }
  };

  return (
    <div className={clsx(styles.container, "container")}>
      <SectionTitle title={category?.title ?? ""}>
        <ViewAllButton href={`${locale}/l/${category?.handle}`} />
      </SectionTitle>
      <ProductsGrid products={products} className={styles.productsGrid} />
      <Flex justify="center">
        <LoadMoreBtn
          hasNext={hasNext}
          handleLoadMore={handleLoadMore}
          isLoadingNext={isLoadingNext}
        />
      </Flex>
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: ${token.margin}px;
      margin-inline: auto;
    `,
    productsGrid: css``,
  };
});
