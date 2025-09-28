"use client";

import { CheckoutPageClient } from "@src/modules/checkout/page/client";
import CartProvider from "@src/providers/cart";

export default function CheckoutModulePage() {
  return (
    <CartProvider cookie="default_cart_id">
      <CheckoutPageClient />
    </CartProvider>
  );
}
