import { CartLine } from "@src/ui-kit/ProductCards/CartLineItem/CartLine";
import { useRemoveItemFromCart, useUpdateCartLineQuantity } from "@src/hooks/cart";
import { Flex, Typography } from "antd";
import { useTranslations } from "next-intl";
import { Thumbnail } from "@src/ui-kit/Thumbnail/Thumbnail";
import { createStyles } from "antd-style";
import type { model } from "@shopana/storefront-sdk";
import { useConfirm } from "@src/ui-kit/Confirm/useConfirm";

const { Text } = Typography;

interface CartItemProps {
  cartLine: model.CartLine;
  onClick?: () => void;
  variant?: "drawer" | "page";
  /** Whether to show confirmation modal before removing item. Defaults to false. */
  confirmRemove?: boolean;
}

export const CartItem = ({
  cartLine,
  onClick,
  variant = "drawer",
  confirmRemove = false,
}: CartItemProps) => {
  const { removeFromCart, loading: isRemoving } = useRemoveItemFromCart();
  const { updateQuantity, loading: isUpdating } = useUpdateCartLineQuantity();
  const t = useTranslations("Cart");
  const { styles } = useStyles();
  const confirm = useConfirm();

  if (!cartLine) {
    return null;
  }

  const quantity = cartLine.quantity;
  const cartItemId = cartLine.id;
  const purchasable = cartLine.purchasable ?? {};

  // Concatenate parent product title with variant title
  const parentTitle = (purchasable as any)?.product?.title;
  const variantTitle = purchasable.title;
  const productTitle = [parentTitle, variantTitle]
    .filter(Boolean)
    .join(' ') || "";

  const increment = () => {
    updateQuantity({ cartItemId, quantity: quantity + 1 });
  };

  const decrement = () => {
    if (quantity > 1) {
      updateQuantity({ cartItemId, quantity: quantity - 1 });
    }
  };

  const handleRemove = async () => {
    if (!confirmRemove) {
      removeFromCart({
        lineId: cartLine.id,
      });
      return;
    }

    const imageUrl = purchasable.cover?.url ?? "";

    const ok = await confirm({
      icon: null,
      title: t("remove-confirm-title"),
      content: (
        <Flex gap={12} align="center">
          <Thumbnail
            src={imageUrl}
            alt={productTitle}
            className={styles.confirmModalThumbnail}
          />
          <Text>{t("remove-confirm-content", { productTitle })}</Text>
        </Flex>
      ),
      okText: t("remove-confirm-ok"),
      cancelText: t("remove-confirm-cancel"),
    });
    if (ok) {
      removeFromCart({
        lineId: cartLine.id,
      });
    }
  };

  return (
    <CartLine
      id={cartLine.id}
      title={productTitle}
      imageUrl={purchasable.cover?.url ?? ""}
      quantity={quantity}
      unitPrice={cartLine.cost.unitPrice}
      totalPrice={cartLine.cost.totalAmount}
      compareAtUnitPrice={cartLine.cost?.compareAtUnitPrice ?? undefined}
      variant={variant}
      onClick={onClick}
      onRemove={handleRemove}
      quantityInputProps={{
        value: quantity,
        onRemove: handleRemove,
        onIncrement: increment,
        onDecrement: decrement,
        size: "small",
        color: "primary",
        loading: isUpdating || isRemoving,
      }}
    />
  );
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
