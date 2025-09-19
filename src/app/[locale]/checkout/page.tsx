"use client";

import { Checkout } from "@src/components/Checkout/Checkout";

import useCart from "@src/hooks/cart/useCart";
import { newMockCart } from "@src/mocks/newCart";
import { Typography } from "antd";

export default function CheckoutPage() {
  const { cart, loading, error } = useCart();
  const methods = newMockCart;

  /* console.log(cart); */

  if (loading) {
    return <Typography.Text>Loading cart...</Typography.Text>;
  }

  if (error) {
    return (
      <Typography.Text>Error loading cart: {error.message}</Typography.Text>
    );
  }

  return (
    <>
      <Checkout cart={cart} methods={methods} />
    </>
  );
}
