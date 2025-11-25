"use client";

import { Tag } from "antd";
import { TbCircleCheck, TbCross } from "react-icons/tb";
import { createStyles } from "antd-style";
import type { model } from "@shopana/storefront-sdk";

export interface Props {
  product?: model.Product;
  stockStatus?: model.StockStatus;
}

export const StockStatus = ({ product, stockStatus }: Props) => {
  const { styles } = useStyles();
  const status = stockStatus || product?.stockStatus;

  return (
    <Tag
      className={styles.statusTag}
      icon={status?.isAvailable ? <TbCircleCheck /> : <TbCross />}
      color={status?.isAvailable ? "success" : "error"}
    >
      {status?.isAvailable ? "In stock" : "Out of stock"}
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
