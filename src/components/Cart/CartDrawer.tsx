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

import { CartSubtotal } from "./CartSubtotal";
import { CartTable } from "./CartTable";
import { useModalStore } from "@src/store/appStore";
import clsx from "clsx";

export const CartDrawer: React.FC = () => {
  const { styles } = useStyles();
  const t = useTranslations("Cart");
  const tProduct = useTranslations("Product");
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
      width={'min(100vw, 500px)'}
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
                {t("cart")} <Badge count={cartLines?.length} color="blue" />
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

          <Flex className={styles.itemsHeader}>
            <Typography.Title className={styles.itemsHeaderTitle} level={5}>
              <span>{tProduct("in-cart")}</span>{" "}
              <Text>
                {t("products-count", { count: cart?.totalQuantity || 0 })}
              </Text>
            </Typography.Title>
          </Flex>
          <CartTable
            cartLines={cartLines}
            variant="drawer"
            className={styles.cartTable}
            divider={false}
          />

          <Flex className={styles.footerWrapper}>
            {subtotal && <CartSubtotal subtotal={subtotal as any} />}
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
    font-size: ${token.fontSizeXL}px;
    font-weight: 600;
  `,
  itemsHeader: css`
    padding: 0 ${token.padding}px;
    margin-bottom: ${token.marginXS}px;
  `,
  itemsHeaderTitle: css`
    align-items: center;
    display: flex;
    font-size: ${token.fontSizeLG}px !important;
    justify-content: space-between;
    margin-top: 0px !important;
    margin: 0 !important;
    width: 100%;
    & > span:not(:first-child) {
      color: ${token.colorPrimary};
      font-size: ${token.fontSizeLG}px;
      font-weight: 400;
    }
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
    background-color: ${token.colorBgBase};
    bottom: 0;
    margin-top: auto;
    padding: 0 ${token.padding}px ${token.padding}px;
    position: sticky;
  `,
}));
