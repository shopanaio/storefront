import CartProvider from "@src/providers/cart";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <CartProvider cookie="default_cart_id">{children}</CartProvider>;
}
