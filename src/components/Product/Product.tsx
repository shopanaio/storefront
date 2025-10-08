"use client";

import { createStyles } from "antd-style";
import React from "react";
import type * as Entity from "@src/entity/namespace";
import { Reviews$key } from "@src/relay/queries/__generated__/Reviews.graphql";
import { ProductMain } from "./ProductMain";
import { ProductDetails } from "./ProductDetails";

interface Prop {
  product: Entity.Product & Reviews$key;
  selectedVariantHandle?: string;
  onChangeVariant?: (handle: string | null) => void;
}

export const Product = ({ product, selectedVariantHandle, onChangeVariant }: Prop) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container} data-testid="product-page">
      <ProductMain
        product={product}
        selectedVariantHandle={selectedVariantHandle}
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
