"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import { SectionTitle, ViewAllButton, LoadMoreBtn } from "@/sections/shared";
import { useCategory } from "@src/hooks/useCategory";
import { useLocale } from "next-intl";
import { usePaginationFragment } from "react-relay";
import Listing from "@src/queries/Listing";
import { ProductsGrid } from "@src/components/Listing/ProductsGrid ";
import clsx from "clsx";

interface HomeProductGridSectionProps {
  categoryHandle: string;
  paginationCount?: number;
}

export default function HomeProductGridSection({
  categoryHandle,
  paginationCount = 16,
}: HomeProductGridSectionProps) {
  const { styles } = useStyles();
  const locale = useLocale();

  const { category } = useCategory(categoryHandle);

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
        <ViewAllButton href={`${locale}/l/${category?.handle}`} />
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
