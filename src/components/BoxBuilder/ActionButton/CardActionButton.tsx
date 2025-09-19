"use client";

import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { BoxBuilderQuantityInput } from "./QuantityInput";
import type { BoxBuilderQuantityInputProps } from "./QuantityInput";
import { useAddItemToCart } from "@src/components/BoxBuilder/hooks/useAddItemToCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useState } from "react";

export interface CardActionButtonProps {
  productId: string;
  isAvailable: boolean;
  isSelected: boolean;
  isFree: boolean;
  isInCart: boolean;
  cartQuantity: number;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: "card" | "activity";
}

export const CardActionButton = ({
  productId,
  isAvailable,
  isSelected,
  isFree,
  isInCart,
  cartQuantity,
  loading,
  buttonProps,
  quantityProps,
  appearance,
}: CardActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { addToCart, loading: isAdding } = useAddItemToCart();
  const { addSelectedCardId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t("sold-out")}
      </Button>
    );
  }

  if (isInCart && cartQuantity > 0) {
    return (
      <BoxBuilderQuantityInput
        productId={productId}
        size={quantityProps?.size ?? "middle"}
        color={quantityProps?.color ?? "primary"}
        disabled={quantityProps?.disabled ?? isFree}
        className={quantityProps?.className}
        useTrashButton={quantityProps?.useTrashButton}
        appearance={appearance}
      />
    );
  }

  const handleSelect = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({ productId, quantity: 1 });
      addSelectedCardId(productId);
    } finally {
      setIsInternalLoading(false);
    }
  };

  return (
    <Button
      block
      onClick={handleSelect}
      type={isSelected ? "primary" : "default"}
      loading={loading || isInternalLoading || isAdding}
      {...buttonProps}
    >
      {appearance === "activity" ? t("select-card") : t("select")}
    </Button>
  );
};
