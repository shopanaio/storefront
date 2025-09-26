import React from "react";
import { HeaderLinkButton } from "./HeaderLinkButton";
import { TbShoppingCart } from "react-icons/tb";
import { useTranslations } from "next-intl";
import useCart from "@src/hooks/cart/useCart";
import { Price } from "@src/components/UI/Price/Price";
import { Money } from "@src/components/UI/Price/Money";

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

  const totalQuantity = cart?.totalQuantity ?? 0;
  const bottomText = cart?.cost?.totalAmount ? (
    <Money money={cart.cost.totalAmount}  />
  ) : (
    t("cart")
  );

  return (
    <HeaderLinkButton
      icon={<TbShoppingCart size={24} color="currentColor" />}
      topText={t("cart")}
      bottomText={bottomText}
      badgeCount={totalQuantity || null}
      mobileBlock={mobileBlock}
      onClick={onClick}
      className={className}
    />
  );
};
