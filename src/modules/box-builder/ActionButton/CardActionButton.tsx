"use client";

import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { BoxBuilderQuantityInput } from "./QuantityInput";
import type { BoxBuilderQuantityInputProps } from "./QuantityInput";
import { useAddItemToBoxBuilderCart } from "@src/modules/box-builder/hooks/useAddItemToCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useState } from "react";

export interface CardActionButtonProps {
  productId: string;
  isAvailable: boolean;
  isFree: boolean;
  isInCart: boolean;
  quantity: number;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: "card" | "activity";
}

export const CardActionButton = ({
  productId,
  isAvailable,
  isFree,
  isInCart,
  quantity,
  loading,
  buttonProps,
  quantityProps,
  appearance,
}: CardActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const { addCardProductId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t("sold-out")}
      </Button>
    );
  }

  if (isInCart && quantity > 0) {
    return (
      <BoxBuilderQuantityInput
        productId={productId}
        size={quantityProps?.size ?? "middle"}
        color={quantityProps?.color ?? "primary"}
        disabled={quantityProps?.disabled ?? isFree}
        className={quantityProps?.className}
        appearance={appearance}
      />
    );
  }

  const handleSelect = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({
        purchasableId: productId,
        quantity: 1,
      });
      addCardProductId(productId);
    } finally {
      setIsInternalLoading(false);
    }
  };

  return (
    <Button
      block
      onClick={handleSelect}
      type={isInCart ? "primary" : "default"}
      loading={loading || isInternalLoading || isAdding}
      {...buttonProps}
    >
      {appearance === "activity" ? t("select-card") : t("select")}
    </Button>
  );
};
