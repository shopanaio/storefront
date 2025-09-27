"use client";

import React from "react";
import { Badge, Button, Drawer, Flex, Typography } from "antd";
import { createStyles, cx } from "antd-style";
import { RxCross2 } from "react-icons/rx";
import { useTranslations } from "next-intl";
import { useRoutes } from "@src/hooks/useRoutes";

import useCart from "@src/hooks/cart/useCart";
import { useCartLineFragment_CartLineFragment$key } from "@src/hooks/cart/useCartLineFragment/__generated__/useCartLineFragment_CartLineFragment.graphql";
const { Text } = Typography;

import { CartTable } from "./CartTable";
import { useModalStore } from "@src/store/appStore";
import { Price } from "@src/components/UI/Price/Price";
import clsx from "clsx";

export const CartDrawer: React.FC = () => {
  const { styles } = useStyles();
  const t = useTranslations("Cart");

  const routes = useRoutes();
  const { cart } = useCart();
  const isOpen = useModalStore((state) => state.isCartDrawerOpen);
  const setIsOpen = useModalStore((state) => state.setIsCartDrawerOpen);

  const cartLines = (cart?.lines ??
    []) as unknown as useCartLineFragment_CartLineFragment$key[];

  const subtotal = cart?.cost?.subtotalAmount;

  return (
    <Drawer
      placement="right"
      onClose={() => setIsOpen(false)}
      open={isOpen}
      closable={false}
      width="var(--components-drawer-width)"
      drawerRender={() => (
        <Flex
          vertical
          className={clsx(styles.customDrawer, "ant-drawer-content")}
        >
          <Flex className={styles.headerWrapper} vertical>
            <Flex
              className={styles.drawerHeader}
              align="center"
              justify="space-between"
            >
              <Text className={styles.drawerTitle}>
                {t("cart")} <Badge count={cart?.totalQuantity} color="blue" />
              </Text>

              <Flex align="center" gap={10}>
                <Button
                  className={styles.viewCartBtn}
                  href={routes.cart.path()}
                  type="link"
                >
                  {t("view-cart")}
                </Button>
                <Button
                  icon={<RxCross2 size={24} />}
                  type="text"
                  className={styles.closeBtn}
                  onClick={() => setIsOpen(false)}
                />
              </Flex>
            </Flex>
          </Flex>
          <CartTable
            cartLines={cartLines}
            variant="drawer"
            className={styles.cartTable}
            divider={false}
          />
          <Flex className={styles.footerWrapper}>
            {subtotal && (
              <Button
                href={routes.checkout.path()}
                type="primary"
                size="large"
                block
                style={{ height: 48 }}
              >
                <Flex align="center" justify="center" gap={8}>
                  {t("checkout")}
                  <span>•</span>
                  <Price money={subtotal as any} raw />
                </Flex>
              </Button>
            )}
          </Flex>
        </Flex>
      )}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  customDrawer: css`
    background: ${token.colorWhite};
    height: 100%;
    width: 100%;
  `,
  headerWrapper: css`
    position: sticky;
    top: 0;
    z-index: 1;
  `,
  drawerHeader: css`
    background-color: ${token.colorBgBase};
    margin-bottom: ${token.marginXXS}px;
    padding: ${token.padding}px;
    width: 100%;
  `,
  drawerTitle: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  cartTable: css`
    gap: ${token.marginXS}px;
    padding: 0 ${token.padding}px;
  `,
  viewCartBtn: css`
    padding: 0;
  `,
  closeBtn: css`
    &:hover {
      color: ${token.colorPrimary} !important;
    }
  `,
  footerWrapper: css`
    bottom: 0;
    margin-top: auto;
    padding: ${token.padding}px;
    position: sticky;
  `,
}));
