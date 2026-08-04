import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import useCart from '@shopana/storefront-sdk/modules/cart/react/hooks/useCart';
import { Money } from '@src/ui-kit/Price/Money';
import { createStyles } from 'antd-style';
import { Button } from 'antd';
import { Badge } from '@src/ui-kit/Badge';
import { mq } from '@src/ui-kit/Theme/breakpoints';
import clsx from 'clsx';
import { useModalStore } from '@src/store/appStore';
import type { HeaderTextBreakpoint } from './HeaderSection.types';

type CartButtonProps = {
  onClick?: () => void;
  className?: string;
  iconSize?: number;
  iconColor?: string;
  showTextFrom?: HeaderTextBreakpoint;
};

export const CartButton: React.FC<CartButtonProps> = ({
  onClick,
  className,
  iconSize = 24,
  iconColor = 'currentColor',
  showTextFrom = 'md',
}) => {
  const t = useTranslations('Header');
  const { cart } = useCart();
  const { styles } = useStyles({ showTextFrom });
  const setIsCartDrawerOpen = useModalStore(
    (state) => state.setIsCartDrawerOpen
  );

  const totalQuantity = cart?.totalQuantity ?? 0;
  const amountText = cart?.cost?.totalAmount ? (
    <Money as="span" money={cart.cost.totalAmount} />
  ) : (
    t('cart')
  );

  const badgeColor = 'var(--header-badge-background, var(--ant-color-primary))';
  const icon = <ShoppingCart size={iconSize} color={iconColor} />;
  const iconWithBadge = totalQuantity ? (
    <Badge
      style={{
        paddingInline: 2,
        boxShadow: `0 0 0 2px ${badgeColor}`,
        color: 'var(--header-badge-text, #ffffff)',
      }}
      count={totalQuantity}
      offset={[-2, 3]}
      color={badgeColor}
      size="small"
    >
      {icon}
    </Badge>
  ) : (
    icon
  );

  const handleClick = () => {
    if (onClick) onClick();
    setIsCartDrawerOpen(true);
  };

  return (
    <Button
      type="text"
      onClick={handleClick}
      className={clsx(styles.button, className)}
    >
      <span className={styles.content}>
        <span className={styles.iconWrapper}>{iconWithBadge}</span>
        <span className={styles.amount}>{amountText}</span>
      </span>
    </Button>
  );
};

const useStyles = createStyles(
  (
    { token, css },
    { showTextFrom }: { showTextFrom: HeaderTextBreakpoint }
  ) => {
    return {
      button: css`
        height: var(--components-header-control-height);
        padding: 0 ${token.paddingXS}px;
        color: var(--header-text-color, ${token.colorText});
        background: var(--header-control-background, transparent);

        &:not(:disabled):not(.ant-btn-disabled):hover {
          color: var(--header-text-color, ${token.colorText});
          background: var(
            --header-control-hover-background,
            ${token.colorBgTextHover}
          );
        }

        ${showTextFrom !== 'never'
          ? `${mq[showTextFrom]} {
              min-width: 84px;
              max-width: 84px;
              padding-bottom: ${token.paddingXS}px;
            }`
          : ''}
      `,
      content: css`
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        ${mq.sm} {
          gap: ${token.marginXS}px;
        }
      `,
      iconWrapper: css`
        display: inline-flex;
        align-items: center;
        justify-content: center;
      `,
      amount: css`
        display: none;
        font-weight: 400;
        font-size: 13px;
        line-height: ${token.lineHeight}px;
        color: currentColor;

        ${showTextFrom !== 'never'
          ? `${mq[showTextFrom]} {
              display: block;
            }`
          : ''}
      `,
    };
  }
);
