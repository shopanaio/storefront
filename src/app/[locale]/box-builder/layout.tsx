"use client";

import CartProvider from "@src/providers/cart";
import { useBoxBuilderStore } from "@src/store/appStore";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { cartId, setCartId } = useBoxBuilderStore();

  return (
    <CartProvider getId={() => cartId} setId={setCartId}>
      {children}
    </CartProvider>
  );
}
