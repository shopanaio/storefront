'use client';

import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import { ListingProductCardRelay } from '@src/templates/collection/blocks/ProductCard';
import clsx from 'clsx';
import type { SearchProduct } from '@shopana/storefront-sdk/modules/search/core/types';
import type { useListingProductCardFragment_product$key } from '@src/templates/collection/relay/__generated__/useListingProductCardFragment_product.graphql';

interface ListingProps {
  products: readonly (
    | SearchProduct
    | useListingProductCardFragment_product$key
  )[];
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
        products.map((product, index) =>
          'price' in product && 'product' in product ? (
            <ListingProductCardRelay
              key={product.id}
              product={product}
            />
          ) : (
            <ListingProductCardRelay
              key={index}
              $productRef={product}
            />
          )
        )
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
