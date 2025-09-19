"use client";

import { createStyles } from "antd-style";
import React from "react";
import { ApiProduct } from "@codegen/schema-client";
import { Reviews$key } from "@src/relay/queries/__generated__/Reviews.graphql";
import { ProductMain } from "./ProductMain";
import { ProductDetails } from "./ProductDetails";

interface Prop {
  product: ApiProduct & Reviews$key;
}

export const Product = ({ product }: Prop) => {
  const { styles } = useStyles();

  return (
    <div className={styles.container} data-testid="product-page">
      <ProductMain product={product} />
      <ProductDetails product={product} />
    </div>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    background-color: ${token.colorBgContainer};
  `,
}));
