"use client";

import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { useAddItemToBoxBuilderCart } from "@src/modules/box-builder/hooks/useAddItemToCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useState } from "react";
import { useIsInTheBoxBuilderCart } from "@src/modules/box-builder/hooks/useIsInTheCart";
import { Entity } from "@shopana/entity";
import { useReplaceBoxBuilderCartItem } from "@src/modules/box-builder/hooks/useReplaceCartItem";
import { useBoxBuilderProducts } from "@src/modules/box-builder/hooks/useBoxProducts";
import { Activity, useFlow } from "@src/modules/box-builder/Stack";
import { LayoutFooterButton } from "@src/modules/box-builder/components/Layout";

export interface CardActionButtonProps {
  variant: Entity.ProductVariant;
  loading?: boolean;
  buttonProps?: ButtonProps;
  appearance: "card" | "activity";
}

export const CardActionButton = ({
  variant,
  loading,
  buttonProps,
  appearance,
}: CardActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const { replaceCartItem, loading: isReplacing } = useReplaceBoxBuilderCartItem();
  const { cards } = useBoxBuilderProducts();
  const { addCardProductId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);
  const { push } = useFlow();

  const cartLine = useIsInTheBoxBuilderCart(variant.id);
  const isInCart = Boolean(cartLine);
  const firstSelectedCard = cards[0];

  const isAvailable = variant.stockStatus?.isAvailable === true;
  const isFree = parseFloat(variant.price?.amount ?? '0') === 0;
  const loadingState = loading || isInternalLoading || isAdding || isReplacing;

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t("sold-out")}
      </Button>
    );
  }

  const handleNext = () => {
    push(Activity.Cart, {});
  };

  const handleSelect = async () => {
    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      if (firstSelectedCard) {
        if (firstSelectedCard.purchasableId !== variant.id) {
          await replaceCartItem({
            quantity: 1,
            lineId: firstSelectedCard.id,
            purchasableId: variant.id,
          });
        }
      } else {
        await addToCart({
          purchasableId: variant.id,
          quantity: 1,
        });
      }
      addCardProductId(variant.id);
    } finally {
      setIsInternalLoading(false);
    }
  };

  if (appearance === "activity") {
    if (isInCart) {
      return (
        <LayoutFooterButton
          label={variant.title}
          money={variant.price}
          onClick={handleNext}
          loading={loadingState}
        />
      );
    }

    return (
      <Button
        block
        onClick={handleSelect}
        type="default"
        loading={loadingState}
        {...buttonProps}
      >
        {t("select-card")}
      </Button>
    );
  }

  if (isInCart) {
    return (
      <Button
        block
        onClick={handleNext}
        type="primary"
        loading={loadingState}
        {...buttonProps}
      >
        {t("next")}
      </Button>
    );
  }

  return (
    <Button
      block
      onClick={handleSelect}
      type="default"
      loading={loadingState}
      {...buttonProps}
    >
      {t("select")}
    </Button>
  );
};
