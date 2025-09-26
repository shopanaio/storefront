"use client";

import { QuantityInput } from "@src/components/Product/QuantityInput";
import { useIsInTheCart } from "@src/modules/box-builder/hooks/useIsInTheCart";
import { useUpdateCartLineQuantity } from "@src/modules/box-builder/hooks/useUpdateCartLineQuantity";
import { useRemoveItemFromCart } from "@src/modules/box-builder/hooks/useRemoveItemFromCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { App } from "antd";
import { useFormatPrice } from "@src/components/UI/Price/Price";

export interface BoxBuilderQuantityInputProps {
  productId: string;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  color?: "primary" | "default";
  loading?: boolean;
  className?: string;
  useTrashButton?: boolean;
  appearance: "card" | "activity";
}

export const BoxBuilderQuantityInput = ({
  productId,
  disabled,
  size = "middle",
  color = "primary",
  loading,
  className,
  useTrashButton = false,
  appearance,
}: BoxBuilderQuantityInputProps) => {
  const t = useTranslations("BoxBuilder");
  const formatPrice = useFormatPrice();
  const {
    quantity: cartQuantity,
    cartItemId,
    subtotal,
  } = useIsInTheCart(productId);
  const { updateQuantity, loading: isUpdating } = useUpdateCartLineQuantity();
  const { removeFromCart, loading: isRemoving } = useRemoveItemFromCart();
  const { modal } = App.useApp();
  const {
    selectedBoxId,
    setSelectedBoxId,
    selectedCardIds,
    removeSelectedCardId,
  } = useBoxBuilderStore();

  const clearSelectionsIfMatched = () => {
    if (selectedBoxId === productId) setSelectedBoxId("");
    if (selectedCardIds.includes(productId)) removeSelectedCardId(productId);
  };

  const handleIncrement = () => {
    updateQuantity({ cartItemId, quantity: cartQuantity + 1 });
  };

  const handleDecrement = () => {
    // If quantity is 1, perform remove instead of setting to 0
    if (cartQuantity <= 1) {
      if (useTrashButton) {
        // In cart: use confirm modal flow
        handleRemove();
      } else {
        // Outside cart: remove immediately
        removeFromCart({ productId });
        clearSelectionsIfMatched();
      }
      return;
    }

    const newQuantity = cartQuantity - 1;
    updateQuantity({ cartItemId, quantity: newQuantity });
  };

  const handleRemove = () => {
    // Show confirm modal only when trash button is used (i.e., in cart)
    if (useTrashButton) {
      modal.confirm({
        icon: null,
        title: t("remove-confirm-title"),
        content: t("remove-confirm-content"),
        okText: t("remove-confirm-ok"),
        cancelText: t("remove-confirm-cancel"),
        onOk: async () => {
          await removeFromCart({ productId });
          clearSelectionsIfMatched();
        },
      });
      return;
    }

    // Fallback (should not be used outside cart because trash is hidden)
    removeFromCart({ productId });
    clearSelectionsIfMatched();
  };

  const value = useMemo(() => {
    let value = `${cartQuantity}`;

    if (appearance === "activity" && subtotal) {
      value = `${value} ${t("in-the-box")} • ${formatPrice(subtotal)}`;
    }

    return value;
  }, [cartQuantity, appearance, subtotal]);

  const computedLoading = Boolean(isUpdating || isRemoving || loading);

  return (
    <QuantityInput
      value={value}
      onIncrement={handleIncrement}
      onDecrement={handleDecrement}
      onRemove={useTrashButton ? handleRemove : undefined}
      size={size}
      color={color}
      disabled={disabled}
      loading={computedLoading}
      className={className}
      {...(appearance === "activity" ? { style: { height: 48 } } : {})}
    />
  );
};
