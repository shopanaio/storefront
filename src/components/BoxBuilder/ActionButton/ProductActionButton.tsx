"use client";

import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { BoxBuilderQuantityInput } from "./QuantityInput";
import type { BoxBuilderQuantityInputProps } from "./QuantityInput";
import { useAddItemToCart } from "@src/components/BoxBuilder/hooks/useAddItemToCart";
import { useState } from "react";

export interface ProductActionButtonProps {
  productId: string;
  isAvailable: boolean;
  isFree: boolean;
  isInCart: boolean;
  cartQuantity: number;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: "card" | "activity";
}

export const ProductActionButton = ({
  productId,
  isAvailable,
  isFree,
  isInCart,
  cartQuantity,
  loading,
  buttonProps,
  appearance,
  quantityProps,
}: ProductActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { addToCart, loading: isAdding } = useAddItemToCart();
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

  const handleAdd = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({ productId, quantity: 1 });
    } finally {
      setIsInternalLoading(false);
    }
  };

  return (
    <Button
      block
      onClick={handleAdd}
      loading={loading || isInternalLoading || isAdding}
      {...buttonProps}
    >
      {appearance === "activity" ? t("add-to-box") : t("add")}
    </Button>
  );
};
