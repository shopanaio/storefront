"use client";

import { useIsInTheBoxBuilderCart } from "./useIsInTheCart";
import { useUpdateBoxBuilderCartLine } from "./useUpdateCartLine";
import { useRemoveItemFromBoxBuilderCart } from "./useRemoveItemFromCart";
import { useBoxBuilderStore } from "@src/store/appStore";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { App, Flex, Typography } from "antd";
import { useFormatPrice } from "@src/components/UI/Price/Price";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { createStyles } from "antd-style";

export interface UseBoxBuilderQuantityInputPropsParams {
  productId: string;
  disabled?: boolean;
  loading?: boolean;
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
  appearance = "card",
}: UseBoxBuilderQuantityInputPropsParams): BoxBuilderQuantityInputProps => {
  const t = useTranslations("BoxBuilder");
  const formatPrice = useFormatPrice();
  const cartLine = useIsInTheBoxBuilderCart(productId);

  const { updateQuantity, loading: isUpdating } = useUpdateBoxBuilderCartLine();
  const { removeFromCart, loading: isRemoving } =
    useRemoveItemFromBoxBuilderCart();
  const { modal } = App.useApp();
  const {} = useBoxBuilderStore();
  const { styles } = useStyles();

  const handleIncrement = () => {
    if (!cartLine) {
      return;
    }
    updateQuantity({
      cartItemId: cartLine.id,
      quantity: cartLine.quantity + 1,
    });
  };

  const handleDecrement = () => {
    if (!cartLine) {
      return;
    }

    if (cartLine.quantity <= 1) {
      handleRemove();
      return;
    }
    updateQuantity({
      cartItemId: cartLine.id,
      quantity: cartLine.quantity - 1,
    });
  };

  const handleRemove = () => {
    const productTitle = cartLine?.purchasable?.title ?? "";
    const imageUrl = cartLine?.purchasable?.cover?.url ?? "";

    modal.confirm({
      icon: null,
      title: t("remove-confirm-title"),
      content: (
        <Flex gap={12} align="center">
          <Thumbnail
            src={imageUrl}
            alt={productTitle}
            className={styles.confirmModalThumbnail}
          />
          <Typography.Text>
            {t("remove-confirm-content", { productTitle })}
          </Typography.Text>
        </Flex>
      ),
      okText: t("remove-confirm-ok"),
      cancelText: t("remove-confirm-cancel"),
      onOk: () => {
        if (cartLine) {
          removeFromCart({
            lineId: cartLine.id,
          });
        }
      },
    });
  };

  const value = useMemo(() => {
    if (!cartLine) {
      return 0;
    }

    const {
      quantity,
      cost: { subtotalAmount },
    } = cartLine;
    let value: string | number = quantity || 0;

    if (appearance === "activity" && subtotalAmount) {
      value = `${quantity} ${t("in-the-box")} • ${formatPrice(subtotalAmount)}`;
    }

    return value;
  }, [cartLine, appearance, t, formatPrice]);

  const computedLoading = Boolean(isUpdating || isRemoving || loading);

  return {
    value,
    onIncrement: handleIncrement,
    onDecrement: handleDecrement,
    onRemove: handleRemove,
    loading: computedLoading,
    disabled,
  };
};

const useStyles = createStyles(({ css }) => ({
  confirmModalThumbnail: css`
    width: 60px !important;
    height: 60px !important;
    flex-shrink: 0;

    .ant-btn {
      width: 60px !important;
      height: 60px !important;
      padding: 0 !important;
    }
  `,
}));
