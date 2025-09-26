import { AppScreen } from "@stackflow/plugin-basic-ui";

import { useCart } from "@src/modules/box-builder/hooks/useCart";
import { Price } from "@src/components/UI/Price/Price";
import { FullLogo } from "@src/components/Layout/Logo";
import { TbArrowRight, TbArrowLeft, TbShoppingCart } from "react-icons/tb";
import { createStyles, cx } from "antd-style";
import React from "react";
import { Badge, Button, ButtonProps, Flex } from "antd";
import { Activity, useFlow } from "./Stack";
import { ApiMoney } from "@codegen/schema-client";
import useToken from "antd/es/theme/useToken";
import { CloseButton } from "../CloseButton";

interface LayoutProps {
  children: React.ReactNode;
  showCart?: boolean;
  customLeftButton?: React.ReactNode;
  footer?: React.ReactNode;
  paddingTop?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showCart = true,
  footer = null,
  paddingTop = true,
}) => {
  const { styles } = useStyles({
    footer: !!footer,
    paddingTop: !!paddingTop,
  });

  const { pop } = useFlow();

  return (
    <AppScreen
      appBar={{
        closeButton: {
          render: () => (
            <CloseButton
              onConfirm={() => {
                // TODO: Navigate to home page or desired location
                window.location.href = "/";
              }}
            />
          ),
        },
        backButton: {
          render: () => (
            <Button
              variant="text"
              color="default"
              size="large"
              icon={<TbArrowLeft size={24} />}
              onClick={() => {
                pop();
              }}
            />
          ),
        },
        title: (
          <Flex align="center" justify="center">
            <FullLogo size={26} />
          </Flex>
        ),
        renderRight: () => (
          <div className={styles.rightSlot}>{showCart && <CartButton />}</div>
        ),
      }}
      ANDROID_ONLY_activityEnterStyle="slideInLeft"
    >
      <div className={styles.container} data-testid="layout-container">
        {children}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </AppScreen>
  );
};

const useStyles = createStyles(
  (
    { token, css },
    { footer, paddingTop }: { footer: boolean; paddingTop: boolean }
  ) => ({
    container: css`
      padding-bottom: ${footer ? 100 : token.padding}px;
      padding-top: ${paddingTop ? token.padding : 0}px;
    `,
    rightSlot: css`
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 40px;
      flex-shrink: 0;
    `,
    footer: css`
      position: fixed;
      bottom: 0;
      width: 100%;
      padding: ${token.padding}px;
      z-index: 2;
    `,
  })
);

export default Layout;

export interface LayoutFooterButtonProps {
  onClick: () => void;
  label: React.ReactNode;
  money?: ApiMoney;
  size?: ButtonProps["size"];
  disabled?: boolean;
  loading?: boolean;
  divider?: string | null;
  type?: ButtonProps["type"];
  rightArrow?: boolean;
}

export const LayoutFooterButton: React.FC<LayoutFooterButtonProps> = ({
  onClick,
  label,
  money,
  disabled,
  loading,
  divider = " • ",
  type = "primary",
  rightArrow = true,
}) => {
  const [, token] = useToken();

  return (
    <Button
      onClick={onClick}
      type={type}
      size="large"
      disabled={disabled}
      loading={loading}
      block
      style={{
        boxShadow: `0 0 1px 1px ${token.colorBgBase}`,
        height: 48,
        position: "relative",
      }}
    >
      <Flex align="center" justify="center">
        {label}
        {divider}
        {money && <Price money={money} raw />}
        {rightArrow && (
          <TbArrowRight
            size={24}
            color="currentColor"
            style={{ position: "absolute", right: token.paddingSM }}
          />
        )}
      </Flex>
    </Button>
  );
};

const CartButton = () => {
  const { cart } = useCart();
  const { push } = useFlow();

  return (
    <Badge
      style={{
        paddingInline: 2,
      }}
      count={cart?.totalQuantity || 0}
      offset={[-8, 8]}
      color="blue"
    >
      <Button
        variant="text"
        color="default"
        size="large"
        onClick={() => {
          push(Activity.Cart, {});
        }}
        icon={<TbShoppingCart size={28} color="currentColor" />}
      />
    </Badge>
  );
};
