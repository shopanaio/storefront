"use client";

import { Activity, useFlow } from "@src/components/BoxBuilder/stackflow/Stack";
import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAddItemToCart } from "@src/components/BoxBuilder/hooks/useAddItemToCart";
import { useRemoveItemFromCart } from "@src/components/BoxBuilder/hooks/useRemoveItemFromCart";
import { useBoxBuilderStore } from "@src/store/appStore";

export interface BoxActionButtonProps {
  isAvailable: boolean;
  isSelected: boolean;
  productId: string;
  loading?: boolean;
  buttonProps?: ButtonProps;
  appearance: "card" | "activity";
}

export const BoxActionButton = ({
  isAvailable,
  isSelected,
  productId,
  loading,
  buttonProps,
  appearance,
}: BoxActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();
  const { addToCart } = useAddItemToCart();
  const { removeFromCart } = useRemoveItemFromCart();
  const { selectedBoxId, setSelectedBoxId } = useBoxBuilderStore();
  const [isInternalLoading, setIsInternalLoading] = useState(false);

  if (!isAvailable) {
    return (
      <Button disabled block {...buttonProps}>
        {t("sold-out")}
      </Button>
    );
  }

  const buttonText = isSelected
    ? t("next")
    : appearance === "activity"
    ? t("select-design")
    : t("select");

  const handleClick = async () => {
    if (isSelected) {
      push(Activity.Step2, {});
      return;
    }

    if (isInternalLoading || !productId) return;
    setIsInternalLoading(true);
    try {
      if (selectedBoxId && selectedBoxId !== productId) {
        await removeFromCart({ productId: selectedBoxId });
        setSelectedBoxId("");
      }
      await addToCart({ productId, quantity: 1 });
      setSelectedBoxId(productId);
    } finally {
      setIsInternalLoading(false);
    }
  };

  return (
    <Button
      block
      onClick={handleClick}
      type={isSelected ? "primary" : "default"}
      loading={loading || isInternalLoading}
      {...buttonProps}
    >
      {buttonText}
    </Button>
  );
};
