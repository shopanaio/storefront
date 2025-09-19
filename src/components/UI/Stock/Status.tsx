"use client";

import { Typography } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import React from "react";

const { Text } = Typography;

export interface StockStatusProps {
  stockStatus: boolean;
}

export const StockStatus = ({ stockStatus }: StockStatusProps) => {
  const { styles } = useStyles();
  const t = useTranslations("ui.stock");

  const statusMessage = stockStatus ? t("in-stock") : t("out-of-stock");

  return (
    <Text
      type={stockStatus ? "success" : "secondary"}
      className={styles.stockStatus}
    >
      {statusMessage}
    </Text>
  );
};

const useStyles = createStyles(({ css }) => ({
  stockStatus: css`
    text-align: start;
  `,
}));
