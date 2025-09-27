"use client";

import React from "react";
import dynamic from "next/dynamic";
import { AppDrawer } from "./AppDrawer";
import { MobileSearch } from "../Search/MobileSearch ";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { AnnouncementBar } from "@src/components/Layout/AnnouncementBar";
import { createStyles } from "antd-style";

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

  return (
    <div>
      <AnnouncementBar />
      <Header />
      <main className={styles.main}>{children}</main>
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
    main: css`
      padding-bottom: ${token.paddingXL}px;
    `,
  };
});
