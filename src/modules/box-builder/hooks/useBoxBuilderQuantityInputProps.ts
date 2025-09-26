"use client";

import { useIsInTheCart } from "./useIsInTheCart";
import { useUpdateCartLineQuantity } from "./useUpdateCartLineQuantity";
import { useRemoveItemFromCart } from "./useRemoveItemFromCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { App } from "antd";
import { useFormatPrice } from "@src/components/UI/Price/Price";

export interface UseBoxBuilderQuantityInputPropsParams {
  productId: string;
  disabled?: boolean;
  loading?: boolean;
  useTrashButton?: boolean;
  appearance?: "card" | "activity";
}

export interface BoxBuilderQuantityInputProps {
  value: string | number;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove?: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const useBoxBuilderQuantityInputProps = ({
  productId,
  disabled,
  loading,
  useTrashButton = false,
  appearance = "card",
}: UseBoxBuilderQuantityInputPropsParams): BoxBuilderQuantityInputProps => {
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
    let value: string | number = cartQuantity;

    if (appearance === "activity" && subtotal) {
      value = `${cartQuantity} ${t("in-the-box")} • ${formatPrice(subtotal)}`;
    }

    return value;
  }, [cartQuantity, appearance, subtotal, t, formatPrice]);

  const computedLoading = Boolean(isUpdating || isRemoving || loading);

  return {
    value,
    onIncrement: handleIncrement,
    onDecrement: handleDecrement,
    onRemove: useTrashButton ? handleRemove : undefined,
    loading: computedLoading,
    disabled,
  };
};
