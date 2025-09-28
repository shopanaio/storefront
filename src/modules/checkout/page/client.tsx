import useCart from "@src/hooks/cart/useCart";
import { useIsClient } from "@src/hooks/useIsClient";
import { Checkout } from "@src/modules/checkout";
import { CheckoutSkeleton } from "@src/modules/checkout/CheckoutSkeleton";
import { CheckoutBrand } from "@src/modules/checkout/page/brand";

export const CheckoutPageClient = () => {
  const { cart } = useCart();
  const isClient = useIsClient();

  return (
    <>
      {isClient ? (
        <Checkout cart={cart} onConfirm={() => {}} brand={<CheckoutBrand />} />
      ) : (
        <CheckoutSkeleton />
      )}
    </>
  );
};
