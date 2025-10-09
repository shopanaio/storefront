import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import useRemoveItemFromCart from "@src/hooks/cart/useRemoveItemFromCart";
import useUpdateCartLineQuantity from "@src/hooks/cart/useUpdateCartLineQuantity";
import { App, Flex, Typography } from "antd";
import { useTranslations } from "next-intl";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { createStyles } from "antd-style";
import type { Entity } from "@shopana/entity";

const { Text } = Typography;

interface CartItemProps {
  cartLine: Entity.CartLine;
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
  const { modal } = App.useApp();
  const t = useTranslations("Cart");
  const { styles } = useStyles();

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

  const handleRemove = () => {
    if (!confirmRemove) {
      removeFromCart({
        lineId: cartLine.id,
      });
      return;
    }

    const imageUrl = purchasable.cover?.url ?? "";

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
          <Text>{t("remove-confirm-content", { productTitle })}</Text>
        </Flex>
      ),
      okText: t("remove-confirm-ok"),
      cancelText: t("remove-confirm-cancel"),
      onOk: () => {
        removeFromCart({
          lineId: cartLine.id,
        });
      },
    });
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
