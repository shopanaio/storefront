"use client";

import { Checkout } from "@src/modules/checkout/Checkout";
import { CheckoutHeader } from "@src/modules/checkout/CheckoutHeader";
import useCart from "@src/hooks/cart/useCart";

export default function CheckoutPage() {
  const { cart } = useCart();

  return (
    <>
      <CheckoutHeader />
      <Checkout cart={cart} onConfirm={() => {}} />
    </>
  );
}
