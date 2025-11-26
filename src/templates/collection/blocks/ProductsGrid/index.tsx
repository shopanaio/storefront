"use client";

import { Empty } from "antd";
import { createStyles } from "antd-style";

import { mq } from "@src/components/UI/Theme/breakpoints";
import { ListingProductCardRelay } from "@src/templates/collection/blocks/ProductCard";
import clsx from "clsx";

interface ListingProps {
  products: readonly any[];
  className?: string;
}

export const ProductsGrid: React.FC<ListingProps> = ({
  products,
  className,
}) => {
  const { styles } = useStyles();

  return (
    <div className={clsx(styles.productList, className)}>
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
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      align-items: stretch;
      gap: ${token.marginSM}px;
    `,
  };
});
