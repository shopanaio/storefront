import React from "react";
import { Button, ButtonProps } from "antd";
import { TbHeart } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { useAddItemToWishlist } from "@src/hooks/useAddItemToWishlist";

type ProductWishlistButtonProps = {
  productId: string;
  showLabel?: boolean;
  size?: ButtonProps['size'];
};

export const ProductWishlistButton: React.FC<ProductWishlistButtonProps> = ({
  productId,
  showLabel,
  size,
}) => {
  const { addItem } = useAddItemToWishlist();
  const t = useTranslations("Product");

  const handleClick = async () => {
    try {
      await addItem(productId);
    } catch (error) {
      console.error("Failed to add item to wishlist", error);
    }
  };

  return (
    <Button
      size={size}
      shape={showLabel ? "default" : "circle"}
      onClick={handleClick}
      aria-label={t("add-to-wishlist")}
      icon={<TbHeart size={18} />}
    >
      {showLabel && t("add-to-wishlist")}
    </Button>
  );
};
