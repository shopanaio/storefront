'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Footer } from '@src/layouts/theme/Footer';
import { Header } from '@src/layouts/theme/Header';
import { AnnouncementBar } from '@src/layouts/theme/AnnouncementBar';
import { createStyles } from 'antd-style';

const AuthModal = dynamic(
  () => import('@src/templates/auth/sections/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);
const RateModal = dynamic(
  () => import('@src/templates/product/blocks/Rate/RateModal').then((m) => m.RateModal),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import('@src/templates/cart/sections/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);
const AppDrawer = dynamic(
  () => import('@src/layouts/theme/AppDrawer/AppDrawer').then((m) => m.AppDrawer),
  { ssr: false }
);
const MobileSearch = dynamic(
  () => import('@src/templates/search/blocks/MobileSearch').then((m) => m.MobileSearch),
  { ssr: false }
);

interface ThemeLayoutProps {
  children: React.ReactNode;
}

const useStyles = createStyles(({ token, css }) => {
  return {
    main: css`
      padding-bottom: ${token.paddingXL}px;
    `,
  };
});

/**
 * Main theme layout component for the storefront.
 * This layout is used for all standard page types (home, product, collection, etc.)
 */
export default function ThemeLayout({ children }: ThemeLayoutProps) {
  const { styles } = useStyles();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className={styles.main}>{children}</main>
      <AuthModal />
      <RateModal />
      <CartDrawer />
      <AppDrawer />
      <MobileSearch />
      <Footer />
    </>
  );
}
