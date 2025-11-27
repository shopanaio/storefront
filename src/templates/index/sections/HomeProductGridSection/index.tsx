"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { SectionTitle, ViewAllButton, LoadMoreBtn } from "../../../shared/atoms";
import { useCategory } from "@src/hooks/useCategory";
import { useRoutes } from "@src/hooks/useRoutes";
import { usePaginationFragment } from "react-relay";
import Listing from "@shopana/storefront-sdk/queries/Listing";
import { ProductsGrid } from "@src/templates/collection/blocks/ProductsGrid";
import clsx from "clsx";
import type { SectionProps } from "@shopana/storefront-sdk/core/types";

interface HomeProductGridSectionSettings {
  categoryHandle: string;
  first?: number;
  paginationCount?: number;
}

export default function HomeProductGridSection({
  settings,
}: SectionProps<HomeProductGridSectionSettings>) {
  const { styles } = useStyles();
  const routes = useRoutes();

  const first = settings.first ?? 16;
  const { category } = useCategory(settings.categoryHandle, first);
  const paginationCount = settings.paginationCount ?? 16;

  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    Listing,
    category
  );

  const products = data?.listing?.edges?.map((edge) => edge.node) ?? [];

  const handleLoadMore = () => {
    if (hasNext && !isLoadingNext) {
      loadNext(paginationCount);
    }
  };

  return (
    <div className={clsx(styles.container, "container")}>
      <SectionTitle title={category?.title ?? ""}>
        <ViewAllButton href={routes.collection.path(category?.handle ?? '')} />
      </SectionTitle>
      <ProductsGrid products={products} className={styles.productsGrid} />
      <Flex justify="center" style={{ display: 'none' }}>
        <LoadMoreBtn
          hasNext={hasNext}
          handleLoadMore={handleLoadMore}
          isLoadingNext={isLoadingNext}
        />
      </Flex>
    </div>
  );
}

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

export { HomeProductGridSection };
