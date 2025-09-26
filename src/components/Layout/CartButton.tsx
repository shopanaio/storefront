import React from "react";
import { TbShoppingCart } from "react-icons/tb";
import { useTranslations } from "next-intl";
import useCart from "@src/hooks/cart/useCart";
import { Money } from "@src/components/UI/Price/Money";
import { createStyles } from "antd-style";
import { Button, Badge } from "antd";
import useToken from "antd/es/theme/useToken";
import { mq } from "@src/components/Theme/breakpoints";
import clsx from "clsx";

type CartButtonProps = {
  onClick?: () => void;
  mobileBlock?: boolean;
  className?: string;
};

export const CartButton: React.FC<CartButtonProps> = ({
  onClick,
  mobileBlock = true,
  className,
}) => {
  const t = useTranslations("Header");
  const { cart } = useCart();
  const { styles } = useStyles();
  const [, token] = useToken();

  const totalQuantity = cart?.totalQuantity ?? 0;
  const amountText = cart?.cost?.totalAmount ? (
    <Money as="span" money={cart.cost.totalAmount} />
  ) : (
    t("cart")
  );

  const icon = <TbShoppingCart size={24} color="currentColor" />;
  const iconWithBadge = totalQuantity ? (
    <Badge
      style={{ paddingInline: 2, boxShadow: `0 0 0 2px ${token.colorPrimary}` }}
      count={totalQuantity}
      offset={[-2, 3]}
      color="blue"
      size="small"
    >
      {icon}
    </Badge>
  ) : (
    icon
  );

  return (
    <Button type="text" onClick={onClick} className={clsx(styles.button, className)}>
      <span className={styles.content}>
        <span className={styles.iconWrapper}>{iconWithBadge}</span>
        <span className={styles.amount}>{amountText}</span>
      </span>
    </Button>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    button: css`
      min-width: 80px;
      max-width: 80px;
      height: 46px;
      padding: 0 ${token.paddingXS}px ${token.paddingXS}px;
      color: ${token.colorText};
    `,
    content: css`
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: ${token.marginXXS}px;

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
      font-weight: 400;
      font-size: 13px;
      line-height: ${token.lineHeight}px;
      color: currentColor;
    `,
  };
});
