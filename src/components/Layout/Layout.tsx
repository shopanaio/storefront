'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Footer } from './Footer';
import { Header } from './Header';
import { AnnouncementBar } from '@src/components/Layout/AnnouncementBar';
import { createStyles } from 'antd-style';

const AuthModal = dynamic(
  () => import('../Auth/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);
const RateModal = dynamic(
  () => import('../Product/Rate/RateModal').then((m) => m.RateModal),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import('../Cart/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);
const AppDrawer = dynamic(
  () => import('./AppDrawer/AppDrawer').then((m) => m.AppDrawer),
  { ssr: false }
);
const MobileSearch = dynamic(
  () => import('../Search/MobileSearch ').then((m) => m.MobileSearch),
  { ssr: false }
);

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: ILayoutProps) => {
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
};

const useStyles = createStyles(({ token, css }) => {
  return {
    main: css`
      padding-bottom: ${token.paddingXL}px;
    `,
  };
});
