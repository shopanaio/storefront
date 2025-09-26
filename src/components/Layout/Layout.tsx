"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AppDrawer } from "./AppDrawer";
import { MobileSearch } from "../Search/MobileSearch ";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { StickyHeader } from "./StickyHeader";
import { createStyles } from "antd-style";
import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@src/components/Layout/AnnouncementBar";

const AuthModal = dynamic(
  () => import("../Auth/AuthModal").then((m) => m.AuthModal),
  { ssr: false }
);
const RateModal = dynamic(
  () => import("../Product/Rate/RateModal").then((m) => m.RateModal),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import("../Cart/CartDrawer").then((m) => m.CartDrawer),
  { ssr: false }
);

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps) => {
  const { styles } = useStyles();

  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

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

  return (
    <div>
      <AnnouncementBar />
      <Header />
      <StickyHeader visible={isVisible} />
      <main className={styles.content}>{children}</main>
      <Footer />
      <AuthModal />
      <RateModal />
      <CartDrawer />
      <AppDrawer />
      <MobileSearch />
    </div>
  );
};

const useStyles = createStyles(({ token, css }) => {
  return {
    content: css`
      background-color: ${token.colorBgBase};
    `,
  };
});
