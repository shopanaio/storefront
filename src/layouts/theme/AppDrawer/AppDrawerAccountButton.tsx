'use client';

import React from 'react';
import { TbUserCircle, TbUser } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { useModalStore } from '@src/store/appStore';
import useToken from 'antd/es/theme/useToken';
import { AppDrawerButton } from './AppDrawerButton';
import { useSessionStore } from '@shopana/storefront-sdk/modules/session/react';
import { useRouter } from 'next/navigation';
import { useRoutes } from '@src/hooks/useRoutes';
import { createStyles } from 'antd-style';

/**
 * Account button for the app drawer
 */
export const AppDrawerAccountButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();
  const router = useRouter();
  const routes = useRoutes();
  const session = useSessionStore()((state) => state.session);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const setIsAppDrawerOpen = useModalStore((state) => state.setIsAppDrawerOpen);

  const isAuthenticated = !!session?.user;

  const handleClick = () => {
    if (isAuthenticated) {
      setIsAppDrawerOpen(false);
      router.push(routes.profile.path('general'));
    } else {
      setIsAppDrawerOpen(false);
      setIsAuthModalVisible(true);
    }
  };

  return (
    <AppDrawerButton
      icon={
        isAuthenticated ? (
          <TbUserCircle size={24} color={token.colorPrimary} />
        ) : (
          <TbUser size={24} color={token.colorPrimary} />
        )
      }
      topText={isAuthenticated ? t('my-account') : t('sign-in')}
      bottomText={t('account')}
      onClick={handleClick}
      className={styles.button}
    />
  );
};

const useStyles = createStyles(({ css, token }) => ({
  button: css`
    gap: ${token.marginXS}px;
  `,
}));
