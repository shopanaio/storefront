'use client';

import { Empty } from 'antd';
import { createStyles } from 'antd-style';
import clsx from 'clsx';
import { CollectionProductCard } from './CollectionProductCard';
import type { CollectionProductCardFragment$key } from '@shopana/storefront-sdk/modules/collection/core/types';

interface CollectionProductsGridProps {
  products: readonly CollectionProductCardFragment$key[];
  className?: string;
}

export const CollectionProductsGrid: React.FC<CollectionProductsGridProps> = ({
  products,
  className,
}) => {
  const { styles } = useStyles();

  return (
    <div className={clsx(styles.productList, className)}>
      {products.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data" />
      ) : (
        products.map((product, index) => (
          <CollectionProductCard key={index} $productRef={product} />
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
