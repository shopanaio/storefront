import React, { useCallback, useMemo, useState } from "react";
import { Button, ButtonProps } from "antd";
import { TbHeart, TbHeartFilled } from "react-icons/tb";
import { useTranslations } from "next-intl";
import {
  useAddItemToWishlist,
  WishlistItemInput,
} from "@src/hooks/useAddItemToWishlist";
import { useWishlistItems, useWishlistActions } from "@src/modules/wishlist";

type ProductWishlistButtonProps = {
  item: WishlistItemInput;
  showLabel?: boolean;
  size?: ButtonProps["size"];
};

export const ProductWishlistButton: React.FC<ProductWishlistButtonProps> = ({
  item,
  showLabel,
  size,
}) => {
  const t = useTranslations("Product");
  const { addItem } = useAddItemToWishlist();
  const { removeItem } = useWishlistActions();
  const wishlistItems = useWishlistItems();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isInWishlist = useMemo(
    () => wishlistItems.some((wishlistItem) => wishlistItem.id === item.id),
    [wishlistItems, item.id]
  );

  const label = showLabel
    ? isInWishlist
      ? t("in-wishlist")
      : t("add-to-wishlist")
    : undefined;

  const handleClick = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isInWishlist) {
        await removeItem(item.id);
      } else {
        await addItem(item);
      }
    } catch (error) {
      console.error("Failed to update wishlist item", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isInWishlist, removeItem, item, addItem]);

  const icon = isInWishlist ? (
    <TbHeartFilled size={18} />
  ) : (
    <TbHeart size={18} />
  );

  return (
    <Button
      size={size}
      shape={showLabel ? "default" : "circle"}
      onClick={handleClick}
      aria-label={label ?? t("add-to-wishlist")}
      aria-pressed={isInWishlist}
      loading={isSubmitting}
      icon={icon}
      type={isInWishlist ? "primary" : "default"}
    >
      {label}
    </Button>
  );
};
