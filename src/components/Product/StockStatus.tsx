"use client";

import { Tag } from "antd";
import { TbCircleCheck, TbCross } from "react-icons/tb";
import { createStyles } from "antd-style";
import { ApiProduct } from "@codegen/schema-client";

interface Props {
  product: ApiProduct;
}

export const StockStatus = ({ product }: Props) => {
  const { styles } = useStyles();

  return (
    <Tag
      className={styles.statusTag}
      icon={product.stockStatus.isAvailable ? <TbCircleCheck /> : <TbCross />}
      color={product.stockStatus.isAvailable ? "success" : "error"}
    >
      {product.stockStatus.isAvailable ? "In stock" : "Out of stock"}
    </Tag>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  statusTag: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    margin: 0;
  `,
}));
