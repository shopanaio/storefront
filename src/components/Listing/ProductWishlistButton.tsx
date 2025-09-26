import React from "react";
import { Button } from "antd";
import { TbHeart } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { useAddItemToWishlist } from "@src/hooks/useAddItemToWishlist";

type ProductWishlistButtonProps = {
  productId: string;
  showLabel?: boolean;
};

export const ProductWishlistButton: React.FC<ProductWishlistButtonProps> = ({
  productId,
  showLabel,
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
      // size="large"
      shape={showLabel ? "default" : "circle"}
      onClick={handleClick}
      aria-label={t("add-to-wishlist")}
      icon={<TbHeart size={18} />}
    >
      {showLabel && t("add-to-wishlist")}
    </Button>
  );
};
