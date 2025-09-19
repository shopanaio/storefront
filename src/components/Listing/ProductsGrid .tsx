"use client";

import { Empty } from "antd";
import { createStyles } from "antd-style";

import { mq } from "@src/components/Theme/breakpoints";
import { ListingProductCardRelay } from "@src/components/Listing/ProductCard";

interface ListingProps {
  products: readonly any[];
}

export const ProductsGrid: React.FC<ListingProps> = ({ products }) => {
  const { styles } = useStyles();

  return (
    <div className={styles.productList}>
      {products.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
      ) : (
        products.map((product) => (
          <ListingProductCardRelay
            key={(product as any).id}
            $productRef={product} // Fix: use $productRef instead of product
          />
        ))
      )}
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    productList: css`
      display: grid;
      width: 100%;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      align-items: stretch;
      padding: 0;

      ${mq.lg} {
        gap: ${token.marginSM}px;
      }
    `,
  };
});
