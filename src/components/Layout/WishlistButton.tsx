import React from "react";
import { TbHeart } from "react-icons/tb";
import { useTranslations } from "next-intl";
import { HeaderLinkButton } from "./HeaderLinkButton";

type WishlistButtonProps = {
  badgeCount?: number | null;
  className?: string;
  onClick?: () => void;
  iconSize?: number;
};

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  badgeCount,
  className,
  onClick,
  iconSize = 24,
}) => {
  const t = useTranslations("Header");

  return (
    <HeaderLinkButton
      icon={<TbHeart size={iconSize} />}
      topText={t("my-items")}
      bottomText={t("wishlist")}
      badgeCount={badgeCount ?? undefined}
      className={className}
      onClick={onClick}
    />
  );
};
