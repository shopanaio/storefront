'use client';

import { createStyles } from 'antd-style';
import React from 'react';
import type { Entity } from '@shopana/entity';
import { Reviews$key } from '@src/relay/queries/__generated__/Reviews.graphql';
import { ProductMain } from './ProductMain';
import { ProductDetails } from './ProductDetails';

interface Prop {
  title: string;
  product: Entity.Product & Reviews$key;
  onChangeVariant: (handle: string) => void;
  currentVariant: Entity.ProductVariant;
}

export const Product = ({
  title,
  product,
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
      <ProductDetails product={product} />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background-color: ${token.colorBgContainer};
  `,
}));
