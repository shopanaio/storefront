"use client";

import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { BoxBuilderQuantityInput } from "./QuantityInput";
import type { BoxBuilderQuantityInputProps } from "./QuantityInput";
import { useAddItemToBoxBuilderCart } from "@src/modules/box-builder/hooks/useAddItemToCart";
import { useState } from "react";
import { useIsInTheBoxBuilderCart } from "@src/modules/box-builder/hooks/useIsInTheCart";
import { Entity } from "@shopana/entity";

export interface ProductActionButtonProps {
  variant: Entity.ProductVariant;
  loading?: boolean;
  buttonProps?: ButtonProps;
  quantityProps?: Partial<BoxBuilderQuantityInputProps>;
  appearance: "card" | "activity";
}

export const ProductActionButton = ({
  variant,
  loading,
  buttonProps,
  appearance,
  quantityProps,
}: ProductActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  const cartLine = useIsInTheBoxBuilderCart(variant.id);
  const isInCart = Boolean(cartLine);
  const { quantity = 0 } = cartLine || {};

  const isAvailable = variant.stockStatus?.isAvailable === true;
  const isFree = parseFloat(variant.price?.amount ?? '0') === 0;

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
        productId={variant.id}
        size={quantityProps?.size ?? "middle"}
        color={quantityProps?.color ?? "primary"}
        disabled={quantityProps?.disabled ?? isFree}
        className={quantityProps?.className}
        appearance={appearance}
      />
    );
  }

  const handleAdd = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({
        purchasableId: variant.id,
        quantity: 1,
      });
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
