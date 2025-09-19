"use client";

import React from "react";
import { useFormatter } from "next-intl";
//import type { ApiMoney } from "@codegen/schema-client";
import { Typography } from "antd";

export interface Money {
  amount: number;
  currencyCode: string;
}

type PriceProps = {
  money: Money;
  raw?: boolean;
} & React.ComponentProps<typeof Typography.Text>;

export const useFormatPrice = () => {
  const format = useFormatter();

  return (money: Money) => {
    // Convert amount to number since in Shopify it may come as string
    const amount =
      typeof money?.amount === "string"
        ? parseFloat(money.amount)
        : money?.amount;

    if (typeof amount !== "number" || isNaN(amount)) {
      return null;
    }

    return format.number(amount, {
      style: "currency",
      currency: money.currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      trailingZeroDisplay: "auto",
      currencyDisplay: "narrowSymbol",
    });
  };
};

export const Price: React.FC<PriceProps> = ({ money, raw, ...props }) => {
  const formatPrice = useFormatPrice();
  const price = formatPrice(money);

  if (raw) {
    return price;
  }

  return <Typography.Text {...props}>{price}</Typography.Text>;
};
