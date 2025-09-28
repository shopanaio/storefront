import { Layout as PageLayout } from "@src/components/Layout/Layout";
import CartProvider from "@src/providers/cart/cart-provider.shopana";
import cartIdUtils from "@src/utils/cartId";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <CartProvider
      getId={cartIdUtils.getCartIdFromCookie}
      setId={cartIdUtils.setCartIdCookie}
    >
      <PageLayout>{children}</PageLayout>
    </CartProvider>
  );
}
