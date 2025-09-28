"use client";

import React from "react";
import { Badge } from "antd";
import { createStyles } from "antd-style";
import { useTranslations } from "next-intl";
import { useRoutes } from "@src/hooks/useRoutes";

import useCart from "@src/hooks/cart/useCart";

import { CartTable } from "./CartTable";
import { useModalStore } from "@src/store/appStore";
import { DrawerBase } from "@src/components/UI/DrawerBase/DrawerBase";
import { StickyButton } from "@src/components/UI/StickyButton";

export const CartDrawer: React.FC = () => {
  const { styles } = useStyles();
  const t = useTranslations("Cart");

  const routes = useRoutes();
  const { cart } = useCart();
  const isOpen = useModalStore((state) => state.isCartDrawerOpen);
  const setIsOpen = useModalStore((state) => state.setIsCartDrawerOpen);

  const cartLines = cart?.lines ?? [];
  const subtotal = cart?.cost?.subtotalAmount;

  /**
   * Footer with checkout button
   */
  const renderFooter = () =>
    subtotal && (
      <StickyButton
        href={routes.checkout.path()}
        label={t("checkout")}
        money={subtotal as any}
        className={styles.checkoutButton}
      />
    );

  return (
    <DrawerBase
      open={isOpen}
      height="75vh"
      onClose={() => setIsOpen(false)}
      title={
        <>
          {t("cart")} <Badge count={cart?.totalQuantity} color="blue" />
        </>
      }
      footer={renderFooter()}
      showCloseButton={true}
      contentClassName={styles.drawerContent}
    >
      <CartTable
        cartLines={cartLines}
        variant="drawer"
        className={styles.cartTable}
        divider={false}
      />
    </DrawerBase>
  );
};

const useStyles = createStyles(({ css, token }) => ({
  viewCartBtn: css`
    padding: 0;
  `,
  drawerContent: css`
    padding: 0 !important;
  `,
  cartTable: css`
    gap: ${token.marginXS}px;
  `,
  checkoutButton: css`
    height: 48px;
  `,
}));
