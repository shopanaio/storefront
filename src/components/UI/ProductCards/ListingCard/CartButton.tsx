import { Button } from "antd";
import { TbShoppingCart, TbCheck } from "react-icons/tb";
import { useTranslations } from "next-intl";

export interface ProductCartButtonProps {
  isAvailable: boolean;
  showLabel?: boolean;
  className?: string;
  isInCart?: boolean;
  onAddToCart?: () => void;
}

export const ProductCartButton = ({
  isAvailable,
  showLabel,
  className,
  isInCart,
  onAddToCart,
}: ProductCartButtonProps) => {
  const t = useTranslations("Product");

  return (
    <Button
      className={className}
      size="large"
      type={!isAvailable ? "default" : "primary"}
      disabled={!isAvailable}
      icon={
        isInCart ? (
          <TbCheck color={!isAvailable ? "secondary" : "default"} size={18} />
        ) : (
          <TbShoppingCart
            color={!isAvailable ? "secondary" : "default"}
            size={18}
          />
        )
      }
      onClick={onAddToCart}
      children={showLabel && (isInCart ? t("in-cart") : t("add-to-cart"))}
    />
  );
};
