"use client";

import React from "react";
import { Divider, Flex, Typography } from "antd";
import { CartItem } from "@src/components/Cart/CartItem";
import { createStyles } from "antd-style";
import { mq } from "@src/components/Theme/breakpoints";
import { useTranslations } from "next-intl";
import { CartLineFragment$key } from "@src/relay/queries/__generated__/CartLineFragment.graphql";

interface CartTableListProps {
  cartLines: CartLineFragment$key[]; // Now use typed array
  variant?: "drawer" | "page";
}

export const CartTable: React.FC<CartTableListProps> = ({
  cartLines,
  variant = "drawer",
}) => {
  const t = useTranslations("Cart");
  const { styles } = useStyles();

  return (
    <Flex className={styles.contentContainer} vertical justify="start">
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
          <React.Fragment key={cartLine.id || index}>
            <CartItem product={cartLine} variant={variant} />
            {index < cartLines.length - 1 && <Divider style={{ margin: 0 }} />}
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
