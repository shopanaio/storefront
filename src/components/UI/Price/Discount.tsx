"use client";

import { Flex } from "antd";
import { createStyles } from "antd-style";
import React from "react";

import { SaleBadge } from "@src/components/UI/Badges/Sale";
import { Price } from "@src/components/UI/Price/Price";

interface Money {
  amount: number;
  currencyCode: string;
}

export interface Props {
  isAvailable: boolean;
  price: Money;
  compareAtPrice?: Money;
}

export const Discount = ({ isAvailable, price, compareAtPrice }: Props) => {
  const { styles } = useStyles();

  const hasDiscount =
    compareAtPrice &&
    compareAtPrice.amount > price.amount &&
    compareAtPrice.amount !== price.amount;

  return (
    hasDiscount &&
    isAvailable && (
      <Flex align="center" gap={8}>
        <Price
          delete
          type="secondary"
          money={compareAtPrice!}
          className={styles.compareAtPrice}
        />
        <SaleBadge
          compareAtPrice={compareAtPrice.amount}
          price={price.amount}
        />
      </Flex>
    )
  );
};

const useStyles = createStyles(({ token, css }) => ({
  compareAtPrice: css`
    font-size: ${token.fontSizeSM}px;
    font-weight: var(--font-weight-300);
    line-height: 1;
  `,
}));
