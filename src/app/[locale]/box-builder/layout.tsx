"use client";

import CartProvider from "@src/providers/cart";
import { useBoxBuilderStore } from "@src/store/appStore";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider
      getId={() => useBoxBuilderStore.getState().boxCartId}
    >
      {children}
    </CartProvider>
  );
}
