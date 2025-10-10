'use client';

import React from 'react';
import { TbUserCircle } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { useModalStore } from '@src/store/appStore';
import useToken from 'antd/es/theme/useToken';
import { AppDrawerButton } from './AppDrawerButton';

/**
 * Account button for the app drawer
 */
export const AppDrawerAccountButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );

  const handleClick = () => {
    setIsAuthModalVisible(true);
  };

  return (
    <AppDrawerButton
      icon={<TbUserCircle size={20} color={token.colorPrimary} />}
      onClick={handleClick}
    >
      {t('account')}
    </AppDrawerButton>
  );
};
