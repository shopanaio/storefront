import { Layout as AntLayout } from "antd";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const AuthModal = dynamic(
  () => import("../Auth/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);
const RateModal = dynamic(
  () => import("../Product/Rate/RateModal").then((m) => m.RateModal),
  { ssr: false }
);
import { DrawerComponent } from "./Drawer";
import { MobileSearch } from "../Search/MobileSearch ";
const CartDrawer = dynamic(
  () => import("../Cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);
import { Footer } from "./Footer";
import { footerMenusArr } from "@src/mocks/footerMenusArr";
import { Header } from "./Header";
import { StickyHeader } from "./StickyHeader";
import { createStyles } from "antd-style";
import { usePathname } from "next/navigation";
import { useSessionStore } from "@src/providers/session-store-provider";
import useCart from "@src/hooks/cart/useCart";

const { Content } = AntLayout;

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps) => {
  const { styles } = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  const { cart } = useCart();

  const user = useSessionStore((state) => state.session?.user);
  const pathname = usePathname();
  const isCheckout = pathname?.includes("/checkout");
  const isBoxBuilder = pathname?.includes("/box-builder");
  const isShopify = pathname?.includes("/shopify");

  const [mobileSearchDrawerOpen, setMobileSearchDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);

  const openMobileSearchDrawer = () => setMobileSearchDrawerOpen(true);
  const closeMobileSearchDrawer = () => setMobileSearchDrawerOpen(false);

  useEffect(() => {
    const onScroll = () => {
      const shouldBeVisible = window.scrollY > 100;

      if (shouldBeVisible) {
        if (!isRendered) setIsRendered(true);
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setTimeout(() => setIsRendered(false), 300);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isRendered]);

  return isCheckout || isBoxBuilder || isShopify ? (
    <Content className={styles.content}>{children}</Content>
  ) : (
    <AntLayout>
      <>
        <StickyHeader
          visible={isVisible}
          onOpenDrawer={openDrawer}
          onOpenCartDrawer={openCartDrawer}
          user={user}
          cartAmount={cart?.cost.subtotalAmount}
          cartLines={cart?.lines?.edges?.length ?? 0}
        />
        <Header
          onOpenDrawer={openDrawer}
          onOpenMobileSearchDrawer={openMobileSearchDrawer}
          onOpenCartDrawer={openCartDrawer}
          cartAmount={cart?.cost.subtotalAmount || null}
          user={user}
          cartLines={cart?.lines?.edges?.length ?? 0}
        />
      </>

      <Content className={styles.content}>{children}</Content>
      <Footer menus={footerMenusArr} />

      <AuthModal />
      <RateModal />

      <CartDrawer open={cartDrawerOpen} onClose={closeCartDrawer} />
      <DrawerComponent open={drawerOpen} onClose={closeDrawer} />
      <MobileSearch
        open={mobileSearchDrawerOpen}
        onClose={closeMobileSearchDrawer}
      />
    </AntLayout>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    content: css`
      background-color: ${token.colorBgBase};
    `,
  };
});
