import { useCartLineFragment_CartLineFragment$key } from "@src/hooks/cart/useCartLineFragment/__generated__/useCartLineFragment_CartLineFragment.graphql";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import useRemoveItemFromCart from "@src/hooks/cart/useRemoveItemFromCart";
import useUpdateCartLineQuantity from "@src/hooks/cart/useUpdateCartLineQuantity";
import useCartLineFragment from "@src/hooks/cart/useCartLineFragment";
import { App, Flex, Typography } from "antd";
import { useTranslations } from "next-intl";
import { Thumbnail } from "@src/components/UI/Thumbnail/Thumbnail";
import { createStyles } from "antd-style";

const { Text } = Typography;

interface CartItemProps {
  cartLineRef: useCartLineFragment_CartLineFragment$key;
  onClick?: () => void;
  variant?: "drawer" | "page";
}

export const CartItem = ({
  cartLineRef,
  onClick,
  variant = "drawer",
}: CartItemProps) => {
  const { removeFromCart, loading: isRemoving } = useRemoveItemFromCart();
  const { updateQuantity, loading: isUpdating } = useUpdateCartLineQuantity();
  const { modal } = App.useApp();
  const t = useTranslations("Cart");
  const { styles } = useStyles();

  const cartLineData = useCartLineFragment(cartLineRef);

  if (!cartLineData?.cartLine) {
    return null;
  }

  const { cartLine } = cartLineData;
  const quantity = cartLine.quantity;
  const cartItemId = cartLine.id;
  const purchasable = cartLine.purchasable ?? {};

  const increment = () => {
    updateQuantity({ cartItemId, quantity: quantity + 1 });
  };

  const decrement = () => {
    if (quantity > 1) {
      updateQuantity({ cartItemId, quantity: quantity - 1 });
    }
  };

  const handleRemove = () => {
    const productTitle = purchasable.title ?? "";
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
          <Text>
            {t("remove-confirm-content", { productTitle })}
          </Text>
        </Flex>
      ),
      okText: t("remove-confirm-ok"),
      cancelText: t("remove-confirm-cancel"),
      onOk: () => {
        removeFromCart({
          checkoutLine: cartLineData.cartLine,
        });
      },
    });
  };

  return (
    <CartLine
      id={cartLine.id}
      title={purchasable.title ?? ""}
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
