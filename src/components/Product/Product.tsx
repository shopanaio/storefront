'use client';

import { createStyles } from 'antd-style';
import React from 'react';
import type { Entity } from '@shopana/entity';
import type { Reviews$key } from '@src/queries/Reviews/__generated__/Reviews.graphql';
import { ProductMain } from './ProductMain';
import { ProductDetails } from './ProductDetails';

interface Prop {
  title: string;
  product: Entity.Product;
  productReviewsRef: Reviews$key | null;
  onChangeVariant: (handle: string) => void;
  currentVariant: Entity.ProductVariant;
}

export const Product = ({
  title,
  product,
  productReviewsRef,
  onChangeVariant,
  currentVariant,
}: Prop) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container} data-testid="product-page">
      <ProductMain
        title={title}
        product={product}
        currentVariant={currentVariant}
        onChangeVariant={onChangeVariant}
      />
      <ProductDetails
        product={product}
        productReviewsRef={productReviewsRef}
      />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background-color: ${token.colorBgContainer};
  `,
}));
