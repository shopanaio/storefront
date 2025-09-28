"use client";
import { Activity, useFlow } from "@src/modules/box-builder/stackflow/Stack";
import { Button, ButtonProps } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAddItemToBoxBuilderCart } from "@src/modules/box-builder/hooks/useAddItemToCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import {
  BoxBuilderQuantityInput,
  BoxBuilderQuantityInputProps,
} from "@src/modules/box-builder/components/ActionButton/QuantityInput";

export interface BoxActionButtonProps {
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

export const BoxActionButton = ({
  productId,
  isAvailable,
  isFree,
  isInCart,
  quantity,
  loading,
  buttonProps,
  quantityProps,
  appearance,
}: BoxActionButtonProps) => {
  const t = useTranslations("BoxBuilder");
  const { push } = useFlow();

  const { addToCart, loading: isAdding } = useAddItemToBoxBuilderCart();
  const { addBoxProductId } = useBoxBuilderStore();
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
        label={t("footer.boxes-count", { count: quantity })}
      />
    );
  }

  const handleSelect = async () => {
    if (appearance === "activity") {
      push(Activity.Step2, {});
      return;
    }

    if (isInternalLoading) return;
    setIsInternalLoading(true);
    try {
      await addToCart({
        purchasableId: productId,
        quantity: 1,
      });
      addBoxProductId(productId);
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
      {appearance === "activity" ? t("select-design") : t("select")}
    </Button>
  );
};
