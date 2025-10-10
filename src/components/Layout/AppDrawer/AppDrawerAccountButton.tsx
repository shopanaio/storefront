'use client';

import React from 'react';
import { Button } from 'antd';
import { TbUserCircle } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { createStyles } from 'antd-style';
import { useModalStore } from '@src/store/appStore';
import useToken from 'antd/es/theme/useToken';

/**
 * Account button for the app drawer
 */
export const AppDrawerAccountButton: React.FC = () => {
  const t = useTranslations('Header');
  const [, token] = useToken();
  const { styles } = useStyles();
  const setIsAuthModalVisible = useModalStore(
    (state) => state.setIsAuthModalVisible
  );

  const handleClick = () => {
    setIsAuthModalVisible(true);
  };

  return (
    <Button
      variant="text"
      color="default"
      icon={<TbUserCircle size={20} color={token.colorPrimary} />}
      className={styles.linkButton}
      onClick={handleClick}
    >
      {t('account')}
    </Button>
  );
};

const useStyles = createStyles(({ css }) => ({
  linkButton: css`
    height: 46px;
    display: flex;
    justify-content: flex-start;
  `,
}));
