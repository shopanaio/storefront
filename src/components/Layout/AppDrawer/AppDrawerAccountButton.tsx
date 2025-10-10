'use client';

import React from 'react';
import { TbUserCircle, TbUser } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { useModalStore } from '@src/store/appStore';
import useToken from 'antd/es/theme/useToken';
import { AppDrawerButton } from './AppDrawerButton';
import { useSession as useSessionStore } from '@src/hooks/useSession';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { createStyles } from 'antd-style';

/**
 * Account button for the app drawer
 */
export const AppDrawerAccountButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();
  const router = useRouter();
  const locale = useLocale();
  const session = useSessionStore((state) => state.session);
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );
  const setIsAppDrawerOpen = useModalStore((state) => state.setIsAppDrawerOpen);

  const isAuthenticated = !!session?.user;

  const handleClick = () => {
    if (isAuthenticated) {
      setIsAppDrawerOpen(false);
      router.push(`/${locale}/profile/general`);
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
