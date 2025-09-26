import { Button } from "antd";
import { TbShoppingCart, TbCheck } from "react-icons/tb";
import { useTranslations } from "next-intl";

export interface ProductCartButtonProps {
  isAvailable: boolean;
  showLabel?: boolean;
  className?: string;
  isInCart?: boolean;
  isLoading?: boolean;
  onAddToCart?: () => void;
}

export const ProductCartButton = ({
  isAvailable,
  showLabel,
  className,
  isInCart,
  isLoading = false,
  onAddToCart,
}: ProductCartButtonProps) => {
  const t = useTranslations("Product");

  return (
    <Button
      className={className}
      // size="large"
      color="primary"
      variant="outlined"
      disabled={!isAvailable}
      loading={isLoading}
      icon={
        !isLoading &&
        (isInCart ? (
          <TbCheck color={!isAvailable ? "secondary" : "default"} size={18} />
        ) : (
          <TbShoppingCart
            color={!isAvailable ? "secondary" : "default"}
            size={18}
          />
        ))
      }
      onClick={isInCart ? undefined : onAddToCart}
      children={showLabel && (isInCart ? t("in-cart") : t("add-to-cart"))}
    />
  );
};
