"use client";

import React from "react";
import { Divider, Flex, Typography } from "antd";
import { CartItem } from "@src/components/Cart/CartItem";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { useTranslations } from "next-intl";
import clsx from "clsx";
import type { model } from "@shopana/storefront-sdk/model/namespace";

interface CartTableListProps {
  cartLines: model.CartLine[];
  variant?: "drawer" | "page";
  className?: string;
  divider?: boolean;
}

export const CartTable: React.FC<CartTableListProps> = ({
  cartLines,
  variant = "drawer",
  className,
  divider,
}) => {
  const t = useTranslations("Cart");
  const { styles } = useStyles();

  return (
    <Flex
      className={clsx(styles.contentContainer, className)}
      vertical
      justify="start"
    >
      {variant === "page" && (
        <div className={styles.cartTableHat}>
          <Typography.Text>{t("product")}</Typography.Text>
          <div></div>
          <Typography.Text>{t("quantity")}</Typography.Text>
          <Typography.Text>{t("total")}</Typography.Text>
        </div>
      )}

      {(cartLines || [])
        .filter((cartLine) => cartLine) // Remove purchasable check since this is now a fragment
        .map((cartLine, index) => (
          <React.Fragment key={index}>
            <CartItem cartLine={cartLine} variant={variant} />
            {divider && index < cartLines.length - 1 && (
              <Divider style={{ margin: 0 }} />
            )}
          </React.Fragment>
        ))}
    </Flex>
  );
};
const useStyles = createStyles(({ token, css }) => {
  return {
    contentContainer: css`
      ${mq.xl} {
        flex: 1;
      }
    `,
    cartTableHat: css`
      display: none;
      ${mq.lg} {
        display: grid;
        grid-template-columns: 64px 2fr 1fr 1fr 40px;
        padding: ${token.padding}px;
        background-color: ${token.colorBgLayout};
        border-radius: ${token.borderRadiusLG}px;
      }
    `,
  };
});
