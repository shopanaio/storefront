import { useCartLineFragment_CartLineFragment$key } from "@src/hooks/cart/useCartLineFragment/__generated__/useCartLineFragment_CartLineFragment.graphql";
import { CartLine } from "@src/components/UI/ProductCards/CartLineItem/CartLine";
import useRemoveItemFromCart from "@src/hooks/cart/useRemoveItemFromCart";
import useUpdateCartLineQuantity from "@src/hooks/cart/useUpdateCartLineQuantity";
import useCartLineFragment from "@src/hooks/cart/useCartLineFragment";

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
    removeFromCart({
      checkoutLine: cartLineData.cartLine,
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
