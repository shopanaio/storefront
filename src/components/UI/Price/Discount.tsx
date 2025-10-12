"use client";

import { Flex, Typography } from "antd";
import { createStyles } from "antd-style";
import React from "react";

import { SaleBadge } from "@src/components/UI/Badges/Sale";
import type { Entity } from "@shopana/entity";
import { Money } from "@src/components/UI/Price/Money";

export interface Props {
  isAvailable: boolean;
  price: Entity.Money;
  compareAtPrice?: Entity.Money;
}

export const Discount = ({ isAvailable, price, compareAtPrice }: Props) => {
  const { styles } = useStyles();

  if (!price || !compareAtPrice) {
    return null;
  }

  if (price.currencyCode !== compareAtPrice.currencyCode) {
    throw new Error(
      "Discount:Price and compareAtPrice must have the same currency code"
    );
  }

  const hasDiscount =
    compareAtPrice &&
    compareAtPrice.amount > price.amount &&
    compareAtPrice.amount !== price.amount;

  return (
    hasDiscount &&
    isAvailable && (
      <Flex align="center" gap={8}>
        <Money
          delete
          type="secondary"
          money={compareAtPrice!}
          className={styles.compareAtPrice}
          as={Typography.Text}
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
