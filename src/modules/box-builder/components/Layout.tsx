import { AppScreen } from '@stackflow/plugin-basic-ui';

import { useBoxBuilderCart } from '@src/modules/box-builder/hooks/useCart';
import { Price } from '@src/components/UI/Price/Price';
import { useLogo } from '@src/hooks/useLogo';
import {
  TbArrowRight,
  TbArrowLeft,
  TbShoppingCart,
  TbGift,
} from 'react-icons/tb';
import { createStyles } from 'antd-style';
import React from 'react';
import { Button, ButtonProps, Flex } from 'antd';
import { Badge } from '@src/components/UI/Badge';
import { Activity, useFlow } from '@src/modules/box-builder/Stack';
import useToken from 'antd/es/theme/useToken';
import { CloseButton } from '@src/modules/box-builder/components/CloseButton';
import { Entity } from '@shopana/entity';

interface LayoutProps {
  children: React.ReactNode;
  showCart?: boolean;
  showBackButton?: boolean;
  customLeftButton?: React.ReactNode;
  footer?: React.ReactNode;
  paddingTop?: boolean;
  paddingBottom?: boolean | number;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showCart = true,
  showBackButton = true,
  footer = null,
  paddingTop = true,
  paddingBottom = true,
}) => {
  const { styles } = useStyles({
    footer: !!footer,
    paddingTop: !!paddingTop,
    paddingBottom,
  });

  const { pop } = useFlow();
  const Logo = useLogo();

  return (
    <AppScreen
      appBar={{
        closeButton: {
          render: () => (
            <CloseButton
              onConfirm={() => {
                // TODO: Navigate to home page or desired location
                window.location.href = '/';
              }}
            />
          ),
        },
        backButton: {
          render: () =>
            showBackButton ? (
              <Button
                variant="text"
                color="default"
                size="large"
                icon={<TbArrowLeft size={24} />}
                onClick={() => {
                  pop();
                }}
              />
            ) : null,
        },

        title: (
          <Flex align="center" justify="center" style={{ marginTop: -2 }}>
            <Logo size={32} />
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
    {
      footer,
      paddingTop,
      paddingBottom,
    }: {
      footer: boolean;
      paddingTop: boolean;
      paddingBottom: boolean | number;
    }
  ) => ({
    container: css`
      padding-bottom: ${footer
        ? 100
        : paddingBottom
          ? typeof paddingBottom === 'number'
            ? paddingBottom
            : token.padding
          : 0}px;
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
  money?: Entity.Money;
  size?: ButtonProps['size'];
  disabled?: boolean;
  loading?: boolean;
  divider?: string | null;
  type?: ButtonProps['type'];
  rightArrow?: boolean;
}

export const LayoutFooterButton: React.FC<LayoutFooterButtonProps> = ({
  onClick,
  label,
  money,
  disabled,
  loading,
  divider = ' • ',
  type = 'primary',
  rightArrow,
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
        position: 'relative',
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
            style={{ position: 'absolute', right: token.paddingSM }}
          />
        )}
      </Flex>
    </Button>
  );
};

const CartButton = () => {
  const { cart } = useBoxBuilderCart();
  const { push } = useFlow();
  const [, token] = useToken();
  return (
    <Badge
      style={{
        paddingInline: 2,
      }}
      count={cart?.totalQuantity || 0}
      offset={[-8, 8]}
      variant="primary"
    >
      <Button
        variant="text"
        color="default"
        size="large"
        onClick={() => {
          push(Activity.Cart, {});
        }}
        icon={<TbGift size={28} color="currentColor" />}
      />
    </Badge>
  );
};
