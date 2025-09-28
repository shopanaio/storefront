import CartProvider from "@src/providers/cart";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <CartProvider cookie="box-builder_cart_id">{children}</CartProvider>;
}
